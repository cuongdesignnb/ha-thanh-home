import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import axios from "axios";
import sharp from "sharp";
import mysql from "mysql2/promise";
import { ContentStatus, MediaType, PrismaClient, ProjectGroup } from "@prisma/client";

// --------------- CONFIG ---------------

const SOURCE_DB = {
  host: process.env.LEGACY_DB_HOST ?? "127.0.0.1",
  port: Number(process.env.LEGACY_DB_PORT ?? 3847),
  user: process.env.LEGACY_DB_USER ?? "dreamhome_user",
  password: process.env.LEGACY_DB_PASS ?? "dreamhome_pass",
  database: process.env.LEGACY_DB_NAME ?? "dreamhome",
};

const STORAGE_BASE = path.resolve(__dirname, "..", "..", "..", "storage", "uploads");
const PUBLIC_PREFIX = process.env.PUBLIC_UPLOAD_URL?.replace(/\/$/, "") || "http://localhost:31875/uploads";
const OLD_SITE_URL = "https://hathanhhome.vn";

const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_IMAGES = process.argv.includes("--only-images");
const SKIP_IMAGES = process.argv.includes("--skip-images");
const ONLY_PRODUCTS = process.argv.includes("--only-products");
const DOWNLOAD_DELAY_MS = 150;

const ERRORS_FILE = path.resolve(__dirname, "migrate-legacy-errors.json");
const errors: Array<{ stage: string; url?: string; parent?: string; error: string }> = [];

// --------------- UTILITIES ---------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function md5(s: string) {
  return crypto.createHash("md5").update(s).digest("hex");
}

