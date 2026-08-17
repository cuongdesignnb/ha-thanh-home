import assert from "node:assert/strict";
import {
  isUsableSlug,
  normalizeLegacyAnchors,
  normalizeLegacyHref,
} from "./rich-content";

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

console.log("SEO rich-content regression tests passed");
