#pragma once

#include "frontier_relay/domain.hpp"

#include <functional>
#include <memory>
#include <optional>
#include <span>

namespace frontier_relay {

class FrontierCoordinator {
 public:
  virtual ~FrontierCoordinator() = default;
  virtual std::vector<Task> plan(std::string_view objective) = 0;
  virtual void review(const EscalationPacket& packet) = 0;
};

class LocalModelAdapter {
 public:
  virtual ~LocalModelAdapter() = default;
  [[nodiscard]] virtual const ModelDescriptor& descriptor() const = 0;
  virtual ProposedChange execute(const Task& packet,
                                 const std::filesystem::path& workspace) = 0;
};

class CapabilityRegistry {
 public:
  virtual ~CapabilityRegistry() = default;
  virtual void register_model(std::shared_ptr<LocalModelAdapter> model) = 0;
  [[nodiscard]] virtual std::vector<std::shared_ptr<LocalModelAdapter>> available() const = 0;
};

class ModelBroker {
 public:
  virtual ~ModelBroker() = default;
  [[nodiscard]] virtual std::shared_ptr<LocalModelAdapter> route(const Task& task) const = 0;
};

class Validator {
 public:
  virtual ~Validator() = default;
  [[nodiscard]] virtual ValidationEvidence validate(const Task& task,
                                                     const ProposedChange& change) const = 0;
};

class ConfidenceEngine {
 public:
  virtual ~ConfidenceEngine() = default;
  [[nodiscard]] virtual ConfidenceResult calculate(
      std::span<const ValidationEvidence> evidence,
      double model_reliability) const = 0;
};

}  // namespace frontier_relay

