import { BadRequestException, ConflictException } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";
import { TextDecoder } from "util";

export const contentStatuses = ["draft", "pending_review", "scheduled", "published", "archived"] as const;
export const groups = ["construction", "interior"] as const;
export const leadStatuses = ["new", "contacted", "consulting", "won", "lost", "spam"] as const;

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(5000, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function listMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 120);
}

export async function uniqueSlug(
  title: string,
  providedSlug: string | undefined,
  exists: (slug: string) => Promise<boolean>,
) {
  const base = slugify(providedSlug || title);
  if (!base) {
    throw new BadRequestException("Slug cannot be empty");
  }

  let candidate = base;
  let index = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

/**
 * Resolve a slug for a new record without silently creating an SEO duplicate.
 * Explicit slugs are user/API intent: if one already exists, fail clearly so
 * the caller can update the existing record instead of creating `-2`, `-3`, ….
 */
export async function createSlug(
  title: string,
  providedSlug: string | undefined,
  exists: (slug: string) => Promise<boolean>,
) {
  const base = slugify(providedSlug || title);
  if (!base) {
    throw new BadRequestException("Slug cannot be empty");
  }

  if (providedSlug && await exists(base)) {
    throw new ConflictException("Slug already exists. Update the existing record instead of creating a duplicate.");
  }

  let candidate = base;
  let index = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

export function cleanHtml(value?: string | null) {
  if (!value) {
    return value;
  }

  return sanitizeHtml(value, {
    allowedTags: [
      "p", "br", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "s",
      "blockquote", "ul", "ol", "li", "a", "hr", "pre", "code", "div", "span", "details", "summary",
      "img", "figure", "figcaption", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    ],
    allowedAttributes: {
      "*": ["class", "style"],
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      figure: ["data-content-image"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|center|right|justify)$/],
        "max-width": [/^\d+(\.\d+)?(px|%|rem|em|vw)$/],
        width: [/^\d+(\.\d+)?(px|%|rem|em|vw)$/],
        height: [/^\d+(\.\d+)?(px|%|rem|em|vh)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
        },
      }),
      img: (_tagName, attribs) => ({ tagName: "img", attribs: { ...attribs, alt: attribs.alt || "" } }),
    },
  });
}

const utf8Decoder = new TextDecoder("utf-8", { fatal: false });

const cp1252Bytes = new Map<string, number>([
  ["€", 0x80], ["‚", 0x82], ["ƒ", 0x83], ["„", 0x84], ["…", 0x85],
  ["†", 0x86], ["‡", 0x87], ["ˆ", 0x88], ["‰", 0x89], ["Š", 0x8a],
  ["‹", 0x8b], ["Œ", 0x8c], ["Ž", 0x8e], ["‘", 0x91], ["’", 0x92],
  ["“", 0x93], ["”", 0x94], ["•", 0x95], ["–", 0x96], ["—", 0x97],
  ["˜", 0x98], ["™", 0x99], ["š", 0x9a], ["›", 0x9b], ["œ", 0x9c],
  ["ž", 0x9e], ["Ÿ", 0x9f],
]);

function looksMojibake(value: string) {
  return /[\u00c3\u00c2\u00c4\u00c5\u00c6]|\u00e1\u00ba|\u00e1\u00bb|\u00c2[\u00a9\u00ae\u00b0\u00b1\u00b7]|\u00e2\u20ac/.test(value);
}

export function repairMojibakeText(value: string) {
  if (!looksMojibake(value)) return value;

  let current = value;
  for (let pass = 0; pass < 2; pass += 1) {
    const bytes: number[] = [];
    let canDecode = true;
    for (const char of current) {
      const mapped = cp1252Bytes.get(char);
      if (mapped !== undefined) {
        bytes.push(mapped);
        continue;
      }
      const code = char.codePointAt(0) || 0;
      if (code <= 0xff) {
        bytes.push(code);
        continue;
      }
      canDecode = false;
      break;
    }

    if (!canDecode) break;
    const decoded = utf8Decoder.decode(Uint8Array.from(bytes));
    if (!decoded || decoded.includes("\uFFFD") || decoded === current) break;
    current = decoded;
    if (!looksMojibake(current)) break;
  }

  return current;
}

export function repairPublicText<T>(value: T): T {
  if (typeof value === "string") return repairMojibakeText(value) as T;
  if (!value || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => repairPublicText(item)) as T;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, repairPublicText(item)]),
  ) as T;
}

export function safeString(value?: string | null, length = 191): string | null {
  if (value === undefined || value === null) return null;
  return value.substring(0, length);
}
