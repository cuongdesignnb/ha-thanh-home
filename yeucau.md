# PROMPT CHO AGENT: Bổ sung trang Giới thiệu Hà Thành Home + Admin Setting + SEO Schema + Menu Drag & Drop Link Suggestions

## 0. Bối cảnh dự án

Dự án: `cuongdesignnb/ha-thanh-home`

Hệ thống gồm:

- `apps/web`: website public Next.js App Router
- `apps/admin`: admin quản trị nội dung
- `apps/api`: API NestJS + Prisma + MySQL

Website ngành:

- Thiết kế kiến trúc
- Thi công nhà ở
- Thi công nội thất
- Xây nhà trọn gói
- Thi công nhà xưởng
- Thi công nội thất văn phòng
- Dự án đã thực hiện
- Mẫu thiết kế kiến trúc
- Mẫu thiết kế nội thất
- Bài viết SEO

Yêu cầu hiện tại: bổ sung/tr hoàn thiện **trang Giới thiệu** theo UX/UI mẫu đã thiết kế, đồng thời tích hợp chuẩn SEO, schema tương ứng, cấu hình nội dung qua admin, và bổ sung route này vào hệ thống menu drag & drop để admin có thể chọn link đề xuất khi tạo menu.

---

## 1. Mục tiêu chính

Cần triển khai trang:

```txt
Tên trang: Giới thiệu
Route public: /gioi-thieu
Admin path đề xuất: Admin > Cấu hình website > Trang giới thiệu
Hoặc: Admin > Trang tĩnh > Giới thiệu nếu hệ thống có module pages
Setting key đề xuất: site.pages.about
```

Trang `/gioi-thieu` cần có giao diện giống UX/UI mẫu:

- Header giống toàn site
- Hero có breadcrumb, ảnh nền biệt thự/không gian sống cao cấp
- Nội dung giới thiệu thương hiệu
- Section tầm nhìn – sứ mệnh – giá trị cốt lõi
- Section vì sao chọn Hà Thành Home
- Hành trình phát triển timeline
- Section con người/nền tảng giá trị
- Stats lớn
- Năng lực & thế mạnh
- Đối tác & khách hàng tiêu biểu
- Testimonials
- CTA cuối trang
- Footer

Yêu cầu quan trọng:

- Nội dung phải chỉnh được trong admin.
- SEO phải chuẩn.
- Có schema phù hợp cho trang giới thiệu.
- Route `/gioi-thieu` phải xuất hiện trong menu link suggestions để admin kéo thả menu header/footer.
- Không hardcode toàn bộ nội dung trong component nếu nội dung đó cần admin chỉnh.
- Nếu chưa có config từ API thì frontend phải dùng fallback default data để trang không trắng.

---

## 2. Yêu cầu bắt buộc trước khi code

Trước khi sửa code, Agent phải đọc repo và trả lời ngắn gọn:

1. Route `/gioi-thieu` hiện đã tồn tại chưa?
2. Nếu đã tồn tại, hiện đang render từ file nào?
3. Trang này đang dùng dữ liệu hardcode hay API/Setting?
4. Admin đã có module cấu hình trang tĩnh hoặc settings chưa?
5. API có endpoint public để lấy settings chưa?
6. API admin có endpoint `GET/PATCH /api/cms/settings` chưa?
7. Menu drag & drop đang lấy link suggestions từ đâu?
8. Trong `menuLinkSuggestions()` đã có route `/gioi-thieu` chưa?
9. Hệ thống SEO hiện đã có metadata helper, JSON-LD helper, sitemap, robots chưa?
10. Agent phải liệt kê danh sách file sẽ tạo/sửa trước khi code.

Không code ngay khi chưa trả lời phương án.

---

## 3. Route public cần có

Cần đảm bảo có route:

```txt
apps/web/src/app/gioi-thieu/page.tsx
```

Nếu route này đã có, refactor lại theo hướng:

```tsx
import { AboutPage } from "@/components/pages/about-page";
import { getAboutPageConfig } from "@/lib/about-page";

export default async function GioiThieuPage() {
  const config = await getAboutPageConfig();

  return <AboutPage config={config} />;
}
```

Component đề xuất:

```txt
apps/web/src/components/pages/about-page.tsx
apps/web/src/components/pages/about-page.module.css
```

Hoặc nếu project đang tổ chức component khác, có thể đặt theo convention hiện tại, nhưng cần tách riêng component để page file gọn.

---

## 4. Setting key và dữ liệu config

Dữ liệu trang giới thiệu nên lưu bằng bảng `Setting`.

Setting key:

```txt
site.pages.about
```

Public route:

```txt
/gioi-thieu
```

Admin nên đọc/ghi config này qua API.

Endpoint đề xuất nếu chưa có:

