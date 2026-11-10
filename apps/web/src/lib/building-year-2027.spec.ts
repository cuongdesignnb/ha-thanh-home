import assert from "node:assert/strict";
import { BUILDING_YEAR_2027_PATH, birthYearFromSlug, canChiOf, verdictFor2027, withBuildingYear2027 } from "./building-year-2027";
import { isLegacyRedirectSource } from "./legacy-redirects";

// Same results as the published 2027 lookup post: these birth years (1958–2001) can build in 2027.
const published = [1958, 1960, 1961, 1969, 1970, 1976, 1985, 1988, 1994, 1997];
const computed: number[] = [];
for (let y = 1958; y <= 2001; y++) if (verdictFor2027(y).canBuild) computed.push(y);
assert.deepEqual(computed, published);

assert.equal(canChiOf(2027), "Đinh Mùi");
assert.equal(canChiOf(1985), "Ất Sửu");
const v1985 = verdictFor2027(1985);
assert.equal(v1985.lunarAge, 43);
assert.equal(v1985.kimLau, null);
assert.equal(v1985.tamTai, false);
assert.equal(v1985.canBuild, true);
assert.equal(verdictFor2027(1991).tamTai, true, "Tân Mùi is in its last Tam Tai year in 2027");
assert.equal(verdictFor2027(1986).kimLau, "Kim Lâu Tử", "tuổi mụ 42");

const yearSlug = "nam-1985-tuoi-at-suu-xay-nha-hop-huong-nao-giup-sinh-tai-loc";
assert.equal(birthYearFromSlug(yearSlug), 1985);
assert.equal(birthYearFromSlug("xem-tuoi-xay-nha-nam-2027-dinh-mui"), null);

// The link target renders, not redirects.
assert.equal(isLegacyRedirectSource(BUILDING_YEAR_2027_PATH), false);

const body = "<h2>Tổng quan</h2><p>A</p><h2>Nam mạng</h2><p>B</p>";
const boxed = withBuildingYear2027(yearSlug, body);
assert.equal((boxed.match(/class="year-2027-box"/g) || []).length, 1);
assert.ok(boxed.includes("Sinh năm 1985 làm nhà năm 2027"));
assert.ok(boxed.includes("có thể tự đứng tên làm nhà"));
assert.ok(boxed.indexOf("year-2027-box") > boxed.indexOf("<h2>Tổng quan</h2>"));
assert.ok(boxed.indexOf("year-2027-box") < boxed.indexOf("<h2>Nam mạng</h2>"));
assert.equal(withBuildingYear2027(yearSlug, boxed), boxed, "never inserted twice");

const bad = withBuildingYear2027("nam-1991-tuoi-tan-mui-xay-nha-hop-huong-nao-giup-sinh-tai-loc", body);
assert.ok(bad.includes("nên mượn tuổi") && bad.includes("Tam Tai"));

const hub = withBuildingYear2027("xem-tuoi-xay-nha-theo-nam-sinh", body);
assert.equal((hub.match(new RegExp(BUILDING_YEAR_2027_PATH, "g")) || []).length, 1);
assert.equal(withBuildingYear2027("thu-tuc-xin-cap-dien-3-pha", body), body);
assert.ok(withBuildingYear2027(yearSlug, "<p>Một</p>").includes("year-2027-box"));

console.log(`building-year-2027: ${computed.length} buildable years match the published 2027 table`);
