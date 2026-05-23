# PROMPT CHO AGENT: Tối ưu SEO toàn bộ hệ thống Hà Thành Home + Schema + Sitemap + robots.txt + Trang 404 chuẩn SEO

## 0. Bối cảnh dự án

Dự án: `cuongdesignnb/ha-thanh-home`

Hệ thống gồm:

- `apps/web`: website public Next.js App Router
- `apps/admin`: admin quản trị nội dung
- `apps/api`: API NestJS + Prisma + MySQL

Ngành nghề website:

- Thiết kế nhà ở
- Thi công nhà ở
- Xây nhà trọn gói
- Sản xuất thi công nội thất
- Thi công nhà xưởng
- Thi công nội thất văn phòng
- Mẫu thiết kế kiến trúc
- Mẫu thiết kế nội thất
- Dự án đã thực hiện
- Bài viết SEO ngành xây dựng – nội thất

Mục tiêu: tối ưu SEO toàn bộ hệ thống ở mức technical SEO, content SEO, local SEO, schema, sitemap, robots.txt, 404, metadata động, OpenGraph, Twitter Card, canonical, structured data và chuẩn riêng cho ngành thiết kế – thi công – nội thất.

---

## 1. Yêu cầu bắt buộc trước khi code

Trước khi sửa code, Agent phải đọc hệ thống và trả lời ngắn gọn các câu sau:

1. Website hiện đang tạo metadata ở đâu?
2. Có file `sitemap.ts`, `robots.ts`, `manifest.ts`, `not-found.tsx` hoặc `robots.txt` chưa?
3. Các route public hiện có là gì?
4. API public đang lấy project/post/service page như thế nào?
5. Admin đã có các trường SEO nào: `metaTitle`, `metaDescription`, `canonicalUrl`, `ogTitle`, `ogDescription`, `ogImage`?
6. Cấu hình website đang lưu ở bảng `Setting`, file static hay hardcode?
7. Có helper nào dùng chung cho URL, image URL, thumbnail, canonical chưa?
8. Hiện website có trang 404 custom chưa?
9. Sau khi đọc xong, Agent phải đề xuất danh sách file sẽ tạo/sửa rồi mới code.

Không code ngay khi chưa trả lời phương án.

---

## 2. Mục tiêu SEO tổng thể

Cần tối ưu theo 5 lớp:

### 2.1 Technical SEO

- Có `robots.txt` chuẩn.
- Có `sitemap.xml` động.
- Có canonical URL cho tất cả trang public.
- Không index admin, API, login, preview, draft, trang lỗi.
- Không redirect mọi 404 về trang chủ.
- Có trang 404 riêng, trả đúng status 404.
- Không sinh duplicate content giữa query/filter/page.
- Metadata động theo từng nội dung.
- OpenGraph đầy đủ.
- Twitter Card đầy đủ.
- JSON-LD schema theo từng loại trang.
- Breadcrumb schema.
- `lang="vi-VN"`.
- Semantic HTML chuẩn: `main`, `section`, `article`, `nav`, `header`, `footer`.
- Mỗi trang chỉ có 1 `h1`.
- Ảnh có alt text.
- Tối ưu Core Web Vitals.

### 2.2 Content SEO

- Mỗi trang có title riêng.
- Mỗi trang có description riêng.
- Nội dung có cấu trúc heading rõ ràng.
- Landing page dịch vụ phải có:
  - Vấn đề khách hàng
  - Giải pháp
  - Phạm vi công việc
  - Quy trình
  - Dự án thực tế
  - Báo giá tham khảo
  - Vì sao chọn Hà Thành Home
  - FAQ
  - CTA nhận báo giá / tư vấn
- Không nhồi từ khóa.
- Nội dung phải phục vụ chuyển đổi lead.

### 2.3 Local SEO

Vì Hà Thành Home là doanh nghiệp dịch vụ địa phương, cần tối ưu Local SEO:

- NAP nhất quán:
  - Name: Hà Thành Home
  - Address
  - Phone
  - Email
- Có `LocalBusiness` hoặc `ProfessionalService` schema.
- Có `areaServed`.
- Có `geo` nếu admin có cấu hình tọa độ.
- Có link Google Maps nếu có.
- Footer hiển thị thông tin liên hệ nhất quán.
- Trang liên hệ có schema riêng.

### 2.4 E-E-A-T cho ngành xây dựng – nội thất

Ngành xây dựng/nội thất cần tăng độ tin cậy:

- Hiển thị dự án thực tế.
- Dự án có ảnh thật.
- Dự án có địa điểm, diện tích, quy mô, hạng mục.
- Có quy trình làm việc.
- Có chính sách bảo hành.
- Có năng lực/xưởng sản xuất/đội ngũ nếu có.
- Có đánh giá khách hàng thật, không fake rating.
- Bài viết có author, ngày đăng, ngày cập nhật.
- Bảng giá ghi rõ là chi phí tham khảo.

### 2.5 Conversion SEO

Mỗi landing page cần có:

- CTA rõ trong hero.
- CTA giữa trang nếu trang dài.
- CTA cuối trang.
- Form lead có source URL.
- Internal link tới dự án liên quan.
- Internal link tới bài viết liên quan.
- FAQ đúng intent tìm kiếm.

---

## 3. Kiến trúc file SEO đề xuất

Tạo các helper dùng chung:

