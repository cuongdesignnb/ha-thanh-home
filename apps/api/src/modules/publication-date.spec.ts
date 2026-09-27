import assert from "node:assert/strict";
import { decidePublishedAtUpdate, publishedAtPrismaValue } from "./publication-date";

const original = new Date("2026-09-03T06:51:51.117Z");
const originalIso = original.toISOString();

function preservedEffectiveValue(decision: ReturnType<typeof decidePublishedAtUpdate>, current: Date): Date {
  const prismaValue = publishedAtPrismaValue(decision);
  return prismaValue instanceof Date ? prismaValue : current;
}

// A — a body-only PATCH of a published project preserves the exact timestamp, including milliseconds.
const bodyOnly = decidePublishedAtUpdate({ currentStatus: "published", incomingStatus: "published" });
assert.equal(bodyOnly.action, "preserve");
assert.equal(preservedEffectiveValue(bodyOnly, original).toISOString(), originalIso);

// B — a title-only PATCH has the same publication-date behavior.
const titleOnly = decidePublishedAtUpdate({ currentStatus: "published", incomingStatus: "published" });
assert.equal(preservedEffectiveValue(titleOnly, original).toISOString(), originalIso);

// C — a content-only PATCH has the same publication-date behavior.
const contentOnly = decidePublishedAtUpdate({ currentStatus: "published", incomingStatus: "published" });
assert.equal(preservedEffectiveValue(contentOnly, original).toISOString(), originalIso);

// D — first publication assigns the supplied clock value when no explicit date exists.
const now = new Date("2026-09-25T15:42:09.163Z");
const firstPublish = decidePublishedAtUpdate({ currentStatus: "draft", incomingStatus: "published", now });
assert.equal(firstPublish.action, "set");
assert.equal(publishedAtPrismaValue(firstPublish)?.toISOString(), now.toISOString());

// E — an explicitly supplied publication date is used exactly, including milliseconds.
const explicit = decidePublishedAtUpdate({
  currentStatus: "published",
  incomingStatus: "published",
  incomingPublishedAt: "2026-09-03T06:51:51.117Z",
});
assert.equal(explicit.action, "set");
assert.equal(publishedAtPrismaValue(explicit)?.toISOString(), originalIso);

// Existing post unpublish semantics are preserved: an explicit non-published status clears its date.
const unpublished = decidePublishedAtUpdate({
  currentStatus: "published",
  incomingStatus: "draft",
  clearWhenUnpublished: true,
});
assert.equal(unpublished.action, "clear");
assert.equal(publishedAtPrismaValue(unpublished), null);

console.log("publishedAt API regression tests passed");
