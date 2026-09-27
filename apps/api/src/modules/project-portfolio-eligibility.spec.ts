import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isPortfolioProjectEligible,
  verifiedPortfolioFilter,
  verifiedPortfolioWhere,
} from "./project-portfolio-eligibility";

assert.equal(isPortfolioProjectEligible({ status: "published", isPortfolioVerified: true }), true);
assert.equal(isPortfolioProjectEligible({ status: "published", isPortfolioVerified: false }), false);
assert.equal(isPortfolioProjectEligible({ status: "draft", isPortfolioVerified: true }), false);
assert.equal(isPortfolioProjectEligible({ status: "published", isPortfolioVerified: null }), false);

assert.deepEqual(verifiedPortfolioFilter({ isPortfolioVerified: "true" }), { isPortfolioVerified: true });
assert.deepEqual(verifiedPortfolioFilter({ isPortfolioVerified: "false" }), {});
assert.deepEqual(verifiedPortfolioFilter({}), {});
assert.deepEqual(verifiedPortfolioWhere(), { isPortfolioVerified: true });

const eligibilitySource = readFileSync("apps/api/src/modules/project-portfolio-eligibility.ts", "utf8");
assert.doesNotMatch(eligibilitySource, /\b65\b/, "eligibility rules must not special-case a project ID");

const migration = readFileSync(
  "apps/api/prisma/migrations/20260927160000_project_portfolio_verification/migration.sql",
  "utf8",
);
assert.match(migration, /ADD COLUMN `isPortfolioVerified` BOOLEAN NOT NULL DEFAULT false/i);
assert.match(migration, /WHERE `status` = 'published'/i);
assert.match(migration, /SET `isPortfolioVerified` = false\s+WHERE `id` = 65/i);
assert.ok(migration.indexOf("ADD COLUMN") < migration.indexOf("WHERE `status` = 'published'"));
assert.ok(migration.indexOf("WHERE `status` = 'published'") < migration.indexOf("WHERE `id` = 65"));

const publicController = readFileSync("apps/api/src/modules/public.controller.ts", "utf8");
assert.match(publicController, /\.\.\.verifiedPortfolioFilter\(query\)/);
const appService = readFileSync("apps/api/src/modules/app.service.ts", "utf8");
assert.equal((appService.match(/\.\.\.verifiedPortfolioWhere\(\)/g) || []).length, 2);
const adminController = readFileSync("apps/api/src/modules/admin.controller.ts", "utf8");
assert.match(adminController, /isPortfolioVerified\?: boolean/);
assert.match(adminController, /isPortfolioVerified: dto\.isPortfolioVerified \?\? false/);
const prismaSchema = readFileSync("apps/api/prisma/schema.prisma", "utf8");
assert.match(prismaSchema, /isPortfolioVerified Boolean @default\(false\)/);

console.log("API project portfolio eligibility and migration tests passed.");
