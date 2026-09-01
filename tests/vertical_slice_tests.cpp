#include "frontier_relay/mvp.hpp"

#include <cassert>
#include <filesystem>
#include <memory>

using namespace frontier_relay;

int main() {
  InMemoryRegistry registry;
  registry.register_model(std::make_shared<DeterministicLocalAdapter>());
  EmpiricalModelBroker broker(registry);
  WeightedConfidenceEngine confidence;
  EventBus events;
  bool accepted = false;
  events.subscribe("TaskAccepted", [&](const Event&) { accepted = true; });
  VerticalSlice slice(broker, confidence, {std::make_shared<ArtifactValidator>()}, events);
  const Task task{.id = "test-1", .objective = "Write a safe artifact",
                  .required_capabilities = {"code-generation"}};
  const auto workspace = std::filesystem::temp_directory_path() / "frontier-relay-test";
  std::filesystem::remove_all(workspace);
  const auto result = slice.run(task, workspace);
  assert(result.confidence.decision == Decision::accept);
  assert(result.confidence.score == 99.5);
  assert(accepted);
  assert(std::filesystem::exists(result.change.changed_files.front()));
  std::filesystem::remove_all(workspace);

  const ValidationEvidence failed{"build", false, 1.0, "failed"};
  const auto failure = confidence.calculate(std::span(&failed, 1), 0.95);
  assert(failure.decision == Decision::escalate);
}
