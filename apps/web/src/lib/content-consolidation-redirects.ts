/**
 * Duplicate-content consolidation (SEO content-architecture audit, phase P0, 2026-10-15).
 * Each source duplicates its destination (shingle Jaccard >= 0.95, a "-2" copy of the same post, or the
 * same project published twice). The destination is the URL with more Search Console impressions, or the
 * page chosen as canonical for that topic. Sources are archived in the CMS by migration
 * 20261015090000_archive_duplicate_content.
 *
 * Read through getLegacyRedirectTarget(), so these entries also rewrite in-content links and are dropped
 * from the sitemap. Destinations must never be redirect sources themselves.
 */
export const contentConsolidationRedirects: Readonly<Record<string, string>> = {
  // Thái Nguyên landing published twice; the root copy holds the clicks (6 vs 0).
  "/du-an/xay-nha-tron-goi-thai-nguyen-2026-bao-gia-chi-tiet-thi-cong-uy-tin": "/xay-nha-tron-goi-thai-nguyen-2026--bao-gia-chi-tiet-thi-cong-uy-tin",
  // "Uy tín tiết kiệm chi phí" generic landing published twice; merged into the money page.
  "/xay-nha-tron-goi-uy-tin-tiet-kiem-chi-phi": "/dich-vu/xay-nha-tron-goi",
  "/dich-vu/xay-nha-tron-goi-uy-tin-tiet-kiem-chi-phi": "/dich-vu/xay-nha-tron-goi",
  "/du-an/xay-dung-nha-tron-goi-uy-tin-tiet-kiem-chi-phi": "/dich-vu/xay-nha-tron-goi",
  // Villa pricing published twice; the blog post is the canonical page for this topic.
  "/bao-gia-xay-biet-thu-tron-goi-quy-trinh-va-kinh-nghiem-thi-cong": "/tin-tuc/gia-xay-biet-thu-tron-goi",
  "/dich-vu/bao-gia-xay-biet-thu-tron-goi-quy-trinh-va-kinh-nghiem-thi-cong": "/tin-tuc/gia-xay-biet-thu-tron-goi",
  "/du-an/bao-gia-xay-biet-thu-tron-goi-2026-quy-trinh-va-kinh-nghiem-thi-cong": "/tin-tuc/gia-xay-biet-thu-tron-goi",
  // Same Bắc Ninh villa as the full project page (legacy copy, 113 words).
  "/cong-trinh-nha-o-biet-thu-3-tang-o-bac-ninh": "/du-an/cong-trinh-nha-o-biet-thu",
  // "-2" copies of existing posts; the original slug has more impressions in each pair.
  "/tin-tuc/xay-nha-chia-khoa-trao-tay-ha-noi-2": "/tin-tuc/xay-nha-chia-khoa-trao-tay-ha-noi",
  "/tin-tuc/gia-xay-biet-thu-tron-goi-2": "/tin-tuc/gia-xay-biet-thu-tron-goi",
  "/tin-tuc/cach-lua-chon-nha-thau-xay-dung-uy-tin-2": "/tin-tuc/cach-lua-chon-nha-thau-xay-dung-uy-tin",
  "/tin-tuc/cach-bao-duong-be-tong-sau-khi-do-dung-tieu-chuan-2": "/tin-tuc/cach-bao-duong-be-tong-sau-khi-do-dung-tieu-chuan",
};
