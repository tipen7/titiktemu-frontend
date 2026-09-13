import type { ConfidenceLevel } from "@/app/types/zones";

// Thresholds (>=80 high, 40-79 moderate, <40 low) are decided server-side
// (titiktemu-backend's confidenceLevelFor) -- this only maps the level
// string it returns to a color/label, so the two never drift apart.
export const CONFIDENCE_COLOR: Record<ConfidenceLevel, string> = {
  high: "#39b332",
  moderate: "#eab308",
  low: "#d90e10",
};

export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  moderate: "Moderate confidence",
  low: "Low confidence",
};
