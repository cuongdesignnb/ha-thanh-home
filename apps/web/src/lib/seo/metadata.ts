import type { Metadata } from "next";
import { siteConfig, absoluteUrl, absoluteImageUrl } from "./site";

export type SeoInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

/**
 * Build Next.js Metadata object with canonical, OG, Twitter Card, and robots.
 * Used by every page to produce consistent SEO metadata.
 */
export function buildMetadata(input: SeoInput): Metadata {
  const {
    title: rawTitle,
    description,
    path,
    image,
    noIndex,
    canonicalUrl: customCanonical,
    type = "website",
    publishedTime,
    modifiedTime,
  } = input;

  // Title: append brand if not already included
  const brand = siteConfig.name;
  const title = rawTitle.includes(brand)
    ? rawTitle
    : `${rawTitle} | ${brand}`;

  // Canonical URL
  const canonical = customCanonical || (path ? absoluteUrl(path) : undefined);

  // OG image — must be absolute
  const ogImage = absoluteImageUrl(image);

  const metadata: Metadata = {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description: description || siteConfig.description,
      url: canonical || siteConfig.url,
      siteName: brand,
      locale: siteConfig.locale,
      type,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      ...(publishedTime && type === "article"
        ? { publishedTime, modifiedTime: modifiedTime || publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || siteConfig.description,
      images: ogImage ? [ogImage] : undefined,
    },
  };

  return metadata;
}
