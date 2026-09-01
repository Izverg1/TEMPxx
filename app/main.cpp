#include "frontier_relay/mvp.hpp"

#include <filesystem>
#include <iostream>
#include <memory>

int main(int argc, char** argv) {
  using namespace frontier_relay;
  const std::string objective = argc > 1 ? argv[1] : "Create a hello-world implementation artifact";
  InMemoryRegistry registry;
  registry.register_model(std::make_shared<DeterministicLocalAdapter>());
  EmpiricalModelBroker broker(registry);
  WeightedConfidenceEngine confidence;
  EventBus events;
  events.subscribe("TaskAssigned", [](const Event& event) {
    std::cout << "LOCAL MODEL: " << event.detail << '\n';
  });
  VerticalSlice pipeline(broker, confidence, {std::make_shared<ArtifactValidator>()}, events);
  const Task task{.id = "demo-1", .objective = objective,
                  .acceptance_criteria = {"An attributable artifact contains the objective"},
                  .required_capabilities = {"code-generation"}};
  const auto workspace = std::filesystem::temp_directory_path() / "frontier-relay-demo";
  const auto result = pipeline.run(task, workspace);
  std::cout << "CONFIDENCE: " << result.confidence.score << "%\n"
            << "DECISION: " << to_string(result.confidence.decision) << '\n'
            << "ARTIFACT: " << result.change.changed_files.front() << '\n';
  return result.confidence.decision == Decision::accept ? 0 : 2;
}

