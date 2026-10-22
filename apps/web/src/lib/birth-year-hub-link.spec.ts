import assert from "node:assert/strict";
import { BIRTH_YEAR_HUB_PATH, birthYearRelatedPosts, linksToBirthYearHub, withBirthYearHubLink } from "./birth-year-hub-link";
import { isLegacyRedirectSource } from "./legacy-redirects";

for (const slug of [
  "nam-1965-tuoi-at-ty-xay-nha-hop-huong-nao-giup-sinh-tai-loc",
  "nam-1980-tuoi-canh-than-y-xay-nha-hop-huong-nao-giup-sinh-tai-loc",
  "nam-2001-tuoi-tan-ty-xay-nha-hop-huong-nao-giup-sinh-tai-loc",
  "co-nen-muon-tuoi-xay-nha",
]) assert.equal(linksToBirthYearHub(slug), true, slug);
for (const slug of ["xem-tuoi-xay-nha-theo-nam-sinh", "thu-tuc-xin-cap-dien-3-pha", "nam-1990-tuoi"]) {
  assert.equal(linksToBirthYearHub(slug), false, slug);
}
// Linked targets must render, not redirect.
assert.equal(isLegacyRedirectSource(BIRTH_YEAR_HUB_PATH), false);
for (const slug of birthYearRelatedPosts) assert.equal(isLegacyRedirectSource(`/tin-tuc/${slug}`), false, `${slug} redirects away`);

const year = "nam-1990-tuoi-canh-ngo-xay-nha-hop-huong-nao-giup-sinh-tai-loc";
const body = "<h2>Tổng quan</h2><p>A</p><h2>Nam mạng</h2><p>B</p>";
const linked = withBirthYearHubLink(year, body);
assert.equal((linked.match(/href="\/tin-tuc\/xem-tuoi-xay-nha-theo-nam-sinh"/g) || []).length, 1);
assert.ok(linked.indexOf("service-context-link") > linked.indexOf("<h2>Tổng quan</h2>"));
assert.ok(linked.indexOf("service-context-link") < linked.indexOf("<h2>Nam mạng</h2>"));
assert.equal(withBirthYearHubLink(year, linked), linked, "never inserted twice");
assert.equal(withBirthYearHubLink("thu-tuc-xin-cap-dien-3-pha", body), body);
assert.ok(withBirthYearHubLink(year, "<p>Một</p>").endsWith("</p>") && withBirthYearHubLink(year, "<p>Một</p>").includes(BIRTH_YEAR_HUB_PATH));

console.log(`birth-year-hub-link: ${birthYearRelatedPosts.size} related posts and year posts verified`);
