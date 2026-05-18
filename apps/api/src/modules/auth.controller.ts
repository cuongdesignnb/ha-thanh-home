import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwt.guard";

const adminTokenCookie = "hathanh_admin_token";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

function cookieIsSecure() {
  return [process.env.ADMIN_URL, process.env.WEB_URL].some((url) => url?.startsWith("https://"));
}

function setAdminCookie(response: Response, accessToken: string) {
  response.cookie(adminTokenCookie, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieIsSecure(),
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
}

function clearAdminCookie(response: Response) {
  response.cookie(adminTokenCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieIsSecure(),
    path: "/",
    maxAge: 0,
  });
}

@Controller("api/admin/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    if (!result) {
      throw new UnauthorizedException("Invalid email or password");
    }

    setAdminCookie(response, result.accessToken);
    return result;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    clearAdminCookie(response);
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtGuard)
  me(@Req() request: Request & { user?: unknown }) {
    return { user: request.user };
  }
}

@Controller("api/auth")
export class AuthCompatController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    if (!result) {
      throw new UnauthorizedException("Invalid email or password");
    }

    setAdminCookie(response, result.accessToken);
    return result;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    clearAdminCookie(response);
    return { ok: true };
  }
}
