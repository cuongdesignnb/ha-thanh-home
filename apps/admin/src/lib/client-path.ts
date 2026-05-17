"use client";

export function adminBasePath() {
  const configured = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || "";
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location.pathname === "/admin") {
    return "/admin";
  }

  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin/")) {
    return "/admin";
  }

  return "";
}

export function adminUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${adminBasePath()}${normalizedPath}`;
}

export function adminApiFetch(path: string, init?: RequestInit) {
  return fetch(adminUrl(path), init);
}
