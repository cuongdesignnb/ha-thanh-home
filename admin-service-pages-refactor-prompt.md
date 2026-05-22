# Prompt refactor Admin Dịch vụ sang cấu hình landing page cố định

## Bối cảnh

Repo: `cuongdesignnb/ha-thanh-home`

Hiện trạng:

- Web dùng Next.js App Router.
- Admin đang có module `services` dạng CRUD để đăng dịch vụ động.
- API đang có CRUD `/api/cms/services`.
- Route `/dich-vu/xay-nha-tron-goi` đã có sẵn.

Hướng mới:

> Không dùng admin để đăng từng dịch vụ động nữa. Mục **Dịch vụ** trong admin sẽ trở thành nơi cấu hình các landing page dịch vụ cố định theo từng section UX/UI.

4 trang dịch vụ cố định:

1. `Xây nhà trọn gói` — `/dich-vu/xay-nha-tron-goi`
2. `Sản Xuất Thi Công Nội Thất` — `/dich-vu/san-xuat-thi-cong-noi-that`
3. `Thi Công Nhà Xưởng` — `/dich-vu/thi-cong-nha-xuong`
4. `Thi Công Nội Thất Văn Phòng` — `/dich-vu/thi-cong-noi-that-van-phong`

Trang làm đầu tiên ở phase sau: **Sản Xuất Thi Công Nội Thất**.

---

## Mục tiêu phase 1

Phase này chỉ xử lý nền admin trước:

- Gỡ module đăng dịch vụ động khỏi admin.
- Không còn nút `Thêm dịch vụ`.
- Không còn danh sách CRUD service động.
- Không còn form tạo/sửa service động.
- Chuẩn bị module mới `Dịch vụ` để quản lý 4 trang landing page cố định.
- Chuẩn bị registry 4 trang dịch vụ.
- Chuẩn bị schema cấu hình section cho phase sau.
- Không làm vỡ route `/dich-vu/xay-nha-tron-goi`.
- Không triển khai full public page mới trong phase này.
- Không xóa Prisma model `Service` ngay nếu vẫn còn dependency.

---

## File cần kiểm tra

```txt
apps/admin/src/components/admin-app.tsx
apps/api/src/modules/admin.controller.ts
apps/api/prisma/schema.prisma
apps/web/src/app/dich-vu/page.tsx
apps/web/src/app/dich-vu/[slug]/page.tsx
apps/web/src/app/dich-vu/xay-nha-tron-goi/page.tsx
```

---

## 1. Gỡ module CRUD `services` khỏi admin

Trong `apps/admin/src/components/admin-app.tsx`:

- Bỏ `services` khỏi union type `Entity` nếu không còn dùng.
- Bỏ item sidebar cũ:

```ts
{ id: "services", label: "Dịch vụ", description: "Dịch vụ công trình và nội thất" }
```

- Bỏ `moduleMeta.services`.
- Bỏ `entitySingular.services`.
- Bỏ các điều kiện `entity === "services"` trong toolbar/filter/form/gallery/status/sortOrder/public preview.
- Đảm bảo `EntityPanel` không còn xử lý service động.
- Đảm bảo TypeScript không lỗi vì thiếu key trong `Record<Entity, ...>`.

Kết quả mong muốn: admin không còn nơi đăng dịch vụ động.

---

## 2. Tạo module mới `service-pages`

Thêm entity mới:

```ts
type Entity =
  | "dashboard"
  | "projects"
  | "project-categories"
  | "project-filter-options"
  | "architecture-designs"
  | "interior-designs"
  | "service-pages"
  | "posts"
  | "post-categories"
  | "leads"
  | "media"
  | "ai"
  | "menus"
  | "estimator"
  | "settings";
```

Sidebar item mới:

```ts
{
  id: "service-pages",
  label: "Dịch vụ",
  description: "Cấu hình các landing page dịch vụ",
  icon: BriefcaseBusiness,
  roles: ["Super Admin", "Admin", "Viewer"],
}
```

`service-pages` không được đưa vào `EntityPanel`. Nó phải render panel riêng.

Trong `AdminApp` thêm case:

```tsx
) : active === "service-pages" ? (
  <ServicePagesPanel />
) : (
  <EntityPanel entity={active} roles={user.roles} />
)
```

---

## 3. Tạo registry 4 trang dịch vụ

Tạo file:

```txt
apps/admin/src/lib/service-page-registry.ts
```

Nội dung:

