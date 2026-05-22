# Migration Plan: Hà Thành Home — PHP Legacy → NextJS/NestJS

> **Dành cho Agent thực thi.** Đọc kỹ toàn bộ trước khi bắt đầu.

---

## 1. Tổng quan

Migrate toàn bộ content từ website PHP cũ (`d:\Ha Thanh`) sang hệ thống mới (`D:\HT\ha-thanh-home`).

| | Source (PHP cũ) | Target (NestJS mới) |
|--|--|--|
| **Codebase** | `d:\Ha Thanh` (PHP monolith) | `D:\HT\ha-thanh-home` (monorepo) |
| **DB Host** | `localhost:3847` | `localhost:31906` |
| **DB Name** | `dreamhome` | `ha_thanh_home` |
| **DB User** | `dreamhome_user` | `hathanh` |
| **DB Pass** | `dreamhome_pass` | `hathanh_secure_password` |
| **ORM** | PDO (raw SQL) | Prisma v6 |
| **Images** | `https://hathanhhome.vn/uploads/YYYYMM/` | `D:\HT\ha-thanh-home\storage\uploads\` |
| **Docker containers** | `dreamhome_mysql` (port 3847) | `hathanh-mysql` (port 31906) |

---

## 2. Cấu trúc project mới (D:\HT\ha-thanh-home)

```
apps/
  api/        ← NestJS, port 4000 (external: 31875)
    prisma/
      schema.prisma   ← source of truth cho data model
    src/
      modules/        ← controllers, services
    scripts/          ← TẠO MỚI: migrate-legacy.ts ở đây
  web/          ← Next.js public, port 3000 (external: 31873)
  admin/        ← Next.js admin, port 3001 (external: 31874)
storage/
  uploads/      ← images mount volume (container: /app/storage/uploads)
