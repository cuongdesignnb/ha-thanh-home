import { ContentStatus, MenuLocation, MenuTarget, PrismaClient, ProjectFilterModule, ProjectFilterType, ProjectGroup } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    ["Super Admin", "Toàn quyền hệ thống"],
    ["Admin", "Quản lý nội dung, dự án, dịch vụ, media"],
    ["SEO Editor", "Quản lý bài viết SEO và lịch đăng bài"],
    ["Sales", "Xử lý lead tư vấn"],
    ["Viewer", "Chỉ xem dữ liệu"],
  ] as const;

  const seededRoles = await Promise.all(
    roles.map(([name, description]) =>
      prisma.role.upsert({
        where: { name },
        update: { description },
        create: { name, description },
      }),
    ),
  );

  const adminRole = seededRoles.find((role) => role.name === "Super Admin")!;

  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@hathanhhome.vn";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { fullName: "Hà Thành Admin" },
    create: {
      email,
      passwordHash,
      fullName: "Hà Thành Admin",
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  await prisma.setting.upsert({
    where: { key: "site.identity" },
    update: {},
    create: {
      key: "site.identity",
      value: {
        name: "Hà Thành Home",
        tagline: "Thiết kế - Thi công - Nội thất",
        hotline: "0966 123 456",
        email: "info@hathanhhome.vn",
        address: "Hà Nội, Việt Nam",
        facebook: "",
        zalo: "",
        workingHours: "08:00 - 18:00, Thứ 2 - Thứ 7",
      },
    },
  });

  await prisma.setting.upsert({
    where: { key: "site.theme" },
    update: {},
    create: {
      key: "site.theme",
      value: {
        forestGreen: "#0f3d2e",
        gold: "#c99a4a",
        cream: "#f8f5ef",
        charcoal: "#1e1e1e",
        headingColor: "#183b2d",
        mutedColor: "#6b6b63",
        lineColor: "#e8ddca",
        headingFont: "cormorant",
        bodyFont: "inter",
        containerMax: "1500",
      },
    },
  });

  await prisma.setting.upsert({
    where: { key: "site.homepage" },
    update: {},
    create: {
      key: "site.homepage",
      value: {
        heroSlides: [{
          eyebrow: "Hà Thành Home",
          title: "Thiết kế & thi công công trình, nội thất hiện đại",
          description: "Hà Thành Home mang đến giải pháp trọn gói từ ý tưởng, thiết kế đến thi công hoàn thiện cho nhà ở, biệt thự, văn phòng và showroom.",
          primaryLabel: "Xem dự án nổi bật",
          primaryUrl: "#projects",
          secondaryLabel: "Tư vấn miễn phí",
          secondaryUrl: "/lien-he",
          imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
        }],
        aboutEyebrow: "Về Hà Thành Home",
        aboutTitle: "Kiến tạo không gian sống và công trình đẳng cấp",
        aboutDescription: "Với hơn 10 năm kinh nghiệm trong lĩnh vực thiết kế, thi công và nội thất, Hà Thành Home tư vấn giải pháp tối ưu, bền vững, thẩm mỹ và phù hợp chi phí.",
        aboutImageUrl: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85",
        aboutBenefits: [
          { title: "Thiết kế sáng tạo", description: "Ý tưởng khác biệt, bám sát nhu cầu sử dụng." },
          { title: "Thi công đúng tiến độ", description: "Quản trị rõ ràng từ kế hoạch đến bàn giao." },
          { title: "Vật liệu chất lượng", description: "Kiểm soát vật liệu, kỹ thuật và hoàn thiện." },
          { title: "Bảo hành tận tâm", description: "Đồng hành sau bàn giao." },
        ],
        expertiseEyebrow: "Hai khối chuyên môn",
        expertiseTitle: "Công trình và nội thất được vận hành tách biệt",
        architectureTemplatesEyebrow: "Mẫu thiết kế",
        architectureTemplatesTitle: "Mẫu thiết kế kiến trúc nổi bật",
        interiorTemplatesEyebrow: "Mẫu thiết kế",
        interiorTemplatesTitle: "Mẫu thiết kế nội thất nổi bật",
        servicesEyebrow: "Dịch vụ",
        servicesTitle: "Dịch vụ của chúng tôi",
        processTitle: "Quy trình làm việc",
        stats: [
          { value: "10+", label: "Năm kinh nghiệm" },
          { value: "500+", label: "Dự án hoàn thiện" },
          { value: "98%", label: "Khách hàng hài lòng" },
          { value: "24/7", label: "Hỗ trợ tư vấn" },
          { value: "50+", label: "Nhân sự chuyên môn" },
        ],
        testimonialsTitle: "Khách hàng nói gì về chúng tôi",
        newsTitle: "Tin tức & cảm hứng",
      },
    },
  });

  const estimatorConfig = {
    name: "Dự toán công trình mặc định",
    isActive: true,
    currency: "VND",
    minFactor: 0.92,
    maxFactor: 1.12,
    disclaimer: "Kết quả chỉ là ước tính tham khảo theo thông tin ban đầu. Báo giá chính xác cần khảo sát hiện trạng, hồ sơ thiết kế và vật liệu thực tế.",
    ctaTitle: "Nhận tư vấn dự toán chi tiết",
    ctaDescription: "Gửi thông tin để Hà Thành Home tư vấn phương án và báo giá phù hợp hơn.",
    inputSchemaJson: [
      { name: "houseType", label: "Loại công trình", type: "select", required: true, defaultValue: "nha-pho", options: [{ label: "Nhà phố", value: "nha-pho", variables: { house_factor: 1 } }, { label: "Biệt thự", value: "biet-thu", variables: { house_factor: 1.18 } }, { label: "Nhà cấp 4", value: "nha-cap-4", variables: { house_factor: 0.92 } }] },
      { name: "scope", label: "Phạm vi thi công", type: "select", required: true, defaultValue: "tron-goi", options: [{ label: "Phần thô", value: "phan-tho", variables: { unit_price: 3800000, scope_factor: 1 } }, { label: "Hoàn thiện cơ bản", value: "hoan-thien", variables: { unit_price: 6200000, scope_factor: 1 } }, { label: "Trọn gói", value: "tron-goi", variables: { unit_price: 7800000, scope_factor: 1 } }] },
      { name: "area", label: "Diện tích sàn/tầng", type: "number", required: true, min: 30, max: 2000, step: 1, unit: "m2", defaultValue: 100 },
      { name: "floors", label: "Số tầng", type: "number", required: true, min: 1, max: 12, step: 1, defaultValue: 3 },
      { name: "finishLevel", label: "Mức hoàn thiện", type: "select", required: true, defaultValue: "kha", options: [{ label: "Cơ bản", value: "co-ban", variables: { finish_factor: 0.92 } }, { label: "Khá", value: "kha", variables: { finish_factor: 1 } }, { label: "Cao cấp", value: "cao-cap", variables: { finish_factor: 1.2 } }] },
      { name: "foundationType", label: "Loại móng", type: "select", required: true, defaultValue: "mong-bang", options: [{ label: "Móng đơn", value: "mong-don", variables: { foundation_extra_per_m2: 180000 } }, { label: "Móng băng", value: "mong-bang", variables: { foundation_extra_per_m2: 320000 } }, { label: "Móng cọc", value: "mong-coc", variables: { foundation_extra_per_m2: 650000 } }] },
      { name: "roofType", label: "Kiểu mái", type: "select", required: true, defaultValue: "mai-bang", options: [{ label: "Mái bằng", value: "mai-bang", variables: { roof_extra_per_m2: 120000 } }, { label: "Mái Nhật", value: "mai-nhat", variables: { roof_extra_per_m2: 480000 } }, { label: "Mái Thái", value: "mai-thai", variables: { roof_extra_per_m2: 560000 } }] },
      { name: "location", label: "Khu vực", type: "select", required: true, defaultValue: "ha-noi", options: [{ label: "Hà Nội", value: "ha-noi", variables: { location_factor: 1 } }, { label: "Ninh Bình", value: "ninh-binh", variables: { location_factor: 0.96 } }] },
      { name: "basementArea", label: "Diện tích tầng hầm nếu có", type: "number", min: 0, max: 2000, step: 1, unit: "m2", defaultValue: 0 },
    ],
    formulaItemsJson: [
      { code: "base", label: "Chi phí xây dựng chính", expression: "gross_area * unit_price * house_factor * scope_factor * finish_factor * location_factor", active: true },
      { code: "foundation", label: "Gia cố móng", expression: "area * foundation_extra_per_m2", active: true },
      { code: "roof", label: "Hoàn thiện mái", expression: "area * roof_extra_per_m2", active: true },
      { code: "basement", label: "Tầng hầm", expression: "basement_area * unit_price * basement_factor", active: true },
      { code: "design", label: "Hồ sơ thiết kế tham khảo", expression: "gross_area * design_unit_price", active: true },
    ],
  };

  await prisma.constructionEstimatorConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...estimatorConfig },
  });

  const projects = [
    ["Biệt thự cao cấp Hà Nội", "biet-thu-cao-cap-ha-noi", ProjectGroup.construction, "Hà Nội"],
    ["Nhà phố hiện đại Ninh Bình", "nha-pho-hien-dai-ninh-binh", ProjectGroup.construction, "Ninh Bình"],
    ["Nội thất căn hộ cao cấp", "noi-that-can-ho-cao-cap", ProjectGroup.interior, "Hà Nội"],
    ["Showroom nội thất Hải Phòng", "showroom-noi-that-hai-phong", ProjectGroup.interior, "Hải Phòng"],
  ] as const;

  for (const [title, slug, group, location] of projects) {
    await prisma.project.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        group,
        location,
        category: group === ProjectGroup.construction ? "Công trình" : "Nội thất",
        description: "Dự án tiêu biểu của Hà Thành Home.",
        status: ContentStatus.published,
        isFeatured: true,
        publishedAt: new Date(),
      },
    });
  }

  const projectCategorySeeds = [
    [ProjectGroup.construction, "Biệt thự", "biet-thu"],
    [ProjectGroup.construction, "Nhà phố", "nha-pho"],
    [ProjectGroup.construction, "Văn phòng", "van-phong-cong-trinh"],
    [ProjectGroup.construction, "Tòa nhà", "toa-nha"],
    [ProjectGroup.construction, "Showroom", "showroom-cong-trinh"],
    [ProjectGroup.construction, "Nhà xưởng", "nha-xuong"],
    [ProjectGroup.interior, "Căn hộ", "can-ho"],
    [ProjectGroup.interior, "Biệt thự", "biet-thu-noi-that"],
    [ProjectGroup.interior, "Văn phòng", "van-phong-noi-that"],
    [ProjectGroup.interior, "Showroom", "showroom-noi-that"],
    [ProjectGroup.interior, "Phòng khách", "phong-khach"],
    [ProjectGroup.interior, "Phòng ngủ", "phong-ngu"],
    [ProjectGroup.interior, "Bếp", "bep"],
    [ProjectGroup.interior, "Trọn gói", "tron-goi"],
  ] as const;

  const categoryByName = new Map<string, { id: number }>();
  for (const [index, [group, name, slug]] of projectCategorySeeds.entries()) {
    const category = await prisma.projectCategory.upsert({
      where: { slug },
      update: {},
      create: { group, name, slug, sortOrder: index, isActive: true },
    });
    categoryByName.set(`${group}:${name}`, category);
  }

  const filterSeeds = [
    [ProjectGroup.construction, ProjectFilterType.project_type, "Biệt thự"],
    [ProjectGroup.construction, ProjectFilterType.project_type, "Nhà phố"],
    [ProjectGroup.construction, ProjectFilterType.project_type, "Văn phòng"],
    [ProjectGroup.construction, ProjectFilterType.project_type, "Showroom"],
    [ProjectGroup.construction, ProjectFilterType.style, "Hiện đại"],
    [ProjectGroup.construction, ProjectFilterType.style, "Tân cổ điển"],
    [ProjectGroup.construction, ProjectFilterType.scale, "Quy mô nhỏ"],
    [ProjectGroup.construction, ProjectFilterType.scale, "Quy mô vừa"],
    [ProjectGroup.construction, ProjectFilterType.scale, "Quy mô lớn"],
    [ProjectGroup.construction, ProjectFilterType.location, "Hà Nội"],
    [ProjectGroup.construction, ProjectFilterType.location, "Ninh Bình"],
    [ProjectGroup.construction, ProjectFilterType.budget_range, "2 - 3 tỷ"],
    [ProjectGroup.construction, ProjectFilterType.budget_range, "3 - 5 tỷ"],
    [ProjectGroup.interior, ProjectFilterType.project_type, "Căn hộ"],
    [ProjectGroup.interior, ProjectFilterType.project_type, "Biệt thự"],
    [ProjectGroup.interior, ProjectFilterType.project_type, "Showroom"],
    [ProjectGroup.interior, ProjectFilterType.space, "Phòng khách"],
    [ProjectGroup.interior, ProjectFilterType.space, "Phòng ngủ"],
    [ProjectGroup.interior, ProjectFilterType.space, "Trọn gói"],
    [ProjectGroup.interior, ProjectFilterType.style, "Hiện đại"],
    [ProjectGroup.interior, ProjectFilterType.style, "Luxury retail"],
    [ProjectGroup.interior, ProjectFilterType.location, "Hà Nội"],
    [ProjectGroup.interior, ProjectFilterType.location, "Hải Phòng"],
    [ProjectGroup.interior, ProjectFilterType.budget_range, "500 - 800 triệu"],
    [ProjectGroup.interior, ProjectFilterType.budget_range, "800 triệu - 1.2 tỷ"],
  ] as const;

  for (const [index, [group, type, name]] of filterSeeds.entries()) {
    const module = ProjectFilterModule.project;
    const slug = `${group}-${type}-${slugifySeed(name)}`;
    await prisma.projectFilterOption.upsert({
      where: { slug },
      update: {},
      create: { module, group, type, name, slug, sortOrder: index, isActive: true },
    });
  }

  const catalogFilterSeeds = [
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.house_type, "Biệt thự"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.house_type, "Nhà phố"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.house_type, "Nhà cấp 4"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.house_type, "Showroom"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.style, "Hiện đại"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.style, "Tân cổ điển"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.style, "Tối giản"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.roof_type, "Mái bằng"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.roof_type, "Mái Nhật"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.roof_type, "Mái Thái"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.floors, "1"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.floors, "2"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.floors, "3"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.floors, "4"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.location, "Hà Nội"],
    [ProjectFilterModule.architecture_design, ProjectGroup.construction, ProjectFilterType.location, "Ninh Bình"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.interior_style, "Hiện đại"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.interior_style, "Tân cổ điển"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.interior_style, "Tối giản"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.interior_style, "Indochine"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.house_type, "Căn hộ"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.house_type, "Biệt thự"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.house_type, "Nhà phố"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.house_type, "Văn phòng"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.room_type, "Phòng khách"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.room_type, "Phòng ngủ"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.room_type, "Bếp"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.room_type, "Trọn gói"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.layout_type, "Không gian mở"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.material_tone, "Gỗ ấm"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.material_tone, "Kem gold"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.budget_range, "300 - 500 triệu"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.budget_range, "500 - 800 triệu"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.location, "Hà Nội"],
    [ProjectFilterModule.interior_design, ProjectGroup.interior, ProjectFilterType.location, "Ninh Bình"],
  ] as const;

  for (const [index, [module, group, type, name]] of catalogFilterSeeds.entries()) {
    const slug = `${module}-${group}-${type}-${slugifySeed(name)}`;
    await prisma.projectFilterOption.upsert({
      where: { slug },
      update: {},
      create: { module, group, type, name, slug, sortOrder: index, isActive: true },
    });
  }

  const projectEnhancements = [
    ["biet-thu-cao-cap-ha-noi", ProjectGroup.construction, "Biệt thự", "Biệt thự", "Hiện đại", "225m2", 225, "Quy mô vừa", "Gia đình tư nhân", "3 - 5 tỷ"],
    ["nha-pho-hien-dai-ninh-binh", ProjectGroup.construction, "Nhà phố", "Nhà phố", "Hiện đại", "180m2", 180, "Quy mô vừa", "Gia đình tư nhân", "2 - 3 tỷ"],
    ["noi-that-can-ho-cao-cap", ProjectGroup.interior, "Căn hộ", "Căn hộ", "Hiện đại", "95m2", 95, "Trọn gói căn hộ", "Chị Thu Hằng", "500 - 800 triệu"],
    ["showroom-noi-that-hai-phong", ProjectGroup.interior, "Showroom", "Showroom", "Luxury retail", "160m2", 160, "Showroom thương mại", "Doanh nghiệp tư nhân", "800 triệu - 1.2 tỷ"],
  ] as const;

  for (const [slug, group, category, projectType, style, area, areaValue, scale, clientName, budgetRange] of projectEnhancements) {
    const categoryId = categoryByName.get(`${group}:${category}`)?.id;
    await prisma.project.updateMany({
      where: { slug, categoryId: null },
      data: { categoryId, category, projectType, style, area, areaValue, scale, clientName, budgetRange },
    });
  }

  const services = [
    ["Thiết kế kiến trúc", "thiet-ke-kien-truc", ProjectGroup.construction],
    ["Thi công phần thô", "thi-cong-phan-tho", ProjectGroup.construction],
    ["Thiết kế nội thất", "thiet-ke-noi-that", ProjectGroup.interior],
    ["Sản xuất nội thất", "san-xuat-noi-that", ProjectGroup.interior],
  ] as const;

  for (const [title, slug, group] of services) {
    await prisma.service.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        group,
        description: "Dịch vụ trọn gói, chuyên nghiệp và kiểm soát chất lượng rõ ràng.",
        status: ContentStatus.published,
        isFeatured: true,
        publishedAt: new Date(),
      },
    });
  }

  const postCategories = [
    ["Cẩm nang xây dựng", "cam-nang-xay-dung"],
    ["Cảm hứng nội thất", "cam-hung-noi-that"],
    ["Kinh nghiệm thiết kế", "kinh-nghiem-thiet-ke"],
  ] as const;

  const postCategoryMap = new Map<string, number>();
  for (const [name, slug] of postCategories) {
    const category = await prisma.postCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug, isActive: true },
    });
    postCategoryMap.set(slug, category.id);
  }

  const posts = [
    ["Xu hướng thiết kế nội thất 2026", "xu-huong-thiet-ke-noi-that-2026", "cam-hung-noi-that"],
    ["5 lưu ý khi xây biệt thự phố", "5-luu-y-khi-xay-biet-thu-pho", "cam-nang-xay-dung"],
  ] as const;

  for (const [title, slug, categorySlug] of posts) {
    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        categoryId: postCategoryMap.get(categorySlug),
        excerpt: "Góc nhìn chuyên môn từ đội ngũ Hà Thành Home.",
        status: ContentStatus.published,
        isFeatured: true,
        publishedAt: new Date(),
      },
    });
  }

  const architectureDesigns = [
    {
      title: "Mẫu biệt thự hiện đại mái bằng 3 tầng",
      slug: "mau-biet-thu-hien-dai-mai-bang-3-tang",
      code: "BTHDAMB03010",
      houseType: "Biệt thự",
      style: "Hiện đại",
      area: 225,
      floors: 3,
      roofType: "Mái bằng",
      estimatedBudget: 3500,
      constructionTime: "6 - 8 tháng",
      location: "Hà Nội",
    },
    {
      title: "Mẫu nhà cấp 4 hiện đại mái Nhật",
      slug: "mau-nha-cap-4-hien-dai-mai-nhat",
      code: "N4HDAMN01034",
      houseType: "Nhà cấp 4",
      style: "Hiện đại",
      area: 138,
      floors: 1,
      roofType: "Mái Nhật",
      estimatedBudget: 1200,
      constructionTime: "4 - 5 tháng",
      location: "Ninh Bình",
    },
  ];

  for (const design of architectureDesigns) {
    await prisma.architectureDesignTemplate.upsert({
      where: { slug: design.slug },
      update: { ...design, description: "Mẫu thiết kế kiến trúc tham khảo cho khách hàng Hà Thành Home." },
      create: {
        ...design,
        description: "Mẫu thiết kế kiến trúc tham khảo cho khách hàng Hà Thành Home.",
        status: ContentStatus.published,
        isFeatured: true,
        publishedAt: new Date(),
      },
    });
  }

  const interiorDesigns = [
    {
      title: "Mẫu thiết kế nội thất phòng khách hiện đại",
      slug: "mau-thiet-ke-noi-that-phong-khach-hien-dai",
      code: "NT-PK-HD-001",
      interiorStyle: "Hiện đại",
      houseType: "Căn hộ",
      roomType: "Phòng khách",
      area: 35,
      layoutType: "Không gian mở",
      materialTone: "Gỗ ấm - đá sắc sáng",
      budgetRange: "300 - 500 triệu",
      budgetMin: 300,
      budgetMax: 500,
      location: "Hà Nội",
    },
    {
      title: "Mẫu nội thất biệt thự tân cổ điển",
      slug: "mau-noi-that-biet-thu-tan-co-dien",
      code: "NT-BT-TCD-002",
      interiorStyle: "Tân cổ điển",
      houseType: "Biệt thự",
      roomType: "Trọn gói",
      area: 220,
      layoutType: "Luxury villa",
      materialTone: "Kem - gold - gỗ óc chó",
      budgetRange: "1 - 2 tỷ",
      budgetMin: 1000,
      budgetMax: 2000,
      location: "Hà Nội",
    },
  ];

  for (const design of interiorDesigns) {
    await prisma.interiorDesignTemplate.upsert({
      where: { slug: design.slug },
      update: { ...design, description: "Mẫu thiết kế nội thất tham khảo cho khách hàng Hà Thành Home." },
      create: {
        ...design,
        description: "Mẫu thiết kế nội thất tham khảo cho khách hàng Hà Thành Home.",
        status: ContentStatus.published,
        isFeatured: true,
        publishedAt: new Date(),
      },
    });
  }

  await seedMenu(MenuLocation.header, "Menu chính", [
    ["Trang chủ", "/"],
    ["Dự án", "/du-an", [["Công trình", "/du-an/cong-trinh"], ["Nội thất", "/du-an/noi-that"]]],
    ["Mẫu kiến trúc", "/mau-thiet-ke-kien-truc"],
    ["Mẫu nội thất", "/mau-thiet-ke-noi-that"],
    ["Dịch vụ", "/dich-vu", [["Dịch vụ công trình", "/dich-vu/cong-trinh"], ["Dịch vụ nội thất", "/dich-vu/noi-that"]]],
    ["Tin tức", "/tin-tuc"],
    ["Liên hệ", "/lien-he"],
  ]);

  await seedMenu(MenuLocation.footer, "Menu footer", [
    ["Công trình", "/du-an/cong-trinh", [["Dự án công trình", "/du-an/cong-trinh"], ["Dịch vụ công trình", "/dich-vu/cong-trinh"], ["Mẫu kiến trúc", "/mau-thiet-ke-kien-truc"]]],
    ["Nội thất", "/du-an/noi-that", [["Dự án nội thất", "/du-an/noi-that"], ["Dịch vụ nội thất", "/dich-vu/noi-that"], ["Mẫu nội thất", "/mau-thiet-ke-noi-that"]]],
    ["Chính sách", "/chinh-sach-bao-hanh", [["Chính sách bảo hành", "/chinh-sach-bao-hanh"], ["Chính sách bảo mật", "/chinh-sach-bao-mat"]]],
    ["Liên hệ", "/lien-he", [["Tin tức", "/tin-tuc"], ["Nhận tư vấn", "/lien-he"]]],
  ]);

  console.log(`Seed completed. Admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function slugifySeed(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedMenu(location: MenuLocation, name: string, items: SeedMenuItem[]) {
  const menu = await prisma.menu.upsert({
    where: { id: location === MenuLocation.header ? 1 : 2 },
    update: { name, location, isActive: true },
    create: { id: location === MenuLocation.header ? 1 : 2, name, location, isActive: true },
  });
  const existingCount = await prisma.menuItem.count({ where: { menuId: menu.id } });
  if (existingCount > 0) return;
  for (const [index, item] of items.entries()) {
    await createSeedMenuItem(menu.id, item, null, index);
  }
}

type SeedMenuItem = [string, string, SeedMenuItem[]?];

async function createSeedMenuItem(menuId: number, item: SeedMenuItem, parentId: number | null, sortOrder: number) {
  const [label, url, children] = item;
  const created = await prisma.menuItem.create({
    data: {
      menuId,
      parentId,
      label,
      url,
      target: MenuTarget.self,
      itemType: "route",
      sortOrder,
      isActive: true,
    },
  });
  for (const [index, child] of (children || []).entries()) {
    await createSeedMenuItem(menuId, child, created.id, index);
  }
}
