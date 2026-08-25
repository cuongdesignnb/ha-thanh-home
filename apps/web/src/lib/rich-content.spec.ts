import assert from "node:assert/strict";
import {
  isUsableSlug,
  normalizeLegacyAnchors,
  normalizeLegacyHref,
} from "./rich-content";
import { getLegacyRedirectTarget, isLegacyRedirectSource } from "./legacy-redirects";
import { getMalformedLegacyTarget } from "../proxy";
import { legacySlugComparisonKey, normalizeMenuItems, normalizeMenuUrl } from "./api";
import { deadInternalHrefPaths } from "./dead-internal-hrefs";
import { internalCanonicalHrefTargets } from "./internal-href-targets";
import { buildPaginationItems, buildProjectCatalogCanonical, buildProjectCatalogPageHref, isCatalogPageOutOfRange } from "./project-catalog-pagination";
import { buildPostCatalogCanonical, buildPostCatalogPageHref, buildPostPaginationItems, isPostCatalogPageOutOfRange } from "./post-catalog-pagination";

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

const wave6bInternalMappings: Array<[string, string]> = [
  ["/xin-cap-nuoc-sach-tai-dau", "/tin-tuc/xin-cap-nuoc-sach-tai-dau"],
  ["/bao-gia-xay-nha-tron-goi-bao-gom-nhung-gi", "/tin-tuc/bao-gia-xay-nha-tron-goi-bao-gom-nhung-gi"],
  ["/co-nen-cung-dong-tho-xay-nha", "/tin-tuc/co-nen-cung-dong-tho-xay-nha"],
  ["/cach-hoa-giai-han-tam-tai-khi-xay-nha-duoc-binh-an", "/tin-tuc/cach-hoa-giai-han-tam-tai-khi-xay-nha-duoc-binh-an"],
  ["/cach-tinh-chi-phi-xay-nha-chinh-xac-nhat-hien-nay", "/tin-tuc/cach-tinh-chi-phi-xay-nha-chinh-xac-nhat-hien-nay"],
  ["/bi-quyet-chon-tuoi-dong-tho-xay-nha-duoc-may-man", "/tin-tuc/bi-quyet-chon-tuoi-dong-tho-xay-nha-duoc-may-man"],
  ["/chon-thang-lam-nha-theo-tuoi-gap-nhieu-may-man", "/tin-tuc/chon-thang-lam-nha-theo-tuoi-gap-nhieu-may-man"],
  ["/nen-xay-nha-tron-goi-hay-tu-thue-tho", "/tin-tuc/nen-xay-nha-tron-goi-hay-tu-thue-tho"],
  ["/bang-gia-vat-lieu-xay-dung-cap-nhat-moi-nhat", "/tin-tuc/bang-gia-vat-lieu-xay-dung-cap-nhat-moi-nhat"],
  ["/nam-binh-ngo-2026-tuoi-nao-xay-nha-tot-nhat", "/tin-tuc/nam-binh-ngo-2026-tuoi-nao-xay-nha-tot-nhat"],
  ["/tuoi-han-thai-tue-co-nen-xay-nha", "/tin-tuc/tuoi-han-thai-tue-co-nen-xay-nha"],
  ["/nhung-dieu-can-biet-chuan-bi-le-vat-cung-dong-tho-day-du", "/tin-tuc/nhung-dieu-can-biet-chuan-bi-le-vat-cung-dong-tho-day-du"],
  ["/muon-nguoi-tren-70-tuoi-dong-tho-xay-nha-co-tot-khong", "/tin-tuc/muon-nguoi-tren-70-tuoi-dong-tho-xay-nha-co-tot-khong"],
  ["/van-khan-dong-tho-xay-nha-chuan", "/tin-tuc/van-khan-dong-tho-xay-nha-chuan"],
  ["/cach-tinh-tuoi-lam-nha-chuan-phong-thuy", "/tin-tuc/cach-tinh-tuoi-lam-nha-chuan-phong-thuy"],
  ["/cach-lua-chon-nha-thau-xay-dung-uy-tin", "/tin-tuc/cach-lua-chon-nha-thau-xay-dung-uy-tin"],
  ["/chi-phi-xay-nha-2-tang-100m2-moi-nhat-nam-2026", "/tin-tuc/chi-phi-xay-nha-2-tang-100m2-moi-nhat-nam-2026"],
  ["/don-gia-xay-dung-nha-tron-goi-moi-nhat", "/tin-tuc/don-gia-xay-dung-nha-tron-goi-moi-nhat"],
  ["/cach-tinh-chi-phi-xay-nha-tranh-phat-sinh", "/tin-tuc/cach-tinh-chi-phi-xay-nha-tranh-phat-sinh"],
  ["/huong-dan-de-be-ca-trong-nha-dung-phong-thuy-hut-tai-loc", "/tin-tuc/huong-dan-de-be-ca-trong-nha-dung-phong-thuy-hut-tai-loc"],
  ["/muon-nguoi-tren-60-tuoi-dong-tho-xay-nha-co-tot-khong", "/tin-tuc/muon-nguoi-tren-60-tuoi-dong-tho-xay-nha-co-tot-khong"],
  ["/lam-nha-xem-tuoi-vo-co-duoc-khong", "/tin-tuc/lam-nha-xem-tuoi-vo-co-duoc-khong"],
  ["/cach-dong-tho-cuoc-dat-tranh-hoa-ruoc-loc", "/tin-tuc/cach-dong-tho-cuoc-dat-tranh-hoa-ruoc-loc"],
  ["/han-lam-nha-va-nhung-dieu-can-biet", "/tin-tuc/han-lam-nha-va-nhung-dieu-can-biet"],
  ["/van-khan-chuoc-nha-khi-muon-tuoi-xay-nha", "/tin-tuc/van-khan-chuoc-nha-khi-muon-tuoi-xay-nha"],
  ["/nhung-dieu-can-biet-truoc-khi-xay-nha-lan-dau", "/tin-tuc/nhung-dieu-can-biet-truoc-khi-xay-nha-lan-dau"],
  ["/mau-nha-3-tang-hien-dai-cho-gia-dinh-tre", "/tin-tuc/mau-nha-3-tang-hien-dai-cho-gia-dinh-tre"],
  ["/du-doan-ve-gia-vat-lieu-xay-dung-nua-cuoi-nam-2026", "/tin-tuc/du-doan-ve-gia-vat-lieu-xay-dung-nua-cuoi-nam-2026"],
  ["/nhung-dieu-can-biet-khi-xay-nha-tai-nam-dinh-khi-hau-tho-nhuong-dia-chat-khu-vuc", "/du-an/nhung-dieu-can-biet-khi-xay-nha-tai-nam-dinh-khi-hau-tho-nhuong-dia-chat-khu-vuc"],
  ["/cach-len-du-toan-chi-phi-xay-nha-tiet-kiem-3", "/tin-tuc/cach-len-du-toan-chi-phi-xay-nha-tiet-kiem"],
  ["/cach-tinh-chi-phi-xay-nha-tranh-phat-sinh-8", "/tin-tuc/cach-tinh-chi-phi-xay-nha-tranh-phat-sinh"],
  ["/cap-nhap-luat-xay-dung-nha-o-dan-dung-va-nhung-dieu-can-biet-5", "/tin-tuc/cap-nhap-luat-xay-dung-nha-o-dan-dung-va-nhung-dieu-can-biet"],
  ["/go-cong-nghiep-la-gi-nhung-uu-diem-khi-lam-noi-that-go-cong-nghiep-5", "/tin-tuc/go-cong-nghiep-la-gi-nhung-uu-diem-khi-lam-noi-that-go-cong-nghiep"],
  ["/mau-phong-khach-chung-cu-dep-chuan-phong-thuy-5", "/tin-tuc/mau-phong-khach-chung-cu-dep-chuan-phong-thuy"],
  ["/uu-diem-khi-dong-tran-thach-cao-0", "/tin-tuc/uu-diem-khi-dong-tran-thach-cao"],
  ["/huong-dan-de-be-ca-trong-nha-dung-phong-thuy-hut-tai-loc-4", "/tin-tuc/huong-dan-de-be-ca-trong-nha-dung-phong-thuy-hut-tai-loc"],
];
assert.equal(wave6bInternalMappings.length, 36);
for (const [source, target] of wave6bInternalMappings) assert.equal(normalizeLegacyHref(source), target);
assert.equal(normalizeLegacyHref("/xin-cap-nuoc-sach-tai-dau?utm_source=internal#faq"), "/tin-tuc/xin-cap-nuoc-sach-tai-dau?utm_source=internal#faq");
assert.equal(normalizeLegacyHref("https://www.hathanhhome.vn/xin-cap-nuoc-sach-tai-dau"), "https://hathanhhome.vn/tin-tuc/xin-cap-nuoc-sach-tai-dau");
assert.equal(Object.keys(internalCanonicalHrefTargets).length, 82);

