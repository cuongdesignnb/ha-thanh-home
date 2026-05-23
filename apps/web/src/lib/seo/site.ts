/**
 * Centralized site configuration for SEO.
 * All pages import from here — no hardcoded domains elsewhere.
 */

const siteUrl = (
  process.env.NEXT_PUBLIC_WEB_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://hathanhhome.vn"
).replace(/\/+$/, "");

export const siteConfig = {
  name: "Hà Thành Home",
  legalName: "Hà Thành Home",
  description:
    "Thiết kế, thi công nhà ở, nội thất và công trình trọn gói.",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  defaultOgImage: `${siteUrl}/og-default.jpg`,
  locale: "vi_VN",
  language: "vi",
  phone: "0966 123 456",
  email: "info@hathanhhome.vn",
  address: {
    streetAddress: "Hà Nội",
    addressLocality: "Hà Nội",
    addressRegion: "Hà Nội",
    addressCountry: "VN",
  },
  sameAs: [] as string[],
  areaServed: ["Hà Nội", "Ninh Bình", "Miền Bắc", "Việt Nam"],
  priceRange: "$$",
} as const;

/** Build an absolute URL from a relative path. */
export function absoluteUrl(path?: string | null): string {
  if (!path) return siteConfig.url;
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean}`;
}

/** Convert a potentially relative image URL to absolute. */
export function absoluteImageUrl(
  url?: string | null,
  fallback?: string,
): string {
  if (!url && !fallback) return siteConfig.defaultOgImage;
  return absoluteUrl(url || fallback);
}
