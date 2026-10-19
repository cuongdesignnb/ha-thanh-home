import { getDetail, type Post } from "./api";
import { isUsableSlug } from "./content-validation";
import { isLegacyRedirectSource } from "./legacy-redirects";

/**
 * Posts that brought most of the site's search traffic in Apr–Jun 2026 (GSC), before the July URL move
 * sent them from the site root to /tin-tuc/. They are indexed at the new URLs but get almost no impressions,
 * so the home page and every post link to them to help Google re-evaluate them. Ordered by past clicks.
 */
export const featuredPostSlugs: readonly string[] = [
  "gia-vat-lieu-xay-dung-thang-5-nam-2026-tai-ha-noi",
  "quy-trinh-dung-lanh-to-cua-lien-tuong-va-nhung-dieu-can-luu-y",
  "quy-trinh-tao-lien-ket-giua-cot-va-tuong-khi-xay",
  "thu-tuc-xin-cap-dien-3-pha",
  "quy-trinh-va-nhung-dieu-can-biet-khi-san-lap-nen",
  "muon-nguoi-tren-60-tuoi-dong-tho-xay-nha-co-tot-khong",
  "khoang-cach-diem-noi-cua-thep-cot-dung-tieu-chuan-an-toan",
  "xin-cap-nuoc-sach-tai-dau",
  "uu-diem-khi-do-lanh-to-cua-truc-tiep",
  "quy-trinh-ep-coc-ly-tam-va-nhung-dieu-can-biet",
  "trach-tu-la-gi-lam-nha-pham-trach-tu-co-sao-khong",
  "thep-san-gi-truoc-khi-do-be-tong-co-anh-huong-gi-khong",
  "cach-xu-ly-ve-sinh-thep-gi-truoc-khi-do-be-tong",
  "hop-dong-xay-dung-co-ap-dung-thue-vat-khong",
  "chat-luong-be-tong-mac-300",
  "do-mai-be-tong-sau-bao-nhieu-ngay-duoc-thi-cong-tiep",
];

export type FeaturedPostLink = { slug: string; title: string; href: string };

/** Resolves the curated list against the CMS, dropping posts that are gone, unpublished or merged away. */
export async function getFeaturedPosts({ exclude, limit }: { exclude?: string; limit?: number } = {}): Promise<FeaturedPostLink[]> {
  const slugs = featuredPostSlugs.filter((slug) => slug !== exclude);
  const posts = await Promise.all(slugs.map((slug) => getDetail<Post>(`/posts/${slug}`)));
  return posts
    .filter((post): post is Post => Boolean(post && isUsableSlug(post.slug) && !isLegacyRedirectSource(`/tin-tuc/${post.slug}`)))
    .slice(0, limit)
    .map((post) => ({ slug: post.slug, title: post.title, href: `/tin-tuc/${post.slug}` }));
}