const wave6cMappedLinks: Array<[string, string]> = [
  ["/xay-nha-tron-goi-tai-tay-ho", "/du-an/xay-nha-tron-goi-tay-ho-bao-gia-chi-tiet-minh-bach"],
  ["/xay-nha-tron-goi-tai-thuong-tin-ha-noi", "/bao-gia-xay-nha-tron-goi-tai-thuong-tin-ha-noi-khong-phat-sinh-chi-phi"],
  ["/xay-nha-tron-goi-tai-bac-giang", "/du-an/xay-nha-tron-goi-tai-bac-giang-cong-ty-xay-nha-tron-goi-uy-tin"],
  ["/xay-nha-tron-goi-tai-phuc-tho-ha-noi", "/du-an/xay-nha-tron-goi-phuc-tho-cap-nhat-bao-gia-nam-2026"],
  ["/xem-ngay-dong-tho-dup-chu-nha-phan-len-nhu-dieu-gap-gio", "/tin-tuc/xem-ngay-dong-tho-giup-chu-nha-phat-len-nhu-dieu-gap-gio"],
];
assert.equal(wave6cMappedLinks.length, 5);
for (const [source, target] of wave6cMappedLinks) assert.equal(normalizeLegacyHref(source), target);
assert.equal(normalizeLegacyHref("/xay-nha-tron-goi-tai-bac-giang?utm_source=internal#bao-gia"), "/du-an/xay-nha-tron-goi-tai-bac-giang-cong-ty-xay-nha-tron-goi-uy-tin?utm_source=internal#bao-gia");
assert.equal(Object.keys(internalCanonicalHrefTargets).length, 82);

