import assert from "node:assert/strict";
import {
  isUsableSlug,
  normalizeLegacyAnchors,
  normalizeLegacyHref,
} from "./rich-content";
import { getLegacyRedirectTarget } from "./legacy-redirects";

assert.equal(normalizeLegacyHref("../gia-vat-lieu-xay-dung/"), "/gia-vat-lieu-xay-dung/");
assert.equal(normalizeLegacyHref("%22../gia-vat-lieu-xay-dung/%22"), "/gia-vat-lieu-xay-dung/");
assert.equal(normalizeLegacyHref("&quot;../gia-vat-lieu-xay-dung/&quot;"), "/gia-vat-lieu-xay-dung/");
assert.equal(normalizeLegacyHref("%22tel:0898502333/%22"), "tel:0898502333");
assert.equal(normalizeLegacyHref("tel:+84898502333"), "tel:+84898502333");
assert.equal(normalizeLegacyHref("https://example.com/a"), "https://example.com/a");
assert.equal(normalizeLegacyHref("https://www.hathanhhome.vn/tin-tuc?x=1#top"), "https://hathanhhome.vn/tin-tuc?x=1#top");
assert.equal(normalizeLegacyAnchors('<img src="../image.jpg"><p>"../not-a-link/"</p>'), '<img src="../image.jpg"><p>"../not-a-link/"</p>');
assert.equal(normalizeLegacyAnchors('<script>const html = "<a href=\\"../not-a-link/\\">";</script><style>.x{content:"../not-a-link/"}</style>'), '<script>const html = "<a href=\\"../not-a-link/\\">";</script><style>.x{content:"../not-a-link/"}</style>');
assert.equal(normalizeLegacyAnchors('<a class="related" href="%27../old-post/%27">Xem</a>'), '<a class="related" href="/old-post/">Xem</a>');

for (const invalid of [null, undefined, "", "  ", "null", "undefined", "NULL", "Undefined"]) assert.equal(isUsableSlug(invalid), false);
assert.equal(isUsableSlug("bai-viet-hop-le"), true);

assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi"), "/dich-vu/xay-nha-tron-goi");
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-tai-ha-noi"), "/du-an/xay-nha-tron-goi-tai-ha-noi-dich-vu-thi-cong-chuyen-nghiep");
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-quan-hai-ba-trung"), "/du-an/xay-nha-tron-goi-hai-ba-trung-hathanhhome");
assert.equal(getLegacyRedirectTarget("/bao-gia-xay-nha-tai-quan-hoan-kiem"), "/du-an/xay-nha-tron-goi-phuong-hoan-kiem-hathanhhome");
assert.equal(getLegacyRedirectTarget("/bao-gia-xay-dung-nha-tron-goi-gia-re"), "/du-an/bao-gia-xay-nha-tron-goi-tai-ha-noi-2026");
assert.equal(getLegacyRedirectTarget("/noi-that-phong-ngu"), "/mau-thiet-ke-noi-that/mau-phong-ngu-dep-am-cung-va-hien-dai");
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-random"), undefined);
for (const path of [
  "/bao-gia-sua-chua-nha-ha-noi",
  "/sua-chua-cua-hang-tai-ha-noi-chuyen-nghiep",
  "/dich-vu-sua-chua-nha-hang-chuyen-nghiep-gia-tot-nhat-tai-ha-noi",
  "/goc-giai-dap-cua-phong-ngu-nen-mo-vao-trong-hay-ra-ngoai",
  "/doc-trat-tuong",
]) assert.equal(getLegacyRedirectTarget(path), undefined);

console.log("SEO rich-content regression tests passed");
