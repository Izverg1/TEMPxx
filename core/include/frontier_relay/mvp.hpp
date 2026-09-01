#pragma once

#include "frontier_relay/event_bus.hpp"
#include "frontier_relay/interfaces.hpp"

namespace frontier_relay {

class InMemoryRegistry final : public CapabilityRegistry {
 public:
  void register_model(std::shared_ptr<LocalModelAdapter> model) override;
  [[nodiscard]] std::vector<std::shared_ptr<LocalModelAdapter>> available() const override;

 private:
  std::vector<std::shared_ptr<LocalModelAdapter>> models_;
};

class EmpiricalModelBroker final : public ModelBroker {
 public:
  explicit EmpiricalModelBroker(const CapabilityRegistry& registry) : registry_(registry) {}
  [[nodiscard]] std::shared_ptr<LocalModelAdapter> route(const Task& task) const override;

 private:
  const CapabilityRegistry& registry_;
};

class WeightedConfidenceEngine final : public ConfidenceEngine {
 public:
  [[nodiscard]] ConfidenceResult calculate(std::span<const ValidationEvidence> evidence,
                                           double model_reliability) const override;
};

class DeterministicLocalAdapter final : public LocalModelAdapter {
 public:
  DeterministicLocalAdapter();
  [[nodiscard]] const ModelDescriptor& descriptor() const override { return descriptor_; }
  ProposedChange execute(const Task& packet, const std::filesystem::path& workspace) override;

 private:
  ModelDescriptor descriptor_;
};

class ArtifactValidator final : public Validator {
 public:
  [[nodiscard]] ValidationEvidence validate(const Task& task,
                                             const ProposedChange& change) const override;
};

class VerticalSlice {
 public:
  VerticalSlice(ModelBroker& broker, ConfidenceEngine& confidence,
                std::vector<std::shared_ptr<Validator>> validators, EventBus& events)
      : broker_(broker), confidence_(confidence), validators_(std::move(validators)), events_(events) {}
  [[nodiscard]] RunResult run(const Task& task, const std::filesystem::path& workspace) const;

 private:
  ModelBroker& broker_;
  ConfidenceEngine& confidence_;
  std::vector<std::shared_ptr<Validator>> validators_;
  EventBus& events_;
};

[[nodiscard]] std::string_view to_string(Decision decision);

}  // namespace frontier_relay

