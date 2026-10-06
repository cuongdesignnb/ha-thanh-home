export type VersionedSetting = {
  exists: boolean;
  value: unknown;
  updatedAt: string | null;
};

export type VersionedSettings = Record<string, VersionedSetting>;

export type SettingsWrite = {
  key: string;
  value: unknown;
};

export function settingsSnapshotUrl(keys: readonly string[]) {
  assertKeys(keys);
  const params = new URLSearchParams({ keys: keys.join(",") });
  return `/api/cms/settings/snapshot?${params.toString()}`;
}

export function parseVersionedSettings(payload: unknown, requestedKeys: readonly string[]): VersionedSettings {
  assertKeys(requestedKeys);
  if (!isRecord(payload) || !isRecord(payload.settings)) throw new Error("Settings response is missing its settings map.");

  const parsed: VersionedSettings = {};
  for (const key of requestedKeys) {
    const item = payload.settings[key];
    if (!isRecord(item) || typeof item.exists !== "boolean") throw new Error(`Settings response is missing version metadata for ${key}.`);
    const updatedAt = item.updatedAt;
    if (updatedAt !== null && (typeof updatedAt !== "string" || Number.isNaN(Date.parse(updatedAt)))) {
      throw new Error(`Settings response has an invalid version for ${key}.`);
    }
    if (item.exists && updatedAt === null) throw new Error(`Existing Settings key ${key} has no version.`);
    if (!item.exists && updatedAt !== null) throw new Error(`Missing Settings key ${key} unexpectedly has a version.`);
    parsed[key] = { exists: item.exists, value: item.value, updatedAt };
  }
  return parsed;
}

export function buildVersionedSettingsPatch(
  changes: readonly SettingsWrite[],
  snapshot: VersionedSettings,
) {
  if (changes.length === 0) throw new Error("At least one Settings change is required.");
  const keys = changes.map(({ key }) => key);
  assertKeys(keys);
  if (new Set(keys).size !== keys.length) throw new Error("A Settings key may only be saved once per request.");

  return {
    updates: changes.map(({ key, value }) => {
      const version = snapshot[key];
      if (!version) throw new Error(`No loaded version is available for Settings key ${key}.`);
      return { key, value, expectedUpdatedAt: version.updatedAt };
    }),
  };
}

export async function fetchVersionedSettings(
  fetcher: (input: string, init?: RequestInit) => Promise<Response>,
  keys: readonly string[],
): Promise<VersionedSettings> {
  const response = await fetcher(settingsSnapshotUrl(keys), { cache: "no-store" });
  if (!response.ok) throw new Error(await response.text() || `Settings read failed (${response.status}).`);
  return parseVersionedSettings(await response.json(), keys);
}

function assertKeys(keys: readonly string[]) {
  if (keys.length === 0 || keys.length > 50 || keys.some((key) => typeof key !== "string" || key.trim() === "" || key.length > 191)) {
    throw new Error("Request one to 50 valid Settings keys.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