```

---

## 3. Mapping dữ liệu: Cũ → Mới

### 3.1 Bài viết (news → Post + PostCategory)

**Bảng nguồn** `cat_news`:
```
cat_id | cat_name  | cat_url
4      | Tin tức   | tin-tuc
```
→ Tạo **PostCategory**: `{ name: cat_name, slug: cat_url, isActive: cat_status=='true', sortOrder: cat_stt }`

**Bảng nguồn** `news`:
| Field cũ | Field mới (Post) | Ghi chú |
|---|---|---|
| `tintuc_name_vn` | `title` | |
| `tintuc_url` | `slug` | unique |
| `tintuc_desc_vn` | `excerpt` | |
| `tintuc_content_vn` | `contentHtml` | Rewrite img URLs (xem §5.3) |
| `tintuc_thumb` | `thumbnailMediaId` | Qua MediaFile (xem §4) |
| `tintuc_keywords` | `focusKeyword` | |
| `tintuc_description` | `metaDescription` | |
| `tintuc_status == 1` | `status = 'published'` | else `'draft'` |
| `tintuc_time` (unix int) | `publishedAt` | `new Date(tintuc_time * 1000)` |
| `tintuc_hot == 1` | `isFeatured = true` | |
| `tintuc_cat` → lookup cat_news | `categoryId` | FK → PostCategory.id |

---

### 3.2 Công trình (projects → Project)

**Bảng nguồn** `project_cat`:
```
cat_id | cat_name       | cat_url
1      | Trường học     | truong-hoc
2      | Khu đô thị     | khu-do-thi
3      | Nhà xưởng      | nha-xuong
4      | Cầu đường      | cau-duong
```
→ Tạo **ProjectCategory**: `{ group: 'construction', name: cat_name, slug: cat_url }`

**Bảng nguồn** `projects`:
| Field cũ | Field mới (Project) | Ghi chú |
|---|---|---|
| `project_name` | `title` | |
| `project_url` | `slug` | |
| `project_content` | `contentHtml` | Rewrite img URLs |
| `project_thumb` | `thumbnailMediaId` | Qua MediaFile |
| `project_gallery` | `galleryMediaIds` | JSON array paths → MediaFile IDs |
| `project_cat` | `categoryId` | FK → ProjectCategory.id |
| `project_quymo` | `scale` | "3.175.000.000vnđ" → budgetRange |
| `project_quymo_value` | `areaValue` | m² |
| `project_chudautu` | `clientName` | |
| `project_code` | (không có field) | bỏ qua |
| `project_status == 1` | `status = 'published'` | |
| `project_hot == 1` | `isFeatured = true` | |
| `project_datetime` | `publishedAt` | |
| `project_title` | `metaTitle` | |
| `project_description` | `metaDescription` | |
| `group` | `'construction'` | hardcode |

---

### 3.3 Mẫu thiết kế kiến trúc (products cat 18 → ArchitectureDesignTemplate)

Chỉ lấy products có `product_cat LIKE '%18%'` (cat_id=18 = "Mẫu thiết kế kiến trúc").

| Field cũ | Field mới (ArchitectureDesignTemplate) | Ghi chú |
|---|---|---|
| `product_name` | `title` | |
| `product_url` | `slug` | |
| `product_desc` | `contentHtml` | Rewrite img URLs |
| `product_thumb` | `thumbnailMediaId` | Qua MediaFile |
| `product_title` | `metaTitle` | |
| `product_description` | `metaDescription` | |
| `product_keywords` | `focusKeyword` (nếu có trên Post) | bỏ qua nếu model không có |
| `product_hot == 1` | `isFeatured = true` | |
| `product_status == 1` | `status = 'published'` | |
| `product_time` | `publishedAt` | parse string hoặc unix |
| `product_fields` (JSON) | parse → `houseType`, `style`, `floors`, `area`, `roofType` | xem §3.3.1 |

**§3.3.1** `product_fields` là JSON string dạng array objects `[{name, value}]`. Map từng key:
- `"Loại nhà"` → `houseType`
- `"Phong cách"` / `"Style"` → `style`
- `"Số tầng"` → `floors` (parseInt)
- `"Diện tích"` → `area` (parseInt, strip "m²")
- `"Loại mái"` → `roofType`
- `"Mặt tiền"` → `facadeWidth` (parseFloat)

---

### 3.4 Dịch vụ (products cat 16 → Service)

Chỉ lấy products có `product_cat LIKE '%16%'` (cat_id=16 = "Xây nhà trọn gói").

| Field cũ | Field mới (Service) | Ghi chú |
|---|---|---|
| `product_name` | `title` | |
| `product_url` | `slug` | |
| `product_desc` | `contentHtml` | Rewrite img URLs |
| `product_thumb` | `thumbnailMediaId` | Qua MediaFile |
| `product_title` | `metaTitle` | |
| `product_description` | `metaDescription` | |
| `product_status == 1` | `status = 'published'` | |
| `group` | `'construction'` | hardcode |

---

### 3.5 Gallery bài viết (images → galleryMediaIds)

Bảng `images`: `images_groups` = ID của bài viết/sản phẩm, `images_link` = path ảnh.

Sau khi migrate xong §3.1–§3.4, query:
```sql
SELECT images_groups, images_link FROM images WHERE images_link != ''
```
- Map `images_groups` → Post/Project/ArchitectureDesignTemplate ID mới
- Download + tạo MediaFile cho từng `images_link`
- UPDATE record mới: set `galleryMediaIds = JSON array of new MediaFile IDs`

---

### 3.6 Cấu hình (cauhinh → Setting)

Lấy row đầu tiên của bảng `cauhinh`. Map từng field → `Setting` key/value:

| Field cũ | Setting key | Kiểu value |
|---|---|---|
| `cauhinh_siteurl` | `site.url` | string |
| `cauhinh_sitetitle` | `site.title` | string |
| `cauhinh_sitedesc` | `site.description` | string |
| `cauhinh_hotline` | `contact.hotline` | string |
| `cauhinh_email` | `contact.email` | string |
| `cauhinh_diachi` | `contact.address` | string |
| `cauhinh_logomax` | `logo.full` | string (URL) |
| `cauhinh_logomin` | `logo.small` | string (URL) |
| `cauhinh_facebookpage` | `social.facebook` | string |
| `cauhinh_youtube` | `social.youtube` | string |
| `cauhinh_zalo` | `social.zalo` | string |
| `cauhinh_tiktok` | `social.tiktok` | string |
| `cauhinh_analyticid` | `analytics.googleId` | string |

---

## 4. Xử lý ảnh (MediaFile)

### 4.1 Luồng xử lý từng ảnh

```
oldPath (từ DB cũ)
  ↓