```txt
apps/web/src/lib/seo/site.ts
apps/web/src/lib/seo/metadata.ts
apps/web/src/lib/seo/jsonld.ts
apps/web/src/lib/seo/sitemap.ts
apps/web/src/lib/seo/robots.ts
apps/web/src/components/seo/json-ld.tsx
```

Nếu chưa có folder `seo`, tạo mới.

---

## 4. `site.ts`

Tạo file:

```txt
apps/web/src/lib/seo/site.ts
```

Nội dung gợi ý:

```ts
export const siteConfig = {
  name: "Hà Thành Home",
  legalName: "Hà Thành Home",
  description: "Thiết kế, thi công nhà ở, nội thất và công trình trọn gói.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://hathanhhome.vn",
  logo: "/logo.png",
  defaultOgImage: "/og-default.jpg",
  phone: "0962 123 456",
  email: "info@hathanh.vn",
  address: {
    streetAddress: "Số 5 Nguyễn Tất Thành",
    addressLocality: "Hà Nội",
    addressRegion: "Hà Nội",
    addressCountry: "VN",
  },
  sameAs: [],
  areaServed: [
    "Hà Nội",
    "Ninh Bình",
    "Miền Bắc",
    "Việt Nam"
  ],
};
```

Yêu cầu:

- Không hardcode domain trong nhiều nơi.
- Dùng `NEXT_PUBLIC_SITE_URL`.
- Nếu hệ thống đã có API settings public thì ưu tiên lấy dữ liệu từ settings.
- Nếu chưa có thì dùng fallback như trên.

---

## 5. Helper metadata chung

Tạo file:

```txt
apps/web/src/lib/seo/metadata.ts
```

Cần có hàm:

```ts
type SeoInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata(input: SeoInput): Metadata;
```

Yêu cầu:

- Tự build absolute canonical URL.
- Nếu có `canonicalUrl` từ CMS thì ưu tiên.
- Nếu không có image thì dùng default OG image.
- Luôn có OpenGraph.
- Luôn có Twitter card.
- Nếu `noIndex = true` thì set robots noindex, nofollow.
- Title format nên là:

```txt
{Page Title} | Hà Thành Home
```

Nhưng nếu title đã chứa brand thì không lặp brand.

---

## 6. JSON-LD component

Tạo file:

```txt
apps/web/src/components/seo/json-ld.tsx
```

Nội dung:

```tsx
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
```

Yêu cầu:

- Escape `<` để tránh lỗi XSS.
- Không render JSON-LD rỗng.
- Có thể truyền mảng schema.

---

## 7. JSON-LD helper

Tạo file:

```txt
apps/web/src/lib/seo/jsonld.ts
```

Cần có các hàm:

```ts
buildOrganizationSchema()
buildLocalBusinessSchema()
buildWebSiteSchema()
buildBreadcrumbSchema(items)
buildWebPageSchema(input)
buildServiceSchema(input)
buildFAQSchema(items)
buildItemListSchema(items)
buildArticleSchema(post)
buildProjectSchema(project)
buildImageObjectSchema(image)
buildContactPageSchema()
```

---

## 8. Schema toàn site

Trong root layout hoặc component SEO global, thêm schema:

```txt
Organization
LocalBusiness hoặc ProfessionalService
WebSite
```

### 8.1 Organization schema

```ts
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  "name": "Hà Thành Home",
  "url": siteUrl,
  "logo": `${siteUrl}/logo.png`,
  "description": "...",
  "telephone": "...",
  "email": "...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "Hà Nội",
    "addressRegion": "Hà Nội",
    "addressCountry": "VN"
  },
  "sameAs": []
}
```

### 8.2 LocalBusiness / ProfessionalService schema

Ưu tiên dùng schema type hợp lệ. Nếu không chắc subtype ngành xây dựng có hợp lệ không, dùng `ProfessionalService` hoặc `LocalBusiness`.

