import { permanentRedirect } from "next/navigation";

function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/**
 * The CMS API resolves detail slugs case- and accent-insensitively, so "/du-an/XAY-NHA-…" or
 * "/du-an/xay-nha-tron-goi-tai-lương-son-phu-tho" return the same record as the stored slug. Rendering those
 * variants made each one a self-canonical duplicate (GSC/indexing report, 2026-10-21).
 */
export function isCanonicalSlug(requestedSlug: string, storedSlug: string): boolean {
  return decodeSlug(requestedSlug) === storedSlug;
}

/** Sends any non-canonical spelling of a record's slug to its stored one with a 308. */
export function redirectToCanonicalSlug(requestedSlug: string, record: { slug?: string | null } | null | undefined, basePath: string) {
  const storedSlug = record?.slug;
  if (storedSlug && !isCanonicalSlug(requestedSlug, storedSlug)) {
    permanentRedirect(`${basePath}/${encodeURIComponent(storedSlug)}`);
  }
}
