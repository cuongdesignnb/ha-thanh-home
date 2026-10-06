import assert from "node:assert/strict";
import { isVersionedContentEntity, withExpectedUpdatedAt } from "./expected-version";

const loadedVersion = "2026-10-06T09:15:22.417Z";
const bodyOnly = { contentHtml: "<p>Body</p>" };

assert.deepEqual(withExpectedUpdatedAt("posts", bodyOnly, loadedVersion), {
  contentHtml: "<p>Body</p>",
  expectedUpdatedAt: loadedVersion,
});
assert.deepEqual(withExpectedUpdatedAt("menus", bodyOnly, loadedVersion), bodyOnly);
assert.equal(isVersionedContentEntity("projects"), true);
assert.equal(isVersionedContentEntity("settings"), false);
assert.throws(() => withExpectedUpdatedAt("pages", bodyOnly), /missing updatedAt/);

console.log("Admin expectedUpdatedAt payload regression tests passed");