Normalize URL: nếu relative "uploads/X" → "https://hathanhhome.vn/uploads/X"
              nếu đã là "https://hathanhhome.vn/..." giữ nguyên
  ↓
Kiểm tra hash MD5 của URL → nếu đã tồn tại trong MediaFile.hash → reuse, skip download
  ↓
Download file → buffer
  ↓
Sharp: convert to WebP (quality 85) + tạo thumbnail (300×200) + medium (800×600)
  ↓
Lưu file vào: storage/uploads/YYYYMM/
  - filename.webp      ← webpUrl
  - filename_thumb.webp ← thumbUrl
  - filename_medium.webp ← mediumUrl
  ↓
INSERT MediaFile {
  originalName, fileName, mimeType: 'image/jpeg', extension: 'webp',
  size, width, height, hash,
  disk: 'local',
  originalUrl: "https://hathanhhome.vn/uploads/...",
  webpUrl: "/storage/uploads/YYYYMM/filename.webp",
  thumbUrl: "/storage/uploads/YYYYMM/filename_thumb.webp",
  mediumUrl: "/storage/uploads/YYYYMM/filename_medium.webp",
  type: MediaType (blog/construction/general tùy ngữ cảnh)
}
  ↓
Return: new MediaFile ID
```

### 4.2 Rate limiting

Delay 150ms giữa mỗi request download để không bị block `hathanhhome.vn`.

### 4.3 Error handling

- Download thất bại (404/timeout) → log vào `migration-errors.json`, set `thumbnailMediaId = null`, tiếp tục
- Không dừng toàn bộ script vì 1 ảnh lỗi

---

## 5. File script cần tạo

### 5.1 Path

```
D:\HT\ha-thanh-home\apps\api\scripts\migrate-legacy.ts
```

### 5.2 Dependencies cần thêm vào apps/api/package.json (nếu chưa có)

```json
"mysql2": "^3.x",
"axios": "^1.x"
```
`sharp` đã có sẵn (v0.34.5). Prisma client đã có sẵn.

### 5.3 Cấu trúc script

```typescript
// migrate-legacy.ts
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// --- CONFIG ---
const SOURCE_DB = {
  host: 'localhost', port: 3847,
  user: 'dreamhome_user', password: 'dreamhome_pass',
  database: 'dreamhome'
};
const STORAGE_BASE = path.resolve(__dirname, '../../../storage/uploads');
const OLD_SITE_URL = 'https://hathanhhome.vn';
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_IMAGES = process.argv.includes('--only-images');

// --- MAIN ---
async function main() {
  const sourceConn = await mysql.createConnection(SOURCE_DB);
  const prisma = new PrismaClient();

  const imageCache = new Map<string, number>(); // oldPath → new MediaFile.id

  // Step 1: Migrate PostCategory (cat_news)
  // Step 2: Migrate Posts (news) — thumbnail trước
  // Step 3: Migrate ProjectCategory (project_cat)
  // Step 4: Migrate Projects (projects)
  // Step 5: Migrate ArchitectureDesignTemplate (products cat 18)
  // Step 6: Migrate Service (products cat 16)
  // Step 7: Migrate Gallery (images table → galleryMediaIds)
  // Step 8: Migrate Settings (cauhinh)

  await sourceConn.end();
  await prisma.$disconnect();
}

main().catch(console.error);
```

### 5.4 Lệnh chạy

```bash
# Từ thư mục D:\HT\ha-thanh-home
cd apps/api

# Dry run - chỉ in log, không write
npx ts-node --project tsconfig.json scripts/migrate-legacy.ts --dry-run

# Chỉ migrate ảnh trước (test)
npx ts-node --project tsconfig.json scripts/migrate-legacy.ts --only-images

# Full migration
npx ts-node --project tsconfig.json scripts/migrate-legacy.ts

# Hoặc chạy trong Docker container hathanh-api
docker exec hathanh-api npx ts-node scripts/migrate-legacy.ts
```

---

## 6. Rewrite URLs trong contentHtml (§5.3)

Trong `contentHtml` của Post/Project/ArchitectureDesignTemplate, các `<img src>` thường chứa:
- `https://hathanhhome.vn/uploads/...` → thay bằng `/storage/uploads/...`
- `http://hathanhhome.vn/uploads/...` → thay bằng `/storage/uploads/...`
- `uploads/202xxx/...` (relative) → thay bằng `/storage/uploads/...`