```ts
export type ServicePageStatus = "existing" | "next" | "planned";

export type ServicePageRegistryItem = {
  slug: string;
  label: string;
  route: string;
  settingKey: string;
  status: ServicePageStatus;
  description: string;
};

export const SERVICE_PAGE_REGISTRY: ServicePageRegistryItem[] = [
  {
    slug: "xay-nha-tron-goi",
    label: "Xây nhà trọn gói",
    route: "/dich-vu/xay-nha-tron-goi",
    settingKey: "site.servicePages.xayNhaTronGoi",
    status: "existing",
    description: "Landing page xây nhà trọn gói hiện đã có route public.",
  },
  {
    slug: "san-xuat-thi-cong-noi-that",
    label: "Sản Xuất Thi Công Nội Thất",
    route: "/dich-vu/san-xuat-thi-cong-noi-that",
    settingKey: "site.servicePages.sanXuatThiCongNoiThat",
    status: "next",
    description: "Landing page sản xuất và thi công nội thất trọn gói theo UX/UI đã thiết kế.",
  },
  {
    slug: "thi-cong-nha-xuong",
    label: "Thi Công Nhà Xưởng",
    route: "/dich-vu/thi-cong-nha-xuong",
    settingKey: "site.servicePages.thiCongNhaXuong",
    status: "planned",
    description: "Landing page thi công nhà xưởng.",
  },
  {
    slug: "thi-cong-noi-that-van-phong",
    label: "Thi Công Nội Thất Văn Phòng",
    route: "/dich-vu/thi-cong-noi-that-van-phong",
    settingKey: "site.servicePages.thiCongNoiThatVanPhong",
    status: "planned",
    description: "Landing page thi công nội thất văn phòng.",
  },
];
```

---

## 4. Tạo `ServicePagesPanel`

Tạo file:

```txt
apps/admin/src/components/service-pages-panel.tsx
```

Panel cần hiển thị:

- Tiêu đề: `Cấu hình trang dịch vụ`
- Mô tả: `Quản lý các landing page dịch vụ cố định, không dùng đăng dịch vụ động.`
- Grid 4 card theo registry.
- Mỗi card gồm:
  - Tên trang
  - Route public
  - Setting key
  - Trạng thái
  - Mô tả
  - Nút `Xem website`
  - Nút `Cấu hình section` tạm disabled hoặc placeholder

Pseudo code:

```tsx
import { ExternalLink, Settings } from "lucide-react";
import { SERVICE_PAGE_REGISTRY } from "@/lib/service-page-registry";

export function ServicePagesPanel() {
  return (
    <section className="service-pages-panel">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <h2>Cấu hình trang dịch vụ</h2>
            <p>Quản lý các landing page dịch vụ cố định, không dùng đăng dịch vụ động.</p>
          </div>
        </div>

        <div className="service-page-card-grid">
          {SERVICE_PAGE_REGISTRY.map((item) => (
            <article className="service-page-card" key={item.slug}>
              <span>{item.status}</span>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
              <code>{item.route}</code>
              <small>{item.settingKey}</small>
              <div className="service-page-card-actions">
                <a href={`${getWebBaseUrl()}${item.route}`} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Xem website
                </a>
                <button type="button" disabled>
                  <Settings size={16} /> Cấu hình section - phase sau
                </button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
```

Nếu `getWebBaseUrl()` đang nằm trong `admin-app.tsx`, hãy tách helper để component mới dùng được.

---

## 5. Chuẩn bị type cấu hình section

Tạo file:

```txt
apps/admin/src/lib/service-page-config.ts
```

Nội dung gợi ý:

```ts
export type ServicePageConfig = {
  slug: string;
  title: string;
  isActive: boolean;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };

  hero: {
    eyebrow?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    primaryCtaLabel?: string;
    primaryCtaUrl?: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
  };

  benefits: Array<{ icon?: string; title: string; description?: string }>;

  intro: {
    eyebrow?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    checklist?: string[];
  };

  scopeItems: Array<{ icon?: string; title: string; description?: string }>;

  processSteps: Array<{ number?: string; title: string; description?: string }>;

  relatedProjects?: {
    title?: string;
    group?: "construction" | "interior" | "xay_nha_tron_goi";
    categoryIds?: number[];
    categorySlugs?: string[];
    projectIds?: number[];
    limit?: number;
    mode?: "latest" | "featured" | "manual" | "category";
    tabs?: Array<{
      label: string;
      key: string;
      group?: "construction" | "interior" | "xay_nha_tron_goi";
      categoryIds?: number[];
      projectIds?: number[];
    }>;
  };

  pricing?: {
    enabled: boolean;
    title?: string;
    description?: string;
    tabs?: Array<{
      label: string;
      key: string;
      imageUrl?: string;
      priceText?: string;
      items?: string[];
    }>;
  };

  quoteForm?: {
    enabled: boolean;
    title?: string;
    description?: string;
    fields?: string[];
  };

  whyChooseItems?: Array<{ icon?: string; title: string; description?: string }>;

  stats?: Array<{ value: string; label: string }>;

  testimonials?: Array<{
    name: string;
    project?: string;
    avatarUrl?: string;
    rating?: number;
    quote: string;
  }>;

  faqs: Array<{ question: string; answer: string }>;

  finalCta: {
    eyebrow?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    primaryLabel?: string;
    primaryUrl?: string;
    secondaryLabel?: string;
    secondaryUrl?: string;
  };
};
```

