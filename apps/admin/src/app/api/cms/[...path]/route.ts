import { NextResponse } from "next/server";
import { apiBase, getToken } from "@/lib/session";

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const target = new URL(`${apiBase()}/admin/${params.path.join("/")}`);
  const source = new URL(request.url);
  target.search = source.search;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : Buffer.from(await request.arrayBuffer());

  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
