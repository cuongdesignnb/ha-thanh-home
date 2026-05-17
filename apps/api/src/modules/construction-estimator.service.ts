import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Parser } from "expr-eval";
import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";

type EstimatorOption = {
  label: string;
  value: string;
  variables?: Record<string, number>;
};

type EstimatorField = {
  name: string;
  label: string;
  type: "select" | "number";
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: string | number;
  options?: EstimatorOption[];
};

type FormulaItem = {
  code: string;
  label: string;
  expression: string;
  description?: string;
  active?: boolean;
};

type EstimatorConfigInput = {
  id?: number;
  name?: string;
  isActive?: boolean;
  currency?: string;
  minFactor?: number;
  maxFactor?: number;
  inputSchemaJson?: EstimatorField[];
  formulaItemsJson?: FormulaItem[];
  disclaimer?: string;
  ctaTitle?: string;
  ctaDescription?: string;
};

type EstimatorRuntimeConfig = {
  id?: number;
  name: string;
  currency: string;
  minFactor: number;
  maxFactor: number;
  inputSchemaJson: unknown;
  formulaItemsJson: unknown;
  disclaimer?: string | null;
  ctaTitle?: string | null;
  ctaDescription?: string | null;
};

export const defaultEstimatorInputSchema: EstimatorField[] = [
  {
    name: "houseType",
    label: "Loại công trình",
    type: "select",
    required: true,
    defaultValue: "nha-pho",
    options: [
      { label: "Nhà phố", value: "nha-pho", variables: { house_factor: 1 } },
      { label: "Biệt thự", value: "biet-thu", variables: { house_factor: 1.12 } },
      { label: "Nhà cấp 4", value: "nha-cap-4", variables: { house_factor: 0.95 } },
      { label: "Showroom / văn phòng", value: "showroom", variables: { house_factor: 1.1 } },
    ],
  },
  {
    name: "scope",
    label: "Gói thi công / đơn giá",
    type: "select",
    required: true,
    defaultValue: "tron-goi-tieu-chuan",
    options: [
      { label: "Phần thô 3,5 triệu/m2", value: "phan-tho", variables: { unit_price: 3500000 } },
      { label: "Trọn gói cơ bản 4,8 triệu/m2", value: "tron-goi-co-ban", variables: { unit_price: 4800000 } },
      { label: "Trọn gói tiêu chuẩn 5,8 triệu/m2", value: "tron-goi-tieu-chuan", variables: { unit_price: 5800000 } },
      { label: "Trọn gói cao cấp 7,0 triệu/m2", value: "tron-goi-cao-cap", variables: { unit_price: 7000000 } },
    ],
  },
  { name: "area", label: "Diện tích một sàn", type: "number", required: true, min: 30, max: 2000, step: 1, unit: "m2", defaultValue: 100 },
  { name: "floors", label: "Số tầng nổi", type: "number", required: true, min: 1, max: 12, step: 1, defaultValue: 2 },
  {
    name: "foundationType",
    label: "Loại móng",
    type: "select",
    required: true,
    defaultValue: "mong-bang-1-phuong",
    options: [
      { label: "Móng đơn - đã tính trong đơn giá", value: "mong-don", variables: { foundation_area_factor: 0 } },
      { label: "Móng băng 1 phương - 50% diện tích", value: "mong-bang-1-phuong", variables: { foundation_area_factor: 0.5 } },
      { label: "Móng băng 2 phương - 70% diện tích", value: "mong-bang-2-phuong", variables: { foundation_area_factor: 0.7 } },
      { label: "Móng cọc/đài móng - 25% diện tích", value: "mong-coc", variables: { foundation_area_factor: 0.25 } },
    ],
  },
  {
    name: "roofType",
    label: "Kiểu mái",
    type: "select",
    required: true,
    defaultValue: "mai-btct",
    options: [
      { label: "Mái tôn - 20% diện tích", value: "mai-ton", variables: { roof_area_factor: 0.2 } },
      { label: "Mái bê tông cốt thép - 50% diện tích", value: "mai-btct", variables: { roof_area_factor: 0.5 } },
      { label: "Mái ngói kèo sắt - 70% diện tích", value: "mai-ngoi-keo-sat", variables: { roof_area_factor: 0.7 } },
      { label: "Mái ngói BTCT / mái Nhật / mái Thái - 100% diện tích", value: "mai-ngoi-btct", variables: { roof_area_factor: 1 } },
    ],
  },
  { name: "basementArea", label: "Diện tích tầng hầm nếu có", type: "number", min: 0, max: 2000, step: 1, unit: "m2", defaultValue: 0 },
  {
    name: "basementType",
    label: "Hệ số tầng hầm",
    type: "select",
    required: true,
    defaultValue: "khong-ham",
    options: [
      { label: "Không có tầng hầm", value: "khong-ham", variables: { basement_area_factor: 0 } },
      { label: "Tầng hầm nông - 150% diện tích", value: "ham-150", variables: { basement_area_factor: 1.5 } },
      { label: "Tầng hầm tiêu chuẩn - 200% diện tích", value: "ham-200", variables: { basement_area_factor: 2 } },
      { label: "Tầng hầm sâu/phức tạp - 250% diện tích", value: "ham-250", variables: { basement_area_factor: 2.5 } },
    ],
  },
  {
    name: "location",
    label: "Khu vực",
    type: "select",
    required: true,
    defaultValue: "ha-noi",
    options: [
      { label: "Hà Nội", value: "ha-noi", variables: { location_factor: 1 } },
      { label: "Ninh Bình", value: "ninh-binh", variables: { location_factor: 0.96 } },
      { label: "Tỉnh miền Bắc", value: "mien-bac", variables: { location_factor: 0.98 } },
    ],
  },
  {
    name: "designOption",
    label: "Chi phí thiết kế",
    type: "select",
    required: true,
    defaultValue: "thiet-ke-co-ban",
    options: [
      { label: "Chưa tính thiết kế", value: "khong-tinh", variables: { design_percent: 0 } },
      { label: "Hồ sơ thiết kế cơ bản - 3%", value: "thiet-ke-co-ban", variables: { design_percent: 0.03 } },
      { label: "Hồ sơ thiết kế chi tiết/cao cấp - 5%", value: "thiet-ke-cao-cap", variables: { design_percent: 0.05 } },
    ],
  },
];

