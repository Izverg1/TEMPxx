#pragma once

#include <chrono>
#include <filesystem>
#include <map>
#include <set>
#include <string>
#include <vector>

namespace frontier_relay {

enum class ModelState { available, busy, unavailable, failed, loading };
enum class Decision { accept, local_review, repair, escalate };

struct Task {
  std::string id;
  std::string objective;
  std::vector<std::string> relevant_files;
  std::vector<std::string> constraints;
  std::vector<std::string> acceptance_criteria;
  std::set<std::string> required_capabilities;
  unsigned maximum_attempts{1};
};

struct ModelDescriptor {
  std::string id;
  std::string family;
  ModelState state{ModelState::unavailable};
  std::set<std::string> capabilities;
  std::size_t context_length{};
  double historical_success_rate{0.5};
  double average_latency_ms{};
};

struct ProposedChange {
  std::string task_id;
  std::string model_id;
  std::filesystem::path workspace;
  std::vector<std::filesystem::path> changed_files;
  std::string summary;
};

struct ValidationEvidence {
  std::string validator;
  bool passed{};
  double weight{};
  std::string detail;
};

struct ConfidenceResult {
  double score{};
  Decision decision{Decision::escalate};
  std::vector<ValidationEvidence> evidence;
};

struct EscalationPacket {
  std::string task_id;
  std::string objective;
  std::string unresolved_question;
  std::vector<std::filesystem::path> relevant_changes;
  std::vector<ValidationEvidence> failed_evidence;
  double confidence{};
};

struct RunResult {
  ProposedChange change;
  ConfidenceResult confidence;
};

}  // namespace frontier_relay

