import assert from "node:assert/strict";
import {
  isUsableSlug,
  normalizeLegacyAnchors,
  normalizeLegacyHref,
} from "./rich-content";
import { getLegacyRedirectTarget, isLegacyRedirectSource } from "./legacy-redirects";

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
const gscRedirects: Array<[string, string]> = [
  ["/du-an/xay-nha-tron-goi-tai-xa-an-khanh-ha-noi-hathanhhome", "/du-an/xay-nha-tron-goi-tai-xa-an-khanh-ha-noi"],
  ["/mau-thiet-ke-kien-truc/35-mau-biet-thu-tan-co-dien-san-vuon-dep-nha-2026", "/mau-thiet-ke-kien-truc/35-mau-biet-thu-tan-co-dien-san-vuon-dep-2026"],
  ["/du-an/xay-nha-tron-goi-tai-ha-dong-khao-sat-tu-van-mien-phi", "/du-an/xay-nha-tron-goi-tai-ha-dong"],
  ["/du-an/cong-trinh-nha-o-biet-thu-3-tang-tai-bac-ninh-dep-hien-dai", "/du-an/cong-trinh-nha-o-biet-thu"],
  ["/cong-ty-noi-that-van-phong-mien-bac-uy-tin-chuyen-nghiep", "/du-an/cong-ty-noi-that-van-phong-mien-bac"],
  ["/xay-nha-tron-goi-ba-vi-ho-tro-24/7-cong-ty-xay-dung-uy-tin", "/du-an/xay-nha-tron-goi-ba-vi-ho-tro-20-7-cong-ty-xay-dung-uy-tin"],
  ["/70%20-mau-biet-thu-tan-co-dien-hien-dai-dep-nha-2026", "/mau-thiet-ke-kien-truc/70-mau-biet-thu-tan-co-dien-hien-dai-dep-2026"],
  ["/du-an/xay-nha-tron-goi-long-bien-ha-noi", "/du-an/xay-nha-tron-goi-long-bien-ha-noi-hathanhhome"],
  ["/du-an/xay-nha-tron-goi-tai-ha-dong-khao-sat-tu-van-mien-phi-hathanhhome", "/du-an/xay-nha-tron-goi-tai-ha-dong"],
  ["/du-an/xay-nha-tron-goi-tai-nam-dinh-cap-nhat-bao-gia-moi-nhat-2026", "/xay-nha-tron-goi-tai-nam-dinh-cap-nhat-bao-gia-moi-nhat-2026"],
  ["/du-an/xay-nha-tron-goi-hai-ba-trung", "/du-an/xay-nha-tron-goi-hai-ba-trung-hathanhhome"],
  ["/90%20-mau-biet-thu-hien-dai-dep-2026", "/mau-thiet-ke-kien-truc/90-mau-biet-thu-hien-dai-dep-2026"],
  ["/du-an/xay-nha-tron-goi-chuong-my-cap-nhap-bao-gia-moi-nhat", "/du-an/xay-nha-tron-goi-chuong-my-cap-nhat-bao-gia-moi-nhat"],
  ["/99-%20-mau-nha-mai-nhat-dep-2026", "/mau-thiet-ke-kien-truc/99-mau-nha-mai-nhat-dep-2026"],
];
for (const [rawPath, target] of gscRedirects) {
  assert.equal(getLegacyRedirectTarget(decodeURIComponent(rawPath)), target);
}
const wave5aRedirects: Array<[string, string]> = [
  ["/xay-nha-tron-goi-cau-giay-chuan-tien-do-hathanhhome", "/du-an/xay-nha-tron-goi-cau-giay"],
  ["/xay-nha-tron-goi-chuong-my-cap-nhap-bao-gia-moi-nhat", "/du-an/xay-nha-tron-goi-chuong-my-cap-nhat-bao-gia-moi-nhat"],
  ["/xay-nha-tron-goi-tai-ha-dong-khao-sat-tu-van-mien-phi-hathanhhome", "/du-an/xay-nha-tron-goi-tai-ha-dong"],
  ["/xay-nha-tron-goi-tai-vinh-phuc-bao-gia-chi-tiet-2026", "/du-an/xay-nha-tron-goi-vinh-phuc-bao-gia-chi-tiet-2026"],
  ["/xay-nha-tron-goi-tai-hai-duong-cap-nhap-bao-gia-moi-nhat-2026", "/du-an/xay-nha-tron-goi-tai-hai-duong-cap-nhat-bao-gia-moi-nhat2026"],
  ["/xay-nha-tron-goi-tai-noi-bai-ha-noi", "/du-an/xay-nha-tron-goi-xa-noi-bai-ha-noi"],
  ["/xay-nha-tron-goi-tai-phuong-ba-dinh", "/du-an/xay-nha-tron-goi-ba-dinh-ha-noi-cong-ty-xay-dung-uy-tin"],
  ["/cong-trinh-biet-thu-nha-vuon-ninh-binh", "/du-an/cong-trinh-biet-thu-nha-vuon-nha-anh-tran-cao-cuong-ninh-binh"],
  ["/Cong-trinh-biet-thu-nha-vuon-ninh-binh", "/du-an/cong-trinh-biet-thu-nha-vuon-nha-anh-tran-cao-cuong-ninh-binh"],
];
for (const [source, target] of wave5aRedirects) assert.equal(getLegacyRedirectTarget(source), target);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-random"), undefined);
assert.equal(getLegacyRedirectTarget("/du-an/xay-nha-tron-goi-long-bien-ha-noi-random"), undefined);
assert.equal(getLegacyRedirectTarget("/70-other-page"), undefined);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-tai-xa-an-khanh-ha-noi-ha-thanh-home"), undefined);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet-nhat-hathanhhome"), undefined);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-dong-da-bao-hanh-dai-han-hathanhhome"), undefined);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-tai-nam-dinh-cap-nhat-bao-gia-moi-nhat-2026"), undefined);
assert.equal(isLegacyRedirectSource("/cong-trinh-biet-thu-nha-vuon-ninh-binh"), true);
assert.equal(isLegacyRedirectSource("/Cong-trinh-biet-thu-nha-vuon-ninh-binh"), true);
for (const path of [
  "/bao-gia-sua-chua-nha-ha-noi",
  "/sua-chua-cua-hang-tai-ha-noi-chuyen-nghiep",
  "/dich-vu-sua-chua-nha-hang-chuyen-nghiep-gia-tot-nhat-tai-ha-noi",
  "/goc-giai-dap-cua-phong-ngu-nen-mo-vao-trong-hay-ra-ngoai",
  "/doc-trat-tuong",
]) assert.equal(getLegacyRedirectTarget(path), undefined);

console.log("SEO rich-content regression tests passed");
