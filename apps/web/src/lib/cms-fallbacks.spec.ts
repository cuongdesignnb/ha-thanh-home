import assert from "node:assert/strict";
import { aboutPageWithDefaults, defaultHomepage, homepageWithDefaults, nhaXuongLandingWithDefaults, noiThatLandingWithDefaults, vanPhongLandingWithDefaults, xayNhaLandingWithDefaults } from "./api";
import { aboutPageDefaultConfig } from "./about-page-defaults";
import { shouldRenderCmsList } from "./testimonial-data";

assert.deepEqual(defaultHomepage.stats, []);
assert.equal(shouldRenderCmsList(defaultHomepage.stats), false);
assert.deepEqual(homepageWithDefaults({ stats: [] }).stats, []);
assert.equal(shouldRenderCmsList(homepageWithDefaults({ stats: [] }).stats), false);
assert.deepEqual(homepageWithDefaults().stats, []);

for (const resolve of [xayNhaLandingWithDefaults, noiThatLandingWithDefaults, nhaXuongLandingWithDefaults, vanPhongLandingWithDefaults]) {
  assert.deepEqual(resolve({ stats: [], testimonials: [] }).stats, []);
  assert.deepEqual(resolve({ stats: [], testimonials: [] }).testimonials, []);
  assert.deepEqual(resolve().stats, []);
  assert.deepEqual(resolve().testimonials, []);
}

assert.deepEqual(aboutPageDefaultConfig.stats, []);
assert.deepEqual(aboutPageDefaultConfig.people.highlights, []);
assert.deepEqual(aboutPageDefaultConfig.testimonials.items, []);

const emptyAbout = aboutPageWithDefaults({
  ...aboutPageDefaultConfig,
  people: { ...aboutPageDefaultConfig.people, highlights: [] },
  stats: [],
  testimonials: { ...aboutPageDefaultConfig.testimonials, items: [] },
});
assert.deepEqual(emptyAbout.people.highlights, []);
assert.deepEqual(emptyAbout.stats, []);
assert.deepEqual(emptyAbout.testimonials.items, []);
assert.equal(shouldRenderCmsList(emptyAbout.stats), false);
assert.equal(shouldRenderCmsList(emptyAbout.testimonials.items), false);

const cmsTestimonial = { name: "CMS customer", quote: "Verified CMS quote", rating: 5 };
assert.deepEqual(
  aboutPageWithDefaults({ ...aboutPageDefaultConfig, testimonials: { title: "Reviews", items: [cmsTestimonial] } }).testimonials.items,
  [cmsTestimonial],
);

console.log("CMS empty-list fallback regression tests passed");
