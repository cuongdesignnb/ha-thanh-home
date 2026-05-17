import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ContentStatus, MediaType, Prisma } from "@prisma/client";
import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import { Request } from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { cleanHtml, uniqueSlug } from "./cms-utils";
import { JwtGuard } from "./jwt.guard";
import { PrismaService } from "./prisma.service";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

type JwtUser = {
  sub: number;
  email: string;
  roles?: string[];
};

class AiContentDto {
  @IsString()
  topic!: string;

  @IsString()
  focusKeyword!: string;

  @IsOptional()
  @IsString()
  secondaryKeywords?: string;

  @IsOptional()
  @IsIn(["construction", "interior"])
  group?: "construction" | "interior";

  @IsOptional()
  @IsString()
  audience?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  articleType?: string;

  @IsOptional()
  @IsString()
  length?: string;

  @IsOptional()
  @IsBoolean()
  createDraft?: boolean;
}

class AiImageDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsIn(["construction", "interior", "blog", "banner", "project", "service", "general"])
  type?: MediaType;

  @IsOptional()
  @IsIn(["1024x1024", "1024x1536", "1536x1024"])
  size?: string;

  @IsOptional()
  @IsIn(["low", "medium", "high", "auto"])
  quality?: string;

  @IsOptional()
  @IsString()
  altText?: string;
}

