import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { contentConsolidationRedirects } from "./content-consolidation-redirects";
import { deadInternalHrefPaths } from "./dead-internal-hrefs";
import { internalCanonicalHrefTargets } from "./internal-href-targets";
import { getLegacyRedirectTarget, isLegacyRedirectSource, legacySeoRedirects } from "./legacy-redirects";
import { getGscNotFoundTarget, gscNotFoundRedirects } from "./legacy-redirects-gsc";
import { prepareDetailHtml } from "./rich-content";
import { TURNKEY_SERVICE_PATH, turnkeyContextPosts, withTurnkeyContextLink } from "./service-context-links";
import { getMalformedLegacyTarget, proxy } from "../proxy";

const entries = Object.entries(contentConsolidationRedirects);
assert.equal(entries.length, 63);

for (const [source, target] of entries) {
  assert.ok(source.startsWith("/") && target.startsWith("/"), `${source} -> ${target} must be root-relative`);
  assert.notEqual(source, target);
  // Disjoint from every other redirect map so no entry is dead code or ambiguous.
  assert.equal(legacySeoRedirects[source], undefined, `${source} already exists in legacySeoRedirects`);
  assert.equal(getGscNotFoundTarget(source), undefined, `${source} already exists in gscNotFoundRedirects`);
  assert.equal(getMalformedLegacyTarget(source), undefined, `${source} already exists in malformedLegacyPaths`);
  assert.equal(deadInternalHrefPaths.has(source), false, `${source} is a known dead path`);
  // No chains: a destination is never itself redirected.
  assert.equal(getLegacyRedirectTarget(target), undefined, `${target} is also a legacy/consolidation source`);
  assert.equal(getGscNotFoundTarget(target), undefined, `${target} is also a GSC source`);
  assert.equal(getMalformedLegacyTarget(target), undefined, `${target} is also a malformed source`);
  assert.equal(isLegacyRedirectSource(source), true);
}

// Existing maps must not point into a consolidated source (that would create a two-hop chain).
const otherTargets = [
  ...Object.values(legacySeoRedirects),
  ...Object.values(gscNotFoundRedirects),
  ...Object.values(internalCanonicalHrefTargets),
];
for (const target of otherTargets) {
  assert.equal(contentConsolidationRedirects[target], undefined, `${target} is a destination elsewhere but now redirects`);
}

function redirectOf(rawPath: string) {
  const response = proxy(new NextRequest(`https://hathanhhome.vn${rawPath}`));
  return { status: response.status, location: response.headers.get("location") };
}

const samples: Array<[string, string]> = [
  ["/du-an/xay-nha-tron-goi-thai-nguyen-2026-bao-gia-chi-tiet-thi-cong-uy-tin", "https://hathanhhome.vn/xay-nha-tron-goi-thai-nguyen-2026--bao-gia-chi-tiet-thi-cong-uy-tin"],
  ["/xay-nha-tron-goi-uy-tin-tiet-kiem-chi-phi", "https://hathanhhome.vn/dich-vu/xay-nha-tron-goi"],
  ["/tin-tuc/gia-xay-biet-thu-tron-goi-2", "https://hathanhhome.vn/tin-tuc/gia-xay-biet-thu-tron-goi"],
  // Previously chained through the /du-an Thái Nguyên copy; now one hop to the kept page.
  ["/xay-nha-tron-goi-tai-thai-nguyen", "https://hathanhhome.vn/xay-nha-tron-goi-thai-nguyen-2026--bao-gia-chi-tiet-thi-cong-uy-tin"],
  // P1-lite merges.
  ["/du-an/xay-nha-tron-goi-tai-ha-noi-dich-vu-thi-cong-chuyen-nghiep", "https://hathanhhome.vn/dich-vu/xay-nha-tron-goi"],
  ["/tin-tuc/thi-cong-nha-xuong-hung-yen", "https://hathanhhome.vn/dich-vu/thi-cong-nha-xuong"],
  ["/du-an/thi-cong-van-phong-tai-hai-phong", "https://hathanhhome.vn/dich-vu/thi-cong-noi-that-van-phong"],
  ["/tin-tuc/xay-nha-tron-goi-tu-mong-den-noi-that-quy-trinh-chi-phi-va-cach-han-che-phat-sinh", "https://hathanhhome.vn/tin-tuc/xay-nha-tron-goi-tu-mong-den-noi-that"],
  // Older maps that pointed into a merged page now go straight to the kept page (one hop).
  ["/xay-nha-tron-goi-tai-ha-noi", "https://hathanhhome.vn/dich-vu/xay-nha-tron-goi"],
  ["/xay-nha-pho-3-tang-tron-goi", "https://hathanhhome.vn/tin-tuc/xay-nha-pho-3-tang-tron-goi-chi-phi-tien-do-va-hang-muc-thi-cong"],
];
for (const [rawPath, location] of samples) assert.deepEqual(redirectOf(rawPath), { status: 308, location });