**Regex rewrite** (áp dụng trước khi INSERT):
```typescript
function rewriteContentUrls(html: string): string {
  return html
    .replace(/https?:\/\/hathanhhome\.vn\/uploads\//gi, '/storage/uploads/')
    .replace(/(?<!['"\/])uploads\//g, '/storage/uploads/');
}
```

---

## 7. Thứ tự thực thi (quan trọng — FK dependencies)

```
1. PostCategory     (no deps)
2. ProjectCategory  (no deps)
3. MediaFile        (no deps — chạy trước để có IDs)
4. Post             (deps: PostCategory, MediaFile)
5. Project          (deps: ProjectCategory, MediaFile)
6. ArchitectureDesignTemplate  (deps: MediaFile)
7. Service          (deps: MediaFile)
8. Gallery update   (deps: MediaFile, Post/Project IDs)
9. Setting          (no deps)
```

---

## 8. Idempotency (quan trọng)

Tất cả INSERT dùng Prisma `upsert` theo `slug` (unique field). Script có thể chạy lại nhiều lần mà không duplicate data.

**MediaFile** upsert theo `hash` (MD5 của `originalUrl`).

---

## 9. Kiểm tra sau migration

```bash
# Kiểm tra số lượng record mới
docker exec hathanh-mysql mysql -u hathanh -phathanh_secure_password ha_thanh_home \
  -e "SELECT 'posts' t, COUNT(*) n FROM Post UNION
      SELECT 'projects', COUNT(*) FROM Project UNION
      SELECT 'arch_templates', COUNT(*) FROM ArchitectureDesignTemplate UNION
      SELECT 'services', COUNT(*) FROM Service UNION
      SELECT 'media_files', COUNT(*) FROM MediaFile;"

# Test API endpoint
curl http://localhost:31875/api/posts?limit=5
curl http://localhost:31875/api/projects?limit=5
```

Kết quả mong đợi:
- Posts: 25+
- Projects: 1+ (từ bảng `projects`)
- ArchitectureDesignTemplate: tùy số sản phẩm cat 18
- Services: tùy số sản phẩm cat 16
- MediaFile: 50+ (mỗi bài viết/sản phẩm ít nhất 1 ảnh)

---

## 10. Bắt đầu từ đâu?

**→ Bắt đầu từ NestJS side (`apps/api/scripts/`)**

**Lý do:**
1. PHP là nguồn dữ liệu — không cần sửa code PHP, chỉ đọc từ DB cũ
2. Script migration chạy trong context Node.js/TypeScript, dùng Prisma client sẵn có
3. `sharp` (image processing) và các dependencies đã có trong `apps/api/package.json`
4. Chạy 1 lần duy nhất (hoặc idempotent nếu cần chạy lại) — không ảnh hưởng PHP site

**PHP side không cần thay đổi gì** — chỉ cần DB vẫn đang chạy tại `localhost:3847`.

---

## 11. Files liên quan để đọc trước khi code

| File | Mục đích |
|---|---|
| `D:\HT\ha-thanh-home\apps\api\prisma\schema.prisma` | Data models đích, tên fields chính xác |
| `D:\HT\ha-thanh-home\apps\api\src\` | NestJS modules để hiểu cách API đang hoạt động |
| `d:\Ha Thanh\sql_hathanhhome_.sql` | Schema + sample data của DB cũ |
| `D:\HT\ha-thanh-home\docker-compose.yml` | Port mapping, network config |
| `D:\HT\ha-thanh-home\.env.docker` | Environment variables thực tế |

---

## 12. Lỗi thường gặp và cách xử lý

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `slug duplicate` | Bài viết trùng URL | Dùng `upsert` thay `create` |
| `ECONNREFUSED localhost:3847` | Docker cũ chưa chạy | `docker compose -f "d:\Ha Thanh\docker-compose.yml" up -d` |
| `sharp: unsupported image format` | File ảnh bị corrupt | catch error, skip, log |
| `axios 404` | Ảnh không tồn tại trên hathanhhome.vn | log vào errors, set thumbnail null |
| `hash unique constraint` | Ảnh đã được migrate | `upsert` theo hash → reuse ID |