function cleanSlug(raw: unknown): string {
  if (raw == null) return "";
  return String(raw).trim().replace(/\//g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function parseUnixString(s: unknown): Date | null {
  if (s == null) return null;
  const str = String(s).trim();
  if (!str) return null;
  const n = parseInt(str, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000);
}

function parseMaybeDate(v: unknown): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return v;
  const fromStr = parseUnixString(v);
  if (fromStr) return fromStr;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

function normalizeOldUrl(p: string): string | null {
  if (!p) return null;
  const t = p.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return `${OLD_SITE_URL}${t}`;
  return `${OLD_SITE_URL}/${t}`;
}

function parseJsonField<T = unknown>(raw: unknown): T | null {
  if (raw == null) return null;
  if (typeof raw === "object") return raw as T;
  const s = String(raw).trim();
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function rewriteContentUrls(html: string, rewriteMap: Map<string, string>): string {
  if (!html) return html;
  let out = html;
  for (const [oldUrl, newUrl] of rewriteMap) {
    const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "g"), newUrl);
  }
  out = out
    .replace(/https?:\/\/hathanhhome\.vn\/uploads\//gi, `${PUBLIC_PREFIX}/`)
    .replace(/(^|[^\w\/'"-])uploads\//g, (_m, p) => `${p}${PUBLIC_PREFIX}/`);
  return out;
}

function extractImgSrcs(html: string): string[] {
  if (!html) return [];
  const re = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi;
  const urls = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[1]) urls.add(m[1]);
  }
  return Array.from(urls);
}

// --------------- IMAGE PIPELINE ---------------

interface DownloadCtx {
  parentTitle?: string;
  type: MediaType;
}

const imageCacheByUrl = new Map<string, number>();

async function downloadAndStoreImage(
  rawUrl: string,
  ctx: DownloadCtx,
  prisma: PrismaClient,
): Promise<number | null> {
  const absoluteUrl = normalizeOldUrl(rawUrl);
  if (!absoluteUrl) return null;

  if (imageCacheByUrl.has(absoluteUrl)) {
    return imageCacheByUrl.get(absoluteUrl)!;
  }

  const hash = md5(absoluteUrl);

  const existing = await prisma.mediaFile.findUnique({ where: { hash } });
  if (existing) {
    imageCacheByUrl.set(absoluteUrl, existing.id);
    return existing.id;
  }

  if (DRY_RUN) {
    console.log(`  [dry-run] would download ${absoluteUrl}`);
    imageCacheByUrl.set(absoluteUrl, -1);
    return null;
  }

  try {
    await sleep(DOWNLOAD_DELAY_MS);

    const resp = await axios.get<ArrayBuffer>(absoluteUrl, {
      responseType: "arraybuffer",
      timeout: 30_000,
      validateStatus: (s) => s >= 200 && s < 300,
      maxRedirects: 5,
    });

    const buf = Buffer.from(resp.data);
    const origName = path.basename(new URL(absoluteUrl).pathname);

    const urlPath = new URL(absoluteUrl).pathname;
    const monthMatch = urlPath.match(/\/uploads\/(\d{6})\//);
    const yyyymm = monthMatch ? monthMatch[1] : new Date().toISOString().slice(0, 7).replace("-", "");

    const baseName = path.basename(origName, path.extname(origName)) || `img-${hash.slice(0, 8)}`;
    const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, "-");

    const monthDir = path.join(STORAGE_BASE, yyyymm);
    fs.mkdirSync(monthDir, { recursive: true });

    const fullFile = path.join(monthDir, `${safeBase}.webp`);
    const thumbFile = path.join(monthDir, `${safeBase}_thumb.webp`);
    const mediumFile = path.join(monthDir, `${safeBase}_medium.webp`);

    const pipeline = sharp(buf, { failOn: "none" });
    const meta = await pipeline.metadata();

    const fullBuf = await sharp(buf, { failOn: "none" }).webp({ quality: 85 }).toBuffer();
    const mediumBuf = await sharp(buf, { failOn: "none" })
      .resize({ width: 800, height: 600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const thumbBuf = await sharp(buf, { failOn: "none" })
      .resize({ width: 300, height: 200, fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer();

    fs.writeFileSync(fullFile, fullBuf);
    fs.writeFileSync(mediumFile, mediumBuf);
    fs.writeFileSync(thumbFile, thumbBuf);

    const record = await prisma.mediaFile.create({
      data: {
        originalName: origName,
        fileName: `${safeBase}.webp`,
        mimeType: "image/webp",
        extension: "webp",
        size: fullBuf.length,
        width: meta.width ?? null,
        height: meta.height ?? null,
        hash,
        disk: "local",
        originalUrl: absoluteUrl,
        webpUrl: `${PUBLIC_PREFIX}/${yyyymm}/${safeBase}.webp`,
        thumbUrl: `${PUBLIC_PREFIX}/${yyyymm}/${safeBase}_thumb.webp`,
        mediumUrl: `${PUBLIC_PREFIX}/${yyyymm}/${safeBase}_medium.webp`,
        altText: ctx.parentTitle ?? null,
        type: ctx.type,
      },
    });

    imageCacheByUrl.set(absoluteUrl, record.id);
    return record.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ! image failed ${absoluteUrl}: ${msg}`);
    errors.push({ stage: "image", url: absoluteUrl, parent: ctx.parentTitle, error: msg });
    imageCacheByUrl.set(absoluteUrl, -1);
    return null;
  }
}

async function downloadAndRewriteContent(
  html: string,
  parentTitle: string,
  type: MediaType,
  prisma: PrismaClient,
): Promise<string> {
  if (!html) return html;
  const srcs = extractImgSrcs(html);
  const rewriteMap = new Map<string, string>();

  for (const src of srcs) {
    const abs = normalizeOldUrl(src);
    if (!abs) continue;
    const id = await downloadAndStoreImage(src, { parentTitle, type }, prisma);
    if (id != null && id > 0) {
      const media = await prisma.mediaFile.findUnique({ where: { id }, select: { webpUrl: true } });
      if (media?.webpUrl) {
        rewriteMap.set(src, media.webpUrl);
      }
    }
  }

  return rewriteContentUrls(html, rewriteMap);
}

// --------------- MIGRATION STEPS ---------------

async function migratePostCategories(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ PostCategories");
  const [rows] = await src.execute("SELECT * FROM cat_news");
  for (const row of rows as any[]) {
    const slug = (row.cat_url && String(row.cat_url).trim()) || slugify(String(row.cat_name));
    if (DRY_RUN) {
      console.log(`  [dry-run] upsert PostCategory slug=${slug}`);
      continue;
    }
    await prisma.postCategory.upsert({
      where: { slug },
      create: {
        name: String(row.cat_name),
        slug,
        sortOrder: Number(row.cat_stt) || 0,
        isActive: row.cat_status === "true" || row.cat_status === 1 || row.cat_status === "1",
      },
      update: {
        name: String(row.cat_name),
        sortOrder: Number(row.cat_stt) || 0,
        isActive: row.cat_status === "true" || row.cat_status === 1 || row.cat_status === "1",
      },
    });
  }
}

async function migrateProjectCategories(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ ProjectCategories");
  const [rows] = await src.execute("SELECT * FROM project_cat");
  for (const row of rows as any[]) {
    const slug = (row.cat_url && String(row.cat_url).trim()) || slugify(String(row.cat_name));
    if (DRY_RUN) {
      console.log(`  [dry-run] upsert ProjectCategory slug=${slug}`);
      continue;
    }
    await prisma.projectCategory.upsert({
      where: { slug },
      create: {
        group: ProjectGroup.construction,
        name: String(row.cat_name),
        slug,
        sortOrder: Number(row.cat_stt) || 0,
        isActive: row.cat_status === "true" || row.cat_status === 1 || row.cat_status === "1" || row.cat_status == null,
      },
      update: {
        name: String(row.cat_name),
        sortOrder: Number(row.cat_stt) || 0,
      },
    });
  }
}

async function migratePosts(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ Posts");
  const [rows] = await src.execute("SELECT * FROM news ORDER BY tintuc_id");

  const cats = await prisma.postCategory.findMany();
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  const [legacyCats] = await src.execute("SELECT cat_id, cat_url FROM cat_news");
  const legacyCatIdToSlug = new Map<number, string>();
  for (const r of legacyCats as any[]) {
    legacyCatIdToSlug.set(Number(r.cat_id), String(r.cat_url));
  }

  for (const row of rows as any[]) {
    const title = String(row.tintuc_name_vn ?? "").trim();
    if (!title) continue;
    const slug = (cleanSlug(row.tintuc_url) || slugify(title));

    const catId = Number(row.tintuc_cat);
    const catSlug = legacyCatIdToSlug.get(catId);
    const categoryId = catSlug ? catBySlug.get(catSlug) ?? null : null;

    const status: ContentStatus =
      row.tintuc_status == null || String(row.tintuc_status) === "1"
        ? ContentStatus.published
        : ContentStatus.draft;

    const publishedAt = parseMaybeDate(row.tintuc_time);

    if (DRY_RUN) {
      console.log(`  [dry-run] upsert Post slug=${slug} title="${title.slice(0, 50)}"`);
      continue;
    }

    let thumbnailMediaId: number | null = null;
    if (row.tintuc_thumb) {
      thumbnailMediaId = await downloadAndStoreImage(
        String(row.tintuc_thumb),
        { parentTitle: title, type: MediaType.blog },
        prisma,
      );
    }

    const rewrittenContent = await downloadAndRewriteContent(
      String(row.tintuc_content_vn ?? ""),
      title,
      MediaType.blog,
      prisma,
    );

    await prisma.post.upsert({
      where: { slug },
      create: {
        title,
        slug,
        categoryId,
        excerpt: row.tintuc_desc_vn ? String(row.tintuc_desc_vn) : null,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        metaTitle: row.tintuc_title ? String(row.tintuc_title) : null,
        metaDescription: row.tintuc_description ? String(row.tintuc_description) : null,
        focusKeyword: row.tintuc_keywords ? String(row.tintuc_keywords) : null,
        status,
        isFeatured: String(row.tintuc_hot) === "1",
        publishedAt,
      },
      update: {
        title,
        categoryId,
        excerpt: row.tintuc_desc_vn ? String(row.tintuc_desc_vn) : null,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        metaTitle: row.tintuc_title ? String(row.tintuc_title) : null,
        metaDescription: row.tintuc_description ? String(row.tintuc_description) : null,
        focusKeyword: row.tintuc_keywords ? String(row.tintuc_keywords) : null,
        status,
        isFeatured: String(row.tintuc_hot) === "1",
        publishedAt,
      },
    });
  }
}

async function migrateProjects(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ Projects");
  const [rows] = await src.execute("SELECT * FROM projects ORDER BY project_id");

  const cats = await prisma.projectCategory.findMany();
  const catById = new Map<number, number>();
  const [legacyCats] = await src.execute("SELECT cat_id, cat_url FROM project_cat");
  for (const r of legacyCats as any[]) {
    const slug = String(r.cat_url);
    const newCat = cats.find((c) => c.slug === slug);
    if (newCat) catById.set(Number(r.cat_id), newCat.id);
  }

  for (const row of rows as any[]) {
    const title = String(row.project_name ?? "").trim();
    if (!title) continue;
    const slug = (cleanSlug(row.project_url) || slugify(title));

    const status: ContentStatus =
      String(row.project_status) === "1" ? ContentStatus.published : ContentStatus.draft;

    const publishedAt = parseMaybeDate(row.project_datetime);

    if (DRY_RUN) {
      console.log(`  [dry-run] upsert Project slug=${slug} title="${title.slice(0, 50)}"`);
      continue;
    }

    let thumbnailMediaId: number | null = null;
    if (row.project_thumb) {
      thumbnailMediaId = await downloadAndStoreImage(
        String(row.project_thumb),
        { parentTitle: title, type: MediaType.construction },
        prisma,
      );
    }

    const galleryPaths = parseJsonField<string[]>(row.project_gallery) ?? [];
    const galleryIds: number[] = [];
    for (const p of galleryPaths) {
      const id = await downloadAndStoreImage(
        p,
        { parentTitle: title, type: MediaType.construction },
        prisma,
      );
      if (id != null && id > 0) galleryIds.push(id);
    }

    const rewrittenContent = await downloadAndRewriteContent(
      String(row.project_content ?? ""),
      title,
      MediaType.construction,
      prisma,
    );

    await prisma.project.upsert({
      where: { slug },
      create: {
        title,
        slug,
        group: ProjectGroup.construction,
        categoryId: catById.get(Number(row.project_cat)) ?? null,
        scale: row.project_quymo ? String(row.project_quymo) : null,
        areaValue: row.project_quymo_value ? Number(row.project_quymo_value) || null : null,
        clientName: row.project_chudautu ? String(row.project_chudautu) : null,
        budgetRange: row.project_quymo ? String(row.project_quymo) : null,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        galleryMediaIds: galleryIds.length ? galleryIds : undefined,
        metaTitle: row.project_title ? String(row.project_title) : null,
        metaDescription: row.project_description ? String(row.project_description) : null,
        status,
        isFeatured: String(row.project_hot) === "1",
        publishedAt,
        sortOrder: Number(row.project_stt) || 0,
      },
      update: {
        title,
        categoryId: catById.get(Number(row.project_cat)) ?? null,
        scale: row.project_quymo ? String(row.project_quymo) : null,
        areaValue: row.project_quymo_value ? Number(row.project_quymo_value) || null : null,
        clientName: row.project_chudautu ? String(row.project_chudautu) : null,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        galleryMediaIds: galleryIds.length ? galleryIds : undefined,
        metaTitle: row.project_title ? String(row.project_title) : null,
        metaDescription: row.project_description ? String(row.project_description) : null,
        status,
        isFeatured: String(row.project_hot) === "1",
        publishedAt,
      },
    });
  }
}

function productInCat(productCat: unknown, catId: string): boolean {
  const parsed = parseJsonField<unknown>(productCat);
  if (Array.isArray(parsed)) return parsed.map(String).includes(catId);
  if (typeof parsed === "string") return parsed === catId;
  if (typeof parsed === "number") return String(parsed) === catId;
  if (productCat == null) return false;
  return String(productCat) === catId;
}

function readField(fields: Array<{ name?: string; value?: unknown }>, ...keys: string[]): string | null {
  for (const f of fields) {
    if (f?.name && keys.some((k) => String(f.name).toLowerCase().includes(k.toLowerCase()))) {
      if (f.value != null && String(f.value).trim()) return String(f.value).trim();
    }
  }
  return null;
}

function parseIntFromText(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/-?\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function parseFloatFromText(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

async function migrateArchitectureTemplates(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ ArchitectureDesignTemplate (products cat 18)");
  const [rows] = await src.execute("SELECT * FROM products ORDER BY product_id");

  for (const row of rows as any[]) {
    if (!productInCat(row.product_cat, "18")) continue;

    const title = String(row.product_name ?? "").trim();
    if (!title) continue;
    const slug = (cleanSlug(row.product_url) || slugify(title));

    const status: ContentStatus =
      String(row.product_status) === "1" ? ContentStatus.published : ContentStatus.draft;

    const fields = parseJsonField<Array<{ name?: string; value?: unknown }>>(row.product_fields) ?? [];

    const houseType = readField(fields, "Loại nhà");
    const style = readField(fields, "Phong cách", "Style");
    const floorsStr = readField(fields, "Số tầng", "Tầng");
    const areaStr = readField(fields, "Diện tích");
    const roofType = readField(fields, "Loại mái", "Mái");
    const facadeStr = readField(fields, "Mặt tiền");
    const depthStr = readField(fields, "Chiều sâu", "Sâu");
    const bedroomsStr = readField(fields, "Phòng ngủ");
    const bathroomsStr = readField(fields, "Phòng tắm", "WC");

    const publishedAt = parseMaybeDate(row.product_time);

    if (DRY_RUN) {
      console.log(`  [dry-run] upsert ArchTemplate slug=${slug} title="${title.slice(0, 50)}"`);
      continue;
    }

    let thumbnailMediaId: number | null = null;
    if (row.product_thumb) {
      thumbnailMediaId = await downloadAndStoreImage(
        String(row.product_thumb),
        { parentTitle: title, type: MediaType.construction },
        prisma,
      );
    }

    const rawContent = (row.product_content && String(row.product_content).trim()) || String(row.product_desc ?? "");
    const rewrittenContent = await downloadAndRewriteContent(
      rawContent,
      title,
      MediaType.construction,
      prisma,
    );

    const galleryIds: number[] = [];
    if (row.product_group) {
      const [imgRows] = await src.execute<any[]>(
        "SELECT images_link FROM images WHERE images_groups = ? AND images_link IS NOT NULL AND images_link != ''",
        [String(row.product_group)],
      );
      for (const ir of imgRows) {
        const mid = await downloadAndStoreImage(String(ir.images_link), { parentTitle: title, type: MediaType.construction }, prisma);
        if (mid != null && mid > 0) galleryIds.push(mid);
      }
    }

    await prisma.architectureDesignTemplate.upsert({
      where: { slug },
      create: {
        title,
        slug,
        code: row.product_pid ? String(row.product_pid) : null,
        houseType,
        style,
        area: parseIntFromText(areaStr),
        floors: parseIntFromText(floorsStr),
        facadeWidth: parseFloatFromText(facadeStr),
        depth: parseFloatFromText(depthStr),
        bedrooms: parseIntFromText(bedroomsStr),
        bathrooms: parseIntFromText(bathroomsStr),
        roofType,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        galleryMediaIds: galleryIds.length ? galleryIds : undefined,
        metaTitle: row.product_title ? String(row.product_title) : null,
        metaDescription: row.product_description ? String(row.product_description) : null,
        status,
        isFeatured: String(row.product_hot) === "1",
        publishedAt,
      },
      update: {
        title,
        houseType,
        style,
        area: parseIntFromText(areaStr),
        floors: parseIntFromText(floorsStr),
        facadeWidth: parseFloatFromText(facadeStr),
        depth: parseFloatFromText(depthStr),
        bedrooms: parseIntFromText(bedroomsStr),
        bathrooms: parseIntFromText(bathroomsStr),
        roofType,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        galleryMediaIds: galleryIds.length ? galleryIds : undefined,
        metaTitle: row.product_title ? String(row.product_title) : null,
        metaDescription: row.product_description ? String(row.product_description) : null,
        status,
        isFeatured: String(row.product_hot) === "1",
        publishedAt,
      },
    });
  }
}

async function migrateServices(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ Service (products cat 16 = Xây nhà trọn gói, cat 17 = Công trình đã thi công)");
  const [rows] = await src.execute("SELECT * FROM products ORDER BY product_id");

  const CAT_LABEL: Record<string, { icon: string; description: string; group: ProjectGroup }> = {
    "16": { icon: "xay-nha-tron-goi", description: "Xây nhà trọn gói", group: ProjectGroup.xay_nha_tron_goi },
    "17": { icon: "cong-trinh", description: "Công trình đã thi công", group: ProjectGroup.construction },
  };

  for (const row of rows as any[]) {
    let cat: "16" | "17" | null = null;
    if (productInCat(row.product_cat, "16")) cat = "16";
    else if (productInCat(row.product_cat, "17")) cat = "17";
    if (!cat) continue;

    const label = CAT_LABEL[cat];

    const title = String(row.product_name ?? "").trim();
    if (!title) continue;
    const slug = (cleanSlug(row.product_url) || slugify(title));

    const status: ContentStatus =
      String(row.product_status) === "1" ? ContentStatus.published : ContentStatus.draft;

    const publishedAt = parseMaybeDate(row.product_time);

    if (DRY_RUN) {
      console.log(`  [dry-run] upsert Service cat=${cat} slug=${slug} title="${title.slice(0, 50)}"`);
      continue;
    }

    let thumbnailMediaId: number | null = null;
    if (row.product_thumb) {
      thumbnailMediaId = await downloadAndStoreImage(
        String(row.product_thumb),
        { parentTitle: title, type: MediaType.service },
        prisma,
      );
    }

    const rawContent = (row.product_content && String(row.product_content).trim()) || String(row.product_desc ?? "");
    const rewrittenContent = await downloadAndRewriteContent(
      rawContent,
      title,
      MediaType.service,
      prisma,
    );

    const galleryIds: number[] = [];
    if (row.product_group) {
      const [imgRows] = await src.execute<any[]>(
        "SELECT images_link FROM images WHERE images_groups = ? AND images_link IS NOT NULL AND images_link != ''",
        [String(row.product_group)],
      );
      for (const ir of imgRows) {
        const mid = await downloadAndStoreImage(String(ir.images_link), { parentTitle: title, type: MediaType.service }, prisma);
        if (mid != null && mid > 0) galleryIds.push(mid);
      }
    }

    await prisma.service.upsert({
      where: { slug },
      create: {
        title,
        slug,
        group: label.group,
        icon: label.icon,
        description: label.description,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        galleryMediaIds: galleryIds.length ? galleryIds : undefined,
        metaTitle: row.product_title ? String(row.product_title) : null,
        metaDescription: row.product_description ? String(row.product_description) : null,
        status,
        isFeatured: String(row.product_hot) === "1",
        publishedAt,
      },
      update: {
        title,
        group: label.group,
        icon: label.icon,
        description: label.description,
        contentHtml: rewrittenContent || null,
        thumbnailMediaId,
        galleryMediaIds: galleryIds.length ? galleryIds : undefined,
        metaTitle: row.product_title ? String(row.product_title) : null,
        metaDescription: row.product_description ? String(row.product_description) : null,
        status,
        isFeatured: String(row.product_hot) === "1",
        publishedAt,
      },
    });
  }
}

async function migrateOrphanImages(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ Orphan images (images table)");
  const [rows] = await src.execute("SELECT * FROM images WHERE images_link IS NOT NULL AND images_link != ''");
  for (const row of rows as any[]) {
    const link = String(row.images_link).trim();
    if (!link) continue;
    if (DRY_RUN) {
      console.log(`  [dry-run] would download orphan ${link}`);
      continue;
    }
    await downloadAndStoreImage(
      link,
      { parentTitle: "Hà Thành Home", type: MediaType.general },
      prisma,
    );
  }
}

async function migrateSettings(src: mysql.Connection, prisma: PrismaClient) {
  console.log("→ Settings");
  const [rows] = await src.execute("SELECT * FROM cauhinh LIMIT 1");
  const row = (rows as any[])[0];
  if (!row) {
    console.log("  no cauhinh row found");
    return;
  }

  const mapping: Array<[string, string]> = [
    ["site.url", row.cauhinh_siteurl],
    ["site.title", row.cauhinh_sitetitle],
    ["site.description", row.cauhinh_sitedesc],
    ["contact.hotline", row.cauhinh_hotline],
    ["contact.email", row.cauhinh_email],
    ["contact.address", row.cauhinh_diachi],
    ["logo.full", row.cauhinh_logomax],
    ["logo.small", row.cauhinh_logomin],
    ["social.facebook", row.cauhinh_facebookpage],
    ["social.youtube", row.cauhinh_youtube],
    ["social.zalo", row.cauhinh_zalo],
    ["social.tiktok", row.cauhinh_tiktok],
    ["social.pinterest", row.cauhinh_pinterest],
    ["social.instagram", row.cauhinh_instagram],
    ["analytics.googleId", row.cauhinh_analyticid],
    ["analytics.msValidate", row.cauhinh_msvalidate],
    ["analytics.googleApiKey", row.cauhinh_googleapikey],
    ["theme.colorPrimary", row.cauhinh_color],
  ];

  for (const [key, value] of mapping) {
    if (value == null || String(value).trim() === "") continue;
    const v = String(value);
    if (DRY_RUN) {
      console.log(`  [dry-run] upsert Setting ${key}`);
      continue;
    }
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: v },
      update: { value: v },
    });
  }
}

// --------------- MAIN ---------------

async function main() {
  console.log(`Migration starting. dryRun=${DRY_RUN} onlyImages=${ONLY_IMAGES} skipImages=${SKIP_IMAGES}`);
  console.log(`Storage base: ${STORAGE_BASE}`);

  fs.mkdirSync(STORAGE_BASE, { recursive: true });

  const src = await mysql.createConnection(SOURCE_DB);
  console.log(`Connected to source: ${SOURCE_DB.host}:${SOURCE_DB.port}/${SOURCE_DB.database}`);

  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log("Connected to target via Prisma");

  try {
    if (ONLY_IMAGES) {
      await migrateOrphanImages(src, prisma);
    } else if (ONLY_PRODUCTS) {
      await migrateArchitectureTemplates(src, prisma);
      await migrateServices(src, prisma);
    } else {
      await migratePostCategories(src, prisma);
      await migrateProjectCategories(src, prisma);
      await migratePosts(src, prisma);
      await migrateProjects(src, prisma);
      await migrateArchitectureTemplates(src, prisma);
      await migrateServices(src, prisma);
      if (!SKIP_IMAGES) {
        await migrateOrphanImages(src, prisma);
      }
      await migrateSettings(src, prisma);
    }
  } finally {
    await src.end();
    await prisma.$disconnect();

    if (errors.length) {
      fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2));
      console.log(`\nWrote ${errors.length} errors to ${ERRORS_FILE}`);
    } else {
      console.log("\nNo errors recorded.");
    }

    console.log("Done.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
