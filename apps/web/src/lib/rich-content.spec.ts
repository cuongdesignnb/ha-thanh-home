import assert from "node:assert/strict";
import {
  isUsableSlug,
  normalizeLegacyAnchors,
  normalizeLegacyHref,
} from "./rich-content";
import { getLegacyRedirectTarget, isLegacyRedirectSource } from "./legacy-redirects";
import { getMalformedLegacyTarget } from "../proxy";
import { legacySlugComparisonKey, normalizeMenuItems, normalizeMenuUrl } from "./api";

assert.equal(normalizeLegacyHref("../gia-vat-lieu-xay-dung/"), "/gia-vat-lieu-xay-dung/");
assert.equal(normalizeLegacyHref("%22../gia-vat-lieu-xay-dung/%22"), "/gia-vat-lieu-xay-dung/");
assert.equal(normalizeLegacyHref("&quot;../gia-vat-lieu-xay-dung/&quot;"), "/gia-vat-lieu-xay-dung/");
assert.equal(normalizeLegacyHref("%22tel:0898502333/%22"), "tel:0898502333");
assert.equal(normalizeLegacyHref("tel:+84898502333"), "tel:+84898502333");
assert.equal(normalizeLegacyHref("\\&quot;../abc\\&quot;"), "/abc");
assert.equal(normalizeLegacyHref("\\&quot;tel:0898502333\\&quot;"), "tel:0898502333");
assert.equal(normalizeLegacyHref("\\&#34;../abc\\&#34;"), "/abc");
assert.equal(normalizeLegacyHref("\\%22../abc\\%22"), "/abc");
assert.equal(normalizeLegacyHref("https://example.com/a"), "https://example.com/a");
assert.equal(normalizeLegacyHref("https://www.hathanhhome.vn/tin-tuc?x=1#top"), "https://hathanhhome.vn/tin-tuc?x=1#top");
assert.equal(normalizeLegacyHref("/xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet-nhat-hathanhhome"), "/du-an/xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet");
assert.equal(normalizeLegacyHref("/xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet-nhat-hathanhhome?utm_source=internal#section"), "/du-an/xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet?utm_source=internal#section");
assert.equal(normalizeLegacyHref("/cach-tinh-chi-phi-xay-nha-tron-goi-khong-phat-sinh"), "/du-an/cach-tinh-chi-phi-xay-nha-tron-goi-khong-phat-sinh");
assert.equal(normalizeLegacyHref("/contact"), "/lien-he");
assert.equal(normalizeLegacyHref("/100+-mau-biet-thu-hien-dai-sang-trong-xu-huong-2026"), "/mau-thiet-ke-kien-truc/100-mau-biet-thu-hien-dai-sang-trong-xu-huong-2026");
for (const unresolved of [
  "/bao-gia-xay-nha-tron-goi-tai-xa-giao-thuy-ninh-binh",
  "/xay-nha-tron-goi-tai-xuam-truong-nam-dinh",
  "/xay-nha-tron-goi-tai-ha-long",
]) assert.equal(normalizeLegacyHref(unresolved), unresolved);
assert.equal(normalizeLegacyAnchors('<img src="../image.jpg"><p>"../not-a-link/"</p>'), '<img src="../image.jpg"><p>"../not-a-link/"</p>');
assert.equal(normalizeLegacyAnchors('<script>const html = "<a href=\\"../not-a-link/\\">";</script><style>.x{content:"../not-a-link/"}</style>'), '<script>const html = "<a href=\\"../not-a-link/\\">";</script><style>.x{content:"../not-a-link/"}</style>');
assert.equal(normalizeLegacyAnchors('<a class="related" href="%27../old-post/%27">Xem</a>'), '<a class="related" href="/old-post/">Xem</a>');

assert.equal(normalizeMenuUrl("/dich-vu/cong-trinh"), "/dich-vu");
assert.equal(normalizeMenuUrl("/dich-vu/noi-that"), "/dich-vu");
assert.equal(normalizeMenuUrl("/gioi-thieu"), "/gioi-thieu");
assert.deepEqual(normalizeMenuItems([
  { id: 1, label: "Dịch vụ", url: "/dich-vu/cong-trinh", children: [{ id: 2, label: "Nội thất", url: "/dich-vu/noi-that" }] },
]), [{ id: 1, label: "Dịch vụ", url: "/dich-vu", children: [{ id: 2, label: "Nội thất", url: "/dich-vu", children: undefined }] }]);

