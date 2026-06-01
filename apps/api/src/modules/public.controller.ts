import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ContentStatus, MenuLocation, Prisma, ProjectFilterModule, ProjectGroup } from "@prisma/client";
import { listMeta, parsePagination, repairPublicText } from "./cms-utils";
import { PrismaService } from "./prisma.service";

@Controller("api")
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("menus/:location")
  async menu(@Param("location") location: string) {
    if (!["header", "footer"].includes(location)) throw new NotFoundException("Menu not found");
    const menu = await this.prisma.menu.findFirst({
      where: { location: location as MenuLocation, isActive: true },
      include: { items: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
      orderBy: { id: "asc" },
    });
    if (!menu) return { location, items: [] };
    return repairPublicText({ id: menu.id, name: menu.name, location: menu.location, items: buildMenuTree(menu.items) });
  }

  @Get("projects")
  async projects(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const and: Prisma.ProjectWhereInput[] = [];
    if (query.category) {
      const categorySlugs = query.category.split(",").map((s) => s.trim()).filter(Boolean);
      if (categorySlugs.length > 0) {
        // Query ProjectCategory from DB to get the actual accented category names
        const dbCategories = await this.prisma.projectCategory.findMany({
          where: { slug: { in: categorySlugs } },
          select: { slug: true, name: true },
        });

        const orFilters: Prisma.ProjectWhereInput[] = [
          { categoryRef: { slug: { in: categorySlugs } } }
        ];

        for (const slug of categorySlugs) {
          // Always allow matching by slug directly (plain text containing slug)
          orFilters.push({ category: { contains: slug } });
          
          // Match by DB name if found
          const dbCat = dbCategories.find((c) => c.slug === slug);
          if (dbCat) {
            const name = dbCat.name;
            orFilters.push({ category: { contains: name } });
            
            // Build unaccented versions
            const unaccented = name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D");
            orFilters.push({ category: { contains: unaccented } });
            orFilters.push({ category: { contains: unaccented.toLowerCase() } });
          }
        }

        // Keep fallback category mapping for safety
        const categoryMapping: Record<string, string[]> = {
          "nha-xuong": ["nhà xưởng", "nha xuong"],
          "biet-thu": ["biệt thự", "biet thu"],
          "nha-pho": ["nhà phố", "nha pho"],
          "truong-hoc": ["trường học", "truong hoc"],
          "khu-do-thi": ["khu đô thị", "khu do thi"],
          "van-phong": ["văn phòng", "van phong"],
          "toa-nha": ["tòa nhà", "toa nha"],
          "cau-duong": ["cầu đường", "cau duong"],
          "showroom": ["showroom"],
        };

        for (const slug of categorySlugs) {
          const mappedWords = categoryMapping[slug];
          if (mappedWords) {
            for (const text of mappedWords) {
              orFilters.push({ category: { contains: text } });
            }
          }
        }

        and.push({ OR: orFilters });
      }
    }
    if (query.space) and.push({ OR: [{ projectType: query.space }, { category: { contains: query.space } }, { scale: { contains: query.space } }, { style: { contains: query.space } }] });
    if (query.search) and.push({ OR: [{ title: { contains: query.search } }, { clientName: { contains: query.search } }, { location: { contains: query.search } }] });
    const where: Prisma.ProjectWhereInput = {
      status: ContentStatus.published,
      ...(query.featured === "true" ? { isFeatured: true } : {}),
      ...(query.group ? { group: { in: query.group.split(",").map((g) => g.trim() as ProjectGroup).filter(Boolean) } } : {}),
      ...(query.projectType ? { projectType: query.projectType } : {}),
      ...(query.style ? { style: query.style } : {}),
      ...(query.scale ? { scale: query.scale } : {}),
      ...(query.location ? { location: query.location } : {}),
      ...(query.budgetRange ? { budgetRange: query.budgetRange } : {}),
      ...(query.areaMin || query.areaMax ? { areaValue: { gte: optionalNumber(query.areaMin), lte: optionalNumber(query.areaMax) } } : {}),
      ...(and.length ? { AND: and } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({ where, skip, take: limit, include: { thumbnailMedia: true, categoryRef: true }, orderBy: projectOrder(query.sort) }),
      this.prisma.project.count({ where }),
    ]);
    return repairPublicText({ data, meta: listMeta(total, page, limit) });
  }

  @Get("projects/filters")
  async projectFilters(@Query() query: Record<string, string>) {
    const groups = query.group && query.group !== "all"
      ? query.group.split(",").map((g) => g.trim() as ProjectGroup).filter(Boolean)
      : [ProjectGroup.construction, ProjectGroup.interior, ProjectGroup.xay_nha_tron_goi];
    const [categories, options] = await Promise.all([
      this.prisma.projectCategory.findMany({
        where: { group: { in: groups }, isActive: true },
        orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      }),
      this.prisma.projectFilterOption.findMany({
        where: { module: ProjectFilterModule.project, group: { in: groups }, isActive: true },
        orderBy: [{ group: "asc" }, { type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);
    return repairPublicText({
      categories,
      filters: options.reduce<Record<string, typeof options>>((acc, option) => {
        const type = option.type;
        acc[type] = [...(acc[type] || []), option];
        return acc;
      }, {}),
    });
  }

  @Get("architecture-designs/filters")
  architectureDesignFilters() {
    return this.catalogFilters(ProjectFilterModule.architecture_design, [ProjectGroup.construction]);
  }

  @Get("interior-designs/filters")
  interiorDesignFilters() {
    return this.catalogFilters(ProjectFilterModule.interior_design, [ProjectGroup.interior]);
  }

  @Get("projects/:slug")
  async project(@Param("slug") slug: string) {
    const data = await this.prisma.project.findFirst({ where: { slug, status: ContentStatus.published }, include: { thumbnailMedia: true, categoryRef: true } });
    if (!data) throw new NotFoundException("Project not found");
    return repairPublicText(await this.withGalleryMedia(data));
  }

  @Get("architecture-designs")
  async architectureDesigns(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.ArchitectureDesignTemplateWhereInput = {
      status: ContentStatus.published,
      ...(query.featured === "true" ? { isFeatured: true } : {}),
      ...(query.houseType ? { houseType: query.houseType } : {}),
      ...(query.style ? { style: query.style } : {}),
      ...(query.roofType ? { roofType: query.roofType } : {}),
      ...(query.floors ? { floors: Number(query.floors) } : {}),
      ...(query.location ? { location: query.location } : {}),
      ...(query.areaMin || query.areaMax ? { area: { gte: optionalNumber(query.areaMin), lte: optionalNumber(query.areaMax) } } : {}),
      ...(query.budgetMin || query.budgetMax ? { estimatedBudget: { gte: optionalNumber(query.budgetMin), lte: optionalNumber(query.budgetMax) } } : {}),
      ...(query.search ? { OR: [{ title: { contains: query.search } }, { code: { contains: query.search } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.architectureDesignTemplate.findMany({ where, skip, take: limit, include: { thumbnailMedia: true }, orderBy: publicDesignOrder(query.sort, "architecture") }),
      this.prisma.architectureDesignTemplate.count({ where }),
    ]);
    return repairPublicText({ data, meta: listMeta(total, page, limit) });
  }

  @Get("architecture-designs/:slug")
  async architectureDesign(@Param("slug") slug: string) {
    const data = await this.prisma.architectureDesignTemplate.findFirst({ where: { slug, status: ContentStatus.published }, include: { thumbnailMedia: true } });
    if (!data) throw new NotFoundException("Architecture design template not found");
    return repairPublicText(await this.withGalleryMedia(data));
  }

  @Get("interior-designs")
  async interiorDesigns(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.InteriorDesignTemplateWhereInput = {
      status: ContentStatus.published,
      ...(query.featured === "true" ? { isFeatured: true } : {}),
      ...(query.interiorStyle ? { interiorStyle: query.interiorStyle } : {}),
      ...(query.houseType ? { houseType: query.houseType } : {}),
      ...(query.roomType ? { roomType: query.roomType } : {}),
      ...(query.budgetRange ? { budgetRange: query.budgetRange } : {}),
      ...(query.location ? { location: query.location } : {}),
      ...(query.areaMin || query.areaMax ? { area: { gte: optionalNumber(query.areaMin), lte: optionalNumber(query.areaMax) } } : {}),
      ...(query.budgetMin || query.budgetMax ? { budgetMin: { gte: optionalNumber(query.budgetMin) }, budgetMax: { lte: optionalNumber(query.budgetMax) } } : {}),
      ...(query.search ? { OR: [{ title: { contains: query.search } }, { code: { contains: query.search } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.interiorDesignTemplate.findMany({ where, skip, take: limit, include: { thumbnailMedia: true }, orderBy: publicDesignOrder(query.sort, "interior") }),
      this.prisma.interiorDesignTemplate.count({ where }),
    ]);
    return repairPublicText({ data, meta: listMeta(total, page, limit) });
  }

  @Get("interior-designs/:slug")
  async interiorDesign(@Param("slug") slug: string) {
    const data = await this.prisma.interiorDesignTemplate.findFirst({ where: { slug, status: ContentStatus.published }, include: { thumbnailMedia: true } });
    if (!data) throw new NotFoundException("Interior design template not found");
    return repairPublicText(await this.withGalleryMedia(data));
  }

  @Get("services")
  async services(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.ServiceWhereInput = {
      status: ContentStatus.published,
      ...(query.group ? { group: query.group as ProjectGroup } : {}),
      ...(query.search ? { title: { contains: query.search } } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.service.findMany({ where, skip, take: limit, include: { thumbnailMedia: true }, orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }] }),
      this.prisma.service.count({ where }),
    ]);
    return repairPublicText({ data, meta: listMeta(total, page, limit) });
  }

  @Get("services/:slug")
  async service(@Param("slug") slug: string) {
    const data = await this.prisma.service.findFirst({ where: { slug, status: ContentStatus.published }, include: { thumbnailMedia: true } });
    if (!data) throw new NotFoundException("Service not found");
    const withGallery = await this.withGalleryMedia(data);
    return repairPublicText(withGallery);
  }

  @Get("posts")
  async posts(@Query() query: Record<string, string>) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.PostWhereInput = {
      status: ContentStatus.published,
      ...(query.category ? { categoryRef: { slug: query.category, isActive: true } } : {}),
      ...(query.search ? { title: { contains: query.search } } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({ where, skip, take: limit, include: { thumbnailMedia: true, categoryRef: true }, orderBy: { publishedAt: "desc" } }),
      this.prisma.post.count({ where }),
    ]);
    return repairPublicText({ data, meta: listMeta(total, page, limit) });
  }

  @Get("post-categories")
  async postCategories() {
    const data = await this.prisma.postCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return repairPublicText({ data });
  }

  @Get("posts/:slug")
  async post(@Param("slug") slug: string) {
    const data = await this.prisma.post.findFirst({ where: { slug, status: ContentStatus.published }, include: { thumbnailMedia: true, categoryRef: true } });
    if (!data) throw new NotFoundException("Post not found");
    return repairPublicText(data);
  }

  private async withGalleryMedia<T extends { galleryMediaIds?: Prisma.JsonValue | null }>(item: T) {
    const ids = Array.isArray(item.galleryMediaIds)
      ? item.galleryMediaIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
      : [];
    if (!ids.length) return { ...item, galleryMedia: [] };
    const galleryMedia = await this.prisma.mediaFile.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
    });
    const mediaById = new Map(galleryMedia.map((media) => [media.id, media]));
    return { ...item, galleryMedia: ids.map((id) => mediaById.get(id)).filter(Boolean) };
  }

  private async catalogFilters(module: ProjectFilterModule, groups: ProjectGroup[]) {
    const options = await this.prisma.projectFilterOption.findMany({
      where: { module, group: { in: groups }, isActive: true },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
    return repairPublicText({
      filters: options.reduce<Record<string, typeof options>>((acc, option) => {
        const type = option.type;
        acc[type] = [...(acc[type] || []), option];
        return acc;
      }, {}),
    });
  }

  @Get("pages")
  async listPublicPages() {
    const data = await this.prisma.page.findMany({
      where: { status: ContentStatus.published },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { sortOrder: "asc" },
    });
    return data;
  }

  @Get("pages/:slug")
  async getPageBySlug(@Param("slug") slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug, status: ContentStatus.published },
      include: { thumbnailMedia: true },
    });
    if (!page) {
      throw new NotFoundException("Trang không tồn tại");
    }
    return repairPublicText(page);
  }
}

function publicDesignOrder(sort?: string, type: "architecture" | "interior" = "architecture") {
  if (sort === "newest") return [{ publishedAt: "desc" as const }, { updatedAt: "desc" as const }];
  if (sort === "area_asc") return [{ area: "asc" as const }];
  if (sort === "area_desc") return [{ area: "desc" as const }];
  if (sort === "budget_asc") return [type === "architecture" ? { estimatedBudget: "asc" as const } : { budgetMin: "asc" as const }];
  if (sort === "budget_desc") return [type === "architecture" ? { estimatedBudget: "desc" as const } : { budgetMax: "desc" as const }];
  return [{ sortOrder: "asc" as const }, { publishedAt: "desc" as const }];
}

function projectOrder(sort?: string) {
  if (sort === "newest") return [{ publishedAt: "desc" as const }, { updatedAt: "desc" as const }];
  if (sort === "area_asc") return [{ areaValue: "asc" as const }, { publishedAt: "desc" as const }];
  if (sort === "area_desc") return [{ areaValue: "desc" as const }, { publishedAt: "desc" as const }];
  if (sort === "year_desc") return [{ year: "desc" as const }, { publishedAt: "desc" as const }];
  return [{ sortOrder: "asc" as const }, { publishedAt: "desc" as const }];
}

function optionalNumber(value?: string) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function buildMenuTree(items: Array<{ id: number; parentId: number | null; label: string; url: string; target: string; rel: string | null; sortOrder: number }>) {
  const map = new Map<number, any>();
  const roots: any[] = [];
  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }
  for (const item of map.values()) {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(item);
    } else {
      roots.push(item);
    }
  }
  const sort = (nodes: any[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    nodes.forEach((node) => sort(node.children));
    return nodes;
  };
  return sort(roots);
}
