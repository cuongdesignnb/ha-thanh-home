import assert from "node:assert/strict";
import {
  mergeSettingsJson,
  nextSettingsUpdatedAt,
  parseSettingsWriteInput,
  SettingsWriteInputError,
} from "./settings-concurrency";

const version = new Date("2026-10-01T10:20:30.123Z");
const single = parseSettingsWriteInput({
  key: "site.landing.test",
  value: { nested: { changed: true }, list: [] },
  expectedUpdatedAt: version.toISOString(),
});
assert.equal(single.length, 1);
assert.equal(single[0]?.expectedUpdatedAt?.toISOString(), version.toISOString());

const absent = parseSettingsWriteInput({ key: "site.landing.new", value: {}, expectedUpdatedAt: null });
assert.equal(absent[0]?.expectedUpdatedAt, null);

assert.throws(
  () => parseSettingsWriteInput({ key: "site.landing.test", value: {} }),
  (error: unknown) => error instanceof SettingsWriteInputError && error.status === 428,
);
assert.throws(
  () => parseSettingsWriteInput({ key: "site.landing.test", value: {}, expectedUpdatedAt: "yesterday" }),
  (error: unknown) => error instanceof SettingsWriteInputError && error.status === 400,
);
assert.throws(
  () => parseSettingsWriteInput({ updates: [
    { key: "same", value: 1, expectedUpdatedAt: null },
    { key: "same", value: 2, expectedUpdatedAt: null },
  ] }),
  (error: unknown) => error instanceof SettingsWriteInputError && error.status === 400,
);

const previous = {
  visible: { title: "old", nested: { kept: "keep", changed: "old" } },
  hiddenTopLevel: "preserve",
  list: ["old"],
};
assert.deepEqual(
  mergeSettingsJson(previous, { visible: { nested: { changed: "new" } }, list: [] }),
  {
    visible: { title: "old", nested: { kept: "keep", changed: "new" } },
    hiddenTopLevel: "preserve",
    list: [],
  },
);
assert.deepEqual(mergeSettingsJson({ canonical: "/old" }, { canonical: null }), { canonical: null });

const next = nextSettingsUpdatedAt(version, version.getTime());
assert.equal(next.getTime(), version.getTime() + 1);
assert.ok(next.getTime() > version.getTime());

console.log("Settings version contract and JSON preservation tests passed");