// Kept pages and near-misses are untouched.
for (const untouched of [
  "/xay-nha-tron-goi-thai-nguyen-2026--bao-gia-chi-tiet-thi-cong-uy-tin",
  "/tin-tuc/gia-xay-biet-thu-tron-goi",
  "/tin-tuc/xay-nha-pho-3-tang-tron-goi-chi-phi-tien-do-va-hang-muc-thi-cong",
  // Pages with their own Search Console visibility are deliberately kept.
  "/du-an/cong-ty-xay-dung-nha-uy-tin-ha-thanh-hathanhhome",
  "/du-an/cong-ty-xay-dung-nha-o-uy-tin-ha-noi",
  "/tin-tuc/don-gia-xay-dung-nha-tron-goi-moi-nhat",
  "/du-an/vat-lieu-thi-cong-xay-nha-tron-goi",
]) {
  assert.deepEqual(redirectOf(untouched), { status: 200, location: null });
}

// In-content links to a consolidated source are rewritten to the kept page.
assert.equal(
  prepareDetailHtml('<p><a href="/tin-tuc/cach-lua-chon-nha-thau-xay-dung-uy-tin-2">x</a></p>'),
  '<p><a href="/tin-tuc/cach-lua-chon-nha-thau-xay-dung-uy-tin">x</a></p>',
);

// Turnkey contextual link.
const contextSlugs = Object.keys(turnkeyContextPosts);
assert.equal(contextSlugs.length, 30);
for (const slug of contextSlugs) assert.equal(isLegacyRedirectSource(`/tin-tuc/${slug}`), false, `${slug} redirects away`);
assert.equal(isLegacyRedirectSource(TURNKEY_SERVICE_PATH), false);

const mapped = "co-nen-thue-xay-nha-tron-goi";
const body = "<p>Mở bài.</p><h2>Một</h2><p>A</p><h2>Hai</h2><p>B</p>";
const linked = withTurnkeyContextLink(mapped, body);
assert.equal((linked.match(/href="\/dich-vu\/xay-nha-tron-goi"/g) || []).length, 1);
assert.ok(linked.indexOf('class="service-context-link"') > linked.indexOf("<h2>Một</h2>"));
assert.ok(linked.indexOf('class="service-context-link"') < linked.indexOf("<h2>Hai</h2>"));
assert.equal(withTurnkeyContextLink(mapped, linked), linked, "never inserted twice");
assert.equal(withTurnkeyContextLink("bai-viet-khac", body), body, "unmapped posts are unchanged");
const alreadyLinked = '<p>Xem <a href="https://hathanhhome.vn/dich-vu/xay-nha-tron-goi/">dịch vụ</a>.</p><h2>A</h2><h2>B</h2>';
assert.equal(withTurnkeyContextLink(mapped, alreadyLinked), alreadyLinked);
// Without a second heading the sentence follows the first paragraph.
assert.equal(
  withTurnkeyContextLink(mapped, "<p>Một</p><p>Hai</p>").indexOf('<p class="service-context-link">'),
  "<p>Một</p>".length,
);
assert.ok(prepareDetailHtml(linked).includes('<a href="/dich-vu/xay-nha-tron-goi">'));

console.log(`content-consolidation-redirects: ${entries.length} redirects and ${contextSlugs.length} context links verified`);
