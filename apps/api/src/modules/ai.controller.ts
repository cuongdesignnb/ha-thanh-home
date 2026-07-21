import { BadRequestException, Body, Controller, Get, HttpException, Post, Req, UseGuards } from "@nestjs/common";
import { ContentStatus, MediaType, Prisma } from "@prisma/client";
import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import { Request } from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { cleanHtml, uniqueSlug, safeString } from "./cms-utils";
import { JwtGuard } from "./jwt.guard";
import { PrismaService } from "./prisma.service";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

type JwtUser = {
  sub: number;
  email: string;
  roles?: string[];
};

type InternalLinkCandidate = {
  title: string;
  url: string;
  kind: string;
  text?: string | null;
  group?: string | null;
};

type AiContentConfig = {
  apiKey: string;
  baseUrl: string;
  wireApi: "chat_completions" | "responses";
  model: string;
  reasoningEffort: "low" | "medium" | "high";
  maxTokens: number;
  provider: string;
};

type AiImageConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  quality: "low" | "medium" | "high" | "auto";
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
  @IsIn(["construction", "interior", "xay_nha_tron_goi"])
  group?: "construction" | "interior" | "xay_nha_tron_goi";

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

    const article = output as {
      title?: string;
      slug?: string;
      excerpt?: string;
      contentHtml?: string;
      metaTitle?: string;
      metaDescription?: string;
      focusKeyword?: string;
    };

    const signature = `
<hr style="margin: 30px 0; border: 0; border-top: 1px solid #ccc;" />
<div style="padding: 20px; background-color: #f9f9f9; border-left: 4px solid #cc0000; margin-top: 30px; font-family: sans-serif;">
  <p style="margin: 0 0 10px 0; font-size: 16px; color: #333; font-weight: bold;"><strong>CÔNG TY CỔ PHẦN THIẾT KẾ VÀ X&Acirc;Y DỰNG HÀ THÀNH</strong></p>
  <p style="margin: 0 0 5px 0; font-size: 14px; color: #555;"><strong>Showroom:</strong> Số 42, Tổ 18 Khu Tập Thể Trường Cao Đẳng Du Lịch, P. Nghĩa Đô, TP. Hà Nội</p>
  <p style="margin: 0 0 5px 0; font-size: 14px; color: #555;"><strong>Tư vấn miễn phí:</strong> <a href="tel:0898502333" style="color: #cc0000; text-decoration: none; font-weight: bold;">0898 502 333</a></p>
  <p style="margin: 0 0 15px 0; font-size: 14px; color: #555;"><strong>Website:</strong> <a href="https://hathanhhome.vn" target="_blank" rel="noopener" style="color: #0066cc; text-decoration: none;">hathanhhome.vn</a></p>
  <p style="margin: 0; font-size: 13px; color: #777; font-style: italic; border-top: 1px dashed #ddd; padding-top: 10px;"><em>Thiết kế kiến trúc | Thi công xây dựng trọn gói | Bảo hành công trình</em></p>
</div>`;

    if (article && typeof article.contentHtml === "string") {
      article.contentHtml = article.contentHtml.trim() + signature;
    }

    if (!dto.createDraft) {
      return output;
    }

    const title = article.title || dto.topic;
    const slug = await uniqueSlug(title, article.slug, (candidate) =>
      this.prisma.post.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    const post = await this.prisma.post.create({
      data: {
        title: safeString(title, 191)!,
        slug,
        excerpt: article.excerpt,
        contentHtml: cleanHtml(article.contentHtml),
        metaTitle: safeString(article.metaTitle, 191),
        metaDescription: article.metaDescription,
        focusKeyword: safeString(article.focusKeyword || dto.focusKeyword, 191),
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
    const aiSettingRecord = await this.prisma.setting.findUnique({ where: { key: "site.ai" } });
    const aiSetting = asAiSetting(aiSettingRecord?.value);

    const provider = aiSetting.imageProvider || process.env.IMAGE_PROVIDER || "openai";
    const imageConfig = provider === "openai" ? resolveOpenAiImageConfig(aiSetting) : null;
    const model = provider === "openai"
      ? imageConfig!.model
      : settingString(aiSetting, "openaiImageModel", "openai_image_model") || process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";

    if (!dto.prompt.trim()) {
      throw new BadRequestException("Image prompt is required");
    }

    const prompt = buildImagePrompt(dto);
    const input = {
      ...dto,
      prompt,
      size: dto.size || "1536x1024",
      quality: dto.quality || imageConfig?.quality || "medium",
    };

    let status = "success";
    let output: unknown = null;
    let imageBuffer: Buffer;

    try {
      if (provider === "gemini") {
        const geminiApiKey = aiSetting.geminiApiKey || process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
          throw new BadRequestException("GEMINI_API_KEY is not configured");
        }

        const isImagen = model.startsWith("imagen-");
        if (isImagen) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${geminiApiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instances: [
                {
                  prompt,
                },
              ],
              parameters: {
                sampleCount: 1,
                aspectRatio: dto.size === "1536x1024" ? "3:2" : dto.size === "1024x1536" ? "2:3" : "1:1",
              },
            }),
          });
          const data = await response.json() as Record<string, any>;
          if (!response.ok) {
            throw new Error(data.error?.message || "Gemini Imagen prediction failed");
          }
          const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
          if (!base64Image) {
            throw new Error("Gemini response did not contain image data");
          }
          imageBuffer = Buffer.from(base64Image, "base64");
        } else {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseModalities: ["TEXT", "IMAGE"],
              },
            }),
          });
          const data = await response.json() as Record<string, any>;
          if (!response.ok) {
            throw new Error(data.error?.message || "Gemini content generation failed");
          }
          const base64Image = data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;
          if (!base64Image) {
            throw new Error("Gemini response did not contain inline image data");
          }
          imageBuffer = Buffer.from(base64Image, "base64");
        }
      } else {
        // OpenAI (ChatGPT Image)
        if (!imageConfig?.apiKey) {
          throw new BadRequestException("OPENAI_IMAGE_API_KEY is not configured");
        }

        // Validate and map parameters for OpenAI ChatGPT Image / DALL-E
        const openaiModel = imageConfig.model || "gpt-image-2";
        let size = input.size;
        let quality: string | undefined = dto.quality || imageConfig.quality;

        if (openaiModel.includes("dall-e-3")) {
          // Standard OpenAI DALL-E 3 mappings
          if (size === "1536x1024") size = "1792x1024";
          else if (size === "1024x1536") size = "1024x1792";
          else if (size !== "1024x1024" && size !== "1792x1024" && size !== "1024x1792") {
            size = "1024x1024";
          }
          quality = input.quality === "high" || input.quality === "hd" ? "hd" : "standard";
        } else if (openaiModel.includes("dall-e-2")) {
          size = "1024x1024";
          quality = undefined; // dall-e-2 doesn't support quality parameter
        } else {
          // Keep original params for gpt-image-2 or other proxy models
          // (which support size like 1536x1024 and quality like low, medium, high, auto)
        }

        const response = await fetch(`${imageConfig.baseUrl}/images/generations`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${imageConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: openaiModel,
            prompt,
            size,
            quality,
            n: 1,
            output_format: "png",
          }),
        });
        const data = await response.json() as Record<string, unknown>;
        if (!response.ok) {
          throw new Error(readOpenAiError(data));
        }
        imageBuffer = await readImageBuffer(data);
      }

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
      const errMsg = error instanceof Error ? error.message : "Unknown AI image error";
      output = { message: errMsg };
      throw new BadRequestException(errMsg);
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
    const aiSettingRecord = await this.prisma.setting.findUnique({ where: { key: "site.ai" } });
    const aiSetting = asAiSetting(aiSettingRecord?.value);
    const config = resolveOpenAiContentConfig(aiSetting);

    if (!config.apiKey) {
      throw new BadRequestException("OPENAI_API_KEY is not configured");
    }
    if (!config.model) {
      throw new BadRequestException("OPENAI_MODEL is not configured");
    }

    const linkCandidates = options.task === "meta" ? [] : await this.buildInternalLinkCandidates(options.dto);
    const prompt = buildPrompt(options.task, options.dto, linkCandidates);
    const instructions = "Bạn là chuyên gia SEO tiếng Việt cho thương hiệu kiến trúc và nội thất cao cấp Hà Thành Home. Trả về JSON hợp lệ theo schema, không thêm markdown ngoài JSON.";
    let status = "success";
    let output: unknown = null;
    try {
      const requestUrl = config.wireApi === "responses"
        ? `${config.baseUrl}/responses`
        : `${config.baseUrl}/chat/completions`;
      const requestBody = config.wireApi === "responses"
        ? {
            model: config.model,
            instructions,
            input: prompt,
            reasoning: { effort: config.reasoningEffort },
            max_output_tokens: config.maxTokens,
            store: false,
            text: {
              format: {
                type: "json_schema",
                name: options.schemaName,
                schema: options.schema,
                strict: false,
              },
            },
          }
        : {
            model: config.model,
            messages: [
              { role: "system", content: `${instructions}\nSchema mục tiêu: ${JSON.stringify(options.schema)}` },
              { role: "user", content: prompt },
            ],
            max_tokens: config.maxTokens,
          };

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json() as Record<string, unknown>;
      if (!response.ok) {
        status = "error";
        output = data;
        throw new HttpException({
          error: "Upstream request failed",
          message: readOpenAiError(data),
          provider_status: response.status,
        }, 424);
      }
      const parsed = parseResponseJson(data);
      output = options.task === "article"
        ? enforceArticleInternalLinks(parsed, linkCandidates, options.dto)
        : options.task === "outline"
          ? normalizeOutlineInternalLinks(parsed, linkCandidates)
          : parsed;
      return output;
    } catch (error) {
      status = "error";
      if (!output) output = { message: error instanceof Error ? error.message : "Unknown AI error" };
      throw error;
    } finally {
      await this.prisma.aiGeneration.create({
        data: {
          prompt,
          provider: config.provider,
          model: config.model,
          input: options.dto as unknown as Prisma.InputJsonValue,
          output: output as Prisma.InputJsonValue,
          status,
          createdBy: options.createdBy,
        },
      }).catch(() => undefined);
    }
  }

  private async buildInternalLinkCandidates(dto: AiContentDto): Promise<InternalLinkCandidate[]> {
    const [projects, services, posts, architecture, interior] = await Promise.all([
      this.prisma.project.findMany({
        where: { status: ContentStatus.published },
        select: { title: true, slug: true, description: true, group: true },
        orderBy: { id: "desc" }, take: 24,
      }),
      this.prisma.service.findMany({
        where: { status: ContentStatus.published },
        select: { title: true, slug: true, description: true, group: true },
        orderBy: { id: "desc" }, take: 16,
      }),
      this.prisma.post.findMany({
        where: { status: ContentStatus.published },
        select: { title: true, slug: true, excerpt: true },
        orderBy: { id: "desc" }, take: 24,
      }),
      this.prisma.architectureDesignTemplate.findMany({
        where: { status: ContentStatus.published },
        select: { title: true, slug: true, description: true },
        orderBy: { id: "desc" }, take: 16,
      }),
      this.prisma.interiorDesignTemplate.findMany({
        where: { status: ContentStatus.published },
        select: { title: true, slug: true, description: true },
        orderBy: { id: "desc" }, take: 16,
      }),
    ]);

    const candidates: InternalLinkCandidate[] = [
      ...projects.map((item) => ({ title: item.title, url: `/du-an/${item.slug}`, kind: "Dự án", text: item.description, group: item.group })),
      ...services.map((item) => ({ title: item.title, url: `/dich-vu/${item.slug}`, kind: "Dịch vụ", text: item.description, group: item.group })),
      ...posts.map((item) => ({ title: item.title, url: `/tin-tuc/${item.slug}`, kind: "Bài viết", text: item.excerpt })),
      ...architecture.map((item) => ({ title: item.title, url: `/mau-thiet-ke-kien-truc/${item.slug}`, kind: "Mẫu kiến trúc", text: item.description, group: "construction" })),
      ...interior.map((item) => ({ title: item.title, url: `/mau-thiet-ke-noi-that/${item.slug}`, kind: "Mẫu nội thất", text: item.description, group: "interior" })),
    ];
    const terms = normalizeSearchText(`${dto.topic} ${dto.focusKeyword} ${dto.secondaryKeywords || ""}`).split(" ").filter((term) => term.length > 2);
    return candidates
      .map((candidate, index) => {
        const haystack = normalizeSearchText(`${candidate.title} ${candidate.text || ""}`);
        const relevance = terms.reduce((score, term) => score + (haystack.includes(term) ? 2 : 0), 0);
        const groupScore = candidate.group && candidate.group === dto.group ? 3 : 0;
        return { candidate, score: relevance + groupScore, index };
      })
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 12)
      .map(({ candidate }) => candidate);
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
    const existing = await this.prisma.mediaFile.findFirst({ where: { hash }, orderBy: { id: "asc" } });
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