```txt
GET   /api/public/pages/about
GET   /api/cms/pages/about
PATCH /api/cms/pages/about
```

Hoặc dùng endpoint settings hiện có:

```txt
GET   /api/cms/settings
PATCH /api/cms/settings
```

Nếu dùng endpoint settings chung, cần map:

```txt
key = site.pages.about
value = AboutPageConfig
```

---

## 5. Schema config đề xuất

Tạo type dùng chung cho web/admin nếu có thể.

File đề xuất:

```txt
apps/web/src/lib/about-page-config.ts
apps/admin/src/lib/about-page-config.ts
```

Nếu có package shared thì đặt vào shared package.

Type đề xuất:

```ts
export type AboutPageConfig = {
  slug: "gioi-thieu";
  title: string;
  isActive: boolean;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
  };

  hero: {
    breadcrumbLabel: string;
    eyebrow: string;
    title: string;
    description: string;
    backgroundImageUrl: string;
    primaryCtaLabel: string;
    primaryCtaUrl: string;
    secondaryCtaLabel: string;
    secondaryCtaUrl: string;
  };

  intro: {
    imageUrl: string;
    eyebrow: string;
    title: string;
    description: string;
    checklist: string[];
  };

  identity: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };

  whyChoose: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };

  timeline: {
    title: string;
    items: Array<{
      year: string;
      title: string;
      description: string;
    }>;
  };

  people: {
    imageUrl: string;
    eyebrow: string;
    title: string;
    description: string;
    highlights: Array<{
      icon: string;
      value?: string;
      title: string;
      description?: string;
    }>;
  };

  stats: Array<{
    icon?: string;
    value: string;
    label: string;
  }>;

  strengths: {
    title: string;
    items: Array<{
      imageUrl: string;
      title: string;
      description: string;
    }>;
  };

  partners: {
    title: string;
    items: Array<{
      name: string;
      logoUrl?: string;
      url?: string;
    }>;
  };

  testimonials: {
    title: string;
    items: Array<{
      name: string;
      location?: string;
      avatarUrl?: string;
      rating?: number;
      quote: string;
    }>;
  };

  finalCta: {
    title: string;
    description: string;
    backgroundImageUrl?: string;
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
  };
};
```

---

## 6. Default data cho trang Giới thiệu

Tạo hoặc cập nhật:

```txt
apps/web/src/lib/page-defaults.ts
```

hoặc:

```txt
apps/web/src/lib/about-page-defaults.ts
```

Default config:

