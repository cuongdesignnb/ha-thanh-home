import {
  BadRequestException,
  Body,
  Controller,
  ConflictException,
  Delete,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { ContentStatus, LeadStatus, MenuLocation, MenuTarget, Prisma, ProjectFilterModule, ProjectFilterType, ProjectGroup } from "@prisma/client";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { cleanHtml, createSlug, listMeta, parsePagination, uniqueSlug, safeString } from "./cms-utils";
import { JwtGuard } from "./jwt.guard";
import { PrismaService } from "./prisma.service";
import { fixedServicePageWhere } from "./public-content-rules";
import { decidePublishedAtUpdate, publishedAtPrismaValue } from "./publication-date";
import { omitUndefined, updateWithExpectedVersion } from "./optimistic-update";
import {
  isRecord,
  mergeSettingsJson,
  nextSettingsUpdatedAt,
  parseSettingsWriteInput,
  SettingsWriteInputError,
} from "./settings-concurrency";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

class ProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(ProjectGroup)
  group?: ProjectGroup;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  areaValue?: number;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  scale?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thumbnailMediaId?: number;

  @IsOptional()
  @IsArray()
  galleryMediaIds?: number[];

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPortfolioVerified?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  expectedUpdatedAt?: string;
}

class ProjectCategoryDto {
  @IsEnum(ProjectGroup)
  group!: ProjectGroup;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class PostCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class ProjectFilterOptionDto {
  @IsOptional()
  @IsEnum(ProjectFilterModule)
  module?: ProjectFilterModule;

  @IsEnum(ProjectGroup)
  group!: ProjectGroup;

  @IsEnum(ProjectFilterType)
  type!: ProjectFilterType;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class MenuDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(MenuLocation)
  location!: MenuLocation;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class MenuItemDto {
  @Type(() => Number)
  @IsInt()
  menuId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number | null;

  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  @MinLength(1)
  url!: string;

  @IsOptional()
  @IsEnum(MenuTarget)
  target?: MenuTarget;

  @IsOptional()
  @IsString()
  rel?: string;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  referenceId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

type MenuTreeInput = {
  id: number;
  children?: MenuTreeInput[];
};

class MenuReorderDto {
  @IsArray()
  tree!: MenuTreeInput[];
}

class ServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(ProjectGroup)
  group?: ProjectGroup;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thumbnailMediaId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  galleryMediaIds?: number[];

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  expectedUpdatedAt?: string;
}

class PageDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thumbnailMediaId?: number;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  expectedUpdatedAt?: string;
}

class PostDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thumbnailMediaId?: number;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  focusKeyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readingTime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  wordCount?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  expectedUpdatedAt?: string;
}

class ArchitectureDesignDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  houseType?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  area?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floors?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facadeWidth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  depth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bathrooms?: number;

  @IsOptional()
  @IsString()
  roofType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedBudget?: number;

  @IsOptional()
  @IsString()
  constructionTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thumbnailMediaId?: number;

  @IsOptional()
  @IsArray()
  galleryMediaIds?: number[];

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  expectedUpdatedAt?: string;
}

class InteriorDesignDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  interiorStyle?: string;

  @IsOptional()
  @IsString()
  houseType?: string;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  area?: number;

  @IsOptional()
  @IsString()
  layoutType?: string;

  @IsOptional()
  @IsString()
  materialTone?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budgetMax?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  thumbnailMediaId?: number;

  @IsOptional()
  @IsArray()
  galleryMediaIds?: number[];

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  expectedUpdatedAt?: string;
}

class LeadUpdateDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

class LeadNoteDto {
  @IsString()
  @MinLength(1)
  note!: string;
}

class SchedulePostDto {
  @IsString()
  scheduledAt!: string;
}

type JwtUser = {
  sub: number;
  email: string;
  roles?: string[];
};

