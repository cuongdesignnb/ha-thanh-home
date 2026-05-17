import { cookies } from "next/headers";

export const adminTokenCookie = "hathanh_admin_token";

export function apiBase() {
  return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:31875/api";
}

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(adminTokenCookie)?.value;
}

export async function getCurrentUser() {
  const token = await getToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`${apiBase()}/admin/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.user as { sub: number; email: string; roles: string[] };
}
