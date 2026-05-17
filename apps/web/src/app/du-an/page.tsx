import type { Metadata } from "next";
import { ProjectCatalog } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type Project, type ProjectFilters } from "@/lib/api";

export const metadata: Metadata = { title: "Dự án | Hà Thành Home" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: "24", ...cleanParams(params) });
  const [payload, filters] = await Promise.all([
    getListPayload<Project>(`/projects?${query}`),
    fetchJson<ProjectFilters>("/projects/filters?group=all", { categories: [], filters: {} }),
  ]);
  return <><SiteHeader /><ProjectCatalog projects={payload.data} meta={payload.meta} filters={filters} searchParams={params} /><SiteFooter /></>;
}

function cleanParams(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value));
}
