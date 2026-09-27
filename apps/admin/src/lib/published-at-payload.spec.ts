import assert from "node:assert/strict";
import { stripImplicitPublishedAt } from "./published-at-payload";

// F — the Project Admin payload must not carry the hidden datetime-local value at all.
const projectFormPayload = stripImplicitPublishedAt("projects", {
  title: "Project body edit",
  status: "published",
  publishedAt: "2026-09-03T13:51",
}, "2026-09-03T13:51");
assert.equal(Object.prototype.hasOwnProperty.call(projectFormPayload, "publishedAt"), false);
assert.equal(projectFormPayload.status, "published");

// An unchanged Post datetime-local value must be omitted because it has lost seconds/milliseconds.
const unchangedPostPayload = stripImplicitPublishedAt("posts", {
  title: "Post body edit",
  status: "published",
  publishedAt: "2026-09-03T13:51",
}, "2026-09-03T13:51");
assert.equal(Object.prototype.hasOwnProperty.call(unchangedPostPayload, "publishedAt"), false);

// A deliberately changed Post date remains explicit in the outgoing payload.
const changedPostPayload = stripImplicitPublishedAt("posts", {
  title: "Post body edit",
  status: "published",
  publishedAt: "2026-09-04T10:15",
}, "2026-09-03T13:51");
assert.equal(
  changedPostPayload.publishedAt,
  new Date("2026-09-04T10:15").toISOString(),
);
assert.match(String(changedPostPayload.publishedAt), /Z$/);

console.log("publishedAt Admin payload regression tests passed");
