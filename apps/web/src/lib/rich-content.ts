import { isUsableSlug } from "./content-validation";
import { deadInternalHrefPaths } from "./dead-internal-hrefs";
import { internalCanonicalHrefTargets } from "./internal-href-targets";
import { getLegacyRedirectTarget } from "./legacy-redirects";

const TABLE_SCROLL_CLASS = "content-table-scroll";

const HREF_ATTRIBUTE_PATTERN = /(^|\s)(href\s*=\s*)(?:(['"])([\s\S]*?)\3|\\(['"])([\s\S]*?)\\\5|\\(?:&quot;|&#34;)([\s\S]*?)\\(?:&quot;|&#34;))/i;

type HrefAttribute = {
  index: number;
  rawMatch: string;
  prefix: string;
  quote: string;
  value: string;
};

function getHrefAttribute(tag: string): HrefAttribute | undefined {
  const match = tag.match(HREF_ATTRIBUTE_PATTERN);
  if (!match || match.index === undefined) return undefined;

  const quote = match[3] || match[5] || '"';
  const value = match[4] ?? match[6] ?? match[7] ?? "";
  const rawMatch = match[0];

  return {
    index: match.index,
    rawMatch,
    prefix: `${match[1]}${match[2]}`,
    quote,
    value,
  };
}

function normalizeAnchorTag(tag: string): string {
  const href = getHrefAttribute(tag);
  if (!href) return tag;

  const normalizedHref = normalizeLegacyHref(href.value);
  const replacement = `${href.prefix}${href.quote}${normalizedHref}${href.quote}`;
  return `${tag.slice(0, href.index)}${replacement}${tag.slice(href.index + href.rawMatch.length)}`;
}

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
  const normalized = protectedHtml.replace(/<a\b[^>]*>/gi, (tag) => normalizeAnchorTag(tag));
  const unlinked = normalized.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi, (match, attrs: string, innerHtml: string) => {
    const href = getHrefAttribute(attrs);
    if (!href) return match;
    const normalizedHref = normalizeLegacyHref(href.value);
    const pathname = getInternalPathname(normalizedHref);
    return pathname && deadInternalHrefPaths.has(pathname) ? innerHtml : match;
  });
  return unlinked.replace(/\u0000rich-content-protected-(\d+)\u0000/g, (_token, index: string) => protectedBlocks[Number(index)] || "");
}

function getInternalPathname(href: string): string | undefined {
  if (href.startsWith("/")) return href.split(/[?#]/, 1)[0];
  const internalHost = href.match(/^https:\/\/hathanhhome\.vn([\s\S]*)$/i);
  return internalHost ? (internalHost[1] || "/").split(/[?#]/, 1)[0] : undefined;
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
