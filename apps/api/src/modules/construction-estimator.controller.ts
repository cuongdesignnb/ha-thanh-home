import { Body, Controller, Get, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { IsArray, IsBoolean, IsEmail, IsInt, IsObject, IsOptional, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { JwtGuard } from "./jwt.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import { ConstructionEstimatorService } from "./construction-estimator.service";

class CalculateEstimateDto {
  @IsObject()
  input!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}

class EstimatorLeadDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimateId?: number;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @MinLength(8)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}

class EstimatorConfigDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  minFactor?: number;

  @IsOptional()
  maxFactor?: number;

  @IsOptional()
  @IsArray()
  inputSchemaJson?: unknown[];

  @IsOptional()
  @IsArray()
  formulaItemsJson?: unknown[];

  @IsOptional()
  @IsString()
  disclaimer?: string;

  @IsOptional()
  @IsString()
  ctaTitle?: string;

  @IsOptional()
  @IsString()
  ctaDescription?: string;

  @IsOptional()
  @IsObject()
  input?: Record<string, unknown>;
}

@Controller("api/construction-estimator")
export class ConstructionEstimatorPublicController {
  constructor(private readonly estimator: ConstructionEstimatorService) {}

  @Get("config")
  config() {
    return this.estimator.getPublicConfig();
  }

  @Post("calculate")
  calculate(@Body() dto: CalculateEstimateDto) {
    return this.estimator.calculate(dto.input, dto.sourceUrl);
  }

  @Post("leads")
  createLead(@Body() dto: EstimatorLeadDto) {
    return this.estimator.createLead(dto);
  }
}

@Controller("api/admin/construction-estimator")
@UseGuards(JwtGuard, RolesGuard)
export class ConstructionEstimatorAdminController {
  constructor(private readonly estimator: ConstructionEstimatorService) {}

  @Get("config")
  @Roles("Admin", "Viewer")
  config() {
    return this.estimator.getAdminConfig();
  }

  @Patch("config")
  @Roles("Admin")
  updateConfig(@Body() dto: EstimatorConfigDto) {
    return this.estimator.updateConfig(dto as never);
  }

  @Post("reset-default")
  @Roles("Admin")
  resetDefault() {
    return this.estimator.resetToDefault();
  }

  @Post("preview")
  @Roles("Admin", "Viewer")
  preview(@Body() dto: EstimatorConfigDto) {
    return this.estimator.preview(dto as never);
  }

  @Get("estimates")
  @Roles("Admin", "Sales", "Viewer")
  estimates(@Query() query: Record<string, unknown>) {
    return this.estimator.listEstimates(query);
  }
}
