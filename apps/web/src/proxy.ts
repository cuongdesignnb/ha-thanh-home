import { NextRequest, NextResponse } from "next/server";

const malformedLegacyPaths: Record<string, string> = {
  "/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24/7": "/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24-7",
  "/dich-vu/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24/7": "/xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24-7",
  "/xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24/7": "/xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24-7",
  "/dich-vu/xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24/7": "/xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24-7",
};

export function proxy(request: NextRequest) {
  let pathname = request.nextUrl.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Keep the encoded path when a malformed URL cannot be decoded safely.
  }

  const targetPath = malformedLegacyPaths[pathname];
  if (!targetPath) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/:path*"],
};