export const defaultEstimatorFormulaItems: FormulaItem[] = [
  { code: "floors", label: "Phần sàn các tầng", expression: "floor_area * unit_price * house_factor * location_factor", active: true },
  { code: "foundation", label: "Phần móng quy đổi", expression: "foundation_area * unit_price * house_factor * location_factor", active: true },
  { code: "roof", label: "Phần mái quy đổi", expression: "roof_area * unit_price * house_factor * location_factor", active: true },
  { code: "basement", label: "Tầng hầm quy đổi", expression: "basement_priced_area * unit_price * house_factor * location_factor", active: true },
  { code: "design", label: "Hồ sơ thiết kế tham khảo", expression: "construction_cost * design_percent", active: true },
];

const defaultConfig = {
  name: "Dự toán xây dựng theo m2 tính giá",
  isActive: true,
  currency: "VND",
  minFactor: 0.9,
  maxFactor: 1.15,
  inputSchemaJson: defaultEstimatorInputSchema,
  formulaItemsJson: defaultEstimatorFormulaItems,
  disclaimer: "Kết quả chỉ là ước tính theo phương pháp m2 tính giá: sàn các tầng, móng, mái và tầng hầm được quy đổi theo hệ số. Báo giá chính xác cần khảo sát hiện trạng, hồ sơ thiết kế, vật liệu và điều kiện thi công thực tế.",
  ctaTitle: "Nhận tư vấn dự toán chi tiết",
  ctaDescription: "Gửi thông tin để Hà Thành Home khảo sát, tối ưu phương án và lập báo giá sát thực tế hơn.",
};

