import assert from "node:assert/strict";
import {
  ConstructionEstimatorService,
  defaultEstimatorFormulaItems,
  defaultEstimatorInputSchema,
  normalizeLegacyConfigForRuntime,
} from "./construction-estimator.service";

const legacyConfig = {
  id: 7,
  name: "Legacy estimator",
  currency: "VND",
  minFactor: 0.9,
  maxFactor: 1.1,
  inputSchemaJson: [{ name: "area", type: "number" }],
  formulaItemsJson: [{ code: "base", label: "Legacy", expression: "gross_area * unit_price" }],
};

async function run() {
  const normalized = normalizeLegacyConfigForRuntime(legacyConfig);
  assert.notStrictEqual(normalized, legacyConfig);
  assert.deepEqual(legacyConfig.formulaItemsJson, [{ code: "base", label: "Legacy", expression: "gross_area * unit_price" }]);
  assert.deepEqual(normalized.formulaItemsJson, defaultEstimatorFormulaItems);
  assert.deepEqual(normalized.inputSchemaJson, defaultEstimatorInputSchema);

  let updateCalled = false;
  const prisma = {
    constructionEstimatorConfig: {
      findFirst: async () => legacyConfig,
      update: async () => {
        updateCalled = true;
        throw new Error("GET must not update estimator config");
      },
    },
  };
  const service = new ConstructionEstimatorService(prisma as never, {} as never);
  const adminConfig = await service.getAdminConfig();
  assert.equal(updateCalled, false);
  assert.deepEqual(adminConfig.formulaItemsJson, defaultEstimatorFormulaItems);

  const publicConfig = await service.getPublicConfig();
  assert.equal(updateCalled, false);
  const publicScope = (publicConfig.inputSchema as Array<{ name: string; options?: Array<{ variables?: Record<string, number> }> }>).find((field) => field.name === "scope");
  assert.equal(publicScope?.options?.[0]?.variables?.unit_price, 3_500_000);

  const zeroFactorConfig = {
    name: "Zero factor regression",
    currency: "VND",
    minFactor: 1,
    maxFactor: 1,
    inputSchemaJson: [
      { name: "area", label: "Area", type: "number", required: true },
      { name: "floors", label: "Floors", type: "number", required: true },
      { name: "scope", label: "Scope", type: "select", required: true, options: [{ label: "Free", value: "free", variables: { unit_price: 1_000_000 } }] },
      { name: "foundationType", label: "Foundation", type: "select", options: [{ label: "None", value: "none", variables: { foundation_area_factor: 0 } }] },
      { name: "roofType", label: "Roof", type: "select", options: [{ label: "None", value: "none", variables: { roof_area_factor: 0 } }] },
      { name: "basementArea", label: "Basement", type: "number", defaultValue: 0 },
      { name: "basementType", label: "Basement type", type: "select", options: [{ label: "None", value: "none", variables: { basement_area_factor: 0 } }] },
      { name: "designOption", label: "Design", type: "select", options: [{ label: "None", value: "none", variables: { design_percent: 0 } }] },
    ],
    formulaItemsJson: [{ code: "total", label: "Total", expression: "construction_cost", active: true }],
  };
  const calculateWithConfig = (service as unknown as { calculateWithConfig: (config: typeof zeroFactorConfig, input: Record<string, unknown>) => { total: number; variables: Record<string, number> } }).calculateWithConfig.bind(service);
  const result = calculateWithConfig(zeroFactorConfig, {
    area: 100,
    floors: 2,
    scope: "free",
    foundationType: "none",
    roofType: "none",
    basementArea: 0,
    basementType: "none",
    designOption: "none",
  });
  assert.equal(result.variables.foundation_area_factor, 0);
  assert.equal(result.variables.roof_area_factor, 0);
  assert.equal(result.variables.basement_area_factor, 0);
  assert.equal(result.variables.design_percent, 0);
  assert.equal(result.variables.priced_area, 200);
  assert.equal(result.total, 200_000_000);
}

run().then(() => console.log("construction estimator regression tests passed"));
