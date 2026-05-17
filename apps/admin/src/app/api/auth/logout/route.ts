import { NextResponse } from "next/server";
import { adminTokenCookie } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminTokenCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.ADMIN_URL?.startsWith("https://") ?? false,
    path: "/",
    maxAge: 0,
  });
  return response;
}