@Controller("api/admin")
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("dashboard")
  @Roles("Admin", "SEO Editor", "Sales", "Viewer")
  async dashboard() {
    const [
      totalProjects,
      constructionProjects,
      interiorProjects,
      totalPosts,
      newLeads,
      scheduledPosts,
      architectureDesigns,
      interiorDesigns,
      publishedDesignTemplates,
      recentLeads,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { group: ProjectGroup.construction } }),
      this.prisma.project.count({ where: { group: ProjectGroup.interior } }),
      this.prisma.post.count(),
      this.prisma.lead.count({ where: { status: LeadStatus.new } }),
      this.prisma.post.count({ where: { status: ContentStatus.scheduled } }),
      this.prisma.architectureDesignTemplate.count(),
      this.prisma.interiorDesignTemplate.count(),
      Promise.all([
        this.prisma.architectureDesignTemplate.count({ where: { status: ContentStatus.published } }),
        this.prisma.interiorDesignTemplate.count({ where: { status: ContentStatus.published } }),
      ]).then(([architecture, interior]) => architecture + interior),
      this.prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    return {
      metrics: {
        totalProjects,
        constructionProjects,
        interiorProjects,
        totalPosts,
        newLeads,
        scheduledPosts,
        architectureDesigns,
        interiorDesigns,
        publishedDesignTemplates,
      },
      recentLeads,
    };
  }

  @Get("projects")
  @Roles("Admin", "Viewer")
  async listProjects(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const and: Prisma.ProjectWhereInput[] = [];
    if (query.category) {
      const categorySlugs = query.category.split(",").map((s) => s.trim()).filter(Boolean);
      if (categorySlugs.length > 0) {
        and.push({
          OR: [
            { categoryRef: { slug: { in: categorySlugs } } },
            { OR: categorySlugs.map((slug) => ({ category: { contains: slug } })) }
          ]
        });
      }
    }
    if (query.search) {
      and.push({
        OR: [
          { title: { contains: query.search } },
          { slug: { contains: query.search } },
          { location: { contains: query.search } },
          { clientName: { contains: query.search } },
        ],
      });
    }
    const where: Prisma.ProjectWhereInput = {
      ...(query.group ? { group: { in: query.group.split(",").map((g) => g.trim() as ProjectGroup).filter(Boolean) } } : {}),
      ...(query.status ? { status: query.status as ContentStatus } : {}),
      ...(query.categoryId ? { categoryId: Number(query.categoryId) } : {}),
      ...(query.projectType ? { projectType: query.projectType } : {}),
      ...(query.style ? { style: query.style } : {}),
      ...(query.scale ? { scale: query.scale } : {}),
      ...(query.location ? { location: query.location } : {}),
      ...(query.areaMin || query.areaMax ? { areaValue: { gte: optionalNumber(query.areaMin), lte: optionalNumber(query.areaMax) } } : {}),
      ...(and.length ? { AND: and } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({ where, skip, take: limit, include: { thumbnailMedia: true, categoryRef: true }, orderBy: projectOrder(query.sort) }),
      this.prisma.project.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Get("projects/:id")
  @Roles("Admin", "Viewer")
  async getProject(@Param("id") id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: Number(id) },
      include: { thumbnailMedia: true, categoryRef: true },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  @Get("project-categories")
  @Roles("Admin", "Viewer")
  async listProjectCategories(@Query() query: Record<string, string>) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(1000, Math.max(1, Number(query.limit || 100)));
    const skip = (page - 1) * limit;
    const where: Prisma.ProjectCategoryWhereInput = {
      ...(query.group ? { group: query.group as ProjectGroup } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search } }, { slug: { contains: query.search } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.projectCategory.findMany({ where, skip, take: limit, orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
      this.prisma.projectCategory.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Post("project-categories")
  @Roles("Admin")
  async createProjectCategory(@Body() dto: ProjectCategoryDto) {
    const slug = await uniqueSlug(dto.name, dto.slug, (candidate) =>
      this.prisma.projectCategory.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.projectCategory.create({ data: { ...dto, slug, sortOrder: dto.sortOrder || 0, isActive: dto.isActive === null ? true : (dto.isActive ?? true) } });
  }

  @Patch("project-categories/:id")
  @Roles("Admin")
  async updateProjectCategory(@Param("id") id: string, @Body() dto: ProjectCategoryDto) {
    const currentId = Number(id);
    const slug = dto.slug
      ? await uniqueSlug(dto.name, dto.slug, async (candidate) => {
          const match = await this.prisma.projectCategory.findUnique({ where: { slug: candidate } });
          return Boolean(match && match.id !== currentId);
        })
      : undefined;
    return this.prisma.projectCategory.update({ where: { id: currentId }, data: { ...dto, isActive: dto.isActive === null ? true : dto.isActive, ...(slug ? { slug } : {}) } });
  }

  @Delete("project-categories/:id")
  @Roles("Admin")
  deleteProjectCategory(@Param("id") id: string) {
    return this.prisma.projectCategory.delete({ where: { id: Number(id) } });
  }

  @Get("project-filter-options")
  @Roles("Admin", "Viewer")
  async listProjectFilterOptions(@Query() query: Record<string, string>) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(1000, Math.max(1, Number(query.limit || 100)));
    const skip = (page - 1) * limit;
    const where: Prisma.ProjectFilterOptionWhereInput = {
      ...(query.module ? { module: query.module as ProjectFilterModule } : {}),
      ...(query.group ? { group: query.group as ProjectGroup } : {}),
      ...(query.type ? { type: query.type as ProjectFilterType } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search } }, { slug: { contains: query.search } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.projectFilterOption.findMany({ where, skip, take: limit, orderBy: [{ module: "asc" }, { group: "asc" }, { type: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
      this.prisma.projectFilterOption.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Post("project-filter-options")
  @Roles("Admin")
  async createProjectFilterOption(@Body() dto: ProjectFilterOptionDto) {
    const module = dto.module || ProjectFilterModule.project;
    const trimmedName = dto.name.trim();

    const existing = await this.prisma.projectFilterOption.findFirst({
      where: {
        module,
        group: dto.group,
        type: dto.type,
        name: trimmedName,
      },
    });

    if (existing) {
      if (!existing.isActive) {
        return this.prisma.projectFilterOption.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      return existing;
    }

    const baseSlug = `${module}-${dto.group}-${dto.type}-${dto.slug || trimmedName}`;
    const slug = await uniqueSlug(trimmedName, baseSlug, (candidate) =>
      this.prisma.projectFilterOption.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.projectFilterOption.create({ data: { ...dto, name: trimmedName, module, slug, sortOrder: dto.sortOrder || 0, isActive: dto.isActive ?? true } });
  }

  @Patch("project-filter-options/:id")
  @Roles("Admin")
  async updateProjectFilterOption(@Param("id") id: string, @Body() dto: ProjectFilterOptionDto) {
    const currentId = Number(id);
    const module = dto.module || ProjectFilterModule.project;
    const baseSlug = `${module}-${dto.group}-${dto.type}-${dto.slug || dto.name}`;
    const slug = dto.slug
      ? await uniqueSlug(dto.name, baseSlug, async (candidate) => {
          const match = await this.prisma.projectFilterOption.findUnique({ where: { slug: candidate } });
          return Boolean(match && match.id !== currentId);
        })
      : undefined;
    return this.prisma.projectFilterOption.update({ where: { id: currentId }, data: { ...dto, module, ...(slug ? { slug } : {}) } });
  }

  @Delete("project-filter-options/:id")
  @Roles("Admin")
  deleteProjectFilterOption(@Param("id") id: string) {
    return this.prisma.projectFilterOption.delete({ where: { id: Number(id) } });
  }

  @Get("post-categories")
  @Roles("Admin", "SEO Editor", "Viewer")
  async listPostCategories(@Query() query: Record<string, string>) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(1000, Math.max(1, Number(query.limit || 100)));
    const skip = (page - 1) * limit;
    const where: Prisma.PostCategoryWhereInput = {
      ...(query.search ? { OR: [{ name: { contains: query.search } }, { slug: { contains: query.search } }] } : {}),
      ...(query.status === "active" ? { isActive: true } : {}),
      ...(query.status === "inactive" ? { isActive: false } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.postCategory.findMany({ where, skip, take: limit, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      this.prisma.postCategory.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Post("post-categories")
  @Roles("Admin", "SEO Editor")
  async createPostCategory(@Body() dto: PostCategoryDto) {
    const slug = await uniqueSlug(dto.name, dto.slug, (candidate) =>
      this.prisma.postCategory.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.postCategory.create({ data: { ...dto, slug, isActive: dto.isActive === null ? true : (dto.isActive ?? true) } });
  }

  @Patch("post-categories/:id")
  @Roles("Admin", "SEO Editor")
  async updatePostCategory(@Param("id") id: string, @Body() dto: PostCategoryDto) {
    const currentId = Number(id);
    const slug = dto.slug
      ? await uniqueSlug(dto.name, dto.slug, async (candidate) => {
          const match = await this.prisma.postCategory.findUnique({ where: { slug: candidate } });
          return Boolean(match && match.id !== currentId);
        })
      : undefined;
    return this.prisma.postCategory.update({ where: { id: currentId }, data: { ...dto, isActive: dto.isActive === null ? true : dto.isActive, ...(slug ? { slug } : {}) } });
  }

  @Delete("post-categories/:id")
  @Roles("Admin", "SEO Editor")
  async deletePostCategory(@Param("id") id: string) {
    const categoryId = Number(id);
    await this.prisma.post.updateMany({ where: { categoryId }, data: { categoryId: null } });
    return this.prisma.postCategory.delete({ where: { id: categoryId } });
  }

  @Get("menus")
  @Roles("Admin", "Viewer")
  async listMenus(@Query() query: Record<string, string>) {
    const where: Prisma.MenuWhereInput = {
      ...(query.location ? { location: query.location as MenuLocation } : {}),
    };
    return this.prisma.menu.findMany({
      where,
      include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
      orderBy: [{ location: "asc" }, { id: "asc" }],
    });
  }

  @Post("menus")
  @Roles("Admin")
  createMenu(@Body() dto: MenuDto) {
    return this.prisma.menu.create({ data: { ...dto, isActive: dto.isActive ?? true }, include: { items: true } });
  }

  @Patch("menus/:id")
  @Roles("Admin")
  updateMenu(@Param("id") id: string, @Body() dto: MenuDto) {
    return this.prisma.menu.update({ where: { id: Number(id) }, data: dto, include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } } });
  }

  @Delete("menus/:id")
  @Roles("Admin")
  deleteMenu(@Param("id") id: string) {
    return this.prisma.menu.delete({ where: { id: Number(id) } });
  }

  @Post("menu-items")
  @Roles("Admin")
  async createMenuItem(@Body() dto: MenuItemDto) {
    await this.assertMenuDepth(dto.menuId, dto.parentId ?? null);
    return this.prisma.menuItem.create({
      data: {
        ...dto,
        parentId: dto.parentId || null,
        target: dto.target || MenuTarget.self,
        itemType: dto.itemType || "custom",
        isActive: dto.isActive ?? true,
      },
    });
  }

  @Patch("menu-items/:id")
  @Roles("Admin")
  async updateMenuItem(@Param("id") id: string, @Body() dto: MenuItemDto) {
    const currentId = Number(id);
    if (dto.parentId === currentId) throw new BadRequestException("Menu item cannot be parent of itself");
    await this.assertMenuDepth(dto.menuId, dto.parentId ?? null);
    return this.prisma.menuItem.update({
      where: { id: currentId },
      data: {
        ...dto,
        parentId: dto.parentId || null,
        target: dto.target || MenuTarget.self,
        itemType: dto.itemType || "custom",
      },
    });
  }

  @Delete("menu-items/:id")
  @Roles("Admin")
  deleteMenuItem(@Param("id") id: string) {
    return this.prisma.menuItem.delete({ where: { id: Number(id) } });
  }

  @Patch("menus/:id/reorder")
  @Roles("Admin")
  async reorderMenu(@Param("id") id: string, @Body() dto: MenuReorderDto) {
    const menuId = Number(id);
    if (!Array.isArray(dto.tree)) throw new BadRequestException("Menu tree must be an array");
    const updates = flattenMenuTree(dto.tree || []);
    if (updates.some((item) => item.depth > 2)) throw new BadRequestException("Menu chỉ hỗ trợ tối đa 3 cấp");
    const existing = await this.prisma.menuItem.findMany({ where: { menuId }, select: { id: true } });
    const existingIds = new Set(existing.map((item) => item.id));
    if (updates.some((item) => !existingIds.has(item.id))) throw new BadRequestException("Menu reorder contains invalid item");
    await this.prisma.$transaction(
      updates.map((item) =>
        this.prisma.menuItem.update({
          where: { id: item.id },
          data: { parentId: item.parentId, sortOrder: item.sortOrder },
        }),
      ),
    );
    return this.prisma.menu.findUnique({ where: { id: menuId }, include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } } });
  }

  @Get("menu-link-suggestions")
  @Roles("Admin", "Viewer")
  async menuLinkSuggestions() {
    const staticRoutes = [
      ["Trang chủ", "/"],
      ["Giới thiệu", "/gioi-thieu"],
      ["Dự án", "/du-an"],
      ["Dự án công trình", "/du-an/cong-trinh"],
      ["Dự án nội thất", "/du-an/noi-that"],
      ["Dịch vụ", "/dich-vu"],
      ["Xây nhà trọn gói", "/dich-vu/xay-nha-tron-goi"],
      ["Sản Xuất Thi Công Nội Thất", "/dich-vu/san-xuat-thi-cong-noi-that"],
      ["Thi Công Nhà Xưởng", "/dich-vu/thi-cong-nha-xuong"],
      ["Thi Công Nội Thất Văn Phòng", "/dich-vu/thi-cong-noi-that-van-phong"],
      ["Tin tức", "/tin-tuc"],
      ["Liên hệ", "/lien-he"],
      ["Mẫu thiết kế kiến trúc", "/mau-thiet-ke-kien-truc"],
      ["Mẫu thiết kế nội thất", "/mau-thiet-ke-noi-that"],
    ].map(([label, url]) => ({ label, url, type: "route" }));

    const [projects, services, posts, postCategories, architectureDesigns, interiorDesigns] = await Promise.all([
      this.prisma.project.findMany({ select: { id: true, title: true, slug: true, status: true }, orderBy: { updatedAt: "desc" }, take: 60 }),
      this.prisma.service.findMany({ where: fixedServicePageWhere(), select: { id: true, title: true, slug: true, status: true }, orderBy: { updatedAt: "desc" }, take: 60 }),
      this.prisma.post.findMany({ select: { id: true, title: true, slug: true, status: true }, orderBy: { updatedAt: "desc" }, take: 60 }),
      this.prisma.postCategory.findMany({ select: { id: true, name: true, slug: true, isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 60 }),
      this.prisma.architectureDesignTemplate.findMany({ select: { id: true, title: true, slug: true, status: true }, orderBy: { updatedAt: "desc" }, take: 60 }),
      this.prisma.interiorDesignTemplate.findMany({ select: { id: true, title: true, slug: true, status: true }, orderBy: { updatedAt: "desc" }, take: 60 }),
    ]);
    return [
      ...staticRoutes,
      ...projects.map((item) => ({ label: item.title, url: `/du-an/${item.slug}`, type: "project", referenceId: item.id, status: item.status })),
      ...services.map((item) => ({ label: item.title, url: `/dich-vu/${item.slug}`, type: "service", referenceId: item.id, status: item.status })),
      ...postCategories.map((item) => ({ label: `Danh mục: ${item.name}`, url: `/tin-tuc?category=${item.slug}`, type: "post_category", referenceId: item.id, status: item.isActive ? "active" : "inactive" })),
      ...posts.map((item) => ({ label: item.title, url: `/tin-tuc/${item.slug}`, type: "post", referenceId: item.id, status: item.status })),
      ...architectureDesigns.map((item) => ({ label: item.title, url: `/mau-thiet-ke-kien-truc/${item.slug}`, type: "architecture_design", referenceId: item.id, status: item.status })),
      ...interiorDesigns.map((item) => ({ label: item.title, url: `/mau-thiet-ke-noi-that/${item.slug}`, type: "interior_design", referenceId: item.id, status: item.status })),
    ];
  }

  @Post("projects")
  @Roles("Admin")
  async createProject(@Body() dto: ProjectDto) {
    const title = requireTitle(dto.title);
    if (!dto.group) throw new BadRequestException("group is required");
    const { expectedUpdatedAt: _expectedUpdatedAt, ...createDto } = dto;
    const contentHtml = cleanHtml(dto.contentHtml);
    if (contentHtml) {
      const duplicate = await this.prisma.project.findFirst({ where: { title, contentHtml } });
      if (duplicate) {
        throw new ConflictException(`A project with the same title and content already exists (ID ${duplicate.id}). Update that record instead of creating a duplicate.`);
      }
    }
    const slug = await createSlug(title, dto.slug, (candidate) =>
      this.prisma.project.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.project.create({
      data: {
        ...createDto,
        title,
        group: dto.group,
        isPortfolioVerified: dto.isPortfolioVerified ?? false,
        isFeatured: dto.isFeatured === null ? false : dto.isFeatured,
        categoryId: dto.categoryId || null,
        thumbnailMediaId: dto.thumbnailMediaId || null,
        slug,
        contentHtml,
        galleryMediaIds: dto.galleryMediaIds || undefined,
        status: dto.status || ContentStatus.draft,
        publishedAt: dto.status === ContentStatus.published ? new Date() : undefined,
      },
      include: { thumbnailMedia: true, categoryRef: true },
    });
  }

  @Patch("projects/:id")
  @Roles("Admin")
  async updateProject(@Param("id") id: string, @Body() dto: ProjectDto) {
    const currentId = Number(id);
    const patchDto = { ...dto };
    delete patchDto.expectedUpdatedAt;
    delete patchDto.isFeatured;
    delete patchDto.isPortfolioVerified;
    delete patchDto.publishedAt;
    return updateWithExpectedVersion({
      entityName: "Project",
      expectedUpdatedAt: dto.expectedUpdatedAt,
      findCurrent: () => this.prisma.project.findUnique({ where: { id: currentId }, select: { updatedAt: true, status: true, title: true } }),
      updateMany: async (expectedUpdatedAt, current) => {
        const slug = dto.slug
          ? await uniqueSlug(dto.title ?? current.title, dto.slug, async (candidate) => {
              const match = await this.prisma.project.findUnique({ where: { slug: candidate } });
              return Boolean(match && match.id !== currentId);
            })
          : undefined;
        const publishedAt = publicationDateForUpdate(current.status, dto.status, dto.publishedAt);
        const data = omitUndefined({
          ...patchDto,
          ...(dto.title !== undefined ? { title: safeString(dto.title, 191)! } : {}),
          ...(dto.isFeatured !== undefined && dto.isFeatured !== null ? { isFeatured: dto.isFeatured } : {}),
          ...(dto.isPortfolioVerified !== undefined && dto.isPortfolioVerified !== null ? { isPortfolioVerified: dto.isPortfolioVerified } : {}),
          ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId || null } : {}),
          ...(dto.thumbnailMediaId !== undefined ? { thumbnailMediaId: dto.thumbnailMediaId || null } : {}),
          ...(slug ? { slug } : {}),
          ...(dto.contentHtml !== undefined ? { contentHtml: cleanHtml(dto.contentHtml) } : {}),
          ...(dto.galleryMediaIds !== undefined ? { galleryMediaIds: dto.galleryMediaIds } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        });
        if (Object.keys(data).length === 0) return { count: 1 };
        return this.prisma.project.updateMany({ where: { id: currentId, updatedAt: expectedUpdatedAt }, data });
      },
      findSaved: () => this.prisma.project.findUnique({ where: { id: currentId }, include: { thumbnailMedia: true, categoryRef: true } }),
    });
  }

  @Delete("projects/:id")
  @Roles("Admin")
  deleteProject(@Param("id") id: string) {
    return this.prisma.project.delete({ where: { id: Number(id) } });
  }

  @Get("architecture-designs")
  @Roles("Admin", "Viewer")
  async listArchitectureDesigns(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where = architectureDesignWhere(query, true);
    const [data, total] = await Promise.all([
      this.prisma.architectureDesignTemplate.findMany({
        where,
        skip,
        take: limit,
        include: { thumbnailMedia: true },
        orderBy: adminDesignOrder(query.sort, "architecture"),
      }),
      this.prisma.architectureDesignTemplate.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Get("architecture-designs/:id")
  @Roles("Admin", "Viewer")
  async getArchitectureDesign(@Param("id") id: string) {
    const design = await this.prisma.architectureDesignTemplate.findUnique({
      where: { id: Number(id) },
      include: { thumbnailMedia: true },
    });
    if (!design) throw new NotFoundException("Architecture design not found");
    return design;
  }

  @Post("architecture-designs")
  @Roles("Admin")
  async createArchitectureDesign(@Body() dto: ArchitectureDesignDto) {
    const title = requireTitle(dto.title);
    const { expectedUpdatedAt: _expectedUpdatedAt, ...createDto } = dto;
    const slug = await createSlug(title, dto.slug, (candidate) =>
      this.prisma.architectureDesignTemplate.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.architectureDesignTemplate.create({
      data: {
        ...createDto,
        title,
        isFeatured: dto.isFeatured === null ? false : dto.isFeatured,
        slug,
        contentHtml: cleanHtml(dto.contentHtml),
        galleryMediaIds: dto.galleryMediaIds || undefined,
        status: dto.status || ContentStatus.draft,
        publishedAt: dto.status === ContentStatus.published ? new Date() : undefined,
      },
      include: { thumbnailMedia: true },
    });
  }

  @Patch("architecture-designs/:id")
  @Roles("Admin")
  async updateArchitectureDesign(@Param("id") id: string, @Body() dto: ArchitectureDesignDto) {
    const currentId = Number(id);
    const patchDto = { ...dto };
    delete patchDto.expectedUpdatedAt;
    delete patchDto.isFeatured;
    delete patchDto.publishedAt;
    return updateWithExpectedVersion({
      entityName: "Architecture design",
      expectedUpdatedAt: dto.expectedUpdatedAt,
      findCurrent: () => this.prisma.architectureDesignTemplate.findUnique({ where: { id: currentId }, select: { updatedAt: true, status: true, title: true } }),
      updateMany: async (expectedUpdatedAt, current) => {
        const slug = dto.slug
          ? await uniqueSlug(dto.title ?? current.title, dto.slug, async (candidate) => {
              const match = await this.prisma.architectureDesignTemplate.findUnique({ where: { slug: candidate } });
              return Boolean(match && match.id !== currentId);
            })
          : undefined;
        const publishedAt = publicationDateForUpdate(current.status, dto.status, dto.publishedAt);
        const data = omitUndefined({
          ...patchDto,
          ...(dto.title !== undefined ? { title: safeString(dto.title, 191)! } : {}),
          ...(dto.isFeatured !== undefined && dto.isFeatured !== null ? { isFeatured: dto.isFeatured } : {}),
          ...(slug ? { slug } : {}),
          ...(dto.contentHtml !== undefined ? { contentHtml: cleanHtml(dto.contentHtml) } : {}),
          ...(dto.galleryMediaIds !== undefined ? { galleryMediaIds: dto.galleryMediaIds } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        });
        if (Object.keys(data).length === 0) return { count: 1 };
        return this.prisma.architectureDesignTemplate.updateMany({ where: { id: currentId, updatedAt: expectedUpdatedAt }, data });
      },
      findSaved: () => this.prisma.architectureDesignTemplate.findUnique({ where: { id: currentId }, include: { thumbnailMedia: true } }),
    });
  }

  @Delete("architecture-designs/:id")
  @Roles("Admin")
  deleteArchitectureDesign(@Param("id") id: string) {
    return this.prisma.architectureDesignTemplate.delete({ where: { id: Number(id) } });
  }

  @Get("interior-designs")
  @Roles("Admin", "Viewer")
  async listInteriorDesigns(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where = interiorDesignWhere(query, true);
    const [data, total] = await Promise.all([
      this.prisma.interiorDesignTemplate.findMany({
        where,
        skip,
        take: limit,
        include: { thumbnailMedia: true },
        orderBy: adminDesignOrder(query.sort, "interior"),
      }),
      this.prisma.interiorDesignTemplate.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Get("interior-designs/:id")
  @Roles("Admin", "Viewer")
  async getInteriorDesign(@Param("id") id: string) {
    const design = await this.prisma.interiorDesignTemplate.findUnique({
      where: { id: Number(id) },
      include: { thumbnailMedia: true },
    });
    if (!design) throw new NotFoundException("Interior design not found");
    return design;
  }

  @Post("interior-designs")
  @Roles("Admin")
  async createInteriorDesign(@Body() dto: InteriorDesignDto) {
    const title = requireTitle(dto.title);
    const { expectedUpdatedAt: _expectedUpdatedAt, ...createDto } = dto;
    const slug = await createSlug(title, dto.slug, (candidate) =>
      this.prisma.interiorDesignTemplate.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.interiorDesignTemplate.create({
      data: {
        ...createDto,
        title,
        isFeatured: dto.isFeatured === null ? false : dto.isFeatured,
        slug,
        contentHtml: cleanHtml(dto.contentHtml),
        galleryMediaIds: dto.galleryMediaIds || undefined,
        status: dto.status || ContentStatus.draft,
        publishedAt: dto.status === ContentStatus.published ? new Date() : undefined,
      },
      include: { thumbnailMedia: true },
    });
  }

  @Patch("interior-designs/:id")
  @Roles("Admin")
  async updateInteriorDesign(@Param("id") id: string, @Body() dto: InteriorDesignDto) {
    const currentId = Number(id);
    const patchDto = { ...dto };
    delete patchDto.expectedUpdatedAt;
    delete patchDto.isFeatured;
    delete patchDto.publishedAt;
    return updateWithExpectedVersion({
      entityName: "Interior design",
      expectedUpdatedAt: dto.expectedUpdatedAt,
      findCurrent: () => this.prisma.interiorDesignTemplate.findUnique({ where: { id: currentId }, select: { updatedAt: true, status: true, title: true } }),
      updateMany: async (expectedUpdatedAt, current) => {
        const slug = dto.slug
          ? await uniqueSlug(dto.title ?? current.title, dto.slug, async (candidate) => {
              const match = await this.prisma.interiorDesignTemplate.findUnique({ where: { slug: candidate } });
              return Boolean(match && match.id !== currentId);
            })
          : undefined;
        const publishedAt = publicationDateForUpdate(current.status, dto.status, dto.publishedAt);
        const data = omitUndefined({
          ...patchDto,
          ...(dto.title !== undefined ? { title: safeString(dto.title, 191)! } : {}),
          ...(dto.isFeatured !== undefined && dto.isFeatured !== null ? { isFeatured: dto.isFeatured } : {}),
          ...(slug ? { slug } : {}),
          ...(dto.contentHtml !== undefined ? { contentHtml: cleanHtml(dto.contentHtml) } : {}),
          ...(dto.galleryMediaIds !== undefined ? { galleryMediaIds: dto.galleryMediaIds } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        });
        if (Object.keys(data).length === 0) return { count: 1 };
        return this.prisma.interiorDesignTemplate.updateMany({ where: { id: currentId, updatedAt: expectedUpdatedAt }, data });
      },
      findSaved: () => this.prisma.interiorDesignTemplate.findUnique({ where: { id: currentId }, include: { thumbnailMedia: true } }),
    });
  }

  @Delete("interior-designs/:id")
  @Roles("Admin")
  deleteInteriorDesign(@Param("id") id: string) {
    return this.prisma.interiorDesignTemplate.delete({ where: { id: Number(id) } });
  }

  @Get("services")
  @Roles("Admin", "Viewer")
  async listServices(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.ServiceWhereInput = {
      ...(query.group ? { group: query.group as ProjectGroup } : {}),
      ...(query.status ? { status: query.status as ContentStatus } : {}),
      ...(query.search ? { OR: [{ title: { contains: query.search } }, { slug: { contains: query.search } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.service.findMany({ where, skip, take: limit, include: { thumbnailMedia: true }, orderBy: { updatedAt: "desc" } }),
      this.prisma.service.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Get("services/:id")
  @Roles("Admin", "Viewer")
  async getService(@Param("id") id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: Number(id) },
      include: { thumbnailMedia: true },
    });
    if (!service) throw new NotFoundException("Service not found");
    return service;
  }

  @Post("services")
  @Roles("Admin")
  async createService(@Body() dto: ServiceDto) {
    const title = requireTitle(dto.title);
    if (!dto.group) throw new BadRequestException("group is required");
    const { expectedUpdatedAt: _expectedUpdatedAt, ...createDto } = dto;
    const slug = await createSlug(title, dto.slug, (candidate) =>
      this.prisma.service.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.service.create({
      data: {
        ...createDto,
        title,
        group: dto.group,
        isFeatured: dto.isFeatured === null ? false : dto.isFeatured,
        slug,
        contentHtml: cleanHtml(dto.contentHtml),
        status: dto.status || ContentStatus.draft,
        publishedAt: dto.status === ContentStatus.published ? new Date() : undefined,
      },
    });
  }

  @Patch("services/:id")
  @Roles("Admin")
  async updateService(@Param("id") id: string, @Body() dto: ServiceDto) {
    const currentId = Number(id);
    const patchDto = { ...dto };
    delete patchDto.expectedUpdatedAt;
    delete patchDto.isFeatured;
    delete patchDto.publishedAt;
    return updateWithExpectedVersion({
      entityName: "Service",
      expectedUpdatedAt: dto.expectedUpdatedAt,
      findCurrent: () => this.prisma.service.findUnique({ where: { id: currentId }, select: { updatedAt: true, status: true, title: true } }),
      updateMany: async (expectedUpdatedAt, current) => {
        const slug = dto.slug
          ? await uniqueSlug(dto.title ?? current.title, dto.slug, async (candidate) => {
              const match = await this.prisma.service.findUnique({ where: { slug: candidate } });
              return Boolean(match && match.id !== currentId);
            })
          : undefined;
        const publishedAt = publicationDateForUpdate(current.status, dto.status, dto.publishedAt);
        const data = omitUndefined({
          ...patchDto,
          ...(dto.title !== undefined ? { title: safeString(dto.title, 191)! } : {}),
          ...(dto.isFeatured !== undefined && dto.isFeatured !== null ? { isFeatured: dto.isFeatured } : {}),
          ...(slug ? { slug } : {}),
          ...(dto.contentHtml !== undefined ? { contentHtml: cleanHtml(dto.contentHtml) } : {}),
          ...(dto.thumbnailMediaId !== undefined ? { thumbnailMediaId: dto.thumbnailMediaId || null } : {}),
          ...(dto.galleryMediaIds !== undefined ? { galleryMediaIds: dto.galleryMediaIds } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        });
        if (Object.keys(data).length === 0) return { count: 1 };
        return this.prisma.service.updateMany({ where: { id: currentId, updatedAt: expectedUpdatedAt }, data });
      },
      findSaved: () => this.prisma.service.findUnique({ where: { id: currentId }, include: { thumbnailMedia: true } }),
    });
  }

  @Delete("services/:id")
  @Roles("Admin")
  deleteService(@Param("id") id: string) {
    return this.prisma.service.delete({ where: { id: Number(id) } });
  }

  @Get("posts")
  @Roles("Admin", "SEO Editor", "Viewer")
  async listPosts(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.PostWhereInput = {
      ...(query.status ? { status: query.status as ContentStatus } : {}),
      ...(query.categoryId ? { categoryId: Number(query.categoryId) } : {}),
      ...(query.category ? { categoryRef: { slug: query.category } } : {}),
      ...(query.search ? { OR: [{ title: { contains: query.search } }, { slug: { contains: query.search } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({ where, skip, take: limit, include: { thumbnailMedia: true, categoryRef: true }, orderBy: { updatedAt: "desc" } }),
      this.prisma.post.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Get("posts/:id")
  @Roles("Admin", "SEO Editor", "Viewer")
  async getPost(@Param("id") id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: Number(id) },
      include: { thumbnailMedia: true, categoryRef: true },
    });
    if (!post) throw new NotFoundException("Post not found");
    return post;
  }

  @Post("posts")
  @Roles("Admin", "SEO Editor")
  async createPost(@Body() dto: PostDto) {
    const title = requireTitle(dto.title);
    const { expectedUpdatedAt: _expectedUpdatedAt, ...createDto } = dto;
    const scheduledAt = dto.scheduledAt ? parseScheduleDate(dto.scheduledAt) : undefined;
    if (dto.status === ContentStatus.scheduled && !scheduledAt) {
      throw new BadRequestException("scheduledAt is required when status is scheduled");
    }
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
    if (publishedAt && Number.isNaN(publishedAt.getTime())) {
      throw new BadRequestException("Invalid publishedAt date");
    }
    const contentHtml = cleanHtml(dto.contentHtml);
    if (contentHtml) {
      const duplicate = await this.prisma.post.findFirst({ where: { title, contentHtml } });
      if (duplicate) {
        throw new ConflictException(`A post with the same title and content already exists (ID ${duplicate.id}). Update that record instead of creating a duplicate.`);
      }
    }
    const slug = await createSlug(title, dto.slug, (candidate) =>
      this.prisma.post.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.post.create({
      data: {
        ...createDto,
        isFeatured: dto.isFeatured === null ? false : dto.isFeatured,
        categoryId: dto.categoryId || null,
        thumbnailMediaId: dto.thumbnailMediaId || null,
        slug,
        title,
        focusKeyword: safeString(dto.focusKeyword, 191),
        metaTitle: safeString(dto.metaTitle, 191),
        canonicalUrl: safeString(dto.canonicalUrl, 191),
        ogTitle: safeString(dto.ogTitle, 191),
        contentHtml,
        status: dto.status || ContentStatus.draft,
        scheduledAt: scheduledAt || null,
        publishedAt: dto.status === ContentStatus.published ? (publishedAt || new Date()) : null,
      },
    });
  }

  @Patch("posts/:id")
  @Roles("Admin", "SEO Editor")
  async updatePost(@Param("id") id: string, @Body() dto: PostDto) {
    const currentId = Number(id);
    const scheduledAt = dto.scheduledAt ? parseScheduleDate(dto.scheduledAt) : undefined;
    if (dto.status === ContentStatus.scheduled && !scheduledAt) {
      throw new BadRequestException("scheduledAt is required when status is scheduled");
    }
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
    if (publishedAt && Number.isNaN(publishedAt.getTime())) {
      throw new BadRequestException("Invalid publishedAt date");
    }
    const patchDto = { ...dto };
    delete patchDto.expectedUpdatedAt;
    delete patchDto.isFeatured;
    delete patchDto.publishedAt;
    return updateWithExpectedVersion({
      entityName: "Post",
      expectedUpdatedAt: dto.expectedUpdatedAt,
      findCurrent: () => this.prisma.post.findUnique({ where: { id: currentId }, select: { updatedAt: true, status: true, title: true } }),
      updateMany: async (expectedUpdatedAt, current) => {
        const slug = dto.slug
          ? await uniqueSlug(dto.title ?? current.title, dto.slug, async (candidate) => {
              const match = await this.prisma.post.findUnique({ where: { slug: candidate } });
              return Boolean(match && match.id !== currentId);
            })
          : undefined;
        const finalPublishedAt = publicationDateForUpdate(current.status, dto.status, publishedAt, true);
        const schedulePatch = dto.status !== undefined
          ? { scheduledAt: dto.status === ContentStatus.scheduled ? scheduledAt : null }
          : dto.scheduledAt !== undefined
            ? { scheduledAt: scheduledAt ?? null }
            : {};
        const data = omitUndefined({
          ...patchDto,
          ...(dto.title !== undefined ? { title: safeString(dto.title, 191)! } : {}),
          ...(dto.focusKeyword !== undefined ? { focusKeyword: safeString(dto.focusKeyword, 191) } : {}),
          ...(dto.metaTitle !== undefined ? { metaTitle: safeString(dto.metaTitle, 191) } : {}),
          ...(dto.metaDescription !== undefined ? { metaDescription: safeString(dto.metaDescription, 191) } : {}),
          ...(dto.canonicalUrl !== undefined ? { canonicalUrl: safeString(dto.canonicalUrl, 191) } : {}),
          ...(dto.ogTitle !== undefined ? { ogTitle: safeString(dto.ogTitle, 191) } : {}),
          ...(dto.ogDescription !== undefined ? { ogDescription: safeString(dto.ogDescription, 191) } : {}),
          ...(dto.isFeatured !== undefined && dto.isFeatured !== null ? { isFeatured: dto.isFeatured } : {}),
          ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId || null } : {}),
          ...(dto.thumbnailMediaId !== undefined ? { thumbnailMediaId: dto.thumbnailMediaId || null } : {}),
          ...(slug ? { slug } : {}),
          ...(dto.contentHtml !== undefined ? { contentHtml: cleanHtml(dto.contentHtml) } : {}),
          ...schedulePatch,
          ...(finalPublishedAt !== undefined ? { publishedAt: finalPublishedAt } : {}),
        });
        if (Object.keys(data).length === 0) return { count: 1 };
        return this.prisma.post.updateMany({ where: { id: currentId, updatedAt: expectedUpdatedAt }, data });
      },
      findSaved: () => this.prisma.post.findUnique({ where: { id: currentId }, include: { thumbnailMedia: true, categoryRef: true } }),
    });
  }

  @Delete("posts/:id")
  @Roles("Admin", "SEO Editor")
  deletePost(@Param("id") id: string) {
    return this.prisma.post.delete({ where: { id: Number(id) } });
  }

  @Post("posts/:id/schedule")
  @Roles("Admin", "SEO Editor")
  async schedulePost(@Param("id") id: string, @Body() dto: SchedulePostDto, @Req() request: Request & { user?: JwtUser }) {
    const scheduledAt = parseScheduleDate(dto.scheduledAt);
    const post = await this.prisma.post.update({
      where: { id: Number(id) },
      data: {
        status: ContentStatus.scheduled,
        scheduledAt,
        publishedAt: null,
      },
      include: { thumbnailMedia: true },
    });
    await this.prisma.activityLog.create({
      data: {
        actorId: request.user?.sub,
        action: "post.scheduled",
        entityType: "post",
        entityId: post.id,
        metadata: { scheduledAt },
      },
    });
    return post;
  }

  @Post("posts/:id/publish")
  @Roles("Admin", "SEO Editor")
  async publishPost(@Param("id") id: string, @Req() request: Request & { user?: JwtUser }) {
    const now = new Date();
    const post = await this.prisma.post.update({
      where: { id: Number(id) },
      data: {
        status: ContentStatus.published,
        scheduledAt: null,
        publishedAt: now,
      },
      include: { thumbnailMedia: true },
    });
    await this.prisma.activityLog.create({
      data: {
        actorId: request.user?.sub,
        action: "post.published",
        entityType: "post",
        entityId: post.id,
        metadata: { publishedAt: now },
      },
    });
    return post;
  }

  @Post("posts/:id/cancel-schedule")
  @Roles("Admin", "SEO Editor")
  async cancelSchedule(@Param("id") id: string, @Req() request: Request & { user?: JwtUser }) {
    const post = await this.prisma.post.update({
      where: { id: Number(id) },
      data: {
        status: ContentStatus.draft,
        scheduledAt: null,
      },
      include: { thumbnailMedia: true },
    });
    await this.prisma.activityLog.create({
      data: {
        actorId: request.user?.sub,
        action: "post.schedule_cancelled",
        entityType: "post",
        entityId: post.id,
      },
    });
    return post;
  }

  @Get("scheduled-posts")
  @Roles("Admin", "SEO Editor", "Viewer")
  scheduledPosts(@Query() query: Record<string, string>) {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const to = query.to ? new Date(query.to) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 90);
    return this.prisma.post.findMany({
      where: {
        status: ContentStatus.scheduled,
        scheduledAt: {
          gte: Number.isNaN(from.getTime()) ? undefined : from,
          lte: Number.isNaN(to.getTime()) ? undefined : to,
        },
      },
      include: { thumbnailMedia: true },
      orderBy: { scheduledAt: "asc" },
    });
  }

  @Get("leads")
  @Roles("Admin", "Sales")
  async listLeads(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.LeadWhereInput = {
      ...(query.status ? { status: query.status as LeadStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search } },
              { phone: { contains: query.search } },
              { email: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Patch("leads/:id")
  @Roles("Admin", "Sales")
  updateLead(@Param("id") id: string, @Body() dto: LeadUpdateDto) {
    return this.prisma.lead.update({ where: { id: Number(id) }, data: dto });
  }

  @Get("leads/:id/notes")
  @Roles("Admin", "Sales")
  leadNotes(@Param("id") id: string) {
    return this.prisma.leadNote.findMany({
      where: { leadId: Number(id) },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post("leads/:id/notes")
  @Roles("Admin", "Sales")
  createLeadNote(@Param("id") id: string, @Body() dto: LeadNoteDto, @Req() request: Request & { user?: JwtUser }) {
    return this.prisma.leadNote.create({
      data: {
        leadId: Number(id),
        note: dto.note,
        createdBy: request.user?.sub,
      },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
  }

  @Get("settings")
  @Roles("Admin", "Viewer")
  async settings() {
    const settings = await this.prisma.setting.findMany();
    return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
  }

  @Get("settings/snapshot")
  @Roles("Admin", "Viewer")
  async settingsSnapshot(@Query("keys") keysQuery?: string | string[]) {
    const rawKeys = Array.isArray(keysQuery) ? keysQuery : typeof keysQuery === "string" ? keysQuery.split(",") : [];
    const keys = [...new Set(rawKeys.map((key) => key.trim()).filter(Boolean))];
    if (keys.length === 0 || keys.length > 50 || keys.some((key) => key.length > 191)) {
      throw new BadRequestException("Request one to 50 valid Settings keys.");
    }

    const rows = await this.prisma.setting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true, updatedAt: true },
    });
    const byKey = new Map(rows.map((row) => [row.key, row]));
    return {
      settings: Object.fromEntries(keys.map((key) => {
        const row = byKey.get(key);
        return [key, {
          exists: Boolean(row),
          value: row?.value ?? null,
          updatedAt: row?.updatedAt.toISOString() ?? null,
        }];
      })),
    };
  }

  @Patch("settings")
  @Roles("Admin")
  async updateSetting(@Body() body: unknown) {
    let updates;
    try {
      updates = parseSettingsWriteInput(body);
    } catch (error) {
      if (error instanceof SettingsWriteInputError) {
        throw new HttpException({ message: error.message, code: error.status === 428 ? "SETTINGS_VERSION_REQUIRED" : "INVALID_SETTINGS_UPDATE" }, error.status);
      }
      throw error;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        for (const update of updates) {
          if (update.expectedUpdatedAt === null) {
            const value = mergeSettingsJson(undefined, update.value);
            await tx.setting.create({
              data: {
                key: update.key,
                value: value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue,
                updatedAt: new Date(),
              },
            });
            continue;
          }

          const current = await tx.setting.findUnique({ where: { key: update.key } });
          if (!current || current.updatedAt.getTime() !== update.expectedUpdatedAt.getTime()) {
            throw settingsVersionConflict(update.key);
          }

          const value = mergeSettingsJson(current.value, update.value);
          const result = await tx.setting.updateMany({
            where: { key: update.key, updatedAt: update.expectedUpdatedAt },
            data: {
              value: value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue,
              updatedAt: nextSettingsUpdatedAt(update.expectedUpdatedAt),
            },
          });
          if (result.count !== 1) throw settingsVersionConflict(update.key);
        }

        const keys = updates.map((update) => update.key);
        const saved = await tx.setting.findMany({
          where: { key: { in: keys } },
          select: { key: true, value: true, updatedAt: true },
        });
        if (saved.length !== keys.length) throw new ConflictException({ code: "SETTINGS_VERSION_CONFLICT", message: "A Settings key changed during this save. Reload the latest values." });
        return {
          settings: Object.fromEntries(saved.map((setting) => [setting.key, {
            exists: true,
            value: setting.value,
            updatedAt: setting.updatedAt.toISOString(),
          }])),
        };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (isPrismaWriteConflict(error)) {
        throw new ConflictException({ code: "SETTINGS_VERSION_CONFLICT", message: "A Settings key changed or was created during this save. Reload the latest values." });
      }
      throw error;
    }
  }

  @Get("users")
  @Roles("Super Admin")
  users() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        createdAt: true,
        roles: { include: { role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("roles")
  @Roles("Super Admin")
  roles() {
    return this.prisma.role.findMany({ orderBy: { name: "asc" } });
  }

  @Get("pages")
  @Roles("Admin", "Viewer")
  async listPages(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.PageWhereInput = {
      ...(query.status ? { status: query.status as ContentStatus } : {}),
      ...(query.search ? { OR: [{ title: { contains: query.search } }, { slug: { contains: query.search } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.page.findMany({ where, skip, take: limit, include: { thumbnailMedia: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
      this.prisma.page.count({ where }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  @Get("pages/:id")
  @Roles("Admin", "Viewer")
  async getPage(@Param("id") id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id: Number(id) },
      include: { thumbnailMedia: true },
    });
    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  @Post("pages")
  @Roles("Admin")
  async createPage(@Body() dto: PageDto) {
    const title = requireTitle(dto.title);
    const { expectedUpdatedAt: _expectedUpdatedAt, ...createDto } = dto;
    const slug = await createSlug(title, dto.slug, (candidate) =>
      this.prisma.page.findUnique({ where: { slug: candidate } }).then(Boolean),
    );
    return this.prisma.page.create({
      data: {
        ...createDto,
        title,
        slug,
        contentHtml: cleanHtml(dto.contentHtml),
        publishedAt: dto.status === ContentStatus.published ? new Date() : undefined,
      },
    });
  }

  @Patch("pages/:id")
  @Roles("Admin")
  async updatePage(@Param("id") id: string, @Body() dto: PageDto) {
    const currentId = Number(id);
    const patchDto = { ...dto };
    delete patchDto.expectedUpdatedAt;
    delete patchDto.publishedAt;
    return updateWithExpectedVersion({
      entityName: "Page",
      expectedUpdatedAt: dto.expectedUpdatedAt,
      findCurrent: () => this.prisma.page.findUnique({ where: { id: currentId }, select: { updatedAt: true, status: true, title: true } }),
      updateMany: async (expectedUpdatedAt, current) => {
        const slug = dto.slug
          ? await uniqueSlug(dto.title ?? current.title, dto.slug, async (candidate) => {
              const match = await this.prisma.page.findUnique({ where: { slug: candidate } });
              return Boolean(match && match.id !== currentId);
            })
          : undefined;
        const publishedAt = publicationDateForUpdate(current.status, dto.status, dto.publishedAt);
        const data = omitUndefined({
          ...patchDto,
          ...(dto.title !== undefined ? { title: safeString(dto.title, 191)! } : {}),
          ...(slug ? { slug } : {}),
          ...(dto.contentHtml !== undefined ? { contentHtml: cleanHtml(dto.contentHtml) } : {}),
          ...(dto.thumbnailMediaId !== undefined ? { thumbnailMediaId: dto.thumbnailMediaId || null } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        });
        if (Object.keys(data).length === 0) return { count: 1 };
        return this.prisma.page.updateMany({ where: { id: currentId, updatedAt: expectedUpdatedAt }, data });
      },
      findSaved: () => this.prisma.page.findUnique({ where: { id: currentId }, include: { thumbnailMedia: true } }),
    });
  }

  @Delete("pages/:id")
  @Roles("Admin")
  deletePage(@Param("id") id: string) {
    return this.prisma.page.delete({ where: { id: Number(id) } });
  }

  private async assertMenuDepth(menuId: number, parentId: number | null) {
    if (!parentId) return;
    let depth = 1;
    let current = await this.prisma.menuItem.findFirst({ where: { id: parentId, menuId }, select: { parentId: true } });
    if (!current) throw new BadRequestException("Parent menu item not found");
    while (current.parentId) {
      depth += 1;
      if (depth > 2) throw new BadRequestException("Menu chỉ hỗ trợ tối đa 3 cấp");
      current = await this.prisma.menuItem.findFirst({ where: { id: current.parentId, menuId }, select: { parentId: true } });
      if (!current) throw new BadRequestException("Invalid menu hierarchy");
    }
  }
}

function parseScheduleDate(value: string) {
  const scheduledAt = new Date(value);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new BadRequestException("Invalid scheduledAt");
  }
  return scheduledAt;
}

function requireTitle(value?: string | null) {
  const title = safeString(value?.trim(), 191);
  if (!title || title.length < 2) throw new BadRequestException("title is required");
  return title;
}

function publicationDateForUpdate(
  currentStatus: ContentStatus,
  incomingStatus?: ContentStatus,
  incomingPublishedAt?: string | Date,
  clearWhenUnpublished = false,
) {
  try {
    return publishedAtPrismaValue(decidePublishedAtUpdate({
      currentStatus,
      incomingStatus,
      incomingPublishedAt,
      clearWhenUnpublished,
    }));
  } catch {
    throw new BadRequestException("Invalid publishedAt date");
  }
}

type FlattenedMenuTreeItem = {
  id: number;
  parentId: number | null;
  sortOrder: number;
  depth: number;
};

function flattenMenuTree(tree: MenuTreeInput[], parentId: number | null = null, depth = 0): FlattenedMenuTreeItem[] {
  return tree.flatMap((node, index) => [
    { id: Number(node.id), parentId, sortOrder: index, depth },
    ...flattenMenuTree(Array.isArray(node.children) ? node.children : [], Number(node.id), depth + 1),
  ]);
}

function architectureDesignWhere(query: Record<string, string>, allowStatusFilter = false): Prisma.ArchitectureDesignTemplateWhereInput {
  return {
    ...(allowStatusFilter && query.status ? { status: query.status as ContentStatus } : {}),
    ...(query.houseType ? { houseType: query.houseType } : {}),
    ...(query.style ? { style: query.style } : {}),
    ...(query.roofType ? { roofType: query.roofType } : {}),
    ...(query.floors ? { floors: Number(query.floors) } : {}),
    ...(query.location ? { location: query.location } : {}),
    ...(query.areaMin || query.areaMax ? { area: { gte: optionalNumber(query.areaMin), lte: optionalNumber(query.areaMax) } } : {}),
    ...(query.budgetMin || query.budgetMax ? { estimatedBudget: { gte: optionalNumber(query.budgetMin), lte: optionalNumber(query.budgetMax) } } : {}),
    ...(query.search ? { OR: [{ title: { contains: query.search } }, { slug: { contains: query.search } }, { code: { contains: query.search } }] } : {}),
  };
}

function interiorDesignWhere(query: Record<string, string>, allowStatusFilter = false): Prisma.InteriorDesignTemplateWhereInput {
  return {
    ...(allowStatusFilter && query.status ? { status: query.status as ContentStatus } : {}),
    ...(query.interiorStyle ? { interiorStyle: query.interiorStyle } : {}),
    ...(query.houseType ? { houseType: query.houseType } : {}),
    ...(query.roomType ? { roomType: query.roomType } : {}),
    ...(query.budgetRange ? { budgetRange: query.budgetRange } : {}),
    ...(query.location ? { location: query.location } : {}),
    ...(query.areaMin || query.areaMax ? { area: { gte: optionalNumber(query.areaMin), lte: optionalNumber(query.areaMax) } } : {}),
    ...(query.budgetMin || query.budgetMax ? { budgetMin: { gte: optionalNumber(query.budgetMin) }, budgetMax: { lte: optionalNumber(query.budgetMax) } } : {}),
    ...(query.search ? { OR: [{ title: { contains: query.search } }, { slug: { contains: query.search } }, { code: { contains: query.search } }] } : {}),
  };
}

function adminDesignOrder(sort?: string, type: "architecture" | "interior" = "architecture") {
  if (sort === "newest") return [{ publishedAt: "desc" as const }, { updatedAt: "desc" as const }];
  if (sort === "area_asc") return [{ area: "asc" as const }];
  if (sort === "area_desc") return [{ area: "desc" as const }];
  if (sort === "budget_asc") return [type === "architecture" ? { estimatedBudget: "asc" as const } : { budgetMin: "asc" as const }];
  if (sort === "budget_desc") return [type === "architecture" ? { estimatedBudget: "desc" as const } : { budgetMax: "desc" as const }];
  return [{ sortOrder: "asc" as const }, { updatedAt: "desc" as const }];
}

function projectOrder(sort?: string) {
  if (sort === "newest") return [{ publishedAt: "desc" as const }, { updatedAt: "desc" as const }];
  if (sort === "area_asc") return [{ areaValue: "asc" as const }, { updatedAt: "desc" as const }];
  if (sort === "area_desc") return [{ areaValue: "desc" as const }, { updatedAt: "desc" as const }];
  if (sort === "year_desc") return [{ year: "desc" as const }, { updatedAt: "desc" as const }];
  return [{ sortOrder: "asc" as const }, { updatedAt: "desc" as const }];
}

function optionalNumber(value?: string) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function settingsVersionConflict(key: string) {
  return new ConflictException({
    code: "SETTINGS_VERSION_CONFLICT",
    key,
    message: "This Settings value changed after it was loaded. Reload and compare before saving again.",
  });
}

function isPrismaWriteConflict(error: unknown): boolean {
  return isRecord(error) && typeof error.code === "string" && ["P2002", "P2034"].includes(error.code);
}
