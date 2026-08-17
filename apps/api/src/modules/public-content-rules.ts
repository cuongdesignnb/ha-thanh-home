import { Prisma } from "@prisma/client";

export const FIXED_SERVICE_PAGE_SLUGS = [
  "xay-nha-tron-goi",
  "san-xuat-thi-cong-noi-that",
  "thi-cong-nha-xuong",
  "thi-cong-noi-that-van-phong",
];

/**
 * A small set of legacy records contain a slash in their slug. Keep the
 * database value untouched and resolve the normalized public URL in memory.
 */
export const LEGACY_SERVICE_SLUG_ALIASES: Record<string, string> = {
  "xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24-7": "xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24/7",
  "xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24-7": "xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24/7",
};

export function legacyServiceSlugCandidates(slug: string) {
  return [slug, LEGACY_SERVICE_SLUG_ALIASES[slug]].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
}

export function fixedServicePageWhere(where: Prisma.ServiceWhereInput = {}): Prisma.ServiceWhereInput {
  const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
  return {
    ...where,
    AND: [...existingAnd, { slug: { in: FIXED_SERVICE_PAGE_SLUGS } }],
  };
}
