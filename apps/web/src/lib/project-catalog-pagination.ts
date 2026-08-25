export const projectCatalogFilterKeys = [
  "category",
  "projectType",
  "style",
  "space",
  "scale",
  "location",
  "sort",
] as const;

export type ProjectCatalogSearchParams = Record<string, string | undefined>;
export type PaginationItem = number | "ellipsis";

function meaningfulValue(value?: string) {
  return Boolean(value && value.trim());
}

export function parseCatalogPage(value?: string | number, totalPages?: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  return totalPages && totalPages > 0 ? Math.min(page, Math.floor(totalPages)) : page;
}

export function isCatalogPageOutOfRange(requestedPage: number, totalPages: number) {
  const page = parseCatalogPage(requestedPage);
  const total = Math.max(0, Math.floor(totalPages || 0));
  if (page <= 1) return false;
  return total === 0 || page > total;
}

export function hasCatalogFilters(searchParams: ProjectCatalogSearchParams) {
  return projectCatalogFilterKeys.some((key) => meaningfulValue(searchParams[key]));
}

function appendAllowedParams(params: URLSearchParams, searchParams: ProjectCatalogSearchParams) {
  for (const key of projectCatalogFilterKeys) {
    const value = searchParams[key];
    if (meaningfulValue(value)) params.set(key, value!.trim());
  }
}

export function buildProjectCatalogPageHref(
  basePath: string,
  searchParams: ProjectCatalogSearchParams,
  page: number,
) {
  const params = new URLSearchParams();
  appendAllowedParams(params, searchParams);
  const normalizedPage = parseCatalogPage(page);
  if (normalizedPage > 1) params.set("page", String(normalizedPage));
  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ""}`;
}

export function buildProjectCatalogApiQuery(
  searchParams: ProjectCatalogSearchParams,
  group?: string,
) {
  const params = new URLSearchParams({ limit: "24" });
  if (group) params.set("group", group);
  appendAllowedParams(params, searchParams);
  const page = parseCatalogPage(searchParams.page);
  if (page > 1) params.set("page", String(page));
  return params;
}

export function buildProjectCatalogCanonical(
  basePath: string,
  searchParams: ProjectCatalogSearchParams,
  page = parseCatalogPage(searchParams.page),
) {
  if (hasCatalogFilters(searchParams)) return basePath;
  return buildProjectCatalogPageHref(basePath, {}, page);
}

export function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  const total = Math.max(1, Math.floor(totalPages));
  const current = parseCatalogPage(currentPage, total);
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}
