import { AboutPageConfig } from "./about-page-config";
import { aboutPageDefaultConfig } from "./about-page-defaults";

export type ProjectGroup = "construction" | "interior" | "xay_nha_tron_goi";


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

export type LandingListItem = {
  title?: string;
  description?: string;
};

export type LandingProcessStep = LandingListItem & {
  number?: string;
};

export type LandingTestimonial = {
  name?: string;
  project?: string;
  quote?: string;
};

export type LandingFaq = {
  question?: string;
  answer?: string;
};

export type LandingProjectsSource = {
  entity?: "project" | "architecture-design" | "interior-design";
  group?: string;
  categorySlug?: string;
  mode?: "latest" | "featured";
  limit?: number;
};

export type LandingProjectCard = {
  id: number;
  title: string;
  slug: string;
  href: string;
  thumbnailUrl: string;
  categoryLabel?: string;
  location?: string;
  meta?: string;
};

export type XayNhaLanding = {
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImageUrl?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  introEyebrow?: string;
  introTitle?: string;
  introDescription?: string;
  introImageUrl?: string;
  introChecklist?: string[];
  scopeEyebrow?: string;
  scopeTitle?: string;
  processEyebrow?: string;
  processTitle?: string;
  projectsEyebrow?: string;
  projectsTitle?: string;
  estimateEyebrow?: string;
  estimateTitle?: string;
  quoteTitle?: string;
  quoteDescription?: string;
  whyEyebrow?: string;
  whyTitle?: string;
  testimonialsEyebrow?: string;
  testimonialsTitle?: string;
  faqEyebrow?: string;
  faqTitle?: string;
  finalEyebrow?: string;
  finalTitle?: string;
  finalDescription?: string;
  benefits?: LandingListItem[];
  scopeItems?: LandingListItem[];
  processSteps?: LandingProcessStep[];
  whyChooseItems?: LandingListItem[];
  stats?: LandingListItem[];
  testimonials?: LandingTestimonial[];
  faqs?: LandingFaq[];
  projectsSource?: LandingProjectsSource;
  detailedIntroHtml?: string;
  detailedIntroCtaLabel?: string;
  detailedIntroCtaUrl?: string;
  detailedIntroImageUrl?: string;
};

export type NoiThatLanding = XayNhaLanding;
export type NhaXuongLanding = XayNhaLanding;
export type VanPhongLanding = XayNhaLanding;

export type LandingWithDefaults<T> = Omit<Required<T>, "projectsSource" | "detailedIntroHtml" | "detailedIntroCtaLabel" | "detailedIntroCtaUrl" | "detailedIntroImageUrl"> & {
  projectsSource?: LandingProjectsSource;
  detailedIntroHtml?: string;
  detailedIntroCtaLabel?: string;
  detailedIntroCtaUrl?: string;
  detailedIntroImageUrl?: string;
};

export type SiteSettings = {
  "site.identity"?: SiteIdentity;
  "site.theme"?: SiteTheme;
  "site.homepage"?: SiteHomepage;
  "site.landing.xayNhaTronGoi"?: XayNhaLanding;
  "site.servicePages.sanXuatThiCongNoiThat"?: NoiThatLanding;
  "site.servicePages.thiCongNhaXuong"?: NhaXuongLanding;
  "site.servicePages.thiCongNoiThatVanPhong"?: VanPhongLanding;
  "site.pages.about"?: AboutPageConfig;
};


export type EstimatorFieldOption = {
  label: string;
  value: string;
  variables?: Record<string, number>;
};

export type EstimatorField = {
  name: string;
  label: string;
  type: "select" | "number";
  defaultValue?: string | number;
  options?: EstimatorFieldOption[];
};

