import { isUsableSlug } from "./content-validation";
import { internalCanonicalHrefTargets } from "./internal-href-targets";
import { getLegacyRedirectTarget } from "./legacy-redirects";

const TABLE_SCROLL_CLASS = "content-table-scroll";

/** Repair only legacy href attribute values; all other HTML is left untouched. */
export function normalizeLegacyHref(rawHref: string): string {
  let href = rawHref.trim();

  // Some old editor exports persisted quote characters around the value.
  // Remove wrappers only (never decode arbitrary URL components).
  const wrapperStart = /^(?:\\)?(?:%22|%27|&quot;|&#34;|["'])/i;
  const wrapperEnd = /(?:\\)?(?:%22|%27|&quot;|&#34;|["'])$/i;
  let previous = "";
  while (href !== previous) {
    previous = href;
    href = href
      .replace(wrapperStart, "")
      .replace(wrapperEnd, "")
      .trim();
  }

  if (/^(?:\.\.\/)+/.test(href)) href = `/${href.replace(/^(?:\.\.\/)+/, "")}`;
  else if (href.startsWith("./")) href = `/${href.slice(2)}`;

  if (/^tel:/i.test(href)) href = href.replace(/\/+$/, "");

  let internalHostPrefix = "";
  const internalHost = href.match(/^https?:\/\/(?:www\.)?hathanhhome\.vn([\s\S]*)$/i);
  if (internalHost) {
    internalHostPrefix = "https://hathanhhome.vn";
    href = internalHost[1] || "/";
  }

  // External and non-navigation schemes are deliberately left untouched.
  if (/^(?:https?:\/\/|mailto:|javascript:|data:)/i.test(href) || href.startsWith("//") || href.startsWith("#")) {
    return `${internalHostPrefix}${href}`;
  }

  const suffixIndex = href.search(/[?#]/);
  const pathname = suffixIndex >= 0 ? href.slice(0, suffixIndex) : href;
  const suffix = suffixIndex >= 0 ? href.slice(suffixIndex) : "";
  if (!pathname.startsWith("/")) return `${internalHostPrefix}${href}`;

  const target = getLegacyRedirectTarget(pathname) || internalCanonicalHrefTargets[pathname];
  return `${internalHostPrefix}${target || pathname}${suffix}`;
}

/** Normalize href attributes without touching text, images, scripts, or styles. */
export function normalizeLegacyAnchors(html: string): string {
  if (!html) return html;
  const protectedBlocks: string[] = [];
  const protectedHtml = html.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, (block) => {
    const token = `\u0000rich-content-protected-${protectedBlocks.length}\u0000`;
    protectedBlocks.push(block);
    return token;
  });
  const normalized = protectedHtml.replace(/<a\b([^>]*?\bhref\s*=\s*)(["'])([\s\S]*?)\2([^>]*)>/gi, (_match, before: string, quote: string, value: string, after: string) => {
    return `<a${before}${quote}${normalizeLegacyHref(value)}${quote}${after}>`;
  });
  return normalized.replace(/\u0000rich-content-protected-(\d+)\u0000/g, (_token, index: string) => protectedBlocks[Number(index)] || "");
}

export function prepareDetailHtml(html?: string | null) {
  if (!html) return "";

  const normalizedHtml = normalizeLegacyAnchors(html);
  return normalizedHtml.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs: string, inner: string, offset: number, source: string) => {
    if (isAlreadyWrappedByTableScroll(source, offset)) return match;

    return `<div class="${TABLE_SCROLL_CLASS}" role="region" aria-label="Bảng nội dung" tabindex="0"><table${attrs}>${inner}</table></div>`;
  });
}

function isAlreadyWrappedByTableScroll(source: string, tableOffset: number) {
  const beforeTable = source.slice(Math.max(0, tableOffset - 180), tableOffset);
  return new RegExp(`<div\\b[^>]*class=["'][^"']*\\b${TABLE_SCROLL_CLASS}\\b`, "i").test(beforeTable);
}

export { isUsableSlug };