@Controller("api/admin/ai")
@UseGuards(JwtGuard, RolesGuard)
export class AiController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("generate-outline")
  @Roles("Admin", "SEO Editor")
  async generateOutline(@Body() dto: AiContentDto, @Req() request: Request & { user?: JwtUser }) {
    const output = await this.generateStructured({
      task: "outline",
      dto,
      schemaName: "seo_outline",
      schema: outlineSchema,
      createdBy: request.user?.sub,
    });
    return output;
  }

  @Post("generate-meta")
  @Roles("Admin", "SEO Editor")
  async generateMeta(@Body() dto: AiContentDto, @Req() request: Request & { user?: JwtUser }) {
    const output = await this.generateStructured({
      task: "meta",
      dto,
      schemaName: "seo_meta",
      schema: metaSchema,
      createdBy: request.user?.sub,
    });
    return output;
  }

  @Post("generate-article")
  @Roles("Admin", "SEO Editor")
  async generateArticle(@Body() dto: AiContentDto, @Req() request: Request & { user?: JwtUser }) {
    const output = await this.generateStructured({
      task: "article",
      dto,
      schemaName: "seo_article",
      schema: articleSchema,
      createdBy: request.user?.sub,
    });

    if (!dto.createDraft) {
      return output;
    }

    const article = output as {
      title?: string;
      slug?: string;
      excerpt?: string;
      contentHtml?: string;
      metaTitle?: string;
      metaDescription?: string;
      focusKeyword?: string;
    };
    const title = article.title || dto.topic;
    const slug = await uniqueSlug(title, article.slug, (candidate) =>
      this.prisma.post.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    const post = await this.prisma.post.create({
      data: {
        title,
        slug,
        excerpt: article.excerpt,
        contentHtml: cleanHtml(article.contentHtml),
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        focusKeyword: article.focusKeyword || dto.focusKeyword,
        status: ContentStatus.draft,
        isFeatured: false,
        createdAt: new Date(),
      },
    });

    return { ...(output as Record<string, unknown>), draftPost: post };
  }

  @Post("generate-image")
  @Roles("Admin", "SEO Editor")
  async generateImage(@Body() dto: AiImageDto, @Req() request: Request & { user?: JwtUser }) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_IMAGE_MODEL || process.env.OPENAI_MODEL_IMAGE;
    const provider = process.env.IMAGE_PROVIDER || "openai";
    if (provider !== "openai") {
      throw new BadRequestException("AI image generation currently supports IMAGE_PROVIDER=openai");
    }
    if (!apiKey) {
      throw new BadRequestException("OPENAI_API_KEY is not configured");
    }
    if (!model) {
      throw new BadRequestException("OPENAI_IMAGE_MODEL or OPENAI_MODEL_IMAGE is not configured");
    }
    if (!dto.prompt.trim()) {
      throw new BadRequestException("Image prompt is required");
    }

    const prompt = buildImagePrompt(dto);
    const input = {
      ...dto,
      prompt,
      size: dto.size || "1536x1024",
      quality: dto.quality || "medium",
    };
    let status = "success";
    let output: unknown = null;
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          size: input.size,
          quality: input.quality,
          n: 1,
          output_format: "png",
        }),
      });
      const data = await response.json() as Record<string, unknown>;
      if (!response.ok) {
        status = "error";
        output = data;
        throw new BadRequestException(readOpenAiError(data));
      }

      const imageBuffer = await readImageBuffer(data);
      const media = await this.saveGeneratedImage(imageBuffer, {
        originalName: `${dto.topic || dto.altText || "ai-hathanh-image"}.png`,
        altText: dto.altText || dto.topic || dto.prompt.slice(0, 120),
        caption: dto.topic ? `AI generated image for ${dto.topic}` : "AI generated image",
        description: prompt,
        type: dto.type || MediaType.blog,
      });

      output = {
        provider,
        model,
        prompt,
        size: input.size,
        quality: input.quality,
        media,
      };
      return output;
    } catch (error) {
      status = "error";
      if (!output) output = { message: error instanceof Error ? error.message : "Unknown AI image error" };
      throw error;
    } finally {
      await this.prisma.aiGeneration.create({
        data: {
          prompt,
          provider,
          model,
          input: input as unknown as Prisma.InputJsonValue,
          output: output as Prisma.InputJsonValue,
          status,
          createdBy: request.user?.sub,
        },
      }).catch(() => undefined);
    }
  }

  @Get("generations")
  @Roles("Admin", "SEO Editor", "Viewer")
  generations() {
    return this.prisma.aiGeneration.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  private async generateStructured(options: {
    task: "outline" | "meta" | "article";
    dto: AiContentDto;
    schemaName: string;
    schema: Record<string, unknown>;
    createdBy?: number;
  }) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL_WRITER || process.env.OPENAI_MODEL_FAST;
    if (!apiKey) {
      throw new BadRequestException("OPENAI_API_KEY is not configured");
    }
    if (!model) {
      throw new BadRequestException("OPENAI_MODEL_WRITER or OPENAI_MODEL_FAST is not configured");
    }

    const prompt = buildPrompt(options.task, options.dto);
    let status = "success";
    let output: unknown = null;
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          instructions: "Bạn là chuyên gia SEO tiếng Việt cho thương hiệu kiến trúc và nội thất cao cấp Hà Thành Home. Trả về JSON hợp lệ theo schema, không thêm markdown ngoài JSON.",
          input: prompt,
          text: {
            format: {
              type: "json_schema",
              name: options.schemaName,
              schema: options.schema,
              strict: false,
            },
          },
        }),
      });
      const data = await response.json() as Record<string, unknown>;
      if (!response.ok) {
        status = "error";
        output = data;
        throw new BadRequestException(readOpenAiError(data));
      }
      output = parseResponseJson(data);
      return output;
    } catch (error) {
      status = "error";
      if (!output) output = { message: error instanceof Error ? error.message : "Unknown AI error" };
      throw error;
    } finally {
      await this.prisma.aiGeneration.create({
        data: {
          prompt,
          provider: "openai",
          model,
          input: options.dto as unknown as Prisma.InputJsonValue,
          output: output as Prisma.InputJsonValue,
          status,
          createdBy: options.createdBy,
        },
      }).catch(() => undefined);
    }
  }

  private async saveGeneratedImage(
    buffer: Buffer,
    options: {
      originalName: string;
      altText?: string;
      caption?: string;
      description?: string;
      type: MediaType;
    },
  ) {
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const existing = await this.prisma.mediaFile.findUnique({ where: { hash } });
    if (existing) return existing;

    const now = new Date();
    const uploadRoot = path.resolve(process.cwd(), "..", "..", process.env.UPLOAD_DIR || "storage/uploads");
    const folder = path.join(now.getFullYear().toString(), String(now.getMonth() + 1).padStart(2, "0"), hash.slice(0, 10));
    const targetDir = path.join(uploadRoot, folder);
    await fs.mkdir(targetDir, { recursive: true });

    const quality = Number(process.env.WEBP_QUALITY || 80);
    const baseName = slugFileName(options.originalName.replace(/\.[^.]+$/, "")) || hash.slice(0, 10);
    const webpPath = path.join(targetDir, `${baseName}.webp`);
    const thumbPath = path.join(targetDir, `${baseName}-thumb.webp`);
    const mediumPath = path.join(targetDir, `${baseName}-medium.webp`);
    const largePath = path.join(targetDir, `${baseName}-large.webp`);
    const metadata = await sharp(buffer, { failOn: "none" }).rotate().metadata();

    await Promise.all([
      sharp(buffer).rotate().webp({ quality }).toFile(webpPath),
      sharp(buffer).rotate().resize({ width: 300, withoutEnlargement: true }).webp({ quality }).toFile(thumbPath),
      sharp(buffer).rotate().resize({ width: 768, withoutEnlargement: true }).webp({ quality }).toFile(mediumPath),
      sharp(buffer).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality }).toFile(largePath),
    ]);

    const publicBase = (process.env.PUBLIC_UPLOAD_URL || "/uploads").replace(/\/$/, "");
    const publicUrl = (fileName: string) => `${publicBase}/${folder.replaceAll("\\", "/")}/${fileName}`;

    return this.prisma.mediaFile.create({
      data: {
        originalName: options.originalName,
        fileName: `${baseName}.webp`,
        mimeType: "image/webp",
        extension: "webp",
        size: buffer.length,
        width: metadata.width,
        height: metadata.height,
        hash,
        webpUrl: publicUrl(path.basename(webpPath)),
        thumbUrl: publicUrl(path.basename(thumbPath)),
        mediumUrl: publicUrl(path.basename(mediumPath)),
        largeUrl: publicUrl(path.basename(largePath)),
        altText: options.altText,
        caption: options.caption,
        description: options.description,
        type: options.type,
      },
    });
  }
}