export type EstimatorPublicConfig = {
  id?: number;
  name?: string;
  currency?: string;
  inputSchema?: EstimatorField[];
  disclaimer?: string;
  ctaTitle?: string;
  ctaDescription?: string;
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
  icon?: string | null;
  description?: string | null;
  contentHtml?: string | null;
  thumbnailMedia?: MediaFile | null;
  galleryMediaIds?: number[] | null;
  galleryMedia?: MediaFile[] | null;
  publishedAt?: string | null;
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
  categoryId?: number | null;
  categoryRef?: { id: number; name: string; slug: string } | null;
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

export type PostCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
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

export const defaultXayNhaLanding: LandingWithDefaults<XayNhaLanding> = {
  heroEyebrow: "Xây nhà trọn gói",
  heroTitle: "Giải pháp xây nhà trọn gói từ thiết kế đến bàn giao",
  heroDescription: "Hà Thành Home cung cấp giải pháp xây nhà trọn gói toàn diện, đảm bảo chất lượng - tiến độ - minh bạch chi phí - bảo hành dài hạn.",
  heroImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ xây nhà trọn gói",
  introTitle: "Xây tổ ấm bền vững An tâm từ đầu đến cuối",
  introDescription: "Dịch vụ xây nhà trọn gói của Hà Thành Home bao gồm toàn bộ quy trình từ khảo sát, thiết kế, xin phép, thi công phần thô, hoàn thiện, bàn giao và bảo hành.",
  introImageUrl: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1400&q=85",
  introChecklist: ["Một đầu mối - chịu trách nhiệm trọn gói", "Minh bạch chi phí - hạn chế phát sinh", "Cam kết tiến độ - đúng chất lượng", "Vật tư chính hãng - nguồn gốc rõ ràng"],
  scopeEyebrow: "Phạm vi công việc",
  scopeTitle: "Trọn gói từ pháp lý, kỹ thuật đến hoàn thiện",
  processEyebrow: "Quy trình xây nhà trọn gói",
  processTitle: "Rõ việc, rõ người, rõ tiến độ",
  projectsEyebrow: "Dự án xây nhà tiêu biểu",
  projectsTitle: "Công trình đã triển khai",
  estimateEyebrow: "Dự toán chi phí xây nhà",
  estimateTitle: "Tham khảo chi phí xây nhà trọn gói",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để nhận tư vấn chi tiết từ chuyên gia Hà Thành Home.",
  whyEyebrow: "Vì sao chọn Hà Thành Home?",
  whyTitle: "Năng lực triển khai thực tế, không chỉ là bản vẽ đẹp",
  testimonialsEyebrow: "Khách hàng nói gì về chúng tôi",
  testimonialsTitle: "Niềm tin đến từ trải nghiệm thật",
  faqEyebrow: "Câu hỏi thường gặp",
  faqTitle: "Những điều khách hàng thường hỏi trước khi xây nhà",
  finalEyebrow: "Bắt đầu cùng Hà Thành Home",
  finalTitle: "Sẵn sàng xây tổ ấm mơ ước của bạn?",
  finalDescription: "Hà Thành Home đồng hành cùng bạn kiến tạo ngôi nhà bền vững - đẹp - tiện nghi.",
  detailedIntroHtml: "<p>Hà Thành Home tự hào là đơn vị cung cấp giải pháp xây nhà trọn gói toàn diện, với quy trình làm việc khép kín từ khâu tư vấn thiết kế, xin phép xây dựng, thi công phần thô đến hoàn thiện chìa khóa trao tay. Chúng tôi luôn cam kết tối ưu hóa chi phí cho khách hàng, sử dụng vật liệu đúng chủng loại, đảm bảo tiến độ và chất lượng thi công đạt chuẩn kỹ thuật cao nhất.</p><blockquote><p><strong>Cam kết từ Hà Thành Home:</strong> Không bán thầu, không phát sinh chi phí ngoài hợp đồng, bảo hành kết cấu lên đến 10 năm.</p></blockquote>",
  detailedIntroCtaLabel: "Nhận báo giá & tư vấn chi tiết",
  detailedIntroCtaUrl: "#du-toan-chi-phi",
  detailedIntroImageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
  benefits: [
    { title: "Thiết kế đồng bộ", description: "Đẹp - công năng - bền vững" },
    { title: "Tối ưu chi phí", description: "Minh bạch, hạn chế phát sinh" },
    { title: "Tiến độ rõ ràng", description: "Cam kết từng giai đoạn" },
    { title: "Vật tư minh bạch", description: "Nguồn gốc rõ ràng" },
    { title: "Bảo hành dài hạn", description: "Đồng hành sau bàn giao" },
    { title: "Đội ngũ chuyên môn", description: "Kinh nghiệm, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Nắm nhu cầu và hiện trạng." },
    { title: "Thiết kế kiến trúc - kết cấu", description: "Đồng bộ công năng và kỹ thuật." },
    { title: "Xin phép xây dựng", description: "Hỗ trợ hồ sơ pháp lý cần thiết." },
    { title: "Thi công phần thô", description: "Kết cấu chuẩn, kiểm soát an toàn." },
    { title: "Thi công hoàn thiện", description: "Hoàn thiện vật tư theo cam kết." },
    { title: "Giám sát công trình", description: "Theo sát tiến độ từng hạng mục." },
    { title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng trước bàn giao." },
    { title: "Bảo hành & bảo trì", description: "Đồng hành sau khi sử dụng." },
  ],
  processSteps: [
    { number: "01", title: "Tư vấn & khảo sát", description: "Tìm hiểu nhu cầu, khảo sát hiện trạng" },
    { number: "02", title: "Lên phương án", description: "Thiết kế sơ bộ, phương án công năng" },
    { number: "03", title: "Báo giá chi tiết", description: "Dự toán minh bạch, cam kết rõ ràng" },
    { number: "04", title: "Ký hợp đồng", description: "Thống nhất điều khoản và tiến độ" },
    { number: "05", title: "Thi công", description: "Thi công phần thô và hoàn thiện" },
    { number: "06", title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng, bàn giao công trình" },
    { number: "07", title: "Bảo hành", description: "Bảo hành và hỗ trợ sau bàn giao" },
  ],
  whyChooseItems: [
    { title: "Kinh nghiệm thực chiến", description: "10+ năm trong lĩnh vực thiết kế & thi công" },
    { title: "Quy trình chuyên nghiệp", description: "Kiểm soát chặt chẽ từng giai đoạn" },
    { title: "Chi phí minh bạch", description: "Báo giá chi tiết, hạn chế phát sinh" },
    { title: "Vật tư chất lượng", description: "Vật tư chính hãng, nguồn gốc rõ ràng" },
    { title: "Tận tâm đồng hành", description: "Hỗ trợ trước, trong và sau thi công" },
    { title: "Bảo hành uy tín", description: "Chính sách rõ ràng, hỗ trợ dài hạn" },
  ],
  stats: [
    { title: "10+", description: "Năm kinh nghiệm" },
    { title: "500+", description: "Dự án hoàn thiện" },
    { title: "98%", description: "Khách hàng hài lòng" },
    { title: "24/7", description: "Hỗ trợ tư vấn" },
  ],
  testimonials: [
    { name: "Anh Minh Tuấn", project: "Biệt thự Hà Nội", quote: "Hà Thành Home làm việc rất chuyên nghiệp, tiến độ đúng cam kết. Ngôi nhà hoàn thiện đẹp hơn mong đợi!" },
    { name: "Chị Thu Hằng", project: "Nhà phố Hải Phòng", quote: "Từ thiết kế đến thi công đều rất chỉn chu, đội ngũ tận tâm, hỗ trợ nhiệt tình." },
    { name: "Anh Quốc Huy", project: "Nhà phố Vĩnh Phúc", quote: "Chi phí hợp lý, chất lượng vượt mong đợi. Tôi rất hài lòng với dịch vụ trọn gói." },
  ],
  faqs: [
    { question: "Xây nhà trọn gói bao gồm những gì?", answer: "Bao gồm khảo sát, tư vấn, thiết kế, dự toán, thi công phần thô, hoàn thiện, nghiệm thu, bàn giao và bảo hành theo hợp đồng." },
    { question: "Thời gian thi công mất bao lâu?", answer: "Tùy quy mô và mức hoàn thiện, nhà phố thường từ 4-7 tháng, biệt thự có thể từ 7-12 tháng hoặc hơn." },
    { question: "Có phát sinh chi phí trong quá trình thi công không?", answer: "Hà Thành Home bóc tách báo giá rõ ràng ngay từ đầu. Phát sinh chỉ xảy ra khi khách hàng thay đổi phạm vi, vật tư hoặc yêu cầu mới." },
    { question: "Hà Thành Home sử dụng vật tư loại gì?", answer: "Vật tư được thống nhất theo hồ sơ báo giá, có thương hiệu, nguồn gốc rõ ràng và được nghiệm thu theo từng giai đoạn." },
    { question: "Chính sách bảo hành như thế nào?", answer: "Công trình được bảo hành theo từng hạng mục, có biên bản bàn giao và quy trình tiếp nhận hỗ trợ sau thi công." },
    { question: "Tôi có thể theo dõi tiến độ công trình không?", answer: "Có. Khách hàng được cập nhật tiến độ, hình ảnh thi công và các mốc nghiệm thu quan trọng trong quá trình triển khai." },
  ],
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

export async function getAboutPageConfig(): Promise<AboutPageConfig> {
  const settings = await getSiteSettings();
  const landing = settings["site.pages.about"];
  if (!landing) return aboutPageDefaultConfig;
  return {
    ...aboutPageDefaultConfig,
    ...landing,
    seo: {
      ...aboutPageDefaultConfig.seo,
      ...(landing.seo || {}),
    },
    hero: {
      ...aboutPageDefaultConfig.hero,
      ...(landing.hero || {}),
    },
    intro: {
      ...aboutPageDefaultConfig.intro,
      ...(landing.intro || {}),
      checklist: Array.isArray(landing.intro?.checklist) && landing.intro.checklist.length ? landing.intro.checklist : aboutPageDefaultConfig.intro.checklist,
    },
    identity: {
      ...aboutPageDefaultConfig.identity,
      ...(landing.identity || {}),
      items: Array.isArray(landing.identity?.items) && landing.identity.items.length ? landing.identity.items : aboutPageDefaultConfig.identity.items,
    },
    whyChoose: {
      ...aboutPageDefaultConfig.whyChoose,
      ...(landing.whyChoose || {}),
      items: Array.isArray(landing.whyChoose?.items) && landing.whyChoose.items.length ? landing.whyChoose.items : aboutPageDefaultConfig.whyChoose.items,
    },
    timeline: {
      ...aboutPageDefaultConfig.timeline,
      ...(landing.timeline || {}),
      items: Array.isArray(landing.timeline?.items) && landing.timeline.items.length ? landing.timeline.items : aboutPageDefaultConfig.timeline.items,
    },
    people: {
      ...aboutPageDefaultConfig.people,
      ...(landing.people || {}),
      highlights: Array.isArray(landing.people?.highlights) && landing.people.highlights.length ? landing.people.highlights : aboutPageDefaultConfig.people.highlights,
    },
    stats: Array.isArray(landing.stats) && landing.stats.length ? landing.stats : aboutPageDefaultConfig.stats,
    strengths: {
      ...aboutPageDefaultConfig.strengths,
      ...(landing.strengths || {}),
      items: Array.isArray(landing.strengths?.items) && landing.strengths.items.length ? landing.strengths.items : aboutPageDefaultConfig.strengths.items,
    },
    partners: {
      ...aboutPageDefaultConfig.partners,
      ...(landing.partners || {}),
      items: Array.isArray(landing.partners?.items) && landing.partners.items.length ? landing.partners.items : aboutPageDefaultConfig.partners.items,
    },
    testimonials: {
      ...aboutPageDefaultConfig.testimonials,
      ...(landing.testimonials || {}),
      items: Array.isArray(landing.testimonials?.items) && landing.testimonials.items.length ? landing.testimonials.items : aboutPageDefaultConfig.testimonials.items,
    },
    finalCta: {
      ...aboutPageDefaultConfig.finalCta,
      ...(landing.finalCta || {}),
    },
  };
}


export function getConstructionEstimatorConfig() {
  return fetchJson<EstimatorPublicConfig>("/construction-estimator/config", {});
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

export async function fetchLandingProjects(
  source: LandingProjectsSource | undefined,
  fallback?: { entity?: LandingProjectsSource["entity"]; group?: LandingProjectsSource["group"] },
): Promise<LandingProjectCard[]> {
  const entity = source?.entity || fallback?.entity || "project";
  const limit = source?.limit && source.limit > 0 ? source.limit : 6;
  const params = new URLSearchParams({ limit: String(limit) });
  if (source?.mode === "featured") params.set("featured", "true");
  else params.set("sort", "newest");
  if (source?.categorySlug) params.set("category", source.categorySlug);

  let url = "/projects";
  if (entity === "project") {
    const group = source?.group || fallback?.group;
    if (group) params.set("group", group);
    url = "/projects";
  } else if (entity === "architecture-design") {
    url = "/architecture-designs";
  } else if (entity === "interior-design") {
    url = "/interior-designs";
  }

  const fallbackImages = entity === "interior-design" || (entity === "project" && (source?.group === "interior")) ? interiorImages : projectImages;

  if (entity === "project") {
    const payload = await getListPayload<Project>(`${url}?${params}`);
    return payload.data.map((p, index) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      href: `/du-an/${p.slug}`,
      thumbnailUrl: thumbnailUrl(p, fallbackImages[index % fallbackImages.length]),
      categoryLabel: p.categoryRef?.name || p.category || (p.group === "interior" ? "Nội thất" : "Công trình"),
      location: p.location || undefined,
      meta: p.area || p.scale || undefined,
    }));
  }

  if (entity === "architecture-design") {
    const payload = await getListPayload<ArchitectureDesign>(`${url}?${params}`);
    return payload.data.map((t, index) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      href: `/mau-thiet-ke-kien-truc/${t.slug}`,
      thumbnailUrl: thumbnailUrl(t, projectImages[index % projectImages.length]),
      categoryLabel: t.houseType || t.style || "Kiến trúc",
      location: t.location || undefined,
      meta: t.area ? `${t.area}m²` : (t.floors ? `${t.floors} tầng` : undefined),
    }));
  }

  const payload = await getListPayload<InteriorDesign>(`${url}?${params}`);
  return payload.data.map((t, index) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    href: `/mau-thiet-ke-noi-that/${t.slug}`,
    thumbnailUrl: thumbnailUrl(t, interiorImages[index % interiorImages.length]),
    categoryLabel: t.interiorStyle || t.roomType || "Nội thất",
    location: t.location || undefined,
    meta: t.area ? `${t.area}m²` : (t.budgetRange || undefined),
  }));
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