function buildPrompt(task: "outline" | "meta" | "article", dto: AiContentDto, linkCandidates: InternalLinkCandidate[] = []) {
  const common = [
    `Nhiệm vụ: ${task}`,
    `Chủ đề: ${dto.topic}`,
    `Từ khóa chính: ${dto.focusKeyword}`,
    `Từ khóa phụ: ${dto.secondaryKeywords || "Không có"}`,
    `Nhóm nội dung: ${dto.group === "interior" ? "Nội thất" : dto.group === "xay_nha_tron_goi" ? "Xây nhà trọn gói" : "Công trình"}`,
    `Đối tượng khách hàng: ${dto.audience || "Chủ nhà, chủ đầu tư, doanh nghiệp"}`,
    `Giọng văn: ${dto.tone || "Chuyên gia, sang trọng, tư vấn bán hàng"}`,
    `Loại bài: ${dto.articleType || "Cẩm nang"}`,
    `Độ dài mong muốn: ${dto.length || "1200 từ"}`,
  ].join("\n");
  const internalLinkRules = linkCandidates.length ? [
    "Danh sách URL nội bộ đã xác minh từ dữ liệu đang xuất bản:",
    ...linkCandidates.map((candidate, index) => {
      const anchors = buildAnchorSuggestions(candidate, dto).join(" | ");
      return `${index + 1}. [${candidate.kind}] ${candidate.title} — ${candidate.url} — anchor gợi ý: ${anchors}`;
    }),
    "Chỉ được dùng URL nội bộ có nguyên văn trong danh sách trên; không tự tạo hoặc đoán URL.",
    "Chọn 2 đến 4 URL liên quan nhất, ưu tiên bài viết/dịch vụ/dự án/mẫu thiết kế gần nhất với chủ đề và từ khóa.",
    "Tỷ lệ anchor hợp lý: khoảng 1 internal link mỗi 350-500 từ, tối đa 4 link trong bài; không đặt nhiều link sát nhau trong cùng một đoạn.",
    "Anchor text phải tự nhiên trong câu: dùng đúng từ khóa chính tối đa 1 lần nếu phù hợp ngữ cảnh; các link còn lại dùng từ khóa phụ, tiêu đề bài liên quan hoặc biến thể mô tả đúng trang đích.",
    "Không nhồi anchor kiểu máy móc, không dùng các cụm chung chung như 'xem tại đây', 'bấm vào đây', 'tham khảo thêm' làm anchor.",
    "Đặt link trong đoạn văn đang giải thích ý liên quan, không gom thành block link riêng nếu không thật cần thiết.",
  ].join("\n") : "Không có URL nội bộ đã xác minh; không tự tạo internal link.";

  if (task === "outline") {
    return `${common}\n${internalLinkRules}\nHãy tạo outline SEO có H1, meta title, meta description, slug, H2/H3, FAQ, CTA, gợi ý ảnh, internalLinks là mảng chỉ gồm URL chính xác đã chọn và dịch vụ/dự án liên quan.`;
  }
  if (task === "meta") {
    return `${common}\nHãy tạo bộ metadata SEO gồm meta title, meta description, slug, OG title, OG description, focus keyword và FAQ schema đề xuất.`;
  }
  return `${common}\n${internalLinkRules}\nHãy viết bài SEO hoàn chỉnh bằng HTML sạch phù hợp TipTap. Có đoạn mở đầu, H2/H3, bullet list nếu cần, FAQ và CTA cuối bài. Trả thêm internalLinks là mảng URL nội bộ chính xác đã thực sự dùng trong contentHtml. Không tự publish.`;
}

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeOutlineInternalLinks(output: unknown, candidates: InternalLinkCandidate[]) {
  if (!output || typeof output !== "object") return output;
  const result = output as Record<string, unknown>;
  const allowed = new Set(candidates.map((candidate) => candidate.url));
  const proposed = Array.isArray(result.internalLinks) ? result.internalLinks.filter((url): url is string => typeof url === "string" && allowed.has(url)) : [];
  result.internalLinks = Array.from(new Set(proposed.length ? proposed : candidates.slice(0, 4).map((candidate) => candidate.url))).slice(0, 4);
  return result;
}

