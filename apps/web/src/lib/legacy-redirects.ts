/** Explicit historical SEO redirects. Keep this list exact and intentionally small. */
export const legacySeoRedirects: Readonly<Record<string, string>> = {
  "/xay-nha-tron-goi": "/dich-vu/xay-nha-tron-goi",
  "/xay-nha-tron-goi-tai-ha-noi": "/du-an/xay-nha-tron-goi-tai-ha-noi-dich-vu-thi-cong-chuyen-nghiep",
  "/xay-nha-tron-goi-quan-hai-ba-trung": "/du-an/xay-nha-tron-goi-hai-ba-trung-hathanhhome",
  "/bao-gia-xay-nha-tai-quan-hoan-kiem": "/du-an/xay-nha-tron-goi-phuong-hoan-kiem-hathanhhome",
  "/bao-gia-xay-dung-nha-tron-goi-gia-re": "/du-an/bao-gia-xay-nha-tron-goi-tai-ha-noi-2026",
  "/noi-that-phong-ngu": "/mau-thiet-ke-noi-that/mau-phong-ngu-dep-am-cung-va-hien-dai",
  "/du-an/xay-nha-tron-goi-tai-xa-an-khanh-ha-noi-hathanhhome": "/du-an/xay-nha-tron-goi-tai-xa-an-khanh-ha-noi",
  "/mau-thiet-ke-kien-truc/35-mau-biet-thu-tan-co-dien-san-vuon-dep-nha-2026": "/mau-thiet-ke-kien-truc/35-mau-biet-thu-tan-co-dien-san-vuon-dep-2026",
  "/du-an/xay-nha-tron-goi-tai-ha-dong-khao-sat-tu-van-mien-phi": "/du-an/xay-nha-tron-goi-tai-ha-dong",
  "/du-an/cong-trinh-nha-o-biet-thu-3-tang-tai-bac-ninh-dep-hien-dai": "/du-an/cong-trinh-nha-o-biet-thu",
  "/cong-ty-noi-that-van-phong-mien-bac-uy-tin-chuyen-nghiep": "/du-an/cong-ty-noi-that-van-phong-mien-bac",
  "/xay-nha-tron-goi-ba-vi-ho-tro-24/7-cong-ty-xay-dung-uy-tin": "/du-an/xay-nha-tron-goi-ba-vi-ho-tro-20-7-cong-ty-xay-dung-uy-tin",
  "/70 -mau-biet-thu-tan-co-dien-hien-dai-dep-nha-2026": "/mau-thiet-ke-kien-truc/70-mau-biet-thu-tan-co-dien-hien-dai-dep-2026",
  "/du-an/xay-nha-tron-goi-long-bien-ha-noi": "/du-an/xay-nha-tron-goi-long-bien-ha-noi-hathanhhome",
  "/du-an/xay-nha-tron-goi-tai-ha-dong-khao-sat-tu-van-mien-phi-hathanhhome": "/xay-nha-tron-goi-tai-ha-dong-khao-sat-tu-van-mien-phi-hathanhhome",
  "/du-an/xay-nha-tron-goi-tai-nam-dinh-cap-nhat-bao-gia-moi-nhat-2026": "/xay-nha-tron-goi-tai-nam-dinh-cap-nhat-bao-gia-moi-nhat-2026",
  "/du-an/xay-nha-tron-goi-hai-ba-trung": "/du-an/xay-nha-tron-goi-hai-ba-trung-hathanhhome",
  "/90 -mau-biet-thu-hien-dai-dep-2026": "/mau-thiet-ke-kien-truc/90-mau-biet-thu-hien-dai-dep-2026",
  "/du-an/xay-nha-tron-goi-chuong-my-cap-nhap-bao-gia-moi-nhat": "/xay-nha-tron-goi-chuong-my-cap-nhap-bao-gia-moi-nhat",
  "/99- -mau-nha-mai-nhat-dep-2026": "/mau-thiet-ke-kien-truc/99-mau-nha-mai-nhat-dep-2026",
};

/** Return a destination only for an explicitly approved historical pathname. */
export function getLegacyRedirectTarget(pathname: string): string | undefined {
  return legacySeoRedirects[pathname];
}
