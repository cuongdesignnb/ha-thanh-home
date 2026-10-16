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