function enforceArticleInternalLinks(output: unknown, candidates: InternalLinkCandidate[], dto: AiContentDto) {
  if (!output || typeof output !== "object") return output;
  const article = output as Record<string, unknown>;
  if (typeof article.contentHtml !== "string") {
    article.internalLinks = [];
    return article;
  }

  const allowed = new Map(candidates.map((candidate) => [candidate.url, candidate]));
  const retainedUrls: string[] = [];
  let html = article.contentHtml.replace(/<a\b([^>]*?)href=(['"])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi, (full, before: string, quote: string, href: string, after: string, label: string) => {
    const normalizedHref = normalizeInternalHref(href);
    if (!normalizedHref) return full;
    if (normalizedHref === "/lien-he") {
      return `<a${before}href=${quote}${normalizedHref}${quote}${after}>${label}</a>`;
    }
    if (allowed.has(normalizedHref) && retainedUrls.length < 4 && !retainedUrls.includes(normalizedHref)) {
      retainedUrls.push(normalizedHref);
      return `<a${before}href=${quote}${normalizedHref}${quote}${after}>${label}</a>`;
    }
    return label;
  });

  const used = candidates.filter((candidate) => retainedUrls.includes(candidate.url));
  const targetLinkCount = getInternalLinkTargetCount(html, candidates.length);
  const needed = Math.max(0, targetLinkCount - used.length);
  if (needed > 0) {
    const additions = candidates.filter((candidate) => !used.some((item) => item.url === candidate.url)).slice(0, needed);
    const usedAnchors = new Set(extractAnchorLabels(html));
    additions.forEach((candidate, index) => {
      const anchor = pickAnchorText(candidate, dto, usedAnchors, index === 0 && used.length === 0);
      usedAnchors.add(normalizeSearchText(anchor));
      const sentence = buildNaturalInternalLinkSentence(candidate, `<a href="${candidate.url}">${escapeHtml(anchor)}</a>`);
      html = injectSentenceIntoNaturalParagraph(html, sentence, index + used.length);
      used.push(candidate);
    });
  }

  article.contentHtml = html;
  article.internalLinks = Array.from(new Set(used.map((candidate) => candidate.url))).slice(0, 4);
  return article;
}

function buildAnchorSuggestions(candidate: InternalLinkCandidate, dto: AiContentDto) {
  const suggestions = [
    candidate.title,
    dto.focusKeyword,
    ...(dto.secondaryKeywords || "").split(","),
    `${candidate.kind} ${candidate.title}`,
  ]
    .map((value) => safeAnchorText(value))
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(suggestions.map((value) => value.trim()))).slice(0, 4);
}

