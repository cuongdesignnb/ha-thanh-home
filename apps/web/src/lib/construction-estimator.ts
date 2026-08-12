export type EstimatorOption = {
  label: string;
  value: string;
  variables?: Record<string, number>;
};

export type EstimatorLabelField = {
  name: string;
};

const variableByField: Record<string, { name: string; suffix: "price" | "area" | "basement-area" | "percent" }> = {
  scope: { name: "unit_price", suffix: "price" },
  foundationType: { name: "foundation_area_factor", suffix: "area" },
  roofType: { name: "roof_area_factor", suffix: "area" },
  basementType: { name: "basement_area_factor", suffix: "basement-area" },
  designOption: { name: "design_percent", suffix: "percent" },
};

/**
 * Keeps option labels presentation-only. The number shown to visitors always
 * comes from the same variables used by the API calculator.
 */
export function formatEstimatorOptionLabel(field: EstimatorLabelField, option: EstimatorOption) {
  const config = variableByField[field.name];
  const baseLabel = stripEstimatorNumericSuffix(option.label, config?.suffix);
  if (!config) return baseLabel;

  const value = Number(option.variables?.[config.name]);
  if (!Number.isFinite(value)) return baseLabel;

  if (config.suffix === "price") return `${baseLabel} — ${formatMillions(value)} triệu/m²`;
  if (config.suffix === "basement-area") return `${baseLabel} — ${formatPercent(value)}% diện tích hầm`;
  if (config.suffix === "area") return `${baseLabel} — ${formatPercent(value)}% diện tích`;
  return `${baseLabel} — ${formatPercent(value)}%`;
}

function stripEstimatorNumericSuffix(label: string, suffix?: "price" | "area" | "basement-area" | "percent") {
  if (!suffix) return label;
  const numeric = String.raw`\d[\d.,]*`;
  const pattern = suffix === "price"
    ? new RegExp(String.raw`\s*(?:[-–—:]\s*)?${numeric}\s*(?:triệu|trieu)\s*/\s*m(?:2|²)\s*$`, "iu")
    : suffix === "percent"
      ? new RegExp(String.raw`\s*(?:[-–—:]\s*)?${numeric}\s*%\s*$`, "u")
      : new RegExp(String.raw`\s*(?:[-–—:]\s*)?${numeric}\s*%\s*(?:diện\s+tích(?:\s+hầm)?|dien\s+tich(?:\s+ham)?)\s*$`, "iu");
  return label.replace(pattern, "").trim() || label.trim();
}

function formatMillions(value: number) {
  return (value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

function formatPercent(value: number) {
  return (value * 100).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}