```ts
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#localbusiness`,
  "name": "Hà Thành Home",
  "image": `${siteUrl}/og-default.jpg`,
  "url": siteUrl,
  "telephone": "...",
  "email": "...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "Hà Nội",
    "addressRegion": "Hà Nội",
    "addressCountry": "VN"
  },
  "areaServed": [
    "Hà Nội",
    "Ninh Bình",
    "Miền Bắc",
    "Việt Nam"
  ],
  "priceRange": "$$"
}
```

Không thêm `aggregateRating` nếu không có đánh giá thật được hiển thị công khai.

### 8.3 WebSite schema

```ts
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  "url": siteUrl,
  "name": "Hà Thành Home",
  "publisher": {
    "@id": `${siteUrl}/#organization`
  },
  "inLanguage": "vi-VN"
}
```

Chỉ thêm `SearchAction` nếu website có trang search thật.

---

## 9. Schema theo từng loại trang

### 9.1 Trang chủ `/`

Schema:

```txt
WebPage
Organization
LocalBusiness / ProfessionalService
ItemList dự án nổi bật
ItemList dịch vụ chính
FAQPage nếu có FAQ hiển thị
BreadcrumbList nếu có breadcrumb
```

SEO title gợi ý:

```txt
Hà Thành Home | Thiết kế thi công nhà ở, nội thất trọn gói
```

Meta description gợi ý:

```txt
Hà Thành Home cung cấp giải pháp thiết kế, thi công nhà ở, nội thất, xây nhà trọn gói và công trình công nghiệp với quy trình minh bạch, tối ưu chi phí.
```

Internal link cần có:

```txt
/dich-vu/xay-nha-tron-goi
/dich-vu/san-xuat-thi-cong-noi-that
/dich-vu/thi-cong-nha-xuong
/dich-vu/thi-cong-noi-that-van-phong
/du-an
/tin-tuc
/lien-he
```

---

### 9.2 Trang giới thiệu `/gioi-thieu`

Schema:

```txt
AboutPage
Organization
BreadcrumbList
ImageObject nếu có ảnh doanh nghiệp/xưởng/đội ngũ
```

Nội dung SEO cần có:

- Lịch sử/năng lực.
- Quy trình.
- Đội ngũ.
- Cam kết.
- Khu vực phục vụ.
- Dự án tiêu biểu.

---

### 9.3 Trang dịch vụ tổng `/dich-vu`

Schema:

```txt
CollectionPage
ItemList các dịch vụ
Service cho từng dịch vụ chính nếu phù hợp
BreadcrumbList
FAQPage nếu có FAQ hiển thị
```

Dịch vụ chính:

```txt
Xây nhà trọn gói
Sản xuất thi công nội thất
Thi công nhà xưởng
Thi công nội thất văn phòng
```

---

### 9.4 Landing page dịch vụ cố định

Áp dụng cho:

```txt
/dich-vu/xay-nha-tron-goi
/dich-vu/san-xuat-thi-cong-noi-that
/dich-vu/thi-cong-nha-xuong
/dich-vu/thi-cong-noi-that-van-phong
```

Schema bắt buộc:

```txt
Service
WebPage
BreadcrumbList
FAQPage nếu có FAQ hiển thị
ItemList dự án liên quan
OfferCatalog nếu có bảng giá/gói dịch vụ
```

Service schema:

```ts
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${url}#service`,
  "name": pageTitle,
  "description": metaDescription,
  "provider": {
    "@id": `${siteUrl}/#organization`
  },
  "areaServed": siteConfig.areaServed,
  "serviceType": "...",
  "url": url
}
```

`serviceType` theo từng trang:

```txt
Xây nhà trọn gói
Sản xuất thi công nội thất
Thi công nhà xưởng
Thi công nội thất văn phòng
```

OfferCatalog schema nếu có bảng giá:

```ts
{
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "name": "Bảng giá tham khảo",
  "itemListElement": [
    {
      "@type": "Offer",
      "name": "Gói cơ bản",
      "description": "...",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "VND"
      }
    }
  ]
}
```

Không ghi `aggregateRating` nếu không có review thật.

Không ghi `price` số nếu giá chỉ là khoảng tham khảo không parse được. Có thể để trong `description`.

---

### 9.5 Trang dự án `/du-an`

Schema:

```txt
CollectionPage
ItemList danh sách dự án
BreadcrumbList
```

SEO cần:

- Có title riêng.
- Có description nói rõ dự án nhà ở, nội thất, công trình.
- Filter không tạo duplicate index.

Canonical query:

```txt
/du-an -> canonical /du-an
/du-an?sort=newest -> canonical /du-an
/du-an?group=interior -> nếu đã có /du-an/noi-that thì canonical /du-an/noi-that
```

Không index quá nhiều URL query/filter.

---

### 9.6 Trang dự án theo nhóm

Routes:

```txt
/du-an/cong-trinh
/du-an/noi-that
```

Schema:

```txt
CollectionPage
ItemList
BreadcrumbList
```

Canonical:

```txt
/du-an/cong-trinh
/du-an/noi-that
```

---

### 9.7 Trang chi tiết dự án `/du-an/[slug]`

Schema:

```txt
WebPage
BreadcrumbList
ImageObject
CreativeWork hoặc Project nếu type hợp lệ
```

Agent phải kiểm tra schema type hợp lệ. Nếu không chắc `Project` có phù hợp không, dùng `CreativeWork` với `additionalProperty`.

Dữ liệu cần đưa vào schema nếu có:

```txt
Tên dự án
Slug
Mô tả
Ảnh đại diện
Gallery
Địa điểm
Diện tích
Quy mô
Loại dự án
Phong cách
Chủ đầu tư nếu public được
Năm hoàn thành
```

SEO:

```txt
Title: {Tên dự án} | Dự án Hà Thành Home
Description: lấy từ mô tả dự án
OG image: ảnh đại diện dự án
```

Breadcrumb:

```txt
Trang chủ
Dự án
Tên dự án
```

---

### 9.8 Trang mẫu kiến trúc

Routes:

```txt
/mau-thiet-ke-kien-truc
/mau-thiet-ke-kien-truc/[slug]
```

List page schema:

```txt
CollectionPage
ItemList
BreadcrumbList
```

Detail page schema:

```txt
WebPage
CreativeWork
ImageObject
BreadcrumbList
FAQPage nếu có
```

SEO ngành:

- Biệt thự
- Nhà phố
- Nhà cấp 4
- Showroom
- Diện tích
- Số tầng
- Phong cách
- Kiểu mái
- Ngân sách
- Vị trí

Title detail gợi ý:

```txt
{Tên mẫu} | Mẫu thiết kế kiến trúc Hà Thành Home
```

---

### 9.9 Trang mẫu nội thất

Routes:

```txt
/mau-thiet-ke-noi-that
/mau-thiet-ke-noi-that/[slug]
```

List page schema:

```txt
CollectionPage
ItemList
BreadcrumbList
```

Detail page schema:

```txt
WebPage
CreativeWork
ImageObject
BreadcrumbList
FAQPage nếu có
```

SEO ngành:

- Phong cách nội thất
- Loại phòng
- Diện tích
- Tone vật liệu
- Ngân sách
- Loại nhà

Title detail gợi ý:

```txt
{Tên mẫu} | Mẫu thiết kế nội thất Hà Thành Home
```

---

### 9.10 Tin tức `/tin-tuc`

Schema:

```txt
CollectionPage
ItemList bài viết
BreadcrumbList
```

Query category:

- Nếu category bằng query thì canonical phù hợp.
- Nếu có route category riêng thì dùng route category sạch.

---

### 9.11 Chi tiết bài viết `/tin-tuc/[slug]`

Schema bắt buộc:

```txt
Article hoặc BlogPosting
BreadcrumbList
ImageObject nếu có ảnh
FAQPage nếu bài có FAQ hiển thị
```

Article schema:

```ts
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.excerpt || post.metaDescription,
  "image": imageUrl,
  "datePublished": post.publishedAt,
  "dateModified": post.updatedAt,
  "author": {
    "@type": "Organization",
    "name": "Hà Thành Home"
  },
  "publisher": {
    "@id": `${siteUrl}/#organization`
  },
  "mainEntityOfPage": canonicalUrl,
  "inLanguage": "vi-VN"
}
```

Yêu cầu:

- Có `datePublished`.
- Có `dateModified`.
- Có author.
- Có publisher.
- Không index bài `draft`, `scheduled`, `archived`.
- Nếu bài chưa published thì `notFound()` hoặc noindex.

---

### 9.12 Trang liên hệ `/lien-he`

Schema:

```txt
ContactPage
LocalBusiness / ProfessionalService
BreadcrumbList
```

Nội dung:

- Tên công ty/brand.
- Điện thoại.
- Email.
- Địa chỉ.
- Bản đồ.
- Form tư vấn.
- Khu vực phục vụ.

---

### 9.13 Trang dự toán công trình nếu có

Nếu có public page hoặc popup dự toán:

Schema:

```txt
WebApplication hoặc WebPage
FAQPage nếu có FAQ
BreadcrumbList nếu có route riêng
```

Không index nếu chỉ là modal nội bộ không có route riêng.

---

## 10. robots.txt

Cần tạo:

```txt
apps/web/src/app/robots.ts
```

Ưu tiên App Router `robots.ts`.

Nội dung gợi ý:

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/login",
          "/preview",
          "/preview/",
          "/draft",
          "/draft/",
          "/*?*preview=",
          "/*?*draft=",
          "/*?*token=",
          "/*?*utm_"
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

Lưu ý:

- Không disallow toàn bộ `/_next/` vì Google cần CSS/JS để render.
- Không chặn ảnh public.
- Không chặn routes public.
- Admin không được index.
- API không được index.
- Query tracking nên canonical/noindex phù hợp.

---

## 11. sitemap.xml động

Tạo:

```txt
apps/web/src/app/sitemap.ts
```

Yêu cầu sitemap gồm:

### 11.1 Static routes

```txt
/
/gioi-thieu
/dich-vu
/dich-vu/xay-nha-tron-goi
/dich-vu/san-xuat-thi-cong-noi-that
/dich-vu/thi-cong-nha-xuong
/dich-vu/thi-cong-noi-that-van-phong
/du-an
/du-an/cong-trinh
/du-an/noi-that
/mau-thiet-ke-kien-truc
/mau-thiet-ke-noi-that
/tin-tuc
/lien-he
```

### 11.2 Dynamic routes

Lấy từ API/database:

```txt
Dự án published
Mẫu kiến trúc published
Mẫu nội thất published
Bài viết published
Danh mục bài viết active nếu có route riêng
Service pages active
```

Không đưa vào sitemap:

```txt
/admin
/api
/login
/preview
/draft
404
not-found
draft content
scheduled content
archived content
lead form endpoint
URL có query filter/sort/search
```

Sitemap item gợi ý:

```ts
{
  url: `${siteUrl}/du-an/${slug}`,
  lastModified: updatedAt || publishedAt,
  changeFrequency: "weekly",
  priority: 0.7
}
```

Priority đề xuất:

```txt
Trang chủ: 1.0
Dịch vụ tổng: 0.9
Trang dịch vụ landing: 0.9
Dự án list: 0.8
Dự án detail: 0.7
Mẫu thiết kế list: 0.8
Mẫu detail: 0.7
Tin tức list: 0.7
Bài viết detail: 0.6
Liên hệ: 0.7
```

Nếu sau này data nhiều, chia sitemap index:

```txt
/sitemap.xml
/sitemap-static.xml
/sitemap-projects.xml
/sitemap-posts.xml
/sitemap-designs.xml
```

Phase hiện tại có thể dùng một `sitemap.ts` trước.

---

## 12. Canonical strategy

Tất cả trang public phải có canonical absolute.

Quy tắc:

```txt
/du-an -> canonical /du-an
/du-an?sort=newest -> canonical /du-an
/du-an?group=interior -> nếu đã có /du-an/noi-that thì canonical /du-an/noi-that
/tin-tuc?category=x -> nếu chưa có route category, canonical tùy chiến lược category; nếu category mỏng thì canonical /tin-tuc
```

Không để cùng một nội dung có nhiều canonical khác nhau.

Dynamic detail:

```txt
/du-an/[slug] canonical chính nó
/tin-tuc/[slug] canonical chính nó
/mau-thiet-ke-kien-truc/[slug] canonical chính nó
/mau-thiet-ke-noi-that/[slug] canonical chính nó
/dich-vu/[fixed-slug] canonical chính nó
```

Nếu CMS có `canonicalUrl`, ưu tiên CMS nhưng phải validate URL.

Không canonical trang 404 về trang chủ.

---

## 13. Bắt buộc: Tạo trang 404 chuẩn SEO

Cần tạo trang 404 riêng cho website public:

```txt
apps/web/src/app/not-found.tsx
```

Mục tiêu:

- Trang 404 phải có giao diện đồng bộ với brand Hà Thành Home.
- Không redirect 404 về trang chủ.
- Trả đúng trạng thái 404 của Next.js.
- Không đưa trang 404 vào sitemap.
- Không canonical trang 404 về trang chủ.
- Không để Google index trang 404.

Nội dung thân thiện:

```txt
Không tìm thấy trang
Trang bạn đang truy cập có thể đã bị xoá, đổi đường dẫn hoặc không còn tồn tại.
```

CTA cần có:

```txt
Về trang chủ
Xem dịch vụ
Xem dự án
Liên hệ tư vấn
```

Link gợi ý:

```txt
/
/dich-vu
/du-an
/tin-tuc
/lien-he
```

Metadata gợi ý:

```ts
export const metadata = {
  title: "Không tìm thấy trang | Hà Thành Home",
  description: "Trang bạn đang truy cập không tồn tại hoặc đã được thay đổi đường dẫn.",
  robots: {
    index: false,
    follow: false,
  },
};
```

Nếu version Next.js hiện tại không hỗ trợ export metadata trong `not-found.tsx`, vẫn cần đảm bảo:

- 404 không có trong sitemap.
- 404 không canonical về home.
- 404 không được index.
- Không redirect tất cả 404 về `/`.

Giao diện gợi ý:

- Nền kem/trắng.
- Số `404` lớn.
- Tiêu đề màu xanh đậm.
- Nút chính màu xanh: `Về trang chủ`.
- Nút phụ: `Xem dịch vụ`, `Xem dự án`.
- Block nhỏ “Bạn có thể cần” với các link nội bộ.

Ví dụ UI structure:

```tsx
import Link from "next/link";
import { Home, BriefcaseBusiness, FolderKanban, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Không tìm thấy trang | Hà Thành Home",
  description: "Trang bạn đang truy cập không tồn tại hoặc đã được thay đổi đường dẫn.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <span>404</span>
        <h1>Không tìm thấy trang</h1>
        <p>Trang bạn đang truy cập có thể đã bị xoá, đổi đường dẫn hoặc không còn tồn tại.</p>

        <div className="not-found-actions">
          <Link href="/">
            <Home size={18} />
            Về trang chủ
          </Link>
          <Link href="/dich-vu">
            <BriefcaseBusiness size={18} />
            Xem dịch vụ
          </Link>
          <Link href="/du-an">
            <FolderKanban size={18} />
            Xem dự án
          </Link>
          <Link href="/lien-he">
            <PhoneCall size={18} />
            Liên hệ tư vấn
          </Link>
        </div>
      </section>
    </main>
  );
}
```

Có thể tạo CSS trong global hoặc CSS module tùy cấu trúc hiện tại.

Không được:

```txt
Redirect mọi 404 về /
Đưa 404 vào sitemap
Gắn canonical 404 về trang chủ
Index trang 404
Hiển thị trang 404 trắng hoặc lỗi mặc định quá sơ sài
```

---

## 14. Metadata admin cần có

Trong admin, cần đảm bảo các entity sau có SEO fields:

### 14.1 Project

```txt
metaTitle
metaDescription
canonicalUrl
ogTitle
ogDescription
ogImage hoặc thumbnailMedia
focusKeyword nếu cần
altText ảnh
```

### 14.2 Architecture Design

```txt
metaTitle
metaDescription
canonicalUrl
ogTitle
ogDescription
thumbnailMedia
altText
```

### 14.3 Interior Design

```txt
metaTitle
metaDescription
canonicalUrl
ogTitle
ogDescription
thumbnailMedia
altText
```

### 14.4 Post

```txt
metaTitle
metaDescription
canonicalUrl
ogTitle
ogDescription
focusKeyword
excerpt
thumbnailMedia
author nếu có
publishedAt
updatedAt
```

### 14.5 Service Page Settings

Mỗi landing page dịch vụ cần tab SEO:

```txt
metaTitle
metaDescription
canonicalUrl
ogTitle
ogDescription
ogImage
noIndex nếu cần
```

Admin UX nên có:

- Counter độ dài title khoảng 50–60 ký tự.
- Counter description khoảng 140–160 ký tự.
- Preview Google snippet.
- Preview social card.
- Cảnh báo nếu thiếu thumbnail/OG image.
- Cảnh báo nếu trùng slug/canonical.

---

## 15. SEO riêng cho ngành xây dựng – nội thất

Agent cần đảm bảo nội dung và schema hỗ trợ các intent chính.

### 15.1 Nhóm từ khóa dịch vụ

```txt
thiết kế thi công nhà ở
xây nhà trọn gói
thi công nội thất trọn gói
sản xuất thi công nội thất
thi công nhà xưởng
thi công nội thất văn phòng
thiết kế nội thất nhà phố
thiết kế biệt thự
thi công nội thất căn hộ
```

### 15.2 Nhóm từ khóa địa phương

```txt
thiết kế thi công nhà ở Hà Nội
thi công nội thất Hà Nội
xây nhà trọn gói Hà Nội
thi công nhà xưởng miền Bắc
thi công nội thất văn phòng Hà Nội
```

Không nhồi từ khóa. Chèn tự nhiên trong:

```txt
H1
H2
Intro
FAQ
Meta
Alt ảnh
Internal links
```

### 15.3 Nội dung bắt buộc ở landing page dịch vụ

Mỗi dịch vụ nên có:

```txt
Vấn đề khách hàng gặp phải
Giải pháp của Hà Thành Home
Phạm vi công việc
Quy trình
Bảng giá tham khảo
Dự án liên quan
Vì sao chọn Hà Thành Home
FAQ
CTA tư vấn
```

### 15.4 Dự án là tài sản SEO quan trọng

Mỗi project detail cần có:

```txt
Tên dự án
Loại công trình
Địa điểm
Diện tích
Phong cách
Quy mô
Hạng mục thực hiện
Mô tả bài toán
Giải pháp triển khai
Kết quả bàn giao
Ảnh thực tế
```

Nếu hiện chưa có đủ fields, không cần thêm DB ngay nhưng cần chuẩn bị schema/data mapping.

---

## 16. Image SEO

Yêu cầu:

- Tất cả ảnh public phải có alt.
- Alt ảnh không nhồi keyword.
- Alt ảnh nên mô tả thật.

Ví dụ:

```txt
Không tốt: thi công nội thất Hà Nội giá rẻ
Tốt: Không gian phòng khách căn hộ hiện đại do Hà Thành Home thi công
```

Yêu cầu kỹ thuật:

- Dùng WebP/AVIF nếu hệ thống đã có media converter.
- Ảnh hero cần priority.
- Ảnh dưới fold lazy load.
- Có width/height tránh CLS.
- File name nên thân thiện nếu upload mới.
- OG image phải là absolute URL.

ImageObject nếu là ảnh chính:

```ts
{
  "@type": "ImageObject",
  "url": imageUrl,
  "caption": title,
  "contentUrl": imageUrl
}
```

---

## 17. Breadcrumb

Tất cả trang ngoài trang chủ cần breadcrumb visible hoặc ít nhất có schema breadcrumb.

Schema:

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
      "name": "Dịch vụ",
      "item": `${siteUrl}/dich-vu`
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": pageTitle,
      "item": canonicalUrl
    }
  ]
}
```

