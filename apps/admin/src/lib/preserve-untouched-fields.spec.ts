import assert from "node:assert/strict";
import { omitUntouchedFormFields } from "./preserve-untouched-fields";

const unchangedBodyForm = {
  contentHtml: "<p>Updated body</p>",
  canonicalUrl: "",
  metaTitle: "",
  metaDescription: "Existing description",
  slug: "kept-slug",
  status: "published",
};

const payload = omitUntouchedFormFields(
  {
    contentHtml: "<p>Updated body</p>",
    canonicalUrl: "",
    metaTitle: "",
    metaDescription: "Existing description",
    slug: "kept-slug",
    status: "published",
  },
  unchangedBodyForm,
  {
    contentHtml: "<p>Original body</p>",
    canonicalUrl: null,
    metaTitle: null,
    metaDescription: "Existing description",
    slug: "kept-slug",
    status: "published",
  },
);

assert.deepEqual(payload, { contentHtml: "<p>Updated body</p>" });

const sparseNumbers = omitUntouchedFormFields(
  { areaValue: null, galleryMediaIds: [], thumbnailMediaId: null },
  { areaValue: Number.NaN, galleryMediaIds: [], thumbnailMediaId: "" },
  { areaValue: null, galleryMediaIds: [], thumbnailMediaId: null },
);
assert.deepEqual(sparseNumbers, {});

const existingCanonical = "relative/legacy-canonical";
const preservedExistingCanonical = omitUntouchedFormFields(
  { canonicalUrl: "/du-an/relative/legacy-canonical" },
  { canonicalUrl: existingCanonical },
  { canonicalUrl: existingCanonical },
);
assert.deepEqual(preservedExistingCanonical, {});

const explicitCanonicalChange = omitUntouchedFormFields(
  { canonicalUrl: "https://example.test/new-canonical" },
  { canonicalUrl: "https://example.test/new-canonical" },
  { canonicalUrl: "https://example.test/old-canonical" },
);
assert.deepEqual(explicitCanonicalChange, { canonicalUrl: "https://example.test/new-canonical" });

const explicitClear = omitUntouchedFormFields(
  { canonicalUrl: "" },
  { canonicalUrl: "" },
  { canonicalUrl: "https://example.test/old-canonical" },
);
assert.deepEqual(explicitClear, { canonicalUrl: "" });

console.log("Admin untouched nullable fields regression tests passed");
