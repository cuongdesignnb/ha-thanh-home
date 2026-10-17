import assert from "node:assert/strict";
import { featuredPostSlugs } from "./featured-posts";
import { getLegacyRedirectTarget } from "./legacy-redirects";
import { getGscNotFoundTarget } from "./legacy-redirects-gsc";

assert.equal(new Set(featuredPostSlugs).size, featuredPostSlugs.length, "featured posts must be unique");
for (const slug of featuredPostSlugs) {
  const path = `/tin-tuc/${slug}`;
  // Linking a redirect source would spend the links on a hop instead of the page itself.
  assert.equal(getLegacyRedirectTarget(path), undefined, `${path} redirects`);
  assert.equal(getGscNotFoundTarget(path), undefined, `${path} redirects`);
}

console.log(`featured-posts: ${featuredPostSlugs.length} posts verified`);
