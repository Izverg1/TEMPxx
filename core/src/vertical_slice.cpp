#include "frontier_relay/mvp.hpp"

#include <fstream>
#include <stdexcept>

namespace frontier_relay {

DeterministicLocalAdapter::DeterministicLocalAdapter()
    : descriptor_{.id = "deterministic-local-mvp",
                  .family = "test-double",
                  .state = ModelState::available,
                  .capabilities = {"code-generation", "text"},
                  .context_length = 4096,
                  .historical_success_rate = 0.95,
                  .average_latency_ms = 1.0} {}

ProposedChange DeterministicLocalAdapter::execute(const Task& packet,
                                                   const std::filesystem::path& workspace) {
  std::filesystem::create_directories(workspace);
  const auto artifact = workspace / "local_model_change.txt";
  std::ofstream output(artifact, std::ios::trunc);
  if (!output) throw std::runtime_error("cannot create worker artifact");
  output << "task=" << packet.id << '\n' << "objective=" << packet.objective << '\n';
  output.close();
  return {.task_id = packet.id, .model_id = descriptor_.id, .workspace = workspace,
          .changed_files = {artifact}, .summary = "Created a bounded demonstration artifact"};
}

ValidationEvidence ArtifactValidator::validate(const Task& task,
                                                 const ProposedChange& change) const {
  if (change.changed_files.size() != 1 || !std::filesystem::is_regular_file(change.changed_files.front()))
    return {.validator = "artifact", .passed = false, .weight = 1.0,
            .detail = "expected exactly one attributable output file"};
  std::ifstream input(change.changed_files.front());
  const std::string content((std::istreambuf_iterator<char>(input)), {});
  const bool covered = content.contains("task=" + task.id) && content.contains(task.objective);
  return {.validator = "artifact", .passed = covered, .weight = 1.0,
          .detail = covered ? "artifact exists and covers the task" : "artifact lacks task coverage"};
}

RunResult VerticalSlice::run(const Task& task, const std::filesystem::path& workspace) const {
  events_.publish({"TaskCreated", task.id, task.objective});
  auto model = broker_.route(task);
  events_.publish({"TaskAssigned", task.id, model->descriptor().id});
  auto change = model->execute(task, workspace);
  events_.publish({"WorkerCompleted", task.id, change.summary});
  std::vector<ValidationEvidence> evidence;
  for (const auto& validator : validators_) evidence.push_back(validator->validate(task, change));
  auto result = confidence_.calculate(evidence, model->descriptor().historical_success_rate);
  events_.publish({"ConfidenceCalculated", task.id, std::to_string(result.score)});
  events_.publish({result.decision == Decision::accept ? "TaskAccepted" : "EscalationRequested",
                   task.id, std::string(to_string(result.decision))});
  return {.change = std::move(change), .confidence = std::move(result)};
}

}  // namespace frontier_relay

