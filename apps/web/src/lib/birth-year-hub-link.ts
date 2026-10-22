/**
 * The birth-year lookup post (published 2026-10-22) links to every "Năm XXXX tuổi … xây nhà hợp hướng nào"
 * post. This adds the link back at render time (no CMS edit), so the 35 year posts and the related age posts
 * form one cluster that Google and readers can move through.
 */
export const BIRTH_YEAR_HUB_PATH = "/tin-tuc/xem-tuoi-xay-nha-theo-nam-sinh";

const BIRTH_YEAR_POST = /^nam-(?:19|20)\d{2}-tuoi-[a-z-]+-xay-nha-hop-huong-nao-giup-sinh-tai-loc$/;

/** Age-related posts the lookup page lists under "Những việc nên xem cùng với tuổi xây nhà". */
export const birthYearRelatedPosts: ReadonlySet<string> = new Set([
  "cach-tinh-trach-tuoi-xay-nha-chuan-nhat",
  "bao-nhieu-tuoi-thi-co-the-dong-tho-xay-nha",
  "co-nen-muon-tuoi-xay-nha",
  "muon-nguoi-tren-60-tuoi-dong-tho-xay-nha-co-tot-khong",
  "van-khan-chuoc-nha-khi-muon-tuoi-xay-nha",
  "cach-hoa-giai-han-tam-tai-khi-xay-nha-duoc-binh-an",
  "tuoi-han-thai-tue-co-nen-xay-nha",
  "han-xay-nha-mat-may-nam-de-hoa-giai",
  "nam-binh-ngo-2026-tuoi-nao-xay-nha-tot-nhat",
  "chon-thang-lam-nha-theo-tuoi-gap-nhieu-may-man",
  "xem-ngay-khoi-cong-nha-theo-tuoi-dung-phong-thuy",
  "lam-nha-xem-tuoi-vo-co-duoc-khong",
  "meo-hoa-giai-huong-nha-khong-hop-tuoi",
]);

export function linksToBirthYearHub(slug: string): boolean {
  return BIRTH_YEAR_POST.test(slug) || birthYearRelatedPosts.has(slug);
}

const EXISTING_HUB_LINK = /\/tin-tuc\/xem-tuoi-xay-nha-theo-nam-sinh\/?["'?#]/i;

/** Insert one sentence linking the lookup page before the post's second <h2>; other posts are returned unchanged. */
export function withBirthYearHubLink(slug: string, html: string): string {
  if (!linksToBirthYearHub(slug) || !html || EXISTING_HUB_LINK.test(html)) return html;

  const paragraph = `<p class="service-context-link">Muốn xem hướng nhà hợp tuổi của các năm sinh khác, bạn có thể tra trong <a href="${BIRTH_YEAR_HUB_PATH}">bảng tra cứu tuổi xây nhà theo năm sinh</a>.</p>`;
  const headings = [...html.matchAll(/<h2\b/gi)];
  if (headings.length >= 2) {
    const index = headings[1].index!;
    return `${html.slice(0, index)}${paragraph}${html.slice(index)}`;
  }
  return `${html}${paragraph}`;
}
