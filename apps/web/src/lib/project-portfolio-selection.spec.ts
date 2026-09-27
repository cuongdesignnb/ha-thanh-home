import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildProjectCatalogApiQuery } from "./project-catalog-pagination";
import { selectVerifiedRelatedProjects, type PortfolioCandidate } from "./project-portfolio-selection";

const project = (id: number, status: string, isPortfolioVerified: boolean): PortfolioCandidate => ({
  id,
  slug: `project-${id}`,
  status,
  isPortfolioVerified,
});

// A: verified + published is eligible.
assert.deepEqual(selectVerifiedRelatedProjects(1, [project(2, "published", true)]).map((item) => item.id), [2]);

// B: published but unverified is excluded.
assert.deepEqual(selectVerifiedRelatedProjects(1, [project(2, "published", false)]), []);

// C: verified but draft is excluded.
assert.deepEqual(selectVerifiedRelatedProjects(1, [project(2, "draft", true)]), []);

// D: Project65-style false record is excluded from related results.
assert.deepEqual(selectVerifiedRelatedProjects(27, [project(65, "published", false)]), []);

// E: Project 27 related results contain only verified published projects, never unverified cards.
const project27Related = selectVerifiedRelatedProjects(
  27,
  [project(65, "published", false), project(28, "published", true)],
  [project(29, "published", false), project(30, "published", true)],
);
assert.deepEqual(project27Related.map((item) => item.id), [28, 30]);
assert.equal(project27Related.every((item) => item.status === "published" && item.isPortfolioVerified === true), true);

// F: exclusion is generic, not an ID-specific exception.
assert.deepEqual(
  selectVerifiedRelatedProjects(27, [project(65, "published", false), project(650, "published", false)]),
  [],
);
assert.equal(buildProjectCatalogApiQuery({}).get("isPortfolioVerified"), "true");
const apiSource = readFileSync("apps/web/src/lib/api.ts", "utf8");
assert.match(apiSource, /if \(entity === "project"\)[\s\S]{0,180}params\.set\("isPortfolioVerified", "true"\)/);

// Eligibility is applied before deduplication: an unverified occurrence cannot suppress a verified record.
assert.deepEqual(
  selectVerifiedRelatedProjects(1, [project(2, "published", false)], [project(2, "published", true)]).map((item) => item.id),
  [2],
);

console.log("Web project portfolio selection tests passed.");