---

## 18. FAQ schema

Chỉ dùng `FAQPage` nếu FAQ hiển thị thật trên trang.

Không dùng FAQ schema cho:

```txt
FAQ ẩn không render
FAQ chỉ có trong config nhưng không hiển thị
FAQ trùng lặp quá nhiều giữa các trang
```

Mỗi landing page dịch vụ nên có 5–8 FAQ riêng.

### 18.1 Xây nhà trọn gói

```txt
Xây nhà trọn gói gồm những hạng mục nào?
Chi phí xây nhà trọn gói tính như thế nào?
Thời gian thi công nhà ở mất bao lâu?
Có phát sinh chi phí không?
Chính sách bảo hành thế nào?
```

### 18.2 Sản xuất thi công nội thất

```txt
Thời gian sản xuất nội thất mất bao lâu?
Có xưởng sản xuất riêng không?
Chi phí nội thất tính theo m2 hay hạng mục?
Có thi công theo thiết kế có sẵn không?
Bảo hành nội thất bao lâu?
```

### 18.3 Thi công nhà xưởng

```txt
Thời gian thi công nhà xưởng mất bao lâu?
Chi phí thi công nhà xưởng được tính thế nào?
Có hỗ trợ xin giấy phép xây dựng không?
Có thi công nhà xưởng trọn gói không?
Nhà xưởng có mở rộng được không?
```

