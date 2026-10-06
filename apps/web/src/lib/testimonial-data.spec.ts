import assert from "node:assert/strict";
import { resolveCmsList, resolveTestimonialItems, resolveTestimonialRating, shouldRenderCmsList, shouldRenderTestimonials } from "./testimonial-data";

const item = { name: "CMS-supplied customer", quote: "Verified CMS entry" };

assert.deepEqual(resolveTestimonialItems([item]), [item]);
assert.deepEqual(resolveTestimonialItems([]), []);
assert.deepEqual(resolveTestimonialItems(undefined), []);
assert.deepEqual(resolveTestimonialItems(null), []);
assert.equal(shouldRenderTestimonials([]), false);
assert.equal(shouldRenderTestimonials(resolveTestimonialItems([])), false);
assert.equal(shouldRenderTestimonials(resolveTestimonialItems([item])), true);
assert.equal(shouldRenderCmsList([]), false);
assert.equal(shouldRenderCmsList([{ value: "CMS stat" }]), true);
assert.equal(resolveTestimonialRating(undefined), null);
assert.equal(resolveTestimonialRating(null), null);
assert.equal(resolveTestimonialRating(5), 5);
assert.equal(resolveTestimonialRating(3), 3);
assert.equal(resolveTestimonialRating(0), null);
assert.equal(resolveTestimonialRating(6), null);
assert.deepEqual(resolveCmsList([]), []);
assert.deepEqual(resolveCmsList(undefined), []);
assert.deepEqual(resolveCmsList([{ value: "CMS stat" }]), [{ value: "CMS stat" }]);

console.log("Empty testimonial data regression tests passed");
