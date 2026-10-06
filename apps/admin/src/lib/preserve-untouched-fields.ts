const nullableTextFields = new Set([
  "metaTitle",
  "metaDescription",
  "canonicalUrl",
  "focusKeyword",
  "ogTitle",
  "ogDescription",
  "category",
  "projectType",
  "location",
  "area",
  "style",
  "scale",
  "clientName",
  "budgetRange",
  "houseType",
  "interiorStyle",
  "roomType",
  "layoutType",
  "materialTone",
  "roofType",
  "constructionTime",
  "code",
  "description",
  "excerpt",
]);

const nullableNumberFields = new Set([
  "categoryId",
  "areaValue",
  "floors",
  "facadeWidth",
  "depth",
  "bedrooms",
  "bathrooms",
  "estimatedBudget",
  "budgetMin",
  "budgetMax",
  "thumbnailMediaId",
]);

/**
 * Forms commonly represent nullable text values as an empty input string.
 * Omit fields whose displayed value is unchanged so a body-only edit cannot
 * turn a stored null into an empty string or normalize an existing canonical.
 */
export function omitUntouchedFormFields<T extends Record<string, unknown>>(
  payload: T,
  formValues: Record<string, unknown>,
  original: Record<string, unknown>,
): Partial<T> {
  const patch: Record<string, unknown> = { ...payload };

  for (const key of Object.keys(patch)) {
    if (!(key in original) || !(key in formValues)) continue;
    if (formValuesAreUnchanged(key, formValues[key], original[key])) delete patch[key];
  }

  return patch as Partial<T>;
}

function formValuesAreUnchanged(key: string, formValue: unknown, originalValue: unknown) {
  if (nullableTextFields.has(key) && isEmptyText(formValue) && (originalValue === null || originalValue === undefined)) {
    return true;
  }

  if (nullableNumberFields.has(key) && isEmptyNumber(formValue) && (originalValue === null || originalValue === undefined)) {
    return true;
  }

  if (formValue instanceof Date || originalValue instanceof Date) {
    return toComparableDate(formValue) === toComparableDate(originalValue);
  }

  return stableValue(formValue) === stableValue(originalValue);
}

function isEmptyText(value: unknown) {
  return value === "" || value === null || value === undefined;
}

function isEmptyNumber(value: unknown) {
  return value === "" || value === null || value === undefined || (typeof value === "number" && Number.isNaN(value));
}

function toComparableDate(value: unknown) {
  if (!value) return value;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function stableValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => `${JSON.stringify(key)}:${stableValue(entry)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
