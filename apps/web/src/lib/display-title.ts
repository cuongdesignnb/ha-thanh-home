// CMS titles often carry typing artefacts ("Xây Nhà Trong Ngõ .", " Mẫu Nhà ", "Giữa  2 Nhà").
// Normalize them for display only; slugs and stored data are left untouched.
export function normalizeDisplayTitle(value: string): string {
  const normalized = value
    .replace(/\s+/g, " ")
    .trim()
    // A detached trailing full stop reads as noise in a heading: drop it.
    .replace(/ \.$/, "")
    // Re-attach punctuation typed with a leading space: "Tư Vấn , Khảo Sát" -> "Tư Vấn, Khảo Sát".
    .replace(/ ([,.;:!?…]+)(?= |$)/g, "$1");
  return normalized || value.trim();
}

const TITLE_FIELDS = ["title", "metaTitle", "ogTitle"] as const;

export function withDisplayTitles<T>(item: T): T {
  if (!item || typeof item !== "object") return item;
  const record = item as Record<string, unknown>;
  const changed: Record<string, string> = {};
  for (const field of TITLE_FIELDS) {
    const value = record[field];
    if (typeof value === "string") {
      const normalized = normalizeDisplayTitle(value);
      if (normalized !== value) changed[field] = normalized;
    }
  }
  return Object.keys(changed).length ? ({ ...record, ...changed } as T) : item;
}
