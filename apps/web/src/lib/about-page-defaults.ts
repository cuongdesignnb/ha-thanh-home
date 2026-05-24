import type { AboutPageConfig } from "./about-page-config";

export const aboutPageDefaultConfig: AboutPageConfig = {
  slug: "gioi-thieu",
  title: "Giới thiệu",
  isActive: true,

  seo: {
    metaTitle: "Giới thiệu Hà Thành Home | Thiết kế, thi công nhà ở & nội thất",
    metaDescription:
      "Hà Thành Home là đơn vị thiết kế, thi công nhà ở và nội thất chuyên nghiệp, kiến tạo không gian sống đẳng cấp, bền vững và mang dấu ấn riêng.",
    canonicalUrl: "/gioi-thieu",
    ogTitle: "Giới thiệu Hà Thành Home",
    ogDescription:
      "Tìm hiểu về Hà Thành Home, năng lực thiết kế thi công, hành trình phát triển, đội ngũ và cam kết đồng hành cùng khách hàng.",
    ogImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&h=630&q=80",
    noIndex: false,
  },

  hero: {
    breadcrumbLabel: "Giới thiệu",
    eyebrow: "VỀ CHÚNG TÔI",
    title: "Kiến tạo không gian sống và công trình đẳng cấp",
    description:
      "Hà Thành Home thấu hiểu mọi mong muốn của bạn để biến ý tưởng thành những không gian sống tinh tế, bền vững và mang dấu ấn riêng.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    primaryCtaLabel: "Nhận tư vấn ngay",
    primaryCtaUrl: "/lien-he?nguon=gioi-thieu",
    secondaryCtaLabel: "Xem video giới thiệu",
    secondaryCtaUrl: "#video-gioi-thieu",
  },

  intro: {
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    eyebrow: "VỀ HÀ THÀNH HOME",
    title: "Kiến tạo giá trị – Nâng tầm cuộc sống",
    description:
      "Hà Thành Home là đơn vị chuyên nghiệp trong lĩnh vực thiết kế kiến trúc, thi công xây dựng trọn gói và nội thất cao cấp. Với hơn 10 năm kinh nghiệm, chúng tôi tự hào mang đến những giải pháp toàn diện – tinh tế – bền vững cho hàng trăm khách hàng trên khắp cả nước.",
    checklist: [
      "Thiết kế sáng tạo, tối ưu công năng và thẩm mỹ",
      "Thi công chuẩn xác, đúng tiến độ, đúng cam kết",
      "Vật liệu minh bạch, chất lượng cao",
      "Hậu mãi tận tâm, đồng hành dài lâu",
    ],
  },

  identity: {
    title: "TẦM NHÌN – SỨ MỆNH – GIÁ TRỊ CỐT LÕI",
    items: [
      {
        icon: "eye",
        title: "Tầm nhìn",
        description:
          "Trở thành thương hiệu kiến trúc – xây dựng – nội thất hàng đầu Việt Nam, kiến tạo không gian sống đẳng cấp và bền vững.",
      },
      {
        icon: "target",
        title: "Sứ mệnh",
        description:
          "Mang đến giải pháp toàn diện, giúp khách hàng hiện thực hóa tổ ấm mơ ước bằng sự tận tâm, minh bạch và chuyên nghiệp.",
      },
      {
        icon: "diamond",
        title: "Giá trị cốt lõi",
        description:
          "Tận tâm – Chất lượng – Minh bạch – Sáng tạo – Hiệu quả – Cam kết đồng hành cùng khách hàng trong suốt hành trình.",
      },
    ],
  },

  whyChoose: {
    title: "VÌ SAO CHỌN HÀ THÀNH HOME?",
    items: [
      {
        icon: "design",
        title: "Thiết kế sáng tạo",
        description: "Kiến tạo tinh tế, công năng tối ưu, đậm dấu ấn riêng.",
      },
      {
        icon: "progress",
        title: "Thi công đúng tiến độ",
        description: "Quản lý chuyên nghiệp, đảm bảo tiến độ và chất lượng từng hạng mục.",
      },
      {
        icon: "materials",
        title: "Vật liệu minh bạch",
        description: "Cam kết vật liệu chính hãng, rõ nguồn gốc, chất lượng được kiểm soát.",
      },
      {
        icon: "shield",
        title: "Bảo hành tận tâm",
        description: "Bảo hành dài hạn, hỗ trợ nhanh chóng sau bàn giao.",
      },
      {
        icon: "team",
        title: "Đội ngũ chuyên môn",
        description: "Kiến trúc sư, kỹ sư, giám sát giàu kinh nghiệm, chuyên nghiệp và tận tâm.",
      },
      {
        icon: "cost",
        title: "Tối ưu chi phí",
        description: "Giúp tối ưu ngân sách hiệu quả, không phát sinh chi phí ẩn.",
      },
    ],
  },

  timeline: {
    title: "HÀNH TRÌNH PHÁT TRIỂN",
    items: [
      {
        year: "2014",
        title: "Khởi đầu",
        description: "Thành lập Hà Thành Home với sứ mệnh kiến tạo không gian sống chất lượng.",
      },
      {
        year: "2016",
        title: "Bước tiến đầu tiên",
        description: "Hoàn thiện hệ thống quy trình, đội ngũ và chinh phục những công trình đầu tiên.",
      },
      {
        year: "2018",
        title: "Mở rộng & khẳng định",
        description: "Mở rộng quy mô, khẳng định thương hiệu qua hàng trăm dự án lớn nhỏ.",
      },
      {
        year: "2020",
        title: "Đổi mới & bứt phá",
        description: "Đầu tư công nghệ, nâng cao năng lực thiết kế và thi công toàn diện.",
      },
      {
        year: "2022",
        title: "Phát triển bền vững",
        description: "Mở rộng hệ sinh thái dịch vụ, nâng cao trải nghiệm khách hàng.",
      },
      {
        year: "2024",
        title: "Vươn tầm tương lai",
        description: "Tiếp tục đổi mới, kiến tạo những công trình biểu tượng và giá trị bền vững.",
      },
    ],
  },

  people: {
    imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
    eyebrow: "CON NGƯỜI – NỀN TẢNG CỦA GIÁ TRỊ",
    title: "Đội ngũ tận tâm – Vận hành bền vững",
    description:
      "Chúng tôi tự hào quy tụ đội ngũ kiến trúc sư, kỹ sư, giám sát và chuyên viên giàu kinh nghiệm. Từng thành viên đều đặt sự tận tâm, trách nhiệm và chất lượng lên hàng đầu trong mỗi công trình.",
    highlights: [
      {
        icon: "users",
        value: "50+",
        title: "Kiến trúc sư, kỹ sư, chuyên viên",
      },
      {
        icon: "experience",
        value: "10+",
        title: "Năm kinh nghiệm trong ngành",
      },
      {
        icon: "quality",
        value: "100%",
        title: "Tận tâm, trách nhiệm với từng dự án",
      },
      {
        icon: "culture",
        title: "Văn hóa",
        description: "Hợp tác – Chia sẻ – Hướng tới khách hàng",
      },
    ],
  },

  stats: [
    { icon: "experience", value: "10+", label: "Năm kinh nghiệm" },
    { icon: "project", value: "500+", label: "Dự án đã hoàn thành" },
    { icon: "satisfaction", value: "98%", label: "Khách hàng hài lòng" },
    { icon: "support", value: "24/7", label: "Hỗ trợ khách hàng" },
  ],

  strengths: {
    title: "NĂNG LỰC & THẾ MẠNH",
    items: [
      {
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85",
        title: "Thiết kế kiến trúc & nội thất",
        description: "Sáng tạo, đồng bộ, phù hợp phong cách sống.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800&q=85",
        title: "Thi công trọn gói",
        description: "Quy trình chuẩn, kiểm soát chặt chẽ từng giai đoạn.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=85",
        title: "Xưởng sản xuất nội thất",
        description: "Trực tiếp thi công, đảm bảo chất lượng và tiến độ.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=85",
        title: "Hệ thống cung ứng vật liệu",
        description: "Đối tác uy tín, nguồn hàng đa dạng, giá tốt.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=85",
        title: "Showroom trải nghiệm",
        description: "Trải nghiệm vật liệu, nội thất thực tế ngay tại showroom.",
      },
    ],
  },

  partners: {
    title: "ĐỐI TÁC & KHÁCH HÀNG TIÊU BIỂU",
    items: [
      { name: "VinHomes", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Sun Group", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Ecopark", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Masterise Homes", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Nam Cường", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "An Cường", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Viglacera", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
    ],
  },

  testimonials: {
    title: "KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI?",
    items: [
      {
        name: "Anh Minh Tuấn",
        location: "Biệt thự – Hà Nội",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
        rating: 5,
        quote:
          "Hà Thành Home làm việc rất chuyên nghiệp, thiết kế đẹp và thi công đúng tiến độ. Rất hài lòng với chất lượng và sự tận tâm của đội ngũ.",
      },
      {
        name: "Chị Thu Hằng",
        location: "Nhà phố – Hải Phòng",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
        rating: 5,
        quote:
          "Không gian sống của gia đình tôi hoàn thiện hơn cả mong đợi. Cảm ơn Hà Thành Home đã kiến tạo nên tổ ấm mơ ước.",
      },
      {
        name: "Anh Quốc Huy",
        location: "Căn hộ – Hà Nội",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
        rating: 5,
        quote:
          "Quá trình làm việc rõ ràng, vật liệu minh bạch và hậu mãi tận tâm. Tôi rất tin tưởng khi lựa chọn Hà Thành Home.",
      },
    ],
  },

  finalCta: {
    title: "Sẵn sàng kiến tạo không gian mơ ước của bạn?",
    description: "Hà Thành Home đồng hành cùng bạn từ ý tưởng đến công trình hoàn thiện – đẳng cấp và bền vững.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    primaryLabel: "Nhận báo giá",
    primaryUrl: "/lien-he?nguon=gioi-thieu",
    secondaryLabel: "Nhận tư vấn ngay",
    secondaryUrl: "/lien-he?nguon=gioi-thieu",
  },
};