### 18.4 Thi công nội thất văn phòng

```txt
Thời gian thi công nội thất văn phòng mất bao lâu?
Có thi công ngoài giờ hành chính không?
Chi phí đã bao gồm nội thất chưa?
Có thiết kế 2D/3D trước khi thi công không?
Có cải tạo văn phòng đang sử dụng không?
```

---

## 19. OpenGraph và Social SEO

Mỗi page cần có:

```txt
og:title
og:description
og:url
og:image
og:type
og:site_name
twitter:card
twitter:title
twitter:description
twitter:image
```

OG image ưu tiên:

```txt
Project detail: thumbnail project
Post detail: thumbnail post
Service page: hero/ogImage từ config
List page: default og image
404 page: không cần OG đặc biệt, noindex
```

Nếu ảnh không có absolute URL, helper phải convert thành absolute.

---

## 20. Noindex strategy

Noindex các trang:

```txt
/admin
/login
/api
/preview
/draft
/search nếu search không có giá trị SEO
trang filter query quá mỏng
trang không có dữ liệu
draft/scheduled/archived content
not-found / 404
```

Nếu detail page không published:

- Dùng `notFound()`
- Hoặc noindex nếu bắt buộc preview nội bộ

Không để Google index dữ liệu nháp.

---

## 21. Redirect và 404

