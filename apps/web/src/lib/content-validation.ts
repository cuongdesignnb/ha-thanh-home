/** Return true only for slugs that can safely be used in a public URL. */
export function isUsableSlug(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const slug = value.trim();
  const normalized = slug.toLowerCase();
  return slug.length > 0 && normalized !== "null" && normalized !== "undefined";
}
