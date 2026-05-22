import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MediaType, Prisma } from "@prisma/client";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { memoryStorage } from "multer";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { listMeta, parsePagination } from "./cms-utils";
import { JwtGuard } from "./jwt.guard";
import { PrismaService } from "./prisma.service";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

class MediaUpdateDto {
  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;
}

@Controller("api/admin/media")
@UseGuards(JwtGuard, RolesGuard)
export class MediaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles("Admin", "SEO Editor", "Viewer")
  async list(@Query() query: Record<string, string>) {
    if (query.ids) {
      const ids = String(query.ids).split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
      if (!ids.length) return { data: [], meta: { total: 0, page: 1, limit: 0, totalPages: 0 } };
      const data = await this.prisma.mediaFile.findMany({ where: { id: { in: ids } } });
      return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
    }
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.MediaFileWhereInput = {
      ...(query.type ? { type: query.type as MediaType } : {}),
      ...(query.search
        ? {
            OR: [
              { originalName: { contains: query.search } },
              { altText: { contains: query.search } },
              { caption: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.mediaFile.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.mediaFile.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Post("upload")
  @Roles("Admin", "SEO Editor")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE || 10_485_760) },
      fileFilter: (_request, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
          callback(new BadRequestException("Only JPG, PNG and WebP images are allowed"), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: MediaUpdateDto) {
    if (!file?.buffer) {
      throw new BadRequestException("Missing image file");
    }

    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const existing = await this.prisma.mediaFile.findUnique({ where: { hash } });
    if (existing) {
      return { media: existing, duplicated: true };
    }

    const uploadRoot = path.resolve(process.cwd(), "..", "..", process.env.UPLOAD_DIR || "storage/uploads");
    const folder = path.join(new Date().getFullYear().toString(), String(new Date().getMonth() + 1).padStart(2, "0"), hash.slice(0, 10));
    const targetDir = path.join(uploadRoot, folder);
    await fs.mkdir(targetDir, { recursive: true });

    const quality = Number(process.env.WEBP_QUALITY || 80);
    const baseName = slugFileName(file.originalname.replace(/\.[^.]+$/, "")) || hash.slice(0, 10);
    const originalPath = path.join(targetDir, `${baseName}${path.extname(file.originalname).toLowerCase()}`);
    const webpPath = path.join(targetDir, `${baseName}.webp`);
    const thumbPath = path.join(targetDir, `${baseName}-thumb.webp`);
    const mediumPath = path.join(targetDir, `${baseName}-medium.webp`);
    const largePath = path.join(targetDir, `${baseName}-large.webp`);

    const image = sharp(file.buffer, { failOn: "none" }).rotate();
    const metadata = await image.metadata();

    if (process.env.KEEP_ORIGINAL_IMAGE === "true") {
      await fs.writeFile(originalPath, file.buffer);
    }

    await Promise.all([
      sharp(file.buffer).rotate().webp({ quality }).toFile(webpPath),
      sharp(file.buffer).rotate().resize({ width: 300, withoutEnlargement: true }).webp({ quality }).toFile(thumbPath),
      sharp(file.buffer).rotate().resize({ width: 768, withoutEnlargement: true }).webp({ quality }).toFile(mediumPath),
      sharp(file.buffer).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality }).toFile(largePath),
    ]);

    const publicBase = (process.env.PUBLIC_UPLOAD_URL || "/uploads").replace(/\/$/, "");
    const publicUrl = (fileName: string) => `${publicBase}/${folder.replaceAll("\\", "/")}/${fileName}`;

    const media = await this.prisma.mediaFile.create({
      data: {
        originalName: file.originalname,
        fileName: `${baseName}.webp`,
        mimeType: "image/webp",
        extension: "webp",
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        hash,
        originalUrl: process.env.KEEP_ORIGINAL_IMAGE === "true" ? publicUrl(path.basename(originalPath)) : null,
        webpUrl: publicUrl(path.basename(webpPath)),
        thumbUrl: publicUrl(path.basename(thumbPath)),
        mediumUrl: publicUrl(path.basename(mediumPath)),
        largeUrl: publicUrl(path.basename(largePath)),
        altText: body.altText,
        caption: body.caption,
        description: body.description,
        type: body.type || MediaType.general,
      },
    });

    return { media, duplicated: false };
  }

  @Get(":id")
  @Roles("Admin", "SEO Editor", "Viewer")
  detail(@Param("id") id: string) {
    return this.prisma.mediaFile.findUniqueOrThrow({ where: { id: Number(id) } });
  }

  @Patch(":id")
  @Roles("Admin", "SEO Editor")
  update(@Param("id") id: string, @Body() dto: MediaUpdateDto) {
    return this.prisma.mediaFile.update({ where: { id: Number(id) }, data: dto });
  }

  @Delete(":id")
  @Roles("Admin")
  async remove(@Param("id") id: string) {
    const media = await this.prisma.mediaFile.findUniqueOrThrow({ where: { id: Number(id) } });
    if (media.usageCount > 0) {
      throw new BadRequestException("Media is currently in use");
    }
    await this.prisma.mediaFile.delete({ where: { id: Number(id) } });
    return media;
  }
}

function slugFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}
