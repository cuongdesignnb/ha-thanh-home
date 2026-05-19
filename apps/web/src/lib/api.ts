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
};

export type SiteSettings = {
  "site.identity"?: SiteIdentity;
  "site.theme"?: SiteTheme;
  "site.homepage"?: SiteHomepage;
  "site.landing.xayNhaTronGoi"?: XayNhaLanding;
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

export const defaultXayNhaLanding: Required<XayNhaLanding> = {
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

export function xayNhaLandingWithDefaults(landing?: XayNhaLanding): Required<XayNhaLanding> {
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
