import assert from "node:assert/strict";
import {
  buildVersionedSettingsPatch,
  parseVersionedSettings,
  settingsSnapshotUrl,
} from "./versioned-settings";

const keys = ["site.landing.xayNhaTronGoi", "site.landing.thiCongNhaXuong"];
const version = "2026-10-01T10:20:30.123Z";
assert.match(settingsSnapshotUrl(keys), /settings\/snapshot\?keys=site\.landing\.xayNhaTronGoi%2Csite\.landing\.thiCongNhaXuong/);

const loaded = parseVersionedSettings({
  settings: {
    [keys[0]!]: { exists: true, value: { hidden: { keep: true }, stats: [1] }, updatedAt: version },
    [keys[1]!]: { exists: false, value: null, updatedAt: null },
  },
}, keys);
assert.equal(loaded[keys[0]!]?.updatedAt, version);
assert.equal(loaded[keys[1]!]?.exists, false);

assert.deepEqual(buildVersionedSettingsPatch([
  { key: keys[0]!, value: { hidden: { keep: true }, stats: [] } },
  { key: keys[1]!, value: { testimonials: [] } },
], loaded), {
  updates: [
    { key: keys[0], value: { hidden: { keep: true }, stats: [] }, expectedUpdatedAt: version },
    { key: keys[1], value: { testimonials: [] }, expectedUpdatedAt: null },
  ],
});

assert.throws(() => parseVersionedSettings({ settings: {} }, keys));
assert.throws(() => buildVersionedSettingsPatch([{ key: "missing", value: {} }], loaded));

console.log("Admin versioned Settings payload regression tests passed");
