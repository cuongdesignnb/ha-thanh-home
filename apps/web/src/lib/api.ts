export type ProjectGroup = "construction" | "interior";

export type MediaFile = {
  id: number;
  webpUrl?: string | null;
  thumbUrl?: string | null;
  mediumUrl?: string | null;
  largeUrl?: string | null;
  altText?: string | null;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  group: ProjectGroup;
  categoryId?: number | null;
  categoryRef?: ProjectCategory | null;
  category?: string | null;
  location?: string | null;
  style?: string | null;
  projectType?: string | null;
  scale?: string | null;
  area?: string | null;
  areaValue?: number | null;
  clientName?: string | null;
  budgetRange?: string | null;
  year?: number | null;
  description?: string | null;
  contentHtml?: string | null;
  thumbnailMedia?: MediaFile | null;
  galleryMediaIds?: number[] | null;
  galleryMedia?: MediaFile[] | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

export type ProjectCategory = {
  id: number;
  group: ProjectGroup;
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type ProjectFilterOption = {
  id: number;
  module?: "project" | "architecture_design" | "interior_design";
  group: ProjectGroup;
  type: "project_type" | "house_type" | "interior_style" | "style" | "scale" | "location" | "space" | "room_type" | "roof_type" | "floors" | "layout_type" | "material_tone" | "budget_range";
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type ProjectFilters = {
  categories: ProjectCategory[];
  filters: Record<string, ProjectFilterOption[]>;
};

export type CatalogFilters = {
  filters: Record<string, ProjectFilterOption[]>;
};

export type MenuItem = {
  id: number;
  label: string;
  url: string;
  target?: "self" | "blank";
  rel?: string | null;
  children?: MenuItem[];
};

export type MenuPayload = {
  id?: number;
  name?: string;
  location: "header" | "footer" | string;
  items: MenuItem[];
};

export type SiteIdentity = {
  name?: string;
  tagline?: string;
  hotline?: string;
  email?: string;
  address?: string;
  facebook?: string;
  zalo?: string;
  workingHours?: string;
};

export type SiteTheme = {
  forestGreen?: string;
  gold?: string;
  cream?: string;
  charcoal?: string;
  headingColor?: string;
  mutedColor?: string;
  lineColor?: string;
  headingFont?: string;
  bodyFont?: string;
  containerMax?: string;
};

export type HomeHeroSlide = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  imageUrl?: string;
};

export type HomeBenefit = {
  title?: string;
  description?: string;
};

export type SiteHomepage = {
  heroSlides?: HomeHeroSlide[];
  aboutEyebrow?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImageUrl?: string;
  aboutBenefits?: HomeBenefit[];
  expertiseEyebrow?: string;
  expertiseTitle?: string;
  architectureTemplatesTitle?: string;
  architectureTemplatesEyebrow?: string;
  interiorTemplatesTitle?: string;
  interiorTemplatesEyebrow?: string;
  servicesTitle?: string;
  servicesEyebrow?: string;
  processTitle?: string;
  stats?: Array<{ value?: string; label?: string }>;
  testimonialsTitle?: string;
  newsTitle?: string;
};

export type SiteSettings = {
  "site.identity"?: SiteIdentity;
  "site.theme"?: SiteTheme;
  "site.homepage"?: SiteHomepage;
};

export const fallbackHeaderMenu: MenuPayload = {
  location: "header",
  items: [
    { id: 1, label: "Trang chủ", url: "/" },
    { id: 2, label: "Dự án", url: "/du-an", children: [{ id: 21, label: "Công trình", url: "/du-an/cong-trinh" }, { id: 22, label: "Nội thất", url: "/du-an/noi-that" }] },
    { id: 3, label: "Mẫu kiến trúc", url: "/mau-thiet-ke-kien-truc" },
    { id: 4, label: "Mẫu nội thất", url: "/mau-thiet-ke-noi-that" },
    { id: 5, label: "Dịch vụ", url: "/dich-vu" },
    { id: 6, label: "Tin tức", url: "/tin-tuc" },
    { id: 7, label: "Liên hệ", url: "/lien-he" },
  ],
};

export const fallbackFooterMenu: MenuPayload = {
  location: "footer",
  items: [
    { id: 1, label: "Công trình", url: "/du-an/cong-trinh", children: [{ id: 11, label: "Dự án công trình", url: "/du-an/cong-trinh" }, { id: 12, label: "Dịch vụ công trình", url: "/dich-vu/cong-trinh" }, { id: 13, label: "Mẫu kiến trúc", url: "/mau-thiet-ke-kien-truc" }] },
    { id: 2, label: "Nội thất", url: "/du-an/noi-that", children: [{ id: 21, label: "Dự án nội thất", url: "/du-an/noi-that" }, { id: 22, label: "Dịch vụ nội thất", url: "/dich-vu/noi-that" }, { id: 23, label: "Mẫu nội thất", url: "/mau-thiet-ke-noi-that" }] },
    { id: 3, label: "Chính sách", url: "/chinh-sach-bao-hanh", children: [{ id: 31, label: "Chính sách bảo hành", url: "/chinh-sach-bao-hanh" }, { id: 32, label: "Chính sách bảo mật", url: "/chinh-sach-bao-mat" }] },
    { id: 4, label: "Liên hệ", url: "/lien-he", children: [{ id: 41, label: "Tin tức", url: "/tin-tuc" }, { id: 42, label: "Nhận tư vấn", url: "/lien-he" }] },
  ],
};

export type Service = {
  id: number;
  title: string;
  slug: string;
  group: ProjectGroup;
  description?: string | null;
  contentHtml?: string | null;
  thumbnailMedia?: MediaFile | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  contentHtml?: string | null;
  thumbnailMedia?: MediaFile | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  publishedAt?: string | null;
};

export type ArchitectureDesign = {
  id: number;
  title: string;
  slug: string;
  code?: string | null;
  houseType?: string | null;
  style?: string | null;
  area?: number | null;
  floors?: number | null;
  roofType?: string | null;
  estimatedBudget?: number | null;
  constructionTime?: string | null;
  location?: string | null;
  description?: string | null;
  contentHtml?: string | null;
  thumbnailMedia?: MediaFile | null;
  galleryMediaIds?: number[] | null;
  galleryMedia?: MediaFile[] | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

export type InteriorDesign = {
  id: number;
  title: string;
  slug: string;
  code?: string | null;
  interiorStyle?: string | null;
  houseType?: string | null;
  roomType?: string | null;
  area?: number | null;
  layoutType?: string | null;
  materialTone?: string | null;
  budgetRange?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  location?: string | null;
  description?: string | null;
  contentHtml?: string | null;
  thumbnailMedia?: MediaFile | null;
  galleryMediaIds?: number[] | null;
  galleryMedia?: MediaFile[] | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

export type HomeData = {
  constructionProjects: Project[];
  interiorProjects: Project[];
  services: Service[];
  posts: Post[];
  architectureDesigns: ArchitectureDesign[];
  interiorDesigns: InteriorDesign[];
};

export const defaultHomepage: Required<Pick<SiteHomepage, "heroSlides" | "aboutBenefits" | "stats">> & SiteHomepage = {
  heroSlides: [
    {
      eyebrow: "Hà Thành Home",
      title: "Thiết kế & thi công công trình, nội thất hiện đại",
      description: "Hà Thành Home mang đến giải pháp trọn gói từ ý tưởng, thiết kế đến thi công hoàn thiện cho nhà ở, biệt thự, văn phòng và showroom.",
      primaryLabel: "Xem dự án nổi bật",
      primaryUrl: "#projects",
      secondaryLabel: "Tư vấn miễn phí",
      secondaryUrl: "/lien-he",
      imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    },
  ],
  aboutEyebrow: "Về Hà Thành Home",
  aboutTitle: "Kiến tạo không gian sống và công trình đẳng cấp",
  aboutDescription: "Với hơn 10 năm kinh nghiệm trong lĩnh vực thiết kế, thi công và nội thất, Hà Thành Home tư vấn giải pháp tối ưu, bền vững, thẩm mỹ và phù hợp chi phí.",
  aboutImageUrl: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85",
  aboutBenefits: [
    { title: "Thiết kế sáng tạo", description: "Ý tưởng khác biệt, bám sát nhu cầu sử dụng." },
    { title: "Thi công đúng tiến độ", description: "Quản trị rõ ràng từ kế hoạch đến bàn giao." },
    { title: "Vật liệu chất lượng", description: "Kiểm soát vật liệu, kỹ thuật và hoàn thiện." },
    { title: "Bảo hành tận tâm", description: "Đồng hành sau bàn giao." },
  ],
  expertiseEyebrow: "Hai khối chuyên môn",
  expertiseTitle: "Công trình và nội thất được vận hành tách biệt",
  architectureTemplatesEyebrow: "Mẫu thiết kế",
  architectureTemplatesTitle: "Mẫu thiết kế kiến trúc nổi bật",
  interiorTemplatesEyebrow: "Mẫu thiết kế",
  interiorTemplatesTitle: "Mẫu thiết kế nội thất nổi bật",
  servicesEyebrow: "Dịch vụ",
  servicesTitle: "Dịch vụ của chúng tôi",
  processTitle: "Quy trình làm việc",
  stats: [
    { value: "10+", label: "Năm kinh nghiệm" },
    { value: "500+", label: "Dự án hoàn thiện" },
    { value: "98%", label: "Khách hàng hài lòng" },
    { value: "24/7", label: "Hỗ trợ tư vấn" },
    { value: "50+", label: "Nhân sự chuyên môn" },
  ],
  testimonialsTitle: "Khách hàng nói gì về chúng tôi",
  newsTitle: "Tin tức & cảm hứng",
};

const fallbackHome: HomeData = {
  constructionProjects: [
    { id: 1, title: "Biệt thự cao cấp Hà Nội", slug: "biet-thu-cao-cap-ha-noi", group: "construction", location: "Hà Nội", category: "Biệt thự", description: "Dự án công trình tiêu biểu." },
    { id: 2, title: "Nhà phố hiện đại Ninh Bình", slug: "nha-pho-hien-dai-ninh-binh", group: "construction", location: "Ninh Bình", category: "Nhà phố", description: "Dự án công trình tiêu biểu." },
  ],
  interiorProjects: [
    { id: 3, title: "Nội thất căn hộ cao cấp", slug: "noi-that-can-ho-cao-cap", group: "interior", location: "Hà Nội", category: "Căn hộ", description: "Dự án nội thất tiêu biểu." },
    { id: 4, title: "Showroom nội thất Hải Phòng", slug: "showroom-noi-that-hai-phong", group: "interior", location: "Hải Phòng", category: "Showroom", description: "Dự án nội thất tiêu biểu." },
  ],
  services: [
    { id: 1, title: "Thiết kế kiến trúc", slug: "thiet-ke-kien-truc", group: "construction", description: "Tối ưu công năng, thẩm mỹ và kết cấu." },
    { id: 2, title: "Thi công phần thô", slug: "thi-cong-phan-tho", group: "construction", description: "Quản trị chất lượng, tiến độ và an toàn." },
    { id: 3, title: "Thiết kế nội thất", slug: "thiet-ke-noi-that", group: "interior", description: "Không gian sống sang trọng, tiện nghi." },
    { id: 4, title: "Sản xuất nội thất", slug: "san-xuat-noi-that", group: "interior", description: "Kiểm soát vật liệu, kỹ thuật và hoàn thiện." },
  ],
  posts: [
    { id: 1, title: "Xu hướng thiết kế nội thất 2026", slug: "xu-huong-thiet-ke-noi-that-2026", excerpt: "Góc nhìn chuyên môn từ Hà Thành Home." },
    { id: 2, title: "5 lưu ý khi xây biệt thự phố", slug: "5-luu-y-khi-xay-biet-thu-pho", excerpt: "Góc nhìn chuyên môn từ Hà Thành Home." },
  ],
  architectureDesigns: [
    { id: 1, title: "Mẫu biệt thự hiện đại mái bằng 3 tầng", slug: "mau-biet-thu-hien-dai-mai-bang-3-tang", code: "BTHDAMB03010", houseType: "Biệt thự", style: "Hiện đại", area: 225 },
    { id: 2, title: "Mẫu nhà cấp 4 hiện đại mái Nhật", slug: "mau-nha-cap-4-hien-dai-mai-nhat", code: "N4HDAMN01034", houseType: "Nhà cấp 4", style: "Hiện đại", area: 138 },
  ],
  interiorDesigns: [
    { id: 1, title: "Mẫu thiết kế nội thất phòng khách hiện đại", slug: "mau-thiet-ke-noi-that-phong-khach-hien-dai", code: "NT-PK-HD-001", interiorStyle: "Hiện đại", houseType: "Căn hộ", roomType: "Phòng khách", area: 35 },
    { id: 2, title: "Mẫu nội thất biệt thự tân cổ điển", slug: "mau-noi-that-biet-thu-tan-co-dien", code: "NT-BT-TCD-002", interiorStyle: "Tân cổ điển", houseType: "Biệt thự", roomType: "Trọn gói", area: 220 },
  ],
};

export function apiBase() {
  return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:31875/api";
}

export async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBase()}${path}`, { next: { revalidate: 60 } });
    if (!response.ok) return fallback;
    return response.json();
  } catch {
    return fallback;
  }
}

export function getHome() {
  return fetchJson<HomeData>("/home", fallbackHome);
}

export async function getSiteSettings() {
  try {
    const response = await fetch(`${apiBase()}/settings`, { cache: "no-store" });
    if (!response.ok) return {};
    return response.json() as Promise<SiteSettings>;
  } catch {
    return {};
  }
}

export async function getMenu(location: "header" | "footer") {
  const fallback = location === "header" ? fallbackHeaderMenu : fallbackFooterMenu;
  const payload = await fetchJson<MenuPayload>(`/menus/${location}`, fallback);
  return payload.items?.length ? payload : fallback;
}

export async function getList<T>(path: string): Promise<T[]> {
  const payload = await fetchJson<{ data: T[] }>(path, { data: [] });
  return payload.data;
}

export async function getListPayload<T>(path: string): Promise<{ data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  return fetchJson(path, { data: [], meta: { page: 1, limit: 24, total: 0, totalPages: 1 } });
}

export async function getDetail<T>(path: string): Promise<T | null> {
  return fetchJson<T | null>(path, null);
}

export const projectImages = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=85",
];

export const interiorImages = [
  "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=85",
];

export function thumbnailUrl(item: { thumbnailMedia?: MediaFile | null } | null | undefined, fallback: string) {
  const media = item?.thumbnailMedia;
  return media?.largeUrl || media?.mediumUrl || media?.webpUrl || media?.thumbUrl || fallback;
}

export function homepageWithDefaults(homepage?: SiteHomepage): SiteHomepage {
  return {
    ...defaultHomepage,
    ...(homepage || {}),
    heroSlides: homepage?.heroSlides?.length ? homepage.heroSlides : defaultHomepage.heroSlides,
    aboutBenefits: homepage?.aboutBenefits?.length ? homepage.aboutBenefits : defaultHomepage.aboutBenefits,
    stats: homepage?.stats?.length ? homepage.stats : defaultHomepage.stats,
  };
}

export function contentMetadata(
  item: {
    title: string;
    description?: string | null;
    excerpt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    thumbnailMedia?: MediaFile | null;
  } | null,
  fallbackTitle: string,
) {
  if (!item) return { title: fallbackTitle };
  const description = item.metaDescription || item.description || item.excerpt || undefined;
  const image = thumbnailUrl(item, "");
  return {
    title: item.metaTitle || `${item.title} | Hà Thành Home`,
    description,
    alternates: item.canonicalUrl ? { canonical: item.canonicalUrl } : undefined,
    openGraph: {
      title: item.ogTitle || item.metaTitle || item.title,
      description: item.ogDescription || description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}