Yêu cầu:

- Nếu slug đổi, nên có redirect 301 từ slug cũ sang slug mới nếu hệ thống lưu được.
- Nếu không có slug redirect, detail page không tồn tại thì trả 404 thật.
- Không redirect mọi 404 về home.
- Trang 404 cần có title và noindex.
- Trang 404 không có trong sitemap.
- Trang 404 không canonical về trang chủ.

Tạo:

```txt
apps/web/src/app/not-found.tsx
```

Nếu có route detail không tìm thấy dữ liệu, dùng:

```ts
import { notFound } from "next/navigation";

if (!data) {
  notFound();
}
```

Áp dụng cho:

```txt
/du-an/[slug]
/tin-tuc/[slug]
/mau-thiet-ke-kien-truc/[slug]
/mau-thiet-ke-noi-that/[slug]
/dich-vu/[slug] nếu còn route động
```

---

## 22. Internal linking

Cần bổ sung internal link chiến lược.

### 22.1 Từ trang chủ

Link tới:

```txt
/dich-vu/xay-nha-tron-goi
/dich-vu/san-xuat-thi-cong-noi-that
/dich-vu/thi-cong-nha-xuong
/dich-vu/thi-cong-noi-that-van-phong
/du-an
/tin-tuc
/lien-he
```

