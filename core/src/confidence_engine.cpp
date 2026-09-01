#include "frontier_relay/mvp.hpp"

#include <algorithm>

namespace frontier_relay {

ConfidenceResult WeightedConfidenceEngine::calculate(
    std::span<const ValidationEvidence> evidence, const double model_reliability) const {
  double earned = 0.0;
  double possible = 0.0;
  for (const auto& signal : evidence) {
    possible += std::max(0.0, signal.weight);
    if (signal.passed) earned += std::max(0.0, signal.weight);
  }
  const double validation_score = possible == 0.0 ? 0.0 : (earned / possible) * 90.0;
  const double score = std::clamp(validation_score + std::clamp(model_reliability, 0.0, 1.0) * 10.0,
                                  0.0, 100.0);
  const auto decision = score >= 90.0 ? Decision::accept
                      : score >= 75.0 ? Decision::local_review
                      : score >= 50.0 ? Decision::repair
                                      : Decision::escalate;
  return {.score = score, .decision = decision,
          .evidence = {evidence.begin(), evidence.end()}};
}

std::string_view to_string(const Decision decision) {
  switch (decision) {
    case Decision::accept: return "ACCEPT";
    case Decision::local_review: return "LOCAL_REVIEW";
    case Decision::repair: return "REPAIR";
    case Decision::escalate: return "ESCALATE";
  }
  return "ESCALATE";
}

}  // namespace frontier_relay

