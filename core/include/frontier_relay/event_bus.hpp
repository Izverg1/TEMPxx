#pragma once

#include <functional>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

namespace frontier_relay {

struct Event {
  std::string type;
  std::string task_id;
  std::string detail;
};

class EventBus {
 public:
  using Handler = std::function<void(const Event&)>;

  void subscribe(std::string type, Handler handler) {
    std::scoped_lock lock(mutex_);
    handlers_[std::move(type)].push_back(std::move(handler));
  }

  void publish(const Event& event) const {
    std::vector<Handler> listeners;
    {
      std::scoped_lock lock(mutex_);
      if (const auto it = handlers_.find(event.type); it != handlers_.end()) listeners = it->second;
    }
    for (const auto& handler : listeners) handler(event);
  }

 private:
  mutable std::mutex mutex_;
  std::unordered_map<std::string, std::vector<Handler>> handlers_;
};

}  // namespace frontier_relay

