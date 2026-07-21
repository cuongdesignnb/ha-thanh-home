import { Prisma } from "@prisma/client";

export const FIXED_SERVICE_PAGE_SLUGS = [
  "xay-nha-tron-goi",
  "san-xuat-thi-cong-noi-that",
  "thi-cong-nha-xuong",
  "thi-cong-noi-that-van-phong",
];

export function fixedServicePageWhere(where: Prisma.ServiceWhereInput = {}): Prisma.ServiceWhereInput {
  const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
  return {
    ...where,
    AND: [...existingAnd, { slug: { in: FIXED_SERVICE_PAGE_SLUGS } }],
  };
}
