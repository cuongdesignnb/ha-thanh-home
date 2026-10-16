import { headers } from "next/headers";
import { preload } from "react-dom";

/**
 * Hero banners are CSS background images, which the browser only discovers after the stylesheet and the
 * hero markup are parsed; Lighthouse measured 1.8–5.3 s of LCP "load delay" from that (Oct 2026).
 * Emitting a high-priority <link rel="preload"> lets the download start with the HTML.
 * Call it from a server component that renders the hero, with the exact URL used in the CSS.
 */
export function preloadHeroImage(url?: string | null) {
  if (url) preload(url, { as: "image", fetchPriority: "high" });
}

/** The media pipeline writes `<name>-large.webp` (1200px) next to `<name>-medium.webp` (768px). */
export function mediumHeroVariant(url: string): string | undefined {
  return /-large\.webp$/i.test(url) ? url.replace(/-large\.webp$/i, "-medium.webp") : undefined;
}

export function isMobileRequest(requestHeaders: Pick<Headers, "get">): boolean {
  if (requestHeaders.get("sec-ch-ua-mobile") === "?1") return true;
  return /Mobi|Android|iPhone|iPod/i.test(requestHeaders.get("user-agent") || "");
}

/**
 * Phones get the 768px rendition of a hero image (about half the bytes of the 1200px one). The choice is
 * made on the server so the inline background and its preload always name the same file: a media-query or
 * srcset choice in the browser could disagree with the CSS and download both.
 * Use the returned URL for both the hero style and preloadHeroImage().
 */
export async function heroImageFor(url: string): Promise<string>;
export async function heroImageFor(url?: string | null): Promise<string | undefined>;
export async function heroImageFor(url?: string | null) {
  if (!url) return url ?? undefined;
  const medium = mediumHeroVariant(url);
  if (!medium) return url;
  return isMobileRequest(await headers()) ? medium : url;
}