@Injectable()
export class ConstructionEstimatorService {
  private readonly parser = new Parser({
    operators: {
      add: true,
      concatenate: false,
      conditional: false,
      divide: true,
      factorial: false,
      logical: false,
      multiply: true,
      power: false,
      remainder: true,
      subtract: true,
      comparison: false,
      in: false,
      assignment: false,
    },
  });

  constructor(private readonly prisma: PrismaService) {}

  async getAdminConfig() {
    const config = await this.prisma.constructionEstimatorConfig.findFirst({ orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }] });
    if (!config) return defaultConfig;
    return this.upgradeLegacyConfig(config);
  }

  async getPublicConfig() {
    const config = await this.getActiveConfig();
    return {
      id: config.id,
      name: config.name,
      currency: config.currency,
      inputSchema: config.inputSchemaJson,
      disclaimer: config.disclaimer,
      ctaTitle: config.ctaTitle,
      ctaDescription: config.ctaDescription,
    };
  }

  async updateConfig(dto: EstimatorConfigInput) {
    const normalized = this.normalizeConfig(dto);
    this.calculateWithConfig(normalized, sampleInput(normalized.inputSchemaJson));
    if (normalized.isActive) {
      await this.prisma.constructionEstimatorConfig.updateMany({ data: { isActive: false } });
    }
    return this.prisma.constructionEstimatorConfig.upsert({
      where: { id: Number(dto.id || 1) },
      update: normalized,
      create: { id: Number(dto.id || 1), ...normalized },
    });
  }

  async resetToDefault() {
    await this.prisma.constructionEstimatorConfig.updateMany({ data: { isActive: false } });
    return this.prisma.constructionEstimatorConfig.upsert({
      where: { id: 1 },
      update: defaultConfig,
      create: { id: 1, ...defaultConfig },
    });
  }

  async preview(dto: EstimatorConfigInput & { input?: Record<string, unknown> }) {
    const normalized = this.normalizeConfig(dto);
    return this.calculateWithConfig(normalized, dto.input || sampleInput(normalized.inputSchemaJson));
  }

  async calculate(input: Record<string, unknown>, sourceUrl?: string) {
    const config = await this.getActiveConfig();
    const result = this.calculateWithConfig(config, input);
    const estimate = await this.prisma.constructionEstimate.create({
      data: {
        configId: "id" in config ? Number(config.id) : null,
        configName: config.name,
        inputJson: result.input as Prisma.InputJsonObject,
        variablesJson: result.variables as Prisma.InputJsonObject,
        lineItemsJson: result.lineItems as Prisma.InputJsonArray,
        total: result.total,
        totalMin: result.totalMin,
        totalMax: result.totalMax,
        currency: result.currency,
        sourceUrl,
      },
    });
    return { ...result, estimateId: estimate.id };
  }

  async createLead(dto: { estimateId?: number; fullName: string; phone: string; email?: string; message?: string; sourceUrl?: string }) {
    const estimate = dto.estimateId
      ? await this.prisma.constructionEstimate.findUnique({ where: { id: dto.estimateId } })
      : null;
    const budget = estimate ? `${formatMoney(Number(estimate.totalMin))} - ${formatMoney(Number(estimate.totalMax))}` : undefined;
    const lead = await this.prisma.lead.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        demandType: "Dự toán chi phí xây dựng",
        projectType: estimate ? String((estimate.inputJson as Record<string, unknown>).houseType || "") : undefined,
        area: estimate ? String((estimate.inputJson as Record<string, unknown>).area || "") : undefined,
        budget,
        message: [dto.message, estimate ? `Dự toán #${estimate.id}: ${budget}` : ""].filter(Boolean).join("\n"),
        sourceUrl: dto.sourceUrl || estimate?.sourceUrl,
        sourceType: "construction_estimator",
      },
    });
    if (estimate) {
      await this.prisma.constructionEstimate.update({ where: { id: estimate.id }, data: { leadId: lead.id } });
    }
    return { lead, estimateId: estimate?.id || null };
  }

  async listEstimates(query: Record<string, unknown>) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.constructionEstimate.findMany({ skip, take: limit, include: { lead: true }, orderBy: { createdAt: "desc" } }),
      this.prisma.constructionEstimate.count(),
    ]);
    const data = rows.map((item) => ({
      ...item,
      total: Number(item.total),
      totalMin: Number(item.totalMin),
      totalMax: Number(item.totalMax),
    }));
    return { data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  private async getActiveConfig() {
    const config = await this.prisma.constructionEstimatorConfig.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } });
    if (!config) throw new NotFoundException("Construction estimator config not found");
    return this.upgradeLegacyConfig(config);
  }

  private async upgradeLegacyConfig(config: EstimatorRuntimeConfig) {
    if (!isLegacyFormula(config.formulaItemsJson)) return config;
    const upgraded = {
      name: defaultConfig.name,
      isActive: true,
      currency: config.currency || defaultConfig.currency,
      minFactor: defaultConfig.minFactor,
      maxFactor: defaultConfig.maxFactor,
      inputSchemaJson: defaultEstimatorInputSchema,
      formulaItemsJson: defaultEstimatorFormulaItems,
      disclaimer: defaultConfig.disclaimer,
      ctaTitle: defaultConfig.ctaTitle,
      ctaDescription: defaultConfig.ctaDescription,
    };
    if (config.id) {
      return this.prisma.constructionEstimatorConfig.update({
        where: { id: Number(config.id) },
        data: upgraded,
      });
    }
    return { id: config.id, ...upgraded };
  }

  private normalizeConfig(dto: EstimatorConfigInput) {
    const inputSchemaJson = Array.isArray(dto.inputSchemaJson) ? dto.inputSchemaJson : defaultEstimatorInputSchema;
    const formulaItemsJson = Array.isArray(dto.formulaItemsJson) ? dto.formulaItemsJson : defaultEstimatorFormulaItems;
    if (!formulaItemsJson.length) throw new BadRequestException("Formula items cannot be empty");
    const minFactor = Number(dto.minFactor ?? defaultConfig.minFactor);
    const maxFactor = Number(dto.maxFactor ?? defaultConfig.maxFactor);
    if (!Number.isFinite(minFactor) || !Number.isFinite(maxFactor) || minFactor <= 0 || maxFactor < minFactor) {
      throw new BadRequestException("Invalid min/max factor");
    }
    return {
      name: String(dto.name || defaultConfig.name),
      isActive: dto.isActive ?? true,
      currency: String(dto.currency || "VND"),
      minFactor,
      maxFactor,
      inputSchemaJson,
      formulaItemsJson,
      disclaimer: dto.disclaimer ?? defaultConfig.disclaimer,
      ctaTitle: dto.ctaTitle ?? defaultConfig.ctaTitle,
      ctaDescription: dto.ctaDescription ?? defaultConfig.ctaDescription,
    };
  }

  private calculateWithConfig(config: EstimatorRuntimeConfig, rawInput: Record<string, unknown>) {
    const inputSchema = ensureFields(config.inputSchemaJson);
    const formulaItems = ensureFormulaItems(config.formulaItemsJson);
    const input = normalizeInput(inputSchema, rawInput);
    const variables = buildVariables(inputSchema, input);

    variables.house_factor = variables.house_factor || 1;
    variables.location_factor = variables.location_factor || 1;
    variables.unit_price = variables.unit_price || 5800000;
    variables.foundation_area_factor = variables.foundation_area_factor || 0;
    variables.roof_area_factor = variables.roof_area_factor || 0;
    variables.basement_area_factor = variables.basement_area_factor || 0;
    variables.design_percent = variables.design_percent || 0;

    variables.floor_area = variables.area * variables.floors;
    variables.foundation_area = variables.area * variables.foundation_area_factor;
    variables.roof_area = variables.area * variables.roof_area_factor;
    variables.basement_area = variables.basementArea || variables.basement_area || 0;
    variables.basement_priced_area = variables.basement_area * variables.basement_area_factor;
    variables.priced_area = variables.floor_area + variables.foundation_area + variables.roof_area + variables.basement_priced_area;
    variables.construction_cost = variables.priced_area * variables.unit_price * variables.house_factor * variables.location_factor;

    const lineItems = formulaItems
      .filter((item) => item.active !== false)
      .map((item) => {
        const expression = this.parser.parse(item.expression);
        const unknownVars = expression.variables().filter((name) => !(name in variables));
        if (unknownVars.length) throw new BadRequestException(`Formula "${item.code}" uses unknown variables: ${unknownVars.join(", ")}`);
        const amount = Number(expression.evaluate(variables));
        if (!Number.isFinite(amount) || amount < 0) throw new BadRequestException(`Formula "${item.code}" returned invalid amount`);
        return { code: item.code, label: item.label, expression: item.expression, description: item.description, amount: roundMoney(amount) };
      });
    const total = roundMoney(lineItems.reduce((sum, item) => sum + item.amount, 0));
    return {
      input,
      variables,
      lineItems,
      total,
      totalMin: roundMoney(total * Number(config.minFactor)),
      totalMax: roundMoney(total * Number(config.maxFactor)),
      currency: config.currency || "VND",
      disclaimer: config.disclaimer,
      ctaTitle: config.ctaTitle,
      ctaDescription: config.ctaDescription,
    };
  }
}