function buildPrompt(task: "outline" | "meta" | "article", dto: AiContentDto) {
  const common = [
    `Nhiệm vụ: ${task}`,
    `Chủ đề: ${dto.topic}`,
    `Từ khóa chính: ${dto.focusKeyword}`,
    `Từ khóa phụ: ${dto.secondaryKeywords || "Không có"}`,
    `Nhóm nội dung: ${dto.group === "interior" ? "Nội thất" : "Công trình"}`,
    `Đối tượng khách hàng: ${dto.audience || "Chủ nhà, chủ đầu tư, doanh nghiệp"}`,
    `Giọng văn: ${dto.tone || "Chuyên gia, sang trọng, tư vấn bán hàng"}`,
    `Loại bài: ${dto.articleType || "Cẩm nang"}`,
    `Độ dài mong muốn: ${dto.length || "1200 từ"}`,
  ].join("\n");

  if (task === "outline") {
    return `${common}\nHãy tạo outline SEO có H1, meta title, meta description, slug, H2/H3, FAQ, CTA, gợi ý ảnh, gợi ý internal link và dịch vụ/dự án liên quan.`;
  }
  if (task === "meta") {
    return `${common}\nHãy tạo bộ metadata SEO gồm meta title, meta description, slug, OG title, OG description, focus keyword và FAQ schema đề xuất.`;
  }
  return `${common}\nHãy viết bài SEO hoàn chỉnh bằng HTML sạch phù hợp TipTap. Có đoạn mở đầu, H2/H3, bullet list nếu cần, FAQ và CTA cuối bài. Không tự publish.`;
}

function parseResponseJson(data: Record<string, unknown>) {
  const direct = data.output_text;
  if (typeof direct === "string") return JSON.parse(direct);
  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output as Array<Record<string, unknown>>) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content as Array<Record<string, unknown>>) {
      if (typeof part.text === "string") return JSON.parse(part.text);
    }
  }
  throw new BadRequestException("AI response did not contain JSON text");
}

function readOpenAiError(data: Record<string, unknown>) {
  const error = data.error as { message?: string } | undefined;
  return error?.message || "OpenAI request failed";
}

async function readImageBuffer(data: Record<string, unknown>) {
  const images = Array.isArray(data.data) ? data.data as Array<Record<string, unknown>> : [];
  const first = images[0];
  if (!first) throw new BadRequestException("OpenAI image response did not contain image data");
  if (typeof first.b64_json === "string") {
    return Buffer.from(first.b64_json, "base64");
  }
  if (typeof first.url === "string") {
    const response = await fetch(first.url);
    if (!response.ok) throw new BadRequestException("Could not download generated image");
    return Buffer.from(await response.arrayBuffer());
  }
  throw new BadRequestException("OpenAI image response did not contain b64_json or url");
}

function buildImagePrompt(dto: AiImageDto) {
  return [
    dto.prompt.trim(),
    dto.topic ? `Topic: ${dto.topic}` : "",
    "Brand style: premium Vietnamese architecture and interior design brand, Ha Thanh Home, refined luxury, warm natural light, deep forest green and gold accents, realistic photography, clean composition, no text, no watermark.",
  ].filter(Boolean).join("\n");
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

const outlineSchema = {
  type: "object",
  properties: {
    h1: { type: "string" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    slug: { type: "string" },
    outline: { type: "array", items: { type: "object", properties: { h2: { type: "string" }, h3: { type: "array", items: { type: "string" } } } } },
    faq: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } },
    cta: { type: "string" },
    imageIdeas: { type: "array", items: { type: "string" } },
    internalLinks: { type: "array", items: { type: "string" } },
    relatedSuggestions: { type: "array", items: { type: "string" } },
  },
};

const metaSchema = {
  type: "object",
  properties: {
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    slug: { type: "string" },
    ogTitle: { type: "string" },
    ogDescription: { type: "string" },
    focusKeyword: { type: "string" },
    secondaryKeywords: { type: "array", items: { type: "string" } },
    faqSchema: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } },
  },
};

const articleSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    excerpt: { type: "string" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    focusKeyword: { type: "string" },
    contentHtml: { type: "string" },
    faq: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } },
    cta: { type: "string" },
  },
};