Phase này chỉ cần chuẩn bị type, chưa cần form chi tiết.

---

## 6. Hướng lưu dữ liệu phase sau

Dùng bảng `Setting` hiện có để lưu JSON cấu hình landing page.

Key đề xuất:

```txt
site.servicePages.xayNhaTronGoi
site.servicePages.sanXuatThiCongNoiThat
site.servicePages.thiCongNhaXuong
site.servicePages.thiCongNoiThatVanPhong
```

Phase sau có thể thêm API riêng:

```txt
GET   /api/cms/service-pages
GET   /api/cms/service-pages/:slug
PATCH /api/cms/service-pages/:slug
```

Endpoint này map `slug` sang `settingKey`, sau đó đọc/ghi bảng `Setting`.

---

## 7. Cập nhật menu suggestion

Trong file:

```txt
apps/api/src/modules/admin.controller.ts
```

Tìm hàm:

```ts
menuLinkSuggestions()
```

Thêm các route cố định:

```ts
["Xây nhà trọn gói", "/dich-vu/xay-nha-tron-goi"],
["Sản Xuất Thi Công Nội Thất", "/dich-vu/san-xuat-thi-cong-noi-that"],
["Thi Công Nhà Xưởng", "/dich-vu/thi-cong-nha-xuong"],
["Thi Công Nội Thất Văn Phòng", "/dich-vu/thi-cong-noi-that-van-phong"],
```

Mục tiêu cuối: menu ngoài website có parent `Dịch vụ` và 4 submenu trên.

Nếu vẫn còn suggestion từ bảng `service`, hãy để TODO bỏ ở phase sau khi frontend đã chuyển hoàn toàn sang service page cố định.

---

## 8. Phase sau: trang Sản Xuất Thi Công Nội Thất

Route:

```txt
/dich-vu/san-xuat-thi-cong-noi-that
```

Các section theo UX/UI:

1. Header + menu.
2. Hero có breadcrumb, ảnh nền nội thất, tiêu đề lớn, mô tả, CTA báo giá và CTA tư vấn.
3. Dải lợi ích icon:
   - Thi công chuẩn thiết kế
   - Xưởng sản xuất trực tiếp
   - Chất liệu minh bạch
   - Tiến độ rõ ràng
   - Bảo hành tận tâm
   - Đội ngũ lành nghề
4. Intro 2 cột: ảnh + nội dung giới thiệu.
5. Phạm vi công việc dạng icon grid.
6. Quy trình 7 bước.
7. Dự án nội thất tiêu biểu.
8. Dự toán chi phí nội thất có tabs hardcode.
9. Form nhận báo giá.
10. Vì sao chọn Hà Thành Home.
11. Stats.
12. Testimonials.
13. FAQ.
14. Final CTA.
15. Footer.

Phần `Dự án nội thất tiêu biểu` sau này phải cho admin chọn nguồn:

- Theo group/category.
- Theo featured.
- Chọn thủ công project IDs.
- Giới hạn số lượng.
- Có thể cấu hình tab hardcode theo UX/UI.

---

## Checklist hoàn thành phase 1

- [ ] Admin không còn module CRUD service động.
- [ ] Không còn nút `Thêm dịch vụ`.
- [ ] Không còn form đăng service động.
- [ ] Có module/panel mới `Dịch vụ` cho 4 service pages cố định.
- [ ] Có registry 4 trang dịch vụ cố định.
- [ ] Có type `ServicePageConfig` chuẩn bị cho phase sau.
- [ ] Menu suggestion có đủ 4 route dịch vụ cố định.
- [ ] Route `/dich-vu/xay-nha-tron-goi` không bị ảnh hưởng.
- [ ] Không còn lỗi TypeScript.
- [ ] Build admin/web/api không lỗi.

---

## Prompt ngắn cho Codex/Agent

Refactor admin dự án `cuongdesignnb/ha-thanh-home` theo tài liệu này. Phase hiện tại chỉ gỡ module CRUD `services` khỏi admin và chuẩn bị module `Dịch vụ` mới cho 4 landing page dịch vụ cố định. Không triển khai full public page mới trong phase này. Không xóa Prisma model `Service` nếu chưa chắc chắn. Đảm bảo admin không còn chỗ đăng dịch vụ động, không còn nút `Thêm dịch vụ`, TypeScript build không lỗi, route `/dich-vu/xay-nha-tron-goi` vẫn hoạt động.
