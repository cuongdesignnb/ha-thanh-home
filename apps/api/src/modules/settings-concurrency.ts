export type SettingsWriteInput = {
  key: string;
  value: unknown;
  expectedUpdatedAt: Date | null;
};

export class SettingsWriteInputError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 428 = 400,
  ) {
    super(message);
    this.name = "SettingsWriteInputError";
  }
}

export function parseSettingsWriteInput(body: unknown): SettingsWriteInput[] {
  if (!isRecord(body)) throw new SettingsWriteInputError("A settings update object is required.");
  const updates = Array.isArray(body.updates) ? body.updates : [body];
  if (updates.length === 0) throw new SettingsWriteInputError("At least one settings update is required.");

  const parsed = updates.map((candidate, index) => {
    if (!isRecord(candidate)) throw new SettingsWriteInputError(`Settings update ${index + 1} must be an object.`);
    if (typeof candidate.key !== "string" || candidate.key.trim() === "" || candidate.key.length > 191) {
      throw new SettingsWriteInputError(`Settings update ${index + 1} has an invalid key.`);
    }
    if (!Object.prototype.hasOwnProperty.call(candidate, "value")) {
      throw new SettingsWriteInputError(`Settings update ${candidate.key} must include value.`);
    }
    if (!Object.prototype.hasOwnProperty.call(candidate, "expectedUpdatedAt")) {
      throw new SettingsWriteInputError(`Settings update ${candidate.key} must include expectedUpdatedAt.`, 428);
    }

    let expectedUpdatedAt: Date | null;
    if (candidate.expectedUpdatedAt === null) {
      expectedUpdatedAt = null;
    } else if (
      typeof candidate.expectedUpdatedAt === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(candidate.expectedUpdatedAt)
    ) {
      expectedUpdatedAt = new Date(candidate.expectedUpdatedAt);
      if (Number.isNaN(expectedUpdatedAt.getTime())) {
        throw new SettingsWriteInputError(`Settings update ${candidate.key} has an invalid expectedUpdatedAt.`);
      }
    } else {
      throw new SettingsWriteInputError(`Settings update ${candidate.key} has an invalid expectedUpdatedAt.`);
    }

    return { key: candidate.key, value: candidate.value, expectedUpdatedAt };
  });

  const keys = parsed.map((item) => item.key);
  if (new Set(keys).size !== keys.length) throw new SettingsWriteInputError("A settings key may only appear once per save.");
  return parsed.sort((a, b) => a.key.localeCompare(b.key));
}

/** Merge object patches recursively; arrays and explicit null replace the old value. */
export function mergeSettingsJson(current: unknown, incoming: unknown): unknown {
  if (!isRecord(current) || !isRecord(incoming)) return incoming;
  const merged: Record<string, unknown> = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = Object.prototype.hasOwnProperty.call(current, key)
      ? mergeSettingsJson(current[key], value)
      : value;
  }
  return merged;
}

/** Guarantee a new millisecond-precision version, even for back-to-back writes. */
export function nextSettingsUpdatedAt(previous: Date, now = Date.now()): Date {
  return new Date(Math.max(now, previous.getTime() + 1));
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
