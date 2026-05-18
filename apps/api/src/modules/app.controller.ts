import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { AppService } from "./app.service";

class CreateLeadDto {
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
  demandType?: string;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  health() {
    return { status: "ok", service: "hathanh-api", timestamp: new Date().toISOString() };
  }

  @Get("api/home")
  home() {
    return this.appService.getHome();
  }

  @Get("api/settings")
  settings() {
    return this.appService.getSettings();
  }

  @Get("api/site-settings")
  siteSettings() {
    return this.appService.getSettings();
  }

  @Post("api/leads")
  createLead(@Body() dto: CreateLeadDto) {
    return this.appService.createLead(dto);
  }
}
