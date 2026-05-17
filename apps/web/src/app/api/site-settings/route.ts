import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
