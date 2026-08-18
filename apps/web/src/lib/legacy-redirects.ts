/** Explicit historical SEO redirects. Keep this list exact and intentionally small. */
export const legacySeoRedirects: Readonly<Record<string, string>> = {
  "/xay-nha-tron-goi": "/dich-vu/xay-nha-tron-goi",
  "/xay-nha-tron-goi-tai-ha-noi": "/du-an/xay-nha-tron-goi-tai-ha-noi-dich-vu-thi-cong-chuyen-nghiep",
  "/xay-nha-tron-goi-quan-hai-ba-trung": "/du-an/xay-nha-tron-goi-hai-ba-trung-hathanhhome",
  "/bao-gia-xay-nha-tai-quan-hoan-kiem": "/du-an/xay-nha-tron-goi-phuong-hoan-kiem-hathanhhome",
  "/bao-gia-xay-dung-nha-tron-goi-gia-re": "/du-an/bao-gia-xay-nha-tron-goi-tai-ha-noi-2026",
  "/noi-that-phong-ngu": "/mau-thiet-ke-noi-that/mau-phong-ngu-dep-am-cung-va-hien-dai",
};

/** Return a destination only for an explicitly approved historical pathname. */
export function getLegacyRedirectTarget(pathname: string): string | undefined {
  return legacySeoRedirects[pathname];
}
