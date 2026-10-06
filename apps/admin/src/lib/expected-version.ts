export const VERSIONED_CONTENT_ENTITIES = [
  "projects",
  "architecture-designs",
  "interior-designs",
  "services",
  "posts",
  "pages",
] as const;

export type VersionedContentEntity = (typeof VERSIONED_CONTENT_ENTITIES)[number];

export function isVersionedContentEntity(entity: string): entity is VersionedContentEntity {
  return VERSIONED_CONTENT_ENTITIES.includes(entity as VersionedContentEntity);
}

export function withExpectedUpdatedAt<T extends Record<string, unknown>>(
  entity: string,
  payload: T,
  updatedAt?: string,
): T | (T & { expectedUpdatedAt: string }) {
  if (!isVersionedContentEntity(entity)) return payload;
  if (!updatedAt) throw new Error("Record is missing updatedAt; reload it before saving.");
  return { ...payload, expectedUpdatedAt: updatedAt };
}