const wave6cDeadLinks = [
  "/phong-ngu-hien-dai-rong-rai-mang-den-su-thoai-mai",
  "/phong-ngu-hien-dai-khep-kin-cho-nha-pho",
  "/hathanhhouse-xay-nha-tron-goi-dam-bao-chat-luong-uy-tin-8",
  "/phong-ngu-nha-pho--phong-cach-hien-dai",
  "/xay-nha-tron-goi-tai-ha-long",
  "/phong-ngu-cho-con-hien-dai-day-du-tien-nghi",
  "/bao-gia-xay-nha-tron-goi-tai-xa-giao-thuy-ninh-binh",
  "/huong-cung-dong-tho-hut-sinh-khi-tai-loc",
  "/xay-nha-tron-goi-tai-xuam-truong-nam-dinh",
  "/hathanhhouse-xay-nha-tron-go-dam-bao-chat-luong-uy-tin-8",
  "/phong-tho-nha-pho-hien-dai-tai-cau-giay-ha-noi",
  "/xay-nha-3-tang-80m2-het-bao-nhieu-tien",
];
assert.equal(deadInternalHrefPaths.size, 12);
for (const path of wave6cDeadLinks) {
  assert.equal(deadInternalHrefPaths.has(path), true);
  assert.equal(normalizeLegacyHref(path), path);
}
assert.equal(normalizeLegacyAnchors('<a href="/xay-nha-tron-goi-tai-ha-long">Hạ Long</a>'), "Hạ Long");
assert.equal(normalizeLegacyAnchors('<a class="related" href="/xay-nha-tron-goi-tai-ha-long"><strong>Hạ Long</strong></a>'), "<strong>Hạ Long</strong>");
assert.equal(normalizeLegacyAnchors('<a href="/xay-nha-tron-goi-tai-ha-long?utm_source=test">Hạ Long</a>'), "Hạ Long");
assert.equal(normalizeLegacyAnchors('<a href="https://www.hathanhhome.vn/xay-nha-tron-goi-tai-ha-long">Hạ Long</a>'), "Hạ Long");
assert.equal(normalizeLegacyAnchors('<a href="https://example.com/xay-nha-tron-goi-tai-ha-long">Example</a>'), '<a href="https://example.com/xay-nha-tron-goi-tai-ha-long">Example</a>');
assert.equal(normalizeLegacyAnchors('<a href="/xay-nha-tron-goi-tai-bac-giang">Bắc Giang</a>'), '<a href="/du-an/xay-nha-tron-goi-tai-bac-giang-cong-ty-xay-nha-tron-goi-uy-tin">Bắc Giang</a>');