### 22.2 Từ landing page dịch vụ

Link tới:

```txt
Dự án liên quan
Bài viết liên quan
Trang liên hệ
Trang dự toán nếu có
```

### 22.3 Từ bài viết

Bài viết SEO nên có block internal CTA:

```txt
Cần tư vấn thiết kế thi công?
Xem dự án liên quan
Nhận báo giá
```

---

## 23. Performance SEO

Agent cần kiểm tra:

- Không biến toàn bộ page thành client component nếu không cần.
- JSON-LD render server.
- Metadata render server.
- Dùng `next/image` nếu phù hợp.
- Hero image có `priority`.
- Project grid images lazy.
- Hạn chế animation nặng trên mobile.
- Không load font quá nhiều weight.
- CSS module hoặc global tối ưu.
- Không inline style quá nhiều nếu có thể dùng CSS module.

---

## 24. Files dự kiến cần tạo/sửa

### 24.1 Web

```txt
apps/web/src/lib/seo/site.ts
apps/web/src/lib/seo/metadata.ts
apps/web/src/lib/seo/jsonld.ts
apps/web/src/lib/seo/sitemap.ts
apps/web/src/components/seo/json-ld.tsx
apps/web/src/app/robots.ts
apps/web/src/app/sitemap.ts
apps/web/src/app/layout.tsx
apps/web/src/app/page.tsx
apps/web/src/app/not-found.tsx
apps/web/src/app/dich-vu/page.tsx
apps/web/src/app/dich-vu/xay-nha-tron-goi/page.tsx
apps/web/src/app/dich-vu/san-xuat-thi-cong-noi-that/page.tsx
apps/web/src/app/dich-vu/thi-cong-nha-xuong/page.tsx
apps/web/src/app/dich-vu/thi-cong-noi-that-van-phong/page.tsx
apps/web/src/app/du-an/page.tsx
apps/web/src/app/du-an/[slug]/page.tsx
apps/web/src/app/mau-thiet-ke-kien-truc/page.tsx
apps/web/src/app/mau-thiet-ke-kien-truc/[slug]/page.tsx
apps/web/src/app/mau-thiet-ke-noi-that/page.tsx
apps/web/src/app/mau-thiet-ke-noi-that/[slug]/page.tsx
apps/web/src/app/tin-tuc/page.tsx
apps/web/src/app/tin-tuc/[slug]/page.tsx
apps/web/src/app/lien-he/page.tsx
```

### 24.2 Admin

```txt
apps/admin/src/components/service-page-settings-panel.tsx
apps/admin/src/components/admin-app.tsx
apps/admin/src/lib/service-page-config.ts
```

Admin cần thêm tab SEO cho service page settings nếu chưa có.

### 24.3 API

Nếu cần public setting endpoint:

```txt
apps/api/src/modules/public.controller.ts
apps/api/src/modules/admin.controller.ts
apps/api/src/modules/service-page-registry.ts
```

---

## 25. Implementation phases

### Phase 1: Audit hiện trạng

Agent cần đọc code và báo cáo:

```txt
Metadata hiện ở đâu
Sitemap đã có chưa
Robots đã có chưa
404 đã có chưa
Schema đã có chưa
Các route public hiện tại
Các entity có SEO fields
Các API public đang dùng
```

### Phase 2: SEO infrastructure

- Tạo `siteConfig`.
- Tạo metadata helper.
- Tạo JSON-LD helper.
- Tạo `JsonLd` component.
- Tạo `robots.ts`.
- Tạo `sitemap.ts`.
- Tạo `not-found.tsx`.
- Thêm Organization, LocalBusiness/ProfessionalService, WebSite schema global.

### Phase 3: Metadata từng route