function ensureFields(value: unknown): EstimatorField[] {
  if (!Array.isArray(value)) throw new BadRequestException("Input schema must be an array");
  return value as EstimatorField[];
}

function ensureFormulaItems(value: unknown): FormulaItem[] {
  if (!Array.isArray(value)) throw new BadRequestException("Formula items must be an array");
  return value as FormulaItem[];
}

function normalizeInput(fields: EstimatorField[], rawInput: Record<string, unknown>) {
  return Object.fromEntries(
    fields.map((field) => {
      const fallback = field.defaultValue ?? (field.type === "number" ? 0 : field.options?.[0]?.value || "");
      const raw = rawInput[field.name] ?? fallback;
      if (field.type === "number") {
        const value = Number(raw);
        if (field.required && (!Number.isFinite(value) || value <= 0)) throw new BadRequestException(`${field.label} is required`);
        return [field.name, Number.isFinite(value) ? value : 0];
      }
      const value = String(raw);
      if (field.required && !value) throw new BadRequestException(`${field.label} is required`);
      return [field.name, value];
    }),
  );
}

function buildVariables(fields: EstimatorField[], input: Record<string, unknown>) {
  const variables: Record<string, number> = {};
  for (const field of fields) {
    if (field.type === "number") {
      variables[field.name] = Number(input[field.name] || 0);
    }
    if (field.type === "select") {
      const option = field.options?.find((item) => item.value === input[field.name]);
      Object.assign(variables, option?.variables || {});
    }
  }
  return variables;
}

function sampleInput(fields: EstimatorField[]) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? (field.type === "number" ? field.min || 0 : field.options?.[0]?.value || "")]));
}

function isLegacyFormula(value: unknown) {
  if (!Array.isArray(value)) return true;
  const source = JSON.stringify(value);
  return source.includes("gross_area") || source.includes("foundation_extra_per_m2") || source.includes("roof_extra_per_m2");
}

function roundMoney(value: number) {
  return Math.max(0, Math.round(value / 1000000) * 1000000);
}

function formatMoney(value: number) {
  return `${Math.round(value / 1000000).toLocaleString("vi-VN")} triệu`;
}