assert.equal(legacySlugComparisonKey("Cong-trinh-nha-o-phong-cach-dai-trung-hai-hien-dai"), legacySlugComparisonKey("cong-trinh-nha-o-phong-cach-dai-trung-hai-hien-dai"));
assert.equal(legacySlugComparisonKey("xay-nha-tron-goi-tai-lương-son-phu-tho"), legacySlugComparisonKey("xay-nha-tron-goi-tai-luong-son-phu-tho"));
assert.equal(legacySlugComparisonKey("xay-nha-tron-goi-ba-vi-ho-tro-24/7"), legacySlugComparisonKey("xay-nha-tron-goi-ba-vi-ho-tro-24-7"));

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
  ["/du-an/xay-nha-tron-goi-tai-nam-dinh-cap-nhat-bao-gia-moi-nhat-2026", "/du-an/cap-nhat-bao-gia-xay-nha-tron-goi-tai-nam-dinh-2026-chi-tiet-tung-hang-muc"],
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
const wave5bRedirects: Array<[string, string]> = [
  ["/bao-gia-xay-nha-tai-tien-du-bac-ninh-uy-tin-chat-luong", "/du-an/bao-gia-xay-nha-tron-goi-tai-tien-du-bac-ninh-uy-tin-chat-luong"],
  ["/xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet-nhat-hathanhhome", "/du-an/xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet"],
  ["/xay-nha-tron-goi-dong-da-bao-hanh-dai-han-hathanhhome", "/du-an/xay-nha-tron-goi-dong-da-bao-hanh-dai-han"],
  ["/bao-gia-xay-nha-tron-goi-tai-ninh-binh-moi-nhat-2026-cong-ty-xay-dung-uy-tin", "/du-an/bao-gia-xay-nha-tron-goi-tai-ninh-binh-nam-2026"],
  ["/xay-nha-tron-goi-tai-dong-anh-don-vi-thi-cong-chuyen-nghiep-ha-thanh-home", "/du-an/xay-nha-tron-goi-dong-anh-don-vi-thi-cong-chuyen-nghiep"],
  ["/xat-nha-tron-goi-tai-phuc-tho-cap-nhap-bao-gia-moi-nhat-hien-nay", "/du-an/xay-nha-tron-goi-phuc-tho-cap-nhat-bao-gia-nam-2026"],
  ["/xay-nha-tron-goi-tai-nam-dinh-cap-nhat-bao-gia-moi-nhat-2026", "/du-an/cap-nhat-bao-gia-xay-nha-tron-goi-tai-nam-dinh-2026-chi-tiet-tung-hang-muc"],
  ["/bao-gia-xay-nha-tron-goi-tai-ha-noi-minh-bach-ha-thanh-home", "/du-an/bao-gia-xay-nha-tron-goi-tai-ha-noi-2026"],
];
for (const [source, target] of wave5bRedirects) assert.equal(getLegacyRedirectTarget(source), target);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-random"), undefined);
assert.equal(getLegacyRedirectTarget("/du-an/xay-nha-tron-goi-long-bien-ha-noi-random"), undefined);
assert.equal(getLegacyRedirectTarget("/70-other-page"), undefined);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-tai-xa-an-khanh-ha-noi-ha-thanh-home"), undefined);
assert.equal(getLegacyRedirectTarget("/bao-gia-xay-nha-tai-tien-du-random"), undefined);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-dong-da-random"), undefined);
assert.equal(getLegacyRedirectTarget("/xay-nha-tron-goi-tai-nam-dinh-random"), undefined);
assert.equal(isLegacyRedirectSource("/cong-trinh-biet-thu-nha-vuon-ninh-binh"), true);
assert.equal(isLegacyRedirectSource("/Cong-trinh-biet-thu-nha-vuon-ninh-binh"), true);
assert.equal(getMalformedLegacyTarget("/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24/7"), "/du-an/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24-7");
assert.equal(getMalformedLegacyTarget("/dich-vu/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24/7"), "/du-an/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24-7");
assert.equal(getMalformedLegacyTarget("/xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24/7"), "/xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24-7");
for (const path of [
  "/bao-gia-sua-chua-nha-ha-noi",
  "/sua-chua-cua-hang-tai-ha-noi-chuyen-nghiep",
  "/dich-vu-sua-chua-nha-hang-chuyen-nghiep-gia-tot-nhat-tai-ha-noi",
  "/goc-giai-dap-cua-phong-ngu-nen-mo-vao-trong-hay-ra-ngoai",
  "/doc-trat-tuong",
]) assert.equal(getLegacyRedirectTarget(path), undefined);

console.log("SEO rich-content regression tests passed");
