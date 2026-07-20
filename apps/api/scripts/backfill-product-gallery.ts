import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import axios from "axios";
import sharp from "sharp";
import mysql from "mysql2/promise";
import { MediaType, PrismaClient } from "@prisma/client";

const SOURCE_DB = {
  host: "127.0.0.1",
  port: 3847,
  user: "dreamhome_user",
  password: "dreamhome_pass",
  database: "dreamhome",
};

const STORAGE_BASE = path.resolve(__dirname, "..", "..", "..", "storage", "uploads");
const PUBLIC_PREFIX = process.env.PUBLIC_UPLOAD_URL?.replace(/\/$/, "") || "http://localhost:31875/uploads";
const OLD_SITE_URL = "https://hathanhhome.vn";
const DOWNLOAD_DELAY_MS = 150;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex");

function normalizeOldUrl(p: string): string | null {
  if (!p) return null;
  const t = p.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return `${OLD_SITE_URL}${t}`;
  return `${OLD_SITE_URL}/${t}`;
}

const errors: Array<{ url: string; product?: string; error: string }> = [];

async function ensureMedia(rawUrl: string, parentTitle: string, type: MediaType, prisma: PrismaClient): Promise<number | null> {
  const absoluteUrl = normalizeOldUrl(rawUrl);
  if (!absoluteUrl) return null;
  const hash = md5(absoluteUrl);

  const existing = await prisma.mediaFile.findFirst({ where: { hash }, orderBy: { id: "asc" } });
  if (existing) return existing.id;

  try {
    await sleep(DOWNLOAD_DELAY_MS);
    const resp = await axios.get<ArrayBuffer>(absoluteUrl, { responseType: "arraybuffer", timeout: 30_000, maxRedirects: 5 });
    const buf = Buffer.from(resp.data);
    const origName = path.basename(new URL(absoluteUrl).pathname);
    const urlPath = new URL(absoluteUrl).pathname;
    const monthMatch = urlPath.match(/\/uploads\/(\d{6})\//);
    const yyyymm = monthMatch ? monthMatch[1] : new Date().toISOString().slice(0, 7).replace("-", "");
    const baseName = (path.basename(origName, path.extname(origName)) || `img-${hash.slice(0, 8)}`).replace(/[^a-zA-Z0-9._-]/g, "-");
    const monthDir = path.join(STORAGE_BASE, yyyymm);
    fs.mkdirSync(monthDir, { recursive: true });

    const meta = await sharp(buf, { failOn: "none" }).metadata();
    const fullBuf = await sharp(buf, { failOn: "none" }).webp({ quality: 85 }).toBuffer();
    const mediumBuf = await sharp(buf, { failOn: "none" }).resize({ width: 800, height: 600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const thumbBuf = await sharp(buf, { failOn: "none" }).resize({ width: 300, height: 200, fit: "cover" }).webp({ quality: 75 }).toBuffer();
    fs.writeFileSync(path.join(monthDir, `${baseName}.webp`), fullBuf);
    fs.writeFileSync(path.join(monthDir, `${baseName}_medium.webp`), mediumBuf);
    fs.writeFileSync(path.join(monthDir, `${baseName}_thumb.webp`), thumbBuf);

    const record = await prisma.mediaFile.create({
      data: {
        originalName: origName,
        fileName: `${baseName}.webp`,
        mimeType: "image/webp",
        extension: "webp",
        size: fullBuf.length,
        width: meta.width ?? null,
        height: meta.height ?? null,
        hash,
        disk: "local",
        originalUrl: absoluteUrl,
        webpUrl: `${PUBLIC_PREFIX}/${yyyymm}/${baseName}.webp`,
        thumbUrl: `${PUBLIC_PREFIX}/${yyyymm}/${baseName}_thumb.webp`,
        mediumUrl: `${PUBLIC_PREFIX}/${yyyymm}/${baseName}_medium.webp`,
        altText: parentTitle,
        type,
      },
    });
    return record.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ! ${absoluteUrl}: ${msg}`);
    errors.push({ url: absoluteUrl, product: parentTitle, error: msg });
    return null;
  }
}

function productInCat(productCat: unknown, catId: string): boolean {
  if (productCat == null) return false;
  const s = String(productCat).trim();
  if (!s) return false;
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(String).includes(catId);
  } catch {}
  return s === catId;
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

async function main() {
  const src = await mysql.createConnection(SOURCE_DB);
  const prisma = new PrismaClient();
  await prisma.$connect();

  const [products] = await src.execute<any[]>(`
    SELECT product_id, product_name, product_url, product_cat, product_group
    FROM products
    WHERE product_group IS NOT NULL AND product_group != ''
    ORDER BY product_id
  `);

  console.log(`Found ${products.length} products with product_group`);

  let serviceUpdated = 0;
  let archUpdated = 0;
  let totalDownloads = 0;

  for (const row of products) {
    const title = String(row.product_name ?? "").trim();
    if (!title) continue;
    const slug = (row.product_url && String(row.product_url).trim()) || slugify(title);
    const productGroup = String(row.product_group).trim();
    if (!productGroup) continue;

    const isService = productInCat(row.product_cat, "16") || productInCat(row.product_cat, "17");
    const isTemplate = productInCat(row.product_cat, "18");
    if (!isService && !isTemplate) continue;

    const [imgs] = await src.execute<any[]>(
      "SELECT images_link FROM images WHERE images_groups = ? AND images_link IS NOT NULL AND images_link != ''",
      [productGroup],
    );
    if (!imgs.length) continue;

    const type = isTemplate ? MediaType.construction : MediaType.service;

    const ids: number[] = [];
    for (const img of imgs) {
      const id = await ensureMedia(String(img.images_link), title, type, prisma);
      if (id) {
        ids.push(id);
        totalDownloads++;
      }
    }
    if (!ids.length) continue;

    if (isService) {
      const svc = await prisma.service.findUnique({ where: { slug } });
      if (svc) {
        await prisma.service.update({ where: { id: svc.id }, data: { galleryMediaIds: ids } });
        serviceUpdated++;
        console.log(`  Service "${title.slice(0, 50)}" ← ${ids.length} images`);
      } else {
        console.log(`  ? Service not found for slug=${slug}`);
      }
    }
    if (isTemplate) {
      const tpl = await prisma.architectureDesignTemplate.findUnique({ where: { slug } });
      if (tpl) {
        await prisma.architectureDesignTemplate.update({ where: { id: tpl.id }, data: { galleryMediaIds: ids } });
        archUpdated++;
        console.log(`  ArchTemplate "${title.slice(0, 50)}" ← ${ids.length} images`);
      } else {
        console.log(`  ? Template not found for slug=${slug}`);
      }
    }
  }

  console.log(`\nDone. Services updated: ${serviceUpdated}, ArchTemplates updated: ${archUpdated}, Image-ensure ops: ${totalDownloads}`);

  if (errors.length) {
    fs.writeFileSync(path.join(__dirname, "backfill-errors.json"), JSON.stringify(errors, null, 2));
    console.log(`Wrote ${errors.length} errors to backfill-errors.json`);
  }

  await src.end();
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
