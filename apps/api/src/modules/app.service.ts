import { Injectable } from "@nestjs/common";
import { ContentStatus } from "@prisma/client";
import { repairPublicText } from "./cms-utils";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHome() {
    const [constructionProjects, interiorProjects, services, posts, architectureDesigns, interiorDesigns] = await Promise.all([
      this.prisma.project.findMany({
        where: { group: "construction", status: ContentStatus.published, isFeatured: true },
        include: { thumbnailMedia: true },
        take: 6,
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      }),
      this.prisma.project.findMany({
        where: { group: "interior", status: ContentStatus.published, isFeatured: true },
        include: { thumbnailMedia: true },
        take: 6,
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      }),
      this.prisma.service.findMany({
        where: { status: ContentStatus.published, isFeatured: true },
        include: { thumbnailMedia: true },
        orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
      }),
      this.prisma.post.findMany({
        where: { status: ContentStatus.published, isFeatured: true },
        include: { thumbnailMedia: true, categoryRef: true },
        take: 4,
        orderBy: { publishedAt: "desc" },
      }),
      this.prisma.architectureDesignTemplate.findMany({
        where: { status: ContentStatus.published, isFeatured: true },
        include: { thumbnailMedia: true },
        take: 6,
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      }),
      this.prisma.interiorDesignTemplate.findMany({
        where: { status: ContentStatus.published, isFeatured: true },
        include: { thumbnailMedia: true },
        take: 6,
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      }),
    ]);

    return repairPublicText({
      constructionProjects,
      interiorProjects,
      services,
      posts,
      architectureDesigns,
      interiorDesigns,
    });
  }

  async getSettings() {
    const settings = await this.prisma.setting.findMany();
    return repairPublicText(Object.fromEntries(settings.map((setting) => [setting.key, setting.value])));
  }

  async createLead(dto: {
    fullName: string;
    phone: string;
    email?: string;
    demandType?: string;
    projectType?: string;
    budget?: string;
    area?: string;
    location?: string;
    message?: string;
    sourceUrl?: string;
  }) {
    return this.prisma.lead.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        demandType: dto.demandType,
        projectType: dto.projectType,
        budget: dto.budget,
        area: dto.area,
        location: dto.location,
        message: dto.message,
        sourceUrl: dto.sourceUrl,
        sourceType: "website",
      },
    });
  }
}