function pickAnchorText(candidate: InternalLinkCandidate, dto: AiContentDto, usedAnchors: Set<string>, allowExactKeyword: boolean) {
  const candidates = [
    allowExactKeyword ? dto.focusKeyword : "",
    candidate.title,
    ...buildAnchorSuggestions(candidate, dto),
  ];
  for (const item of candidates) {
    const anchor = safeAnchorText(item);
    if (anchor && !usedAnchors.has(normalizeSearchText(anchor))) return anchor;
  }
  return safeAnchorText(candidate.title) || "nội dung liên quan";
}

function safeAnchorText(value: unknown) {
  if (typeof value !== "string") return "";
  return stripHtml(value)
    .replace(/\s+/g, " ")
    .replace(/^[,.;:|\-\s]+|[,.;:|\-\s]+$/g, "")
    .trim()
    .slice(0, 90);
}

function getInternalLinkTargetCount(html: string, candidateCount: number) {
  if (!candidateCount) return 0;
  const wordCount = countHtmlWords(html);
  const ratioBasedCount = Math.ceil(wordCount / 450);
  const minimum = wordCount >= 700 ? 2 : 1;
  return Math.min(4, candidateCount, Math.max(minimum, ratioBasedCount));
}

function countHtmlWords(html: string) {
  const normalized = normalizeSearchText(stripHtml(html));
  return normalized ? normalized.split(/\s+/).filter(Boolean).length : 0;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function extractAnchorLabels(html: string) {
  const labels: string[] = [];
  html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (_full, label: string) => {
    const anchor = safeAnchorText(label);
    if (anchor) labels.push(normalizeSearchText(anchor));
    return "";
  });
  return labels;
}