- Home
- About
- Service list
- Service landing pages
- Project list/detail
- Architecture list/detail
- Interior list/detail
- Blog list/detail
- Contact
- 404 noindex

### Phase 4: Schema từng route

- Breadcrumb toàn bộ page.
- Service schema cho landing pages.
- Article schema cho blog.
- ItemList cho list pages.
- CreativeWork/Project schema cho project/design detail.
- FAQ schema cho các page có FAQ.
- ContactPage schema cho liên hệ.

### Phase 5: Admin SEO improvement

- SEO tab cho service page settings.
- SEO preview snippet.
- OG preview.
- Cảnh báo thiếu title/description/image.
- Alt text ảnh nếu media hỗ trợ.
- Noindex option nếu cần.

### Phase 6: Kiểm thử

- Kiểm tra `/robots.txt`.
- Kiểm tra `/sitemap.xml`.
- Kiểm tra `/duong-dan-khong-ton-tai` có trang 404 đúng.
- Kiểm tra 404 không redirect về home.
- Kiểm tra 404 không có trong sitemap.
- View source kiểm tra JSON-LD.
- Kiểm tra canonical.
- Kiểm tra noindex admin/API.
- Build web/admin/api.
- Test các dynamic routes không published.
- Test bằng Rich Results Test sau deploy.

---

## 26. Acceptance checklist

### 26.1 Technical

- [ ] Có `/robots.txt`.
- [ ] Có `/sitemap.xml`.
- [ ] Có `apps/web/src/app/not-found.tsx`.
- [ ] 404 trả đúng 404, không redirect về home.
- [ ] 404 có noindex.
- [ ] 404 không có trong sitemap.
- [ ] Sitemap không chứa admin/API/draft/query rác.
- [ ] Tất cả trang public có canonical.
- [ ] Tất cả trang public có metadata.
- [ ] Dynamic detail page dùng metadata theo dữ liệu CMS.
- [ ] Draft/scheduled/archived không index.
- [ ] API/admin/login noindex hoặc disallow đúng.

### 26.2 Schema

- [ ] Global có Organization.
- [ ] Global có LocalBusiness/ProfessionalService phù hợp.
- [ ] Global có WebSite.
- [ ] Mỗi page có BreadcrumbList nếu không phải home.
- [ ] Service landing page có Service schema.
- [ ] Service landing page có FAQPage nếu có FAQ visible.
- [ ] Service landing page có OfferCatalog nếu có bảng giá.
- [ ] Project list có ItemList.
- [ ] Project detail có CreativeWork/Project schema hợp lệ.
- [ ] Blog detail có Article/BlogPosting.
- [ ] Contact page có ContactPage.
- [ ] Không gắn schema sai cho 404.

### 26.3 Nội dung ngành

- [ ] Landing page dịch vụ có quy trình.
- [ ] Landing page dịch vụ có phạm vi công việc.
- [ ] Landing page dịch vụ có dự án liên quan.
- [ ] Landing page dịch vụ có FAQ riêng.
- [ ] Landing page dịch vụ có CTA.
- [ ] Bảng giá ghi rõ là tham khảo.
- [ ] Không nhồi từ khóa.

### 26.4 Performance

- [ ] Không biến page server thành client nếu không cần.
- [ ] Ảnh hero priority.
- [ ] Ảnh grid lazy.
- [ ] Có alt ảnh.
- [ ] Không CLS lớn do thiếu kích thước ảnh.

---

## 27. Lưu ý quan trọng cho Agent

- Không tự thêm schema type không chắc chắn.
- Nếu không chắc type hợp lệ, dùng type phổ biến hơn như:
  - `LocalBusiness`
  - `ProfessionalService`
  - `Service`
  - `WebPage`
  - `Article`
  - `CollectionPage`
  - `ItemList`
  - `BreadcrumbList`
  - `FAQPage`
  - `ContactPage`
- Không thêm rating/review schema nếu không có review thật hiển thị công khai.
- Không thêm FAQ schema nếu FAQ không hiển thị trên trang.
- Không để robots chặn CSS/JS cần cho Google render.
- Không đưa URL draft hoặc scheduled vào sitemap.
- Không tạo canonical sai sang home.
- Không canonical 404 về home.
- Không redirect mọi 404 về home.
- Không dùng metadata chung cho mọi page.
- Không hardcode domain; dùng `NEXT_PUBLIC_SITE_URL`.
- Nếu thiếu `NEXT_PUBLIC_SITE_URL`, fallback local chỉ dùng dev, production phải set domain thật.
- Không code ngay khi chưa đọc file và trả lời phương án.

---

## 28. Prompt ngắn để Agent bắt đầu

Hãy đọc hệ thống `cuongdesignnb/ha-thanh-home` và triển khai kế hoạch SEO tổng thể theo tài liệu này. Trước khi code, hãy báo cáo hiện trạng SEO hiện tại: metadata, sitemap, robots, schema, 404, route public, API dữ liệu, admin SEO fields. Sau đó chia implementation thành các phase nhỏ. Mục tiêu là toàn bộ website có robots.txt, sitemap.xml động, canonical, metadata động, OpenGraph, Twitter Card, JSON-LD schema tương ứng từng loại trang, trang 404 chuẩn SEO/noindex, và chuẩn SEO riêng cho ngành thiết kế thi công nhà ở – nội thất – xây dựng công trình.