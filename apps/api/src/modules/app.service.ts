import { Injectable } from "@nestjs/common";
import { ContentStatus } from "@prisma/client";
import { repairPublicText } from "./cms-utils";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHome() {
    const [constructionProjects, interiorProjects, posts, architectureDesigns, interiorDesigns] = await Promise.all([
      this.prisma.project.findMany({
        where: { group: { in: ["construction", "xay_nha_tron_goi"] }, status: ContentStatus.published, isFeatured: true },
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

    const services = [
      {
        id: 1,
        title: "Xây nhà trọn gói",
        slug: "xay-nha-tron-goi",
        group: "xay_nha_tron_goi",
        description: "Giải pháp thi công trọn gói toàn diện từ khảo sát, thiết kế bản vẽ, xin phép xây dựng đến bàn giao chìa khóa trao tay.",
        status: ContentStatus.published,
        isFeatured: true,
      },
      {
        id: 2,
        title: "Sản xuất & Thi công nội thất",
        slug: "san-xuat-thi-cong-noi-that",
        group: "interior",
        description: "Thiết kế và thi công hoàn thiện nội thất biệt thự, nhà phố, chung cư cao cấp với xưởng gỗ sản xuất trực tiếp.",
        status: ContentStatus.published,
        isFeatured: true,
      },
      {
        id: 3,
        title: "Thi công nhà xưởng",
        slug: "thi-cong-nha-xuong",
        group: "construction",
        description: "Thiết kế và gia công lắp dựng kết cấu thép nhà xưởng, nhà kho tiền chế khẩu độ lớn, đạt chuẩn kỹ thuật công nghiệp.",
        status: ContentStatus.published,
        isFeatured: true,
      },
      {
        id: 4,
        title: "Thi công nội thất văn phòng",
        slug: "thi-cong-noi-that-van-phong",
        group: "interior",
        description: "Giải pháp kiến tạo không gian làm việc chuyên nghiệp, hiện đại, tối ưu công suất hoạt động và nâng tầm nhận diện thương hiệu.",
        status: ContentStatus.published,
        isFeatured: true,
      },
    ];

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