function buildNaturalInternalLinkSentence(candidate: InternalLinkCandidate, anchorHtml: string) {
  if (candidate.url.startsWith("/tin-tuc/")) {
    return `Bạn có thể đọc thêm ${anchorHtml} để mở rộng góc nhìn trước khi chốt phương án.`;
  }
  if (candidate.url.startsWith("/dich-vu/")) {
    return `Khi cần triển khai bài bản hơn, ${anchorHtml} là phần nên đối chiếu để hiểu rõ phạm vi công việc.`;
  }
  if (candidate.url.startsWith("/du-an/")) {
    return `Một ví dụ gần với chủ đề này là ${anchorHtml}, giúp bạn hình dung cách xử lý không gian trong thực tế.`;
  }
  if (candidate.url.startsWith("/mau-thiet-ke-")) {
    return `Nếu muốn xem thêm hướng bố trí cụ thể, ${anchorHtml} sẽ là gợi ý đáng tham khảo.`;
  }
  return `Nội dung ${anchorHtml} cũng giúp bổ sung thêm góc nhìn liên quan cho phần này.`;
}

function injectSentenceIntoNaturalParagraph(html: string, sentence: string, preferredIndex: number) {
  let paragraphIndex = 0;
  let inserted = false;
  const updated = html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (full, attrs: string, body: string) => {
    if (inserted) return full;
    const plain = stripHtml(body);
    const hasLink = /<a\b/i.test(body);
    const hasImage = /<img\b/i.test(body);
    const looksLikeCta = /(liên hệ|tư vấn|nhận báo giá|hotline)/i.test(plain);
    const isUsefulParagraph = plain.length >= 90 && !hasLink && !hasImage && !looksLikeCta;
    if (isUsefulParagraph) {
      const currentIndex = paragraphIndex;
      paragraphIndex += 1;
      if (currentIndex >= preferredIndex) {
        inserted = true;
        const separator = /[.!?…]\s*$/.test(plain) ? " " : ". ";
        return `<p${attrs}>${body}${separator}${sentence}</p>`;
      }
    }
    return full;
  });
  if (inserted) return updated;

  const paragraph = `<p>${sentence}</p>`;
  const ctaPattern = /<(h2|h3)([^>]*)>([^<]*(?:liên hệ|tư vấn|nhận báo giá)[^<]*)<\/\1>/i;
  return ctaPattern.test(html) ? html.replace(ctaPattern, `${paragraph}$&`) : `${html}${paragraph}`;
}

