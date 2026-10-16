import assert from "node:assert/strict";
import { getLegacyRedirectTarget } from "./legacy-redirects";
import { getGscNotFoundTarget } from "./legacy-redirects-gsc";
import { areaLandingsFor, getProjectPageInfo, nonPortfolioProjectPages, parentServices } from "./project-page-kind";

const entries = Object.entries(nonPortfolioProjectPages);
assert.equal(entries.length, 82);

for (const [slug, info] of entries) {
  assert.ok(/^[a-z0-9-]+$/.test(slug), `${slug} must be a bare slug`);
  assert.ok(parentServices[info.parent], `${slug} has an unknown parent ${info.parent}`);
  if (info.kind === "area") assert.ok(info.region, `${slug} is an area landing without a region`);
  // A merged page never renders, so listing it here would be dead data.
  assert.equal(getLegacyRedirectTarget(`/du-an/${slug}`), undefined, `${slug} redirects away`);
  assert.equal(getGscNotFoundTarget(`/du-an/${slug}`), undefined, `${slug} redirects away`);
}

const kinds = entries.reduce<Record<string, number>>((acc, [, info]) => ({ ...acc, [info.kind]: (acc[info.kind] || 0) + 1 }), {});
assert.deepEqual(kinds, { area: 44, pricing: 21, service: 7, guide: 10 });

// Real projects are not in the table and keep the project template.
for (const project of [
  "cong-trinh-nha-o-biet-thu",
  "du-an-thiet-ke-thi-cong-nha-pho-do-van-hai-thinh-liet-hoang-mai",
  "du-an-thiet-ke-thi-cong-xay-nha-tron-goi-soc-son-ha-noi",
  "xay-nha-tron-goi-yen-phong-bac-ninh-biet-thu-2-tang-mai-thai",
]) {
  assert.equal(getProjectPageInfo(project), undefined, `${project} is a real project`);
}
assert.equal(getProjectPageInfo(undefined), undefined);
assert.deepEqual(getProjectPageInfo("xay-nha-tron-goi-cau-giay"), { kind: "area", parent: "xay-nha-tron-goi", region: "Cầu Giấy, Hà Nội" });

const areas = areaLandingsFor("xay-nha-tron-goi");
assert.equal(areas.length, 44);
assert.equal(areas.filter((area) => area.region.endsWith("Hà Nội")).length, 27);
assert.equal(areaLandingsFor("thi-cong-nha-xuong").length, 0);

console.log(`project-page-kind: ${entries.length} non-portfolio project pages verified`);