```ts
export const aboutPageDefaultConfig = {
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
    ogImage: "",
    noIndex: false,
  },

  hero: {
    breadcrumbLabel: "Giới thiệu",
    eyebrow: "VỀ CHÚNG TÔI",
    title: "Kiến tạo không gian sống và công trình đẳng cấp",
    description:
      "Hà Thành Home thấu hiểu mọi mong muốn của bạn để biến ý tưởng thành những không gian sống tinh tế, bền vững và mang dấu ấn riêng.",
    backgroundImageUrl: "",
    primaryCtaLabel: "Nhận tư vấn ngay",
    primaryCtaUrl: "/lien-he?nguon=gioi-thieu",
    secondaryCtaLabel: "Xem video giới thiệu",
    secondaryCtaUrl: "#video-gioi-thieu",
  },

  intro: {
    imageUrl: "",
    eyebrow: "VỀ HÀ THÀNH HOME",
    title: "Kiến tạo giá trị – Nâng tầm cuộc sống",
    description:
      "Hà Thành Home là đơn vị chuyên nghiệp trong lĩnh vực thiết kế kiến trúc, thi công xây dựng trọn gói và nội thất cao cấp. Với hơn 10 năm kinh nghiệm, chúng tôi tự hào mang đến những giải pháp toàn diện – tinh tế – bền vững cho hàng trăm khách hàng trên khắp cả nước.",
    checklist: [
      "Thiết kế sáng tạo, tối ưu công năng và thẩm mỹ",
      "Thi công chuẩn xác, đúng tiến độ, đúng cam kết",
      "Vật liệu minh bạch, chất lượng cao",
      "Hậu mãi tận tâm, đồng hành dài lâu"
    ],
  },

  identity: {
    title: "TẦM NHÌN – SỨ MỆNH – GIÁ TRỊ CỐT LÕI",
    items: [
      {
        icon: "eye",
        title: "Tầm nhìn",
        description:
          "Trở thành thương hiệu kiến trúc – xây dựng – nội thất hàng đầu Việt Nam, kiến tạo không gian sống đẳng cấp và bền vững."
      },
      {
        icon: "target",
        title: "Sứ mệnh",
        description:
          "Mang đến giải pháp toàn diện, giúp khách hàng hiện thực hóa tổ ấm mơ ước bằng sự tận tâm, minh bạch và chuyên nghiệp."
      },
      {
        icon: "diamond",
        title: "Giá trị cốt lõi",
        description:
          "Tận tâm – Chất lượng – Minh bạch – Sáng tạo – Hiệu quả – Cam kết đồng hành cùng khách hàng trong suốt hành trình."
      }
    ],
  },

  whyChoose: {
    title: "VÌ SAO CHỌN HÀ THÀNH HOME?",
    items: [
      {
        icon: "design",
        title: "Thiết kế sáng tạo",
        description:
          "Kiến tạo tinh tế, công năng tối ưu, đậm dấu ấn riêng."
      },
      {
        icon: "progress",
        title: "Thi công đúng tiến độ",
        description:
          "Quản lý chuyên nghiệp, đảm bảo tiến độ và chất lượng từng hạng mục."
      },
      {
        icon: "materials",
        title: "Vật liệu minh bạch",
        description:
          "Cam kết vật liệu chính hãng, rõ nguồn gốc, chất lượng được kiểm soát."
      },
      {
        icon: "shield",
        title: "Bảo hành tận tâm",
        description:
          "Bảo hành dài hạn, hỗ trợ nhanh chóng sau bàn giao."
      },
      {
        icon: "team",
        title: "Đội ngũ chuyên môn",
        description:
          "Kiến trúc sư, kỹ sư, giám sát giàu kinh nghiệm, chuyên nghiệp và tận tâm."
      },
      {
        icon: "cost",
        title: "Tối ưu chi phí",
        description:
          "Giúp tối ưu ngân sách hiệu quả, không phát sinh chi phí ẩn."
      }
    ],
  },

  timeline: {
    title: "HÀNH TRÌNH PHÁT TRIỂN",
    items: [
      {
        year: "2014",
        title: "Khởi đầu",
        description:
          "Thành lập Hà Thành Home với sứ mệnh kiến tạo không gian sống chất lượng."
      },
      {
        year: "2016",
        title: "Bước tiến đầu tiên",
        description:
          "Hoàn thiện hệ thống quy trình, đội ngũ và chinh phục những công trình đầu tiên."
      },
      {
        year: "2018",
        title: "Mở rộng & khẳng định",
        description:
          "Mở rộng quy mô, khẳng định thương hiệu qua hàng trăm dự án lớn nhỏ."
      },
      {
        year: "2020",
        title: "Đổi mới & bứt phá",
        description:
          "Đầu tư công nghệ, nâng cao năng lực thiết kế và thi công toàn diện."
      },
      {
        year: "2022",
        title: "Phát triển bền vững",
        description:
          "Mở rộng hệ sinh thái dịch vụ, nâng cao trải nghiệm khách hàng."
      },
      {
        year: "2024",
        title: "Vươn tầm tương lai",
        description:
          "Tiếp tục đổi mới, kiến tạo những công trình biểu tượng và giá trị bền vững."
      }
    ],
  },

  people: {
    imageUrl: "",
    eyebrow: "CON NGƯỜI – NỀN TẢNG CỦA GIÁ TRỊ",
    title: "Đội ngũ tận tâm – Vận hành bền vững",
    description:
      "Chúng tôi tự hào quy tụ đội ngũ kiến trúc sư, kỹ sư, giám sát và chuyên viên giàu kinh nghiệm. Từng thành viên đều đặt sự tận tâm, trách nhiệm và chất lượng lên hàng đầu trong mỗi công trình.",
    highlights: [
      {
        icon: "users",
        value: "50+",
        title: "Kiến trúc sư, kỹ sư, chuyên viên"
      },
      {
        icon: "experience",
        value: "10+",
        title: "Năm kinh nghiệm trong ngành"
      },
      {
        icon: "quality",
        value: "100%",
        title: "Tận tâm, trách nhiệm với từng dự án"
      },
      {
        icon: "culture",
        title: "Văn hóa",
        description: "Hợp tác – Chia sẻ – Hướng tới khách hàng"
      }
    ],
  },

  stats: [
    { icon: "experience", value: "10+", label: "Năm kinh nghiệm" },
    { icon: "project", value: "500+", label: "Dự án đã hoàn thành" },
    { icon: "satisfaction", value: "98%", label: "Khách hàng hài lòng" },
    { icon: "support", value: "24/7", label: "Hỗ trợ khách hàng" }
  ],

  strengths: {
    title: "NĂNG LỰC & THẾ MẠNH",
    items: [
      {
        imageUrl: "",
        title: "Thiết kế kiến trúc & nội thất",
        description:
          "Sáng tạo, đồng bộ, phù hợp phong cách sống."
      },
      {
        imageUrl: "",
        title: "Thi công trọn gói",
        description:
          "Quy trình chuẩn, kiểm soát chặt chẽ từng giai đoạn."
      },
      {
        imageUrl: "",
        title: "Xưởng sản xuất nội thất",
        description:
          "Trực tiếp thi công, đảm bảo chất lượng và tiến độ."
      },
      {
        imageUrl: "",
        title: "Hệ thống cung ứng vật liệu",
        description:
          "Đối tác uy tín, nguồn hàng đa dạng, giá tốt."
      },
      {
        imageUrl: "",
        title: "Showroom trải nghiệm",
        description:
          "Trải nghiệm vật liệu, nội thất thực tế ngay tại showroom."
      }
    ],
  },

  partners: {
    title: "ĐỐI TÁC & KHÁCH HÀNG TIÊU BIỂU",
    items: [
      { name: "VinHomes", logoUrl: "", url: "" },
      { name: "Sun Group", logoUrl: "", url: "" },
      { name: "Ecopark", logoUrl: "", url: "" },
      { name: "Masterise Homes", logoUrl: "", url: "" },
      { name: "Nam Cường", logoUrl: "", url: "" },
      { name: "An Cường", logoUrl: "", url: "" },
      { name: "Viglacera", logoUrl: "", url: "" }
    ],
  },

  testimonials: {
    title: "KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI?",
    items: [
      {
        name: "Anh Minh Tuấn",
        location: "Biệt thự – Hà Nội",
        avatarUrl: "",
        rating: 5,
        quote:
          "Hà Thành Home làm việc rất chuyên nghiệp, thiết kế đẹp và thi công đúng tiến độ. Rất hài lòng với chất lượng và sự tận tâm của đội ngũ."
      },
      {
        name: "Chị Thu Hằng",
        location: "Nhà phố – Hải Phòng",
        avatarUrl: "",
        rating: 5,
        quote:
          "Không gian sống của gia đình tôi hoàn thiện hơn cả mong đợi. Cảm ơn Hà Thành Home đã kiến tạo nên tổ ấm mơ ước."
      },
      {
        name: "Anh Quốc Huy",
        location: "Căn hộ – Hà Nội",
        avatarUrl: "",
        rating: 5,
        quote:
          "Quá trình làm việc rõ ràng, vật liệu minh bạch và hậu mãi tận tâm. Tôi rất tin tưởng khi lựa chọn Hà Thành Home."
      }
    ],
  },

  finalCta: {
    title: "Sẵn sàng kiến tạo không gian mơ ước của bạn?",
    description:
      "Hà Thành Home đồng hành cùng bạn từ ý tưởng đến công trình hoàn thiện – đẳng cấp và bền vững.",
    backgroundImageUrl: "",
    primaryLabel: "Nhận báo giá",
    primaryUrl: "/lien-he?nguon=gioi-thieu",
    secondaryLabel: "Nhận tư vấn ngay",
    secondaryUrl: "tel:0962123456",
  },
};
```