function normalizeInternalHref(href: string) {
  const trimmed = href.trim();
  if (trimmed.startsWith("/")) return trimmed.split(/[?#]/)[0];
  try {
    const url = new URL(trimmed);
    if (url.hostname === "hathanhhome.vn" || url.hostname === "www.hathanhhome.vn") return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return null;
  }
  return null;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function joinVietnameseLinks(links: string[]) {
  if (links.length < 2) return links[0] || "";
  return `${links.slice(0, -1).join(", ")} và ${links.at(-1)}`;
}

function asAiSetting(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, item == null ? "" : String(item)]));
}

function settingString(settings: Record<string, string>, camelKey: string, snakeKey: string) {
  return nonEmpty(settings[camelKey]) || nonEmpty(settings[snakeKey]);
}

function nonEmpty(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

function normalizeHttpsBaseUrl(value: string, fallback: string) {
  const candidate = (value || fallback).trim().replace(/\/+$/, "");
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") throw new Error("Base URL must use HTTPS");
    return url.toString().replace(/\/+$/, "");
  } catch {
    throw new BadRequestException("AI Base URL must be a valid HTTPS URL");
  }
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function resolveOpenAiContentConfig(settings: Record<string, string>): AiContentConfig {
  const wireApi = settingString(settings, "openaiWireApi", "openai_wire_api") || process.env.OPENAI_WIRE_API || "chat_completions";
  const normalizedWireApi = wireApi === "responses" ? "responses" : "chat_completions";
  const effort = settingString(settings, "openaiReasoningEffort", "openai_reasoning_effort") || process.env.OPENAI_REASONING_EFFORT || "high";
  const normalizedEffort = effort === "low" || effort === "medium" || effort === "high" ? effort : "high";
  const maxTokens = clampInteger(
    settingString(settings, "openaiMaxTokens", "openai_max_tokens") || process.env.OPENAI_MAX_TOKENS,
    4096,
    1,
    128000,
  );

  return {
    apiKey: settingString(settings, "openaiApiKey", "openai_api_key") || process.env.OPENAI_API_KEY || "",
    baseUrl: normalizeHttpsBaseUrl(
      settingString(settings, "openaiBaseUrl", "openai_base_url") || process.env.OPENAI_BASE_URL || "",
      "https://modelapi.vn/v1",
    ),
    wireApi: normalizedWireApi,
    model: settingString(settings, "openaiModel", "openai_model")
      || settingString(settings, "openaiModelWriter", "openai_model_writer")
      || settingString(settings, "openaiModelFast", "openai_model_fast")
      || process.env.OPENAI_MODEL
      || process.env.OPENAI_MODEL_WRITER
      || process.env.OPENAI_MODEL_FAST
      || "gpt-5.5",
    reasoningEffort: normalizedEffort,
    maxTokens,
    provider: "openai-compatible",
  };
}

function resolveOpenAiImageConfig(settings: Record<string, string>): AiImageConfig {
  const quality = settingString(settings, "openaiImageQuality", "openai_image_quality") || process.env.OPENAI_IMAGE_QUALITY || "medium";
  const normalizedQuality = quality === "low" || quality === "medium" || quality === "high" || quality === "auto" ? quality : "medium";

  return {
    apiKey: settingString(settings, "openaiImageApiKey", "openai_image_api_key") || process.env.OPENAI_IMAGE_API_KEY || "",
    baseUrl: normalizeHttpsBaseUrl(
      settingString(settings, "openaiImageBaseUrl", "openai_image_base_url") || process.env.OPENAI_IMAGE_BASE_URL || "",
      "https://api.openai.com/v1",
    ),
    model: settingString(settings, "openaiImageModel", "openai_image_model") || process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    quality: normalizedQuality,
  };
}

function parseResponseJson(data: Record<string, unknown>) {
  const direct = data.output_text;
  if (typeof direct === "string") return parseJsonText(direct);
  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output as Array<Record<string, unknown>>) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content as Array<Record<string, unknown>>) {
      if (typeof part.text === "string") return parseJsonText(part.text);
    }
  }
  const choices = Array.isArray(data.choices) ? data.choices : [];
  for (const choice of choices as Array<Record<string, unknown>>) {
    const message = choice.message;
    if (message && typeof message === "object" && "content" in message) {
      const content = (message as { content?: unknown }).content;
      if (typeof content === "string") return parseJsonText(content);
    }
  }
  throw new BadRequestException("AI response did not contain JSON text");
}

function parseJsonText(value: string) {
  const cleaned = value.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
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
    internalLinks: { type: "array", items: { type: "string" } },
    faq: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } } } },
    cta: { type: "string" },
  },
};
