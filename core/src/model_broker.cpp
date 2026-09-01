#include "frontier_relay/mvp.hpp"

#include <algorithm>
#include <stdexcept>

namespace frontier_relay {

void InMemoryRegistry::register_model(std::shared_ptr<LocalModelAdapter> model) {
  models_.push_back(std::move(model));
}

std::vector<std::shared_ptr<LocalModelAdapter>> InMemoryRegistry::available() const {
  std::vector<std::shared_ptr<LocalModelAdapter>> result;
  std::ranges::copy_if(models_, std::back_inserter(result), [](const auto& model) {
    return model->descriptor().state == ModelState::available;
  });
  return result;
}

std::shared_ptr<LocalModelAdapter> EmpiricalModelBroker::route(const Task& task) const {
  auto candidates = registry_.available();
  const auto eligible = [&task](const auto& model) {
    const auto& capabilities = model->descriptor().capabilities;
    return std::ranges::all_of(task.required_capabilities,
                               [&capabilities](const auto& requirement) {
                                 return capabilities.contains(requirement);
                               });
  };
  candidates.erase(std::remove_if(candidates.begin(), candidates.end(),
                                  [&](const auto& model) { return !eligible(model); }),
                   candidates.end());
  if (candidates.empty()) throw std::runtime_error("no available model satisfies the task capabilities");
  return *std::ranges::max_element(candidates, {}, [](const auto& model) {
    return model->descriptor().historical_success_rate -
           std::min(model->descriptor().average_latency_ms / 1'000'000.0, 0.1);
  });
}

}  // namespace frontier_relay

