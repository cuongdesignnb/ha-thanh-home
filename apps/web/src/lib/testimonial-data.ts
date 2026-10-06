export function resolveCmsList<T>(items: T[] | null | undefined): T[] {
  return Array.isArray(items) ? items : [];
}

export const resolveTestimonialItems = resolveCmsList;

export function shouldRenderCmsList<T>(items: readonly T[] | null | undefined): boolean {
  return Array.isArray(items) && items.length > 0;
}

export const shouldRenderTestimonials = shouldRenderCmsList;

export function resolveTestimonialRating(rating: unknown): number | null {
  if (rating === null || rating === undefined || rating === "") return null;
  const value = Number(rating);
  if (!Number.isFinite(value) || value < 1 || value > 5) return null;
  return Math.floor(value);
}
