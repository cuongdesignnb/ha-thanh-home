export type ServiceDisplayPrice = {
  packageName: string;
  price: string;
};

/** Marketing reference only. The estimator's inputs and formulas are separate API data. */
export const SERVICE_DISPLAY_REFERENCE_PRICING: readonly ServiceDisplayPrice[] = [
  { packageName: "Xây thô + nhân công hoàn thiện", price: "4–5 triệu đồng/m²" },
  { packageName: "Trọn gói tiêu chuẩn", price: "6–7,5 triệu đồng/m²" },
  { packageName: "Vật tư khá", price: "7–8,5 triệu đồng/m²" },
  { packageName: "Cao cấp", price: "8–10 triệu đồng/m²" },
];

export function resolveServiceDisplayPricing(
  prices: readonly ServiceDisplayPrice[] = SERVICE_DISPLAY_REFERENCE_PRICING,
): readonly ServiceDisplayPrice[] {
  return prices;
}

export const SERVICE_DISPLAY_REFERENCE_NOTE = {
  vat: "Giá chưa bao gồm VAT.",
  effectivePeriod: "Hiệu lực tham khảo: 01/06/2026 – 01/01/2027.",
} as const;