---

## 7. Frontend layout theo UX/UI mẫu

Trang public `/gioi-thieu` cần có section theo thứ tự:

```txt
1. Header
2. Hero full width
3. Intro 2 cột: ảnh + nội dung giới thiệu
4. Tầm nhìn – Sứ mệnh – Giá trị cốt lõi
5. Vì sao chọn Hà Thành Home
6. Hành trình phát triển timeline
7. Con người – Nền tảng giá trị
8. Stats strip màu xanh đậm
9. Năng lực & thế mạnh
10. Đối tác & khách hàng tiêu biểu
11. Testimonials
12. Final CTA
13. Footer
```

Tone màu:

```txt
Xanh đậm: #0f3d2e
Xanh sâu: #082b22
Vàng đồng: #c99a4a
Kem: #f8f5ef
Trắng: #ffffff
Text đậm: #183b2d
Text phụ: #6b6b63
Line: #e8ddca
```

Responsive:

- Desktop giống UX/UI mẫu.
- Tablet chia 2 cột hợp lý.
- Mobile xếp dọc.
- Không tràn ngang.
- CTA rõ ràng.
- Ảnh dùng object-fit cover.
- Timeline trên mobile chuyển thành dạng vertical list.

---

## 8. SEO cho trang Giới thiệu

Trang `/gioi-thieu` cần metadata riêng.

Metadata mặc định:

```txt
Title: Giới thiệu Hà Thành Home | Thiết kế, thi công nhà ở & nội thất
Description: Hà Thành Home là đơn vị thiết kế, thi công nhà ở và nội thất chuyên nghiệp, kiến tạo không gian sống đẳng cấp, bền vững và mang dấu ấn riêng.
Canonical: /gioi-thieu
```

Yêu cầu:

