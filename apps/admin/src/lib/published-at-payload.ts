const entitiesWithoutPublishedAtEditor = new Set([
  "projects",
  "services",
  "architecture-designs",
  "interior-designs",
  "pages",
]);

export function stripImplicitPublishedAt(
  entity: string,
  values: Record<string, unknown>,
  originalPublishedAtLocal: string,
): Record<string, unknown> {
  const payload = { ...values };

  // These entities have no publication-date editor; never send the form's hidden/default value.
  if (entitiesWithoutPublishedAtEditor.has(entity)) {
    delete payload.publishedAt;
    return payload;
  }

  // Posts do expose datetime-local. Its value is minute precision, so omit it unless the editor changed it.
  if (entity === "posts" && typeof payload.publishedAt === "string") {
    if (payload.publishedAt === originalPublishedAtLocal) {
      delete payload.publishedAt;
    } else if (payload.publishedAt !== "") {
      // datetime-local has no timezone. Convert an intentional local edit to an explicit ISO instant
      // before the API parses it, so the API host's timezone cannot shift the selected value.
      const value = new Date(payload.publishedAt);
      if (!Number.isNaN(value.getTime())) payload.publishedAt = value.toISOString();
    }
  }

  return payload;
}
