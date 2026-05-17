import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwt.guard";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller("api/admin/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.email, dto.password);
    if (!result) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return result;
  }

  @Post("logout")
  logout() {
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtGuard)
  me(@Req() request: Request & { user?: unknown }) {
    return { user: request.user };
  }
}