function mergeList<T>(value: T[] | undefined, fallback: T[]) {
  return Array.isArray(value) && value.length ? value : fallback;
}

export function xayNhaLandingWithDefaults(landing?: XayNhaLanding): LandingWithDefaults<XayNhaLanding> {
  return {
    ...defaultXayNhaLanding,
    ...(landing || {}),
    introChecklist: mergeList(landing?.introChecklist, defaultXayNhaLanding.introChecklist),
    benefits: mergeList(landing?.benefits, defaultXayNhaLanding.benefits),
    scopeItems: mergeList(landing?.scopeItems, defaultXayNhaLanding.scopeItems),
    processSteps: mergeList(landing?.processSteps, defaultXayNhaLanding.processSteps),
    whyChooseItems: mergeList(landing?.whyChooseItems, defaultXayNhaLanding.whyChooseItems),
    stats: mergeList(landing?.stats, defaultXayNhaLanding.stats),
    testimonials: mergeList(landing?.testimonials, defaultXayNhaLanding.testimonials),
    faqs: mergeList(landing?.faqs, defaultXayNhaLanding.faqs),
  };
}

export const defaultNoiThatLanding: LandingWithDefaults<NoiThatLanding> = {
  heroEyebrow: "Sản xuất thi công nội thất",
  heroTitle: "Sản xuất & thi công nội thất trọn gói",
  heroDescription: "Hà Thành Home cung cấp giải pháp nội thất trọn gói — từ thiết kế, sản xuất tại xưởng đến thi công hoàn thiện, mang đến không gian sống tinh tế và bền vững.",
  heroImageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ sản xuất thi công nội thất",
  introTitle: "Hoàn thiện không gian sống tinh tế – Đồng bộ từ xưởng đến công trình",
  introDescription: "Hà Thành Home sở hữu xưởng sản xuất hiện đại, quy trình khép kín và đội thi công lành nghề, đảm bảo chất lượng – thẩm mỹ – tiến độ cho mọi công trình nội thất.",
  introImageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85",
  introChecklist: [
    "Thiết kế đồng bộ, tối ưu công năng và thẩm mỹ",
    "Sản xuất trực tiếp tại xưởng, kiểm soát chất lượng",
    "Thi công chuẩn xác, hoàn thiện tỉ mỉ đến từng chi tiết",
    "Bảo hành dài hạn, đồng hành cùng khách hàng",
  ],
  scopeEyebrow: "Phạm vi công việc",
  scopeTitle: "Trọn gói từ khảo sát, thiết kế đến hoàn thiện",
  processEyebrow: "Quy trình sản xuất thi công nội thất",
  processTitle: "Rõ việc, rõ tiến độ – 7 bước chuẩn",
  projectsEyebrow: "Dự án nội thất tiêu biểu",
  projectsTitle: "Công trình nội thất đã triển khai",
  estimateEyebrow: "Dự toán chi phí nội thất",
  estimateTitle: "Tham khảo chi phí nội thất",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để nhận tư vấn chi tiết từ chuyên gia Hà Thành Home.",
  whyEyebrow: "Vì sao chọn Hà Thành Home?",
  whyTitle: "Đồng bộ từ thiết kế – sản xuất – thi công",
  testimonialsEyebrow: "Khách hàng nói gì về chúng tôi",
  testimonialsTitle: "Niềm tin đến từ trải nghiệm thật",
  faqEyebrow: "Câu hỏi thường gặp",
  faqTitle: "Những điều khách hàng thường hỏi",
  finalEyebrow: "Bắt đầu cùng Hà Thành Home",
  finalTitle: "Sẵn sàng kiến tạo không gian sống mơ ước?",
  finalDescription: "Hà Thành Home đồng hành cùng bạn từ thiết kế đến hoàn thiện nội thất – tinh tế & bền vững.",
  benefits: [
    { title: "Thi công chuẩn thiết kế", description: "Đúng concept, đúng vật liệu" },
    { title: "Xưởng sản xuất trực tiếp", description: "Kiểm soát chất lượng từ gốc" },
    { title: "Chất liệu minh bạch", description: "Nguồn gốc rõ ràng" },
    { title: "Tiến độ rõ ràng", description: "Cam kết từng giai đoạn" },
    { title: "Bảo hành tận tâm", description: "Đồng hành sau bàn giao" },
    { title: "Đội ngũ lành nghề", description: "Tay nghề cao, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Hiểu nhu cầu và hiện trạng không gian." },
    { title: "Thiết kế kỹ thuật triển khai", description: "Bản vẽ chi tiết cho sản xuất và thi công." },
    { title: "Sản xuất tại xưởng", description: "Đồ gỗ, kệ, tủ chế tác chuyên nghiệp." },
    { title: "Thi công lắp đặt", description: "Lắp đặt chuẩn xác, kiểm soát chất lượng." },
    { title: "Hoàn thiện chi tiết", description: "Tỉ mỉ từng chi tiết hoàn thiện." },
    { title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng trước bàn giao." },
    { title: "Bảo hành & bảo trì", description: "Hỗ trợ dài hạn sau khi sử dụng." },
  ],
  processSteps: [
    { number: "01", title: "Tư vấn & khảo sát", description: "Tiếp nhận nhu cầu, khảo sát hiện trạng" },
    { number: "02", title: "Thiết kế / bóc tách", description: "Thiết kế 3D, kỹ thuật & bóc tách vật liệu" },
    { number: "03", title: "Báo giá chi tiết", description: "Lập dự toán minh bạch, cam kết không phát sinh" },
    { number: "04", title: "Ký hợp đồng", description: "Thống nhất điều khoản, tiến độ thi công" },
    { number: "05", title: "Sản xuất tại xưởng", description: "Sản xuất theo tiêu chuẩn, kiểm soát chất lượng" },
    { number: "06", title: "Thi công lắp đặt", description: "Vận chuyển, lắp đặt đúng kỹ thuật" },
    { number: "07", title: "Nghiệm thu & bàn giao", description: "Nghiệm thu, bàn giao và bảo hành theo cam kết" },
  ],
  whyChooseItems: [
    { title: "Xưởng sản xuất trực tiếp", description: "Chủ động sản xuất, kiểm soát chất lượng" },
    { title: "Thi công chuẩn thiết kế", description: "Đảm bảo thẩm mỹ, đúng concept thiết kế" },
    { title: "Vật liệu cao cấp", description: "Minh bạch nguồn gốc, an toàn sức khỏe" },
    { title: "Tiến độ cam kết", description: "Đảm bảo kế hoạch rõ ràng, đúng hạn" },
    { title: "Bảo hành dài hạn", description: "Bảo hành 12 – 24 tháng, bảo trì trọn đời" },
    { title: "Đội ngũ lành nghề", description: "Kỹ sư, thợ tay nghề cao và tận tâm" },
  ],
  stats: [
    { title: "10+", description: "Năm kinh nghiệm" },
    { title: "500+", description: "Dự án hoàn thiện" },
    { title: "98%", description: "Khách hàng hài lòng" },
    { title: "24/7", description: "Hỗ trợ tư vấn" },
  ],
  testimonials: [
    { name: "Anh Minh Tuấn", project: "Căn hộ Cầu Giấy – Hà Nội", quote: "Nội thất đẹp, thi công chuẩn từng chi tiết. Đội ngũ làm việc chuyên nghiệp, hỗ trợ tận tâm." },
    { name: "Chị Thu Hằng", project: "Biệt thự Long Biên – Hà Nội", quote: "Thiết kế tinh tế, tối ưu không gian rất tốt. Sản xuất tại xưởng nên chất lượng rất đồng đều." },
    { name: "Anh Quốc Huy", project: "Nhà phố Bắc Từ Liêm – Hà Nội", quote: "Đúng tiến độ, đúng cam kết và bảo hành rõ ràng. Rất hài lòng khi chọn Hà Thành Home." },
  ],
  faqs: [
    { question: "Thời gian sản xuất nội thất mất bao lâu?", answer: "Tùy khối lượng và mức hoàn thiện, thông thường 30-60 ngày cho căn hộ và 60-90 ngày cho biệt thự, văn phòng." },
    { question: "Hà Thành Home có xưởng sản xuất riêng không?", answer: "Có. Hà Thành Home sở hữu xưởng sản xuất riêng tại Hà Nội với máy móc CNC hiện đại và đội ngũ thợ tay nghề cao." },
    { question: "Chi phí nội thất được tính như thế nào?", answer: "Chi phí phụ thuộc vào diện tích, phong cách, vật liệu và mức hoàn thiện. Hà Thành Home tư vấn báo giá chi tiết và minh bạch." },
    { question: "Tôi có thể xem mẫu vật liệu tại showroom không?", answer: "Có. Khách hàng được mời tới showroom xem mẫu vật liệu, gỗ, vải, đá… trước khi quyết định." },
    { question: "Chính sách bảo hành nội thất ra sao?", answer: "Bảo hành 12 – 24 tháng cho phần nội thất, bảo trì miễn phí trọn đời cho khách hàng của Hà Thành Home." },
    { question: "Hà Thành Home có nhận thi công nội thất theo thiết kế riêng không?", answer: "Có. Đội ngũ tiếp nhận và triển khai theo bản vẽ thiết kế riêng của khách hàng, sản xuất và thi công đảm bảo đúng concept." },
  ],
};

export function noiThatLandingWithDefaults(landing?: NoiThatLanding): LandingWithDefaults<NoiThatLanding> {
  return {
    ...defaultNoiThatLanding,
    ...(landing || {}),
    introChecklist: mergeList(landing?.introChecklist, defaultNoiThatLanding.introChecklist),
    benefits: mergeList(landing?.benefits, defaultNoiThatLanding.benefits),
    scopeItems: mergeList(landing?.scopeItems, defaultNoiThatLanding.scopeItems),
    processSteps: mergeList(landing?.processSteps, defaultNoiThatLanding.processSteps),
    whyChooseItems: mergeList(landing?.whyChooseItems, defaultNoiThatLanding.whyChooseItems),
    stats: mergeList(landing?.stats, defaultNoiThatLanding.stats),
    testimonials: mergeList(landing?.testimonials, defaultNoiThatLanding.testimonials),
    faqs: mergeList(landing?.faqs, defaultNoiThatLanding.faqs),
  };
}

export const defaultNhaXuongLanding: LandingWithDefaults<NhaXuongLanding> = {
  heroEyebrow: "Thi công nhà xưởng",
  heroTitle: "Giải pháp thi công nhà xưởng trọn gói",
  heroDescription: "Hà Thành Home cung cấp giải pháp thi công nhà xưởng trọn gói — từ tư vấn, thiết kế, sản xuất cấu kiện đến thi công hoàn thiện, bàn giao đúng tiến độ.",
  heroImageUrl: "https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ thi công nhà xưởng",
  introTitle: "Giải pháp xây dựng nhà xưởng hiện đại – bền vững – hiệu quả",
  introDescription: "Cung cấp giải pháp thi công nhà xưởng trọn gói, phù hợp với mô hình sản xuất và kinh doanh, đảm bảo vận hành hiệu quả và phát triển bền vững.",
  introImageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1400&q=85",
  introChecklist: [
    "Tư vấn & thiết kế tối ưu công năng, phù hợp nhu cầu sản xuất",
    "Kết cấu thép chất lượng cao, tiêu chuẩn kỹ thuật rõ ràng",
    "Thi công nhanh chóng, an toàn, đảm bảo tiến độ",
    "Chi phí hợp lý, tối ưu hiệu quả đầu tư",
    "Bảo hành kết cấu dài hạn, đồng hành lâu dài cùng khách hàng",
  ],
  scopeEyebrow: "Phạm vi công việc",
  scopeTitle: "Trọn gói từ thiết kế đến hoàn thiện nhà xưởng",
  processEyebrow: "Quy trình thi công nhà xưởng",
  processTitle: "Rõ việc, rõ tiến độ – 7 bước chuẩn",
  projectsEyebrow: "Dự án nhà xưởng tiêu biểu",
  projectsTitle: "Công trình nhà xưởng đã triển khai",
  estimateEyebrow: "Dự toán chi phí thi công nhà xưởng",
  estimateTitle: "Tham khảo chi phí thi công nhà xưởng",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để nhận tư vấn chi tiết và báo giá phù hợp từ Hà Thành Home.",
  whyEyebrow: "Vì sao chọn Hà Thành Home?",
  whyTitle: "Đối tác tin cậy cho mọi công trình công nghiệp",
  testimonialsEyebrow: "Khách hàng nói gì về chúng tôi",
  testimonialsTitle: "Niềm tin đến từ trải nghiệm thật",
  faqEyebrow: "Câu hỏi thường gặp",
  faqTitle: "Những điều khách hàng thường hỏi",
  finalEyebrow: "Bắt đầu cùng Hà Thành Home",
  finalTitle: "Sẵn sàng xây dựng nhà xưởng hiện đại cho doanh nghiệp của bạn?",
  finalDescription: "Hà Thành Home – Đối tác tin cậy cho mọi công trình công nghiệp.",
  benefits: [
    { title: "Thiết kế tối ưu công năng", description: "Phù hợp dây chuyền sản xuất" },
    { title: "Kết cấu vững chắc", description: "Chuẩn kỹ thuật, bền vững" },
    { title: "Tiến độ rõ ràng", description: "Cam kết đúng hạn" },
    { title: "Chi phí minh bạch", description: "Không phát sinh ẩn" },
    { title: "An toàn thi công", description: "Tuyệt đối, đúng quy trình" },
    { title: "Đội ngũ chuyên môn", description: "Kinh nghiệm cao, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Nắm rõ nhu cầu và hiện trạng." },
    { title: "Thiết kế kiến trúc, kết cấu", description: "Tối ưu công năng, kỹ thuật." },
    { title: "Thi công nền móng", description: "Móng vững chắc, đúng kết cấu." },
    { title: "Sản xuất & lắp dựng khung thép", description: "Gia công tại xưởng, lắp dựng nhanh." },
    { title: "Thi công hoàn thiện", description: "Tường, mái, nền xưởng hoàn thiện." },
    { title: "Hệ thống MEP", description: "Điện – Nước – PCCC đồng bộ." },
    { title: "Hệ thống PCCC", description: "Tuân thủ quy chuẩn an toàn." },
    { title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng trước bàn giao." },
  ],
  processSteps: [
    { number: "01", title: "Tiếp nhận yêu cầu", description: "Khảo sát và thu thập thông tin dự án" },
    { number: "02", title: "Tư vấn & thiết kế", description: "Đề xuất giải pháp, thiết kế kiến trúc, kết cấu" },
    { number: "03", title: "Báo giá & hợp đồng", description: "Báo giá chi tiết, thống nhất điều khoản và ký kết" },
    { number: "04", title: "Sản xuất cấu kiện", description: "Gia công cấu kiện thép tại nhà máy/xưởng" },
    { number: "05", title: "Thi công lắp dựng", description: "Thi công nền móng và lắp dựng khung thép" },
    { number: "06", title: "Thi công hoàn thiện", description: "Hoàn thiện hệ thống MEP, PCCC và hạng mục phụ trợ" },
    { number: "07", title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng, bàn giao và bảo hành" },
  ],
  whyChooseItems: [
    { title: "Kinh nghiệm thực chiến", description: "Nhiều công trình nhà xưởng, kho bãi đã bàn giao" },
    { title: "Năng lực sản xuất mạnh", description: "Nhà máy hiện đại, chủ động sản xuất cấu kiện" },
    { title: "Quy trình chuyên nghiệp", description: "Quản lý chặt chẽ từ thiết kế, sản xuất đến thi công" },
    { title: "Đúng tiến độ cam kết", description: "Tối ưu tiến độ, đảm bảo bàn giao đúng hạn" },
    { title: "An toàn là ưu tiên", description: "Thi công an toàn, tuân thủ quy trình nghiêm ngặt" },
    { title: "Bảo hành dài hạn", description: "Đồng hành sau bàn giao công trình" },
  ],
  stats: [
    { title: "10+", description: "Năm kinh nghiệm" },
    { title: "300+", description: "Dự án nhà xưởng" },
    { title: "98%", description: "Khách hàng hài lòng" },
    { title: "24/7", description: "Hỗ trợ tư vấn" },
  ],
  testimonials: [
    { name: "Ông Nguyễn Văn Hùng", project: "Giám đốc – Công ty ABC", quote: "Hà Thành Home thi công đúng tiến độ, chất lượng vượt mong đợi. Đội ngũ chuyên nghiệp, hỗ trợ rất tận tâm." },
    { name: "Bà Trần Thị Mai", project: "Giám đốc – Công ty HTech", quote: "Nhà xưởng được thiết kế đúng công năng, chi phí hợp lý. Rất hài lòng với sự hợp tác." },
    { name: "Ông Phạm Quốc Tuấn", project: "CEO – Công ty VinaFoods", quote: "Dịch vụ trọn gói chuyên nghiệp từ tư vấn đến bàn giao. Hà Thành Home là đối tác tin cậy của chúng tôi." },
  ],
  faqs: [
    { question: "Thời gian thi công nhà xưởng mất bao lâu?", answer: "Tùy quy mô và yêu cầu kỹ thuật, thời gian thi công thường từ 2 – 6 tháng hoặc hơn đối với dự án lớn." },
    { question: "Chi phí thi công nhà xưởng được tính thế nào?", answer: "Chi phí phụ thuộc diện tích, kết cấu, vật liệu, hệ thống MEP, PCCC và mức độ hoàn thiện." },
    { question: "Hà Thành Home có hỗ trợ xin giấy phép xây dựng không?", answer: "Có. Chúng tôi có thể tư vấn hồ sơ pháp lý, giấy phép xây dựng và các thủ tục liên quan tùy theo dự án." },
    { question: "Nhà xưởng có thể mở rộng trong tương lai không?", answer: "Có. Phương án thiết kế có thể tính trước khả năng mở rộng để tối ưu chi phí đầu tư dài hạn." },
    { question: "Chính sách bảo hành công trình như thế nào?", answer: "Công trình được bảo hành theo từng hạng mục, đặc biệt là kết cấu, mái, hệ thống kỹ thuật và các phần hoàn thiện." },
    { question: "Hà Thành Home có thi công trọn gói không?", answer: "Có. Chúng tôi cung cấp dịch vụ trọn gói từ tư vấn, thiết kế, sản xuất cấu kiện, thi công đến nghiệm thu bàn giao." },
  ],
};

export function nhaXuongLandingWithDefaults(landing?: NhaXuongLanding): LandingWithDefaults<NhaXuongLanding> {
  return {
    ...defaultNhaXuongLanding,
    ...(landing || {}),
    introChecklist: mergeList(landing?.introChecklist, defaultNhaXuongLanding.introChecklist),
    benefits: mergeList(landing?.benefits, defaultNhaXuongLanding.benefits),
    scopeItems: mergeList(landing?.scopeItems, defaultNhaXuongLanding.scopeItems),
    processSteps: mergeList(landing?.processSteps, defaultNhaXuongLanding.processSteps),
    whyChooseItems: mergeList(landing?.whyChooseItems, defaultNhaXuongLanding.whyChooseItems),
    stats: mergeList(landing?.stats, defaultNhaXuongLanding.stats),
    testimonials: mergeList(landing?.testimonials, defaultNhaXuongLanding.testimonials),
    faqs: mergeList(landing?.faqs, defaultNhaXuongLanding.faqs),
  };
}

export const defaultVanPhongLanding: LandingWithDefaults<VanPhongLanding> = {
  heroEyebrow: "Thi công nội thất văn phòng",
  heroTitle: "Kiến tạo không gian làm việc hiện đại",
  heroDescription: "Hà Thành Home đồng hành cùng doanh nghiệp trong thi công nội thất văn phòng trọn gói, đảm bảo chất lượng – tiến độ – thẩm mỹ, kiến tạo môi trường làm việc truyền cảm hứng và hiệu quả.",
  heroImageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ thi công nội thất văn phòng",
  introTitle: "Thi công trọn gói – Chuẩn công năng – Nâng tầm môi trường làm việc",
  introDescription: "Chúng tôi cung cấp giải pháp thi công nội thất văn phòng trọn gói, dành cho mọi loại hình doanh nghiệp, từ startup, SME đến tập đoàn lớn.",
  introImageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85",
  introChecklist: [
    "Thi công theo bản vẽ, đảm bảo độ chính xác cao",
    "Tối ưu không gian làm việc, nâng cao hiệu suất làm việc",
    "Vật liệu bền vững, an toàn và thân thiện môi trường",
    "Quản lý dự án chặt chẽ, minh bạch chi phí",
    "Bảo hành dài hạn, đồng hành cùng doanh nghiệp",
  ],
  scopeEyebrow: "Phạm vi công việc",
  scopeTitle: "Trọn gói từ tư vấn, thiết kế đến hoàn thiện văn phòng",
  processEyebrow: "Quy trình thi công nội thất văn phòng",
  processTitle: "Rõ việc, rõ tiến độ – 7 bước chuẩn",
  projectsEyebrow: "Dự án văn phòng tiêu biểu",
  projectsTitle: "Công trình văn phòng đã triển khai",
  estimateEyebrow: "Chi phí thi công nội thất văn phòng",
  estimateTitle: "Báo giá tham khảo theo quy mô",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để đội ngũ Hà Thành Home liên hệ và tư vấn chi tiết.",
  whyEyebrow: "Vì sao chọn Hà Thành Home?",
  whyTitle: "Nâng tầm môi trường làm việc cho doanh nghiệp",
  testimonialsEyebrow: "Khách hàng nói gì về chúng tôi",
  testimonialsTitle: "Niềm tin từ đối tác doanh nghiệp",
  faqEyebrow: "Câu hỏi thường gặp",
  faqTitle: "Những điều khách hàng thường hỏi",
  finalEyebrow: "Bắt đầu cùng Hà Thành Home",
  finalTitle: "Sẵn sàng nâng tầm không gian làm việc của bạn?",
  finalDescription: "Hà Thành Home đồng hành kiến tạo văn phòng hiện đại – hiệu quả – đậm dấu ấn thương hiệu.",
  benefits: [
    { title: "Thi công chuẩn bản vẽ", description: "Đúng thiết kế – đúng chất lượng" },
    { title: "Tối ưu công năng", description: "Hiệu quả – linh hoạt – thoải mái" },
    { title: "Tiến độ rõ ràng", description: "Cam kết đúng thời hạn" },
    { title: "Vật liệu minh bạch", description: "Nguồn gốc rõ ràng" },
    { title: "Bảo hành tận tâm", description: "Bảo hành 12 – 24 tháng" },
    { title: "Đội ngũ chuyên môn", description: "Kinh nghiệm, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Phân tích nhu cầu và không gian." },
    { title: "Thiết kế kỹ thuật & triển khai", description: "Bản vẽ chi tiết cho thi công." },
    { title: "Sản xuất nội thất", description: "Bàn ghế, vách ngăn, tủ chế tác." },
    { title: "Thi công lắp đặt", description: "Lắp đặt chuẩn xác, an toàn." },
    { title: "Hoàn thiện chi tiết", description: "Tỉ mỉ từng chi tiết hoàn thiện." },
    { title: "Bàn giao & nghiệm thu", description: "Kiểm tra chất lượng kỹ lưỡng." },
    { title: "Bảo hành", description: "Đồng hành sau khi sử dụng." },
  ],
  processSteps: [
    { number: "01", title: "Tiếp nhận yêu cầu", description: "Khảo sát hiện trạng, trao đổi nhu cầu" },
    { number: "02", title: "Tư vấn & đề xuất", description: "Định hướng giải pháp, báo giá sơ bộ" },
    { number: "03", title: "Thiết kế & triển khai", description: "Thiết kế 2D/3D, hồ sơ kỹ thuật thi công" },
    { number: "04", title: "Ký hợp đồng", description: "Thống nhất phạm vi, tiến độ, chi phí" },
    { number: "05", title: "Sản xuất nội thất", description: "Sản xuất tại xưởng, kiểm soát chất lượng" },
    { number: "06", title: "Thi công lắp đặt", description: "Thi công tại công trình, đảm bảo an toàn" },
    { number: "07", title: "Nghiệm thu & bàn giao", description: "Nghiệm thu, bàn giao và hướng dẫn bảo hành" },
  ],
  whyChooseItems: [
    { title: "Kinh nghiệm thực chiến", description: "10+ năm trong lĩnh vực thi công văn phòng" },
    { title: "Giải pháp tối ưu", description: "Công năng hiệu quả, trải nghiệm nhân viên tốt hơn" },
    { title: "Thi công chuẩn xác", description: "Đảm bảo chất lượng, đúng thiết kế" },
    { title: "Cam kết tiến độ", description: "Quản lý dự án chặt chẽ" },
    { title: "Bảo hành dài hạn", description: "Hỗ trợ doanh nghiệp lâu dài" },
    { title: "Đội ngũ chuyên môn", description: "Đội thi công nhiều kinh nghiệm" },
  ],
  stats: [
    { title: "10+", description: "Năm kinh nghiệm" },
    { title: "500+", description: "Dự án văn phòng" },
    { title: "98%", description: "Khách hàng hài lòng" },
    { title: "24/7", description: "Hỗ trợ tư vấn" },
  ],
  testimonials: [
    { name: "Anh Nguyễn Quốc Bảo", project: "Giám đốc – FPT Software", quote: "Hà Thành Home làm việc chuyên nghiệp, đúng tiến độ và chất lượng. Không gian văn phòng sau thi công rất hiện đại, tối ưu công năng." },
    { name: "Chị Trần Minh Hằng", project: "HR Director – Unilever Việt Nam", quote: "Đội ngũ thi công tỉ mỉ, phối hợp nhịp nhàng, đảm bảo tiêu chuẩn cao của chúng tôi. Rất hài lòng!" },
    { name: "Anh Lê Hoàng Nam", project: "CEO – StartupX", quote: "Chi phí hợp lý, thiết kế sáng tạo và thi công rất chỉn chu. Văn phòng của chúng tôi giờ đây truyền cảm hứng hơn rất nhiều." },
  ],
  faqs: [
    { question: "Thời gian thi công nội thất văn phòng là bao lâu?", answer: "Tùy quy mô, thường 30 – 60 ngày cho văn phòng nhỏ, 60 – 90 ngày cho văn phòng lớn." },
    { question: "Hà Thành Home có thiết kế 2D/3D trước khi thi công không?", answer: "Có. Toàn bộ phương án được thiết kế chi tiết và duyệt trước khi triển khai thi công." },
    { question: "Chi phí thi công bao gồm những gì?", answer: "Bao gồm khảo sát, thiết kế, sản xuất, thi công lắp đặt, vật liệu và nghiệm thu bàn giao." },
    { question: "Doanh nghiệp có thể thi công ngoài giờ hành chính không?", answer: "Có. Hà Thành Home hỗ trợ thi công ngoài giờ, cuối tuần để không ảnh hưởng vận hành doanh nghiệp." },
    { question: "Chính sách bảo hành nội thất văn phòng như thế nào?", answer: "Bảo hành 12 – 24 tháng theo từng hạng mục. Bảo trì miễn phí trọn đời." },
    { question: "Có hỗ trợ cải tạo, nâng cấp văn phòng đang sử dụng không?", answer: "Có. Hà Thành Home tư vấn và thi công cải tạo, nâng cấp nội thất văn phòng hiện hữu." },
  ],
};

export function vanPhongLandingWithDefaults(landing?: VanPhongLanding): LandingWithDefaults<VanPhongLanding> {
  return {
    ...defaultVanPhongLanding,
    ...(landing || {}),
    introChecklist: mergeList(landing?.introChecklist, defaultVanPhongLanding.introChecklist),
    benefits: mergeList(landing?.benefits, defaultVanPhongLanding.benefits),
    scopeItems: mergeList(landing?.scopeItems, defaultVanPhongLanding.scopeItems),
    processSteps: mergeList(landing?.processSteps, defaultVanPhongLanding.processSteps),
    whyChooseItems: mergeList(landing?.whyChooseItems, defaultVanPhongLanding.whyChooseItems),
    stats: mergeList(landing?.stats, defaultVanPhongLanding.stats),
    testimonials: mergeList(landing?.testimonials, defaultVanPhongLanding.testimonials),
    faqs: mergeList(landing?.faqs, defaultVanPhongLanding.faqs),
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
