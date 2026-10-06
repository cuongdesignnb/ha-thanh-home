import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ConstructionEstimatorService } from "../apps/api/src/modules/construction-estimator.service";
import { resolveServiceDisplayPricing, SERVICE_DISPLAY_REFERENCE_PRICING } from "../apps/web/src/lib/service-display-pricing";

const pageSource = readFileSync("apps/web/src/app/dich-vu/xay-nha-tron-goi/page.tsx", "utf8");
const estimatorSource = readFileSync("apps/api/src/modules/construction-estimator.service.ts", "utf8");
assert.match(pageSource, /resolveServiceDisplayPricing\(\)/);
assert.doesNotMatch(pageSource, /getConstructionEstimatorConfig|EstimatorPublicConfig|formatEstimatorOptionLabel/);
assert.doesNotMatch(estimatorSource, /service-display-pricing/);

const service = new ConstructionEstimatorService({} as never, {} as never);
const calculateWithConfig = (service as unknown as {
  calculateWithConfig: (config: Record<string, unknown>, input: Record<string, unknown>) => { total: number };
}).calculateWithConfig.bind(service);

const estimatorConfig = {
  name: "Estimator-only fixture",
  currency: "VND",
  minFactor: 1,
  maxFactor: 1,
  inputSchemaJson: [
    { name: "area", label: "Area", type: "number", required: true },
    { name: "floors", label: "Floors", type: "number", required: true },
    { name: "scope", label: "Scope", type: "select", required: true, options: [{ label: "Engine price", value: "engine", variables: { unit_price: 5_800_000 } }] },
  ],
  formulaItemsJson: [{ code: "total", label: "Total", expression: "construction_cost", active: true }],
};
const input = { area: 100, floors: 2, scope: "engine" };
const baselineEstimate = calculateWithConfig(estimatorConfig, input);
assert.equal(baselineEstimate.total, 1_160_000_000);

const originalDisplay = resolveServiceDisplayPricing();
const displayOnlyChange = originalDisplay.map((item, index) => index === 0 ? { ...item, price: "4–6 triệu đồng/m²" } : item);
assert.equal(resolveServiceDisplayPricing(displayOnlyChange)[0]?.price, "4–6 triệu đồng/m²");
assert.equal(calculateWithConfig(estimatorConfig, input).total, baselineEstimate.total);

const changedEstimatorConfig = {
  ...estimatorConfig,
  inputSchemaJson: estimatorConfig.inputSchemaJson.map((field) => field.name === "scope"
    ? { ...field, options: [{ label: "Engine-only changed", value: "engine", variables: { unit_price: 6_800_000 } }] }
    : field),
};
assert.equal(calculateWithConfig(changedEstimatorConfig, input).total, 1_360_000_000);
assert.deepEqual(resolveServiceDisplayPricing(), originalDisplay);
assert.deepEqual(SERVICE_DISPLAY_REFERENCE_PRICING, originalDisplay);

console.log("Service display pricing / estimator separation tests passed");