- Có `generateMetadata()` hoặc metadata server-side.
- Lấy dữ liệu từ config SEO nếu có.
- Nếu thiếu config thì dùng default.
- Có OpenGraph.
- Có Twitter Card.
- OG image ưu tiên `seo.ogImage`, fallback `hero.backgroundImageUrl`, fallback default OG image.
- Canonical là absolute URL.
- Không dùng title chung cho mọi trang.

Ví dụ:

```ts
export async function generateMetadata() {
  const config = await getAboutPageConfig();

  return buildMetadata({
    title: config.seo.metaTitle || config.title,
    description: config.seo.metaDescription,
    path: "/gioi-thieu",
    canonicalUrl: config.seo.canonicalUrl,
    image: config.seo.ogImage || config.hero.backgroundImageUrl,
    noIndex: config.seo.noIndex,
  });
}
```

---

## 9. Schema JSON-LD cho trang Giới thiệu

Trang `/gioi-thieu` cần các schema:

```txt
AboutPage
Organization
BreadcrumbList
ImageObject nếu có ảnh chính
ItemList cho năng lực/thế mạnh nếu phù hợp
```

### 9.1 AboutPage schema

```ts
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${siteUrl}/gioi-thieu#about`,
  "url": `${siteUrl}/gioi-thieu`,
  "name": config.seo.metaTitle || config.title,
  "description": config.seo.metaDescription || config.hero.description,
  "isPartOf": {
    "@id": `${siteUrl}/#website`
  },
  "about": {
    "@id": `${siteUrl}/#organization`
  },
  "inLanguage": "vi-VN"
}
```

### 9.2 BreadcrumbList schema

```ts
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": siteUrl
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Giới thiệu",
      "item": `${siteUrl}/gioi-thieu`
    }
  ]
}
```

### 9.3 ImageObject schema

Nếu có hero image hoặc intro image:

```ts
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "url": imageUrl,
  "contentUrl": imageUrl,
  "caption": config.hero.title
}
```

### 9.4 Organization schema

Nếu global layout đã render Organization schema rồi thì không cần render lại. Nếu chưa có global schema, trang giới thiệu nên render Organization schema.

Không thêm `aggregateRating` nếu không có review thật được hiển thị công khai.

---

## 10. Admin setting cho trang Giới thiệu

Cần bổ sung màn hình cấu hình:

```txt
Admin > Cấu hình website > Trang giới thiệu
```

Hoặc nếu admin đã có group pages:

```txt
Admin > Trang tĩnh > Giới thiệu
```

Không cần tạo CRUD nhiều trang nếu dự án chưa có module pages. Trang giới thiệu là page cố định, lưu bằng Setting JSON.

Component đề xuất:

```txt
apps/admin/src/components/about-page-settings-panel.tsx
```

hoặc dùng component generic:

```txt
apps/admin/src/components/static-page-settings-panel.tsx
```

Panel cần chia tab/accordion, không làm 1 form quá dài.

Tabs đề xuất:

```txt
Tổng quan
SEO
Hero
Giới thiệu
Tầm nhìn – Sứ mệnh
Vì sao chọn
Hành trình
Con người
Thống kê
Năng lực
Đối tác
Khách hàng
CTA cuối trang
```

---

## 11. Chi tiết field admin

### 11.1 Tab Tổng quan

```txt
Tên trang
Slug
Route public
Setting key
Bật/tắt hiển thị
Nút xem website
```

Giá trị cố định:

```txt
slug = gioi-thieu
route = /gioi-thieu
settingKey = site.pages.about
```

### 11.2 Tab SEO

```txt
Meta title
Meta description
Canonical URL
OG title
OG description
OG image
Noindex
```

Yêu cầu UX:

- Counter title khoảng 50–60 ký tự.
- Counter description khoảng 140–160 ký tự.
- Preview Google snippet.
- Preview social card.
- Cảnh báo nếu thiếu OG image.

### 11.3 Tab Hero

```txt
Breadcrumb label
Eyebrow
Title
Description
Background image
Primary CTA label
Primary CTA URL
Secondary CTA label
Secondary CTA URL
```

### 11.4 Tab Giới thiệu

```txt
Image
Eyebrow
Title
Description
Checklist repeater
```

### 11.5 Tab Tầm nhìn – Sứ mệnh

Repeater:

```txt
Icon
Title
Description
```

Default 3 item:

```txt
Tầm nhìn
Sứ mệnh
Giá trị cốt lõi
```

### 11.6 Tab Vì sao chọn

Repeater:

```txt
Icon
Title
Description
```

Default 6 item:

```txt
Thiết kế sáng tạo
Thi công đúng tiến độ
Vật liệu minh bạch
Bảo hành tận tâm
Đội ngũ chuyên môn
Tối ưu chi phí
```

### 11.7 Tab Hành trình

Repeater timeline:

```txt
Year
Title
Description
```

Default:

```txt
2014
2016
2018
2020
2022
2024
```

### 11.8 Tab Con người

```txt
Image
Eyebrow
Title
Description
Highlights repeater
```

Highlight repeater:

```txt
Icon
Value
Title
Description
```

### 11.9 Tab Thống kê

Repeater:

```txt
Icon
Value
Label
```

Default:

```txt
10+ / Năm kinh nghiệm
500+ / Dự án đã hoàn thành
98% / Khách hàng hài lòng
24/7 / Hỗ trợ khách hàng
```

### 11.10 Tab Năng lực

Repeater:

```txt
Image
Title
Description
```

Default:

```txt
Thiết kế kiến trúc & nội thất
Thi công trọn gói
Xưởng sản xuất nội thất
Hệ thống cung ứng vật liệu
Showroom trải nghiệm
```

### 11.11 Tab Đối tác

Repeater:

```txt
Name
Logo
URL
```

Yêu cầu:

- Nếu chưa có logo, hiển thị text logo.
- Logo phải có alt bằng tên đối tác.

### 11.12 Tab Khách hàng

Repeater testimonial:

```txt
Name
Location
Avatar
Rating
Quote
```

Lưu ý:

- Chỉ hiển thị rating schema nếu đánh giá thật và được hiển thị công khai.
- Nếu không chắc, chỉ hiển thị rating UI, không đưa `aggregateRating` vào schema.

### 11.13 Tab CTA cuối trang

```txt
Title
Description
Background image
Primary label
Primary URL
Secondary label
Secondary URL
```

---

## 12. API admin cho page setting

Nếu dùng endpoint settings chung:

```txt
GET /api/cms/settings
PATCH /api/cms/settings
```

Khi lưu:

```json
{
  "key": "site.pages.about",
  "value": { "...": "AboutPageConfig" }
}
```

Nếu muốn sạch hơn, tạo endpoint riêng:

```txt
GET   /api/cms/pages/about
PATCH /api/cms/pages/about
GET   /api/public/pages/about
```

Yêu cầu endpoint:

- Admin hoặc Viewer được xem config trong CMS.
- Chỉ Admin được sửa.
- Public chỉ trả config đã active.
- Nếu chưa có setting, trả default config.
- Không trả null gây trắng trang.

---

## 13. Menu drag & drop link suggestions

Hiện admin có module `Menu` kéo thả header/footer. Cần đảm bảo route `/gioi-thieu` xuất hiện trong danh sách link đề xuất.

File cần kiểm tra:

```txt
apps/api/src/modules/admin.controller.ts
```

Tìm hàm:

```ts
menuLinkSuggestions()
```

Cần có static route:

```ts
["Giới thiệu", "/gioi-thieu"]
```

Trong danh sách static routes nên có:

```ts
const staticRoutes = [
  ["Trang chủ", "/"],
  ["Giới thiệu", "/gioi-thieu"],
  ["Dịch vụ", "/dich-vu"],
  ["Xây nhà trọn gói", "/dich-vu/xay-nha-tron-goi"],
  ["Sản Xuất Thi Công Nội Thất", "/dich-vu/san-xuat-thi-cong-noi-that"],
  ["Thi Công Nhà Xưởng", "/dich-vu/thi-cong-nha-xuong"],
  ["Thi Công Nội Thất Văn Phòng", "/dich-vu/thi-cong-noi-that-van-phong"],
  ["Dự án", "/du-an"],
  ["Dự án công trình", "/du-an/cong-trinh"],
  ["Dự án nội thất", "/du-an/noi-that"],
  ["Mẫu thiết kế kiến trúc", "/mau-thiet-ke-kien-truc"],
  ["Mẫu thiết kế nội thất", "/mau-thiet-ke-noi-that"],
  ["Tin tức", "/tin-tuc"],
  ["Liên hệ", "/lien-he"]
].map(([label, url]) => ({ label, url, type: "route" }));
```

Yêu cầu admin menu:

- Khi admin thêm menu item, gợi ý phải có `Giới thiệu`.
- Khi kéo thả menu header/footer, route `/gioi-thieu` lưu được.
- Không tạo duplicate `Giới thiệu` nếu đã có.
- Nếu menu hiện tại đang hardcode thiếu `/gioi-thieu`, bổ sung.
- Nếu frontend header đang lấy menu từ API, kiểm tra hiển thị đúng active state khi đang ở `/gioi-thieu`.

---

## 14. Header active state

Khi ở route:

```txt
/gioi-thieu
```

Menu item `Giới thiệu` phải active.

Yêu cầu:

- Header không hardcode sai thứ tự.
- Nếu dùng menu CMS, active theo pathname.
- Nếu dùng static fallback menu, có item `/gioi-thieu`.
- Không để active nhầm `Trang chủ`.

---

## 15. Sitemap

Route `/gioi-thieu` phải có trong sitemap:

```txt
/gioi-thieu
```

Sitemap item:

```ts
{
  url: `${siteUrl}/gioi-thieu`,
  lastModified: new Date(),
  changeFrequency: "monthly",
  priority: 0.8
}
```

Nếu setting có `updatedAt`, dùng `updatedAt`.

Không đưa page vào sitemap nếu:

```txt
config.isActive = false
config.seo.noIndex = true
```

---

## 16. robots.txt

Không chặn `/gioi-thieu`.

Đảm bảo robots cho phép:

```txt
/gioi-thieu
```

Không thêm vào disallow.

---

## 17. Internal linking

Trang giới thiệu cần link nội bộ tới:

```txt
/dich-vu
/dich-vu/xay-nha-tron-goi
/dich-vu/san-xuat-thi-cong-noi-that
/dich-vu/thi-cong-nha-xuong
/dich-vu/thi-cong-noi-that-van-phong
/du-an
/tin-tuc
/lien-he
```

CTA nên link:

```txt
Nhận tư vấn ngay -> /lien-he?nguon=gioi-thieu
Nhận báo giá -> /lien-he?nguon=gioi-thieu
Xem dự án -> /du-an
```

---

## 18. Image SEO

Yêu cầu ảnh trên trang giới thiệu:

- Hero image có alt phù hợp.
- Intro image có alt.
- People image có alt.
- Strength card image có alt.
- Partner logo có alt.
- Testimonial avatar có alt.

Alt gợi ý:

```txt
Không gian biệt thự hiện đại do Hà Thành Home thiết kế thi công
Phòng khách cao cấp trong dự án Hà Thành Home
Đội ngũ Hà Thành Home trao đổi phương án thiết kế thi công
Xưởng sản xuất nội thất Hà Thành Home
Showroom trải nghiệm vật liệu và nội thất Hà Thành Home
```

Không nhồi từ khóa.

---

## 19. Performance

- Trang `/gioi-thieu` nên là Server Component nếu không cần state client.
- Các section không cần tương tác thì render server.
- Nếu testimonial slider cần client, tách riêng client component nhỏ.
- Hero image dùng priority.
- Ảnh dưới fold lazy load.
- Dùng `next/image` nếu hệ thống đang dùng Next Image.
- Không load animation nặng.
- Không dùng quá nhiều JS cho timeline nếu không cần.

---

## 20. Files cần tạo/sửa

### 20.1 Web

```txt
apps/web/src/app/gioi-thieu/page.tsx
apps/web/src/components/pages/about-page.tsx
apps/web/src/components/pages/about-page.module.css
apps/web/src/lib/about-page-config.ts
apps/web/src/lib/about-page-defaults.ts
apps/web/src/lib/seo/metadata.ts
apps/web/src/lib/seo/jsonld.ts
apps/web/src/components/seo/json-ld.tsx
apps/web/src/app/sitemap.ts
```

Nếu các file SEO đã có thì chỉ cập nhật.

### 20.2 Admin

```txt
apps/admin/src/components/about-page-settings-panel.tsx
apps/admin/src/lib/about-page-config.ts
apps/admin/src/components/admin-app.tsx
```

Nếu có `settings` module hiện tại, có thể tích hợp panel vào đó thay vì tạo menu mới.

### 20.3 API

```txt
apps/api/src/modules/admin.controller.ts
```

Nếu tạo endpoint riêng:

```txt
apps/api/src/modules/public.controller.ts
apps/api/src/modules/page-settings.controller.ts
```

Không bắt buộc nếu dùng `settings` endpoint hiện có.

---

## 21. Phương án triển khai theo phase

### Phase 1: Audit

Agent đọc code và báo cáo:

```txt
Route /gioi-thieu hiện có chưa
Menu suggestions đang ở đâu
Admin settings hiện có chưa
SEO helper đã có chưa
Sitemap đã có chưa
Schema đã có chưa
```

### Phase 2: Data config

- Tạo `AboutPageConfig`.
- Tạo `aboutPageDefaultConfig`.
- Tạo helper `getAboutPageConfig()`.
- Đảm bảo fallback default.

### Phase 3: Public page

- Tạo/refactor `/gioi-thieu`.
- Tạo `AboutPage` component.
- Tạo CSS module đúng UX/UI.
- Render các section theo config.

### Phase 4: SEO + Schema

- `generateMetadata()`.
- AboutPage schema.
- Breadcrumb schema.
- ImageObject schema nếu có ảnh.
- Không thêm rating schema nếu không đủ điều kiện.

### Phase 5: Admin setting

- Tạo panel cấu hình trang giới thiệu.
- Chia tab/accordion.
- Lưu vào `site.pages.about`.
- Có nút xem website.
- Có SEO preview nếu đã có component.

### Phase 6: Menu drag & drop

- Bổ sung `/gioi-thieu` vào `menuLinkSuggestions()`.
- Kiểm tra menu header/footer có thể chọn `Giới thiệu`.
- Kiểm tra active state header.

### Phase 7: Sitemap + test

- Thêm `/gioi-thieu` vào sitemap.
- Không chặn trong robots.
- Build web/admin/api.
- Test route public.
- Test admin save config.
- Test menu suggestion.
- Test metadata/schema bằng view source.

---

## 22. Acceptance checklist

### Public page

- [ ] Có route `/gioi-thieu`.
- [ ] Giao diện giống UX/UI mẫu.
- [ ] Có đầy đủ các section:
  - [ ] Hero
  - [ ] Intro
  - [ ] Tầm nhìn – Sứ mệnh – Giá trị cốt lõi
  - [ ] Vì sao chọn Hà Thành Home
  - [ ] Hành trình phát triển
  - [ ] Con người – Nền tảng giá trị
  - [ ] Stats
  - [ ] Năng lực & thế mạnh
  - [ ] Đối tác
  - [ ] Testimonials
  - [ ] CTA cuối trang
- [ ] Responsive desktop/tablet/mobile.
- [ ] Không tràn ngang.
- [ ] Ảnh có alt.

### SEO

- [ ] Có metadata riêng.
- [ ] Có canonical `/gioi-thieu`.
- [ ] Có OpenGraph.
- [ ] Có Twitter Card.
- [ ] Có AboutPage schema.
- [ ] Có BreadcrumbList schema.
- [ ] Có ImageObject nếu có ảnh chính.
- [ ] Không thêm schema rating sai.
- [ ] Có trong sitemap.
- [ ] Không bị robots chặn.

### Admin

- [ ] Có màn cấu hình trang giới thiệu.
- [ ] Lưu config vào `site.pages.about`.
- [ ] Có tab SEO.
- [ ] Có tab Hero.
- [ ] Có tab Intro.
- [ ] Có tab Tầm nhìn – Sứ mệnh.
- [ ] Có tab Vì sao chọn.
- [ ] Có tab Hành trình.
- [ ] Có tab Năng lực.
- [ ] Có tab Đối tác.
- [ ] Có tab Testimonials.
- [ ] Có tab CTA.
- [ ] Save/load không lỗi.
- [ ] Nếu chưa có config, hiển thị default.

### Menu

- [ ] `menuLinkSuggestions()` có `Giới thiệu -> /gioi-thieu`.
- [ ] Admin menu drag & drop chọn được link `Giới thiệu`.
- [ ] Header active đúng khi ở `/gioi-thieu`.
- [ ] Không duplicate link suggestion.

### Build

- [ ] Build `apps/web` không lỗi.
- [ ] Build `apps/admin` không lỗi.
- [ ] Build `apps/api` không lỗi.
- [ ] TypeScript không lỗi.

---

## 23. Lưu ý quan trọng cho Agent

- Không code ngay khi chưa audit.
- Không hardcode toàn bộ nội dung nếu admin cần chỉnh.
- Không tạo CRUD pages phức tạp nếu chưa cần, chỉ cần setting cố định cho `/gioi-thieu`.
- Không làm vỡ menu hiện có.
- Không làm vỡ route dịch vụ đã có.
- Không xóa dữ liệu cũ.
- Không thêm schema type không chắc chắn.
- Không thêm fake rating schema.
- Không đưa nội dung noindex vào sitemap.
- Không dùng domain hardcode nhiều nơi, dùng `NEXT_PUBLIC_SITE_URL`.
- Nếu setting chưa có, frontend phải fallback default config.
- Nếu admin chưa làm được full form ở phase đầu, ít nhất phải chuẩn bị structure đúng để mở rộng.

---

## 24. Prompt ngắn để Agent bắt đầu

Hãy đọc repo `cuongdesignnb/ha-thanh-home` và triển khai trang `/gioi-thieu` theo UX/UI mẫu. Trước khi code, hãy audit route hiện tại, admin settings, menuLinkSuggestions, sitemap, SEO helper và schema. Sau đó tạo/refactor trang Giới thiệu dùng config `site.pages.about`, có fallback default data, giao diện đúng tone Hà Thành Home, chuẩn SEO với AboutPage schema, BreadcrumbList, metadata, canonical, OpenGraph, có trong sitemap, không bị robots chặn. Đồng thời bổ sung link `Giới thiệu -> /gioi-thieu` vào hệ thống menu drag & drop link suggestions để admin có thể chọn khi cấu hình menu header/footer.