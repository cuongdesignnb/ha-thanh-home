import { NextResponse } from "next/server";
import { adminTokenCookie, apiBase } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${apiBase()}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  const result = NextResponse.json({ user: payload.user });
  result.cookies.set(adminTokenCookie, payload.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.ADMIN_URL?.startsWith("https://") ?? false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return result;
}
