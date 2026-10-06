import assert from "node:assert/strict";
import { ConflictException } from "@nestjs/common";
import { omitUndefined, updateWithExpectedVersion } from "./optimistic-update";

type CmsRecord = {
  id: number;
  title: string;
  contentHtml: string;
  slug: string;
  canonicalUrl: string | null;
  status: "published" | "draft";
  thumbnailMediaId: number | null;
  galleryMediaIds: number[];
  publishedAt: Date | null;
  updatedAt: Date;
};

const initialRecord: CmsRecord = {
  id: 7,
  title: "Existing title",
  contentHtml: "<p>Before</p>",
  slug: "existing-slug",
  canonicalUrl: "https://example.test/existing-slug",
  status: "published",
  thumbnailMediaId: 19,
  galleryMediaIds: [21, 22],
  publishedAt: new Date("2026-09-03T06:51:51.117Z"),
  updatedAt: new Date("2026-10-06T09:15:22.417Z"),
};

function makeStore() {
  let value = { ...initialRecord, galleryMediaIds: [...initialRecord.galleryMediaIds] };
  let writeCount = 0;
  return {
    get value() { return value; },
    get writeCount() { return writeCount; },
    replace(next: CmsRecord) { value = next; },
    async save(expectedUpdatedAt: string, patch: Partial<CmsRecord>, beforeCompareAndSwap?: () => void) {
      return updateWithExpectedVersion({
        entityName: "Post",
        expectedUpdatedAt,
        findCurrent: async () => ({ updatedAt: value.updatedAt, status: value.status, title: value.title }),
        updateMany: async (expected) => {
          beforeCompareAndSwap?.();
          if (value.updatedAt.getTime() !== expected.getTime()) return { count: 0 };
          writeCount += 1;
          value = { ...value, ...patch, updatedAt: new Date("2026-10-06T09:16:00.000Z") };
          return { count: 1 };
        },
        findSaved: async () => value,
      });
    },
  };
}

const originalVersion = initialRecord.updatedAt.toISOString();

async function run() {
// Body-only update and undefined fields preserve publication date and every
// unrelated URL/status/media field.
{
  const store = makeStore();
  const patch = omitUndefined({
    contentHtml: "<p>After</p>",
    slug: undefined,
    canonicalUrl: undefined,
    status: undefined,
    thumbnailMediaId: undefined,
    galleryMediaIds: undefined,
    publishedAt: undefined,
  });
  const saved = await store.save(originalVersion, patch);
  assert.equal(saved.contentHtml, "<p>After</p>");
  assert.equal(saved.publishedAt?.toISOString(), "2026-09-03T06:51:51.117Z");
  assert.equal(saved.slug, initialRecord.slug);
  assert.equal(saved.canonicalUrl, initialRecord.canonicalUrl);
  assert.equal(saved.status, initialRecord.status);
  assert.equal(saved.thumbnailMediaId, initialRecord.thumbnailMediaId);
  assert.deepEqual(saved.galleryMediaIds, initialRecord.galleryMediaIds);
  assert.equal(store.writeCount, 1);
}

// A version already stale at request time produces HTTP 409 and does not write.
{
  const store = makeStore();
  store.replace({ ...store.value, contentHtml: "<p>Concurrent version</p>", updatedAt: new Date("2026-10-06T09:16:00.000Z") });
  const before = { ...store.value };
  await assert.rejects(
    () => store.save(originalVersion, { contentHtml: "<p>Stale overwrite</p>" }),
    (error: unknown) => error instanceof ConflictException && error.getStatus() === 409,
  );
  assert.deepEqual(store.value, before);
  assert.equal(store.writeCount, 0);
}

// A concurrent writer between the read and update is rejected by the atomic
// updatedAt predicate, proving the check is not a read-then-write race.
{
  const store = makeStore();
  const before = { ...store.value };
  await assert.rejects(
    () => store.save(originalVersion, { contentHtml: "<p>Stale overwrite</p>" }, () => {
      store.replace({ ...store.value, title: "Concurrent title", updatedAt: new Date("2026-10-06T09:16:00.000Z") });
    }),
    (error: unknown) => error instanceof ConflictException && error.getStatus() === 409,
  );
  assert.equal(store.value.contentHtml, before.contentHtml);
  assert.equal(store.value.title, "Concurrent title");
  assert.equal(store.writeCount, 0);
}

// Explicit fields in scope are saved while null/undefined-omitted fields stay untouched.
{
  const store = makeStore();
  const patch = omitUndefined({
    contentHtml: "<p>Updated body</p>",
    canonicalUrl: null,
    thumbnailMediaId: undefined,
    galleryMediaIds: undefined,
    publishedAt: undefined,
  });
  const saved = await store.save(originalVersion, patch);
  assert.equal(saved.contentHtml, "<p>Updated body</p>");
  assert.equal(saved.canonicalUrl, null);
  assert.equal(saved.thumbnailMediaId, initialRecord.thumbnailMediaId);
  assert.deepEqual(saved.galleryMediaIds, initialRecord.galleryMediaIds);
  assert.equal(saved.publishedAt?.toISOString(), "2026-09-03T06:51:51.117Z");
}

}

run().then(() => console.log("CMS optimistic concurrency regression tests passed"));