assert.equal(buildProjectCatalogPageHref("/du-an", {}, 1), "/du-an");
assert.equal(buildProjectCatalogPageHref("/du-an", {}, 2), "/du-an?page=2");
assert.equal(buildProjectCatalogPageHref("/du-an", { category: "nha-xuong" }, 2), "/du-an?category=nha-xuong&page=2");
assert.equal(buildProjectCatalogPageHref("/du-an/cong-trinh", { category: "biet-thu", group: "SHOULD_NOT_PRESERVE", limit: "500" }, 3), "/du-an/cong-trinh?category=biet-thu&page=3");
assert.equal(buildProjectCatalogCanonical("/du-an", {}, 1), "/du-an");
assert.equal(buildProjectCatalogCanonical("/du-an", {}, 2), "/du-an?page=2");
assert.equal(buildProjectCatalogCanonical("/du-an", { category: "nha-pho" }, 2), "/du-an");
assert.equal(buildProjectCatalogCanonical("/du-an/cong-trinh", {}, 4), "/du-an/cong-trinh?page=4");
assert.equal(buildProjectCatalogCanonical("/du-an/noi-that", {}, 1), "/du-an/noi-that");
assert.deepEqual(buildPaginationItems(1, 6), [1, 2, 3, 4, 5, 6]);
assert.deepEqual(buildPaginationItems(8, 30), [1, "ellipsis", 7, 8, 9, "ellipsis", 30]);
assert.equal(buildPaginationItems(0, 6).includes(0), false);
assert.equal(buildPaginationItems(31, 30).includes(31), false);
assert.equal(isCatalogPageOutOfRange(6, 6), false);
assert.equal(isCatalogPageOutOfRange(7, 6), true);
assert.equal(isCatalogPageOutOfRange(999, 6), true);
assert.equal(isCatalogPageOutOfRange(1, 0), false);
assert.equal(isCatalogPageOutOfRange(2, 0), true);
assert.equal(buildPostCatalogPageHref("/tin-tuc", {}, 1), "/tin-tuc");
assert.equal(buildPostCatalogPageHref("/tin-tuc", {}, 2), "/tin-tuc?page=2");
assert.equal(buildPostCatalogPageHref("/tin-tuc", { category: "cam-nang-xay-dung" }, 2), "/tin-tuc?category=cam-nang-xay-dung&page=2");
assert.equal(buildPostCatalogPageHref("/tin-tuc", { category: "cam-nang-xay-dung", limit: "500", group: "bad", utm_source: "bad" }, 2), "/tin-tuc?category=cam-nang-xay-dung&page=2");
assert.equal(buildPostCatalogCanonical("/tin-tuc", {}, 1), "/tin-tuc");
assert.equal(buildPostCatalogCanonical("/tin-tuc", {}, 2), "/tin-tuc?page=2");
assert.equal(buildPostCatalogCanonical("/tin-tuc", { category: "abc" }, 1), "/tin-tuc");
assert.equal(buildPostCatalogCanonical("/tin-tuc", { category: "abc", page: "3" }, 3), "/tin-tuc");
assert.equal(isPostCatalogPageOutOfRange(16, 16), false);
assert.equal(isPostCatalogPageOutOfRange(17, 16), true);
assert.equal(isPostCatalogPageOutOfRange(999, 16), true);
assert.equal(isPostCatalogPageOutOfRange(1, 0), false);
assert.equal(isPostCatalogPageOutOfRange(2, 0), true);
assert.deepEqual(buildPostPaginationItems(1, 6), [1, 2, 3, 4, 5, 6]);
assert.deepEqual(buildPostPaginationItems(8, 30), [1, "ellipsis", 7, 8, 9, "ellipsis", 30]);
assert.equal(buildPostPaginationItems(0, 6).includes(0), false);
assert.equal(buildPostPaginationItems(31, 30).includes(31), false);

const wave6bUnresolved = [
  "/phong-ngu-hien-dai-rong-rai-mang-den-su-thoai-mai",
  "/phong-ngu-hien-dai-khep-kin-cho-nha-pho",
  "/hathanhhouse-xay-nha-tron-goi-dam-bao-chat-luong-uy-tin-8",
  "/phong-ngu-nha-pho--phong-cach-hien-dai",
  "/xay-nha-tron-goi-tai-ha-long",
  "/phong-ngu-cho-con-hien-dai-day-du-tien-nghi",
  "/bao-gia-xay-nha-tron-goi-tai-xa-giao-thuy-ninh-binh",
  "/huong-cung-dong-tho-hut-sinh-khi-tai-loc",
  "/xay-nha-tron-goi-tai-xuam-truong-nam-dinh",
  "/hathanhhouse-xay-nha-tron-go-dam-bao-chat-luong-uy-tin-8",
  "/phong-tho-nha-pho-hien-dai-tai-cau-giay-ha-noi",
  "/xay-nha-3-tang-80m2-het-bao-nhieu-tien",
];
assert.equal(wave6bUnresolved.length, 12);
for (const url of wave6bUnresolved) assert.equal(normalizeLegacyHref(url), url);

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
