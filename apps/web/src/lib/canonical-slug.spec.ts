import assert from "node:assert/strict";
import { isCanonicalSlug } from "./canonical-slug";

assert.equal(isCanonicalSlug("thu-tuc-xin-cap-dien-3-pha", "thu-tuc-xin-cap-dien-3-pha"), true);
// Variants the API resolves to the same record must not render as their own pages.
assert.equal(isCanonicalSlug("THU-TUC-XIN-CAP-DIEN-3-PHA", "thu-tuc-xin-cap-dien-3-pha"), false);
assert.equal(isCanonicalSlug("xay-nha-tron-goi-tai-l%C6%B0%C6%A1ng-son-phu-tho", "xay-nha-tron-goi-tai-luong-son-phu-tho"), false);
assert.equal(isCanonicalSlug("xay-nha-tron-goi-tai-lương-son-phu-tho", "xay-nha-tron-goi-tai-luong-son-phu-tho"), false);
// A stored slug with non-ASCII characters matches whether or not the router decoded it.
assert.equal(isCanonicalSlug("hai-d%C6%B0%C6%A1ng", "hai-dương"), true);
assert.equal(isCanonicalSlug("hai-dương", "hai-dương"), true);
// Malformed escapes fall back to the raw value instead of throwing.
assert.equal(isCanonicalSlug("bad-%E0%A4%A", "bad-%E0%A4%A"), true);

console.log("canonical-slug: slug canonicalisation verified");
