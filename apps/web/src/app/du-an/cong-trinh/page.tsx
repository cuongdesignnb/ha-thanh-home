import type { Metadata } from "next";
import { ProjectCatalog } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type Project, type ProjectFilters } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Dự án công trình",
  description: "Tổng hợp dự án thiết kế, thi công công trình nhà ở, biệt thự, văn phòng, showroom bởi Hà Thành Home.",
  alternates: { canonical: "/du-an/cong-trinh" },
};

export default async function ConstructionProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: "24", group: "construction", ...cleanParams(params) });
  const [payload, filters] = await Promise.all([
    getListPayload<Project>(`/projects?${query}`),
    fetchJson<ProjectFilters>("/projects/filters?group=construction", { categories: [], filters: {} }),
  ]);
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dự án", url: "/du-an" },
      { name: "Công trình", url: "/du-an/cong-trinh" },
    ]),
    buildWebPageSchema({ name: "Dự án công trình", description: "Dự án công trình đã thực hiện.", url: "/du-an/cong-trinh", type: "CollectionPage" }),
  ];
  return <><SiteHeader /><JsonLd data={schemas} /><ProjectCatalog projects={payload.data} meta={payload.meta} filters={filters} group="construction" searchParams={params} /><SiteFooter /></>;
}

function cleanParams(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value));
}
