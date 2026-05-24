import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";
import { apiBase } from "@/lib/api";

type ApiItem = { slug: string; updatedAt?: string; publishedAt?: string };

async function fetchSlugs(path: string): Promise<ApiItem[]> {
  try {
    const res = await fetch(`${apiBase()}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || json || []) as ApiItem[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/dich-vu`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/dich-vu/xay-nha-tron-goi`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/dich-vu/san-xuat-thi-cong-noi-that`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/dich-vu/thi-cong-nha-xuong`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/dich-vu/thi-cong-noi-that-van-phong`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/du-an`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/du-an/cong-trinh`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/du-an/noi-that`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/mau-thiet-ke-kien-truc`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/mau-thiet-ke-noi-that`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tin-tuc`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/lien-he`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/gioi-thieu`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
  ];


  // Dynamic routes from API
  const [projects, archDesigns, intDesigns, posts] = await Promise.all([
    fetchSlugs("/projects?limit=500&status=published"),
    fetchSlugs("/architecture-designs?limit=500&status=published"),
    fetchSlugs("/interior-designs?limit=500&status=published"),
    fetchSlugs("/posts?limit=500&status=published"),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...projects.map((p) => ({
      url: `${base}/du-an/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt ? new Date(p.updatedAt || p.publishedAt!) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...archDesigns.map((d) => ({
      url: `${base}/mau-thiet-ke-kien-truc/${d.slug}`,
      lastModified: d.updatedAt || d.publishedAt ? new Date(d.updatedAt || d.publishedAt!) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...intDesigns.map((d) => ({
      url: `${base}/mau-thiet-ke-noi-that/${d.slug}`,
      lastModified: d.updatedAt || d.publishedAt ? new Date(d.updatedAt || d.publishedAt!) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${base}/tin-tuc/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt ? new Date(p.updatedAt || p.publishedAt!) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
