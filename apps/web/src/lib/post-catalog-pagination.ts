export type PostCatalogSearchParams = Record<string, string | undefined>;
export type PostPaginationItem = number | "ellipsis";

function meaningfulCategory(value?: string) {
  return Boolean(value && value.trim());
}

export function parsePostCatalogPage(value?: string | number, totalPages?: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  return totalPages && totalPages > 0 ? Math.min(page, Math.floor(totalPages)) : page;
}

export function isPostCatalogPageOutOfRange(requestedPage: number, totalPages: number) {
  const page = parsePostCatalogPage(requestedPage);
  const total = Math.max(0, Math.floor(totalPages || 0));
  if (page <= 1) return false;
  return total === 0 || page > total;
}

function appendAllowedParams(params: URLSearchParams, searchParams: PostCatalogSearchParams) {
  const category = searchParams.category;
  if (meaningfulCategory(category)) params.set("category", category!.trim());
}

export function buildPostCatalogPageHref(
  basePath: string,
  searchParams: PostCatalogSearchParams,
  page: number,
) {
  const params = new URLSearchParams();
  appendAllowedParams(params, searchParams);
  const normalizedPage = parsePostCatalogPage(page);
  if (normalizedPage > 1) params.set("page", String(normalizedPage));
  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ""}`;
}

export function buildPostCatalogApiQuery(searchParams: PostCatalogSearchParams) {
  const params = new URLSearchParams({ limit: "24" });
  appendAllowedParams(params, searchParams);
  const page = parsePostCatalogPage(searchParams.page);
  if (page > 1) params.set("page", String(page));
  return params;
}

export function buildPostCatalogCanonical(
  basePath: string,
  searchParams: PostCatalogSearchParams,
  page = parsePostCatalogPage(searchParams.page),
) {
  if (meaningfulCategory(searchParams.category)) return basePath;
  return buildPostCatalogPageHref(basePath, {}, page);
}

export function buildPostPaginationItems(currentPage: number, totalPages: number): PostPaginationItem[] {
  const total = Math.max(1, Math.floor(totalPages));
  const current = parsePostCatalogPage(currentPage, total);
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

