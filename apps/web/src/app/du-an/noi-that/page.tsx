import type { Metadata } from "next";
import { ProjectCatalog } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type Project, type ProjectFilters } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Dự án nội thất",
  description: "Tổng hợp dự án thiết kế, sản xuất và thi công nội thất trọn gói bởi Hà Thành Home.",
  alternates: { canonical: "/du-an/noi-that" },
};

export default async function InteriorProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: "24", group: "interior", ...cleanParams(params) });
  const [payload, filters] = await Promise.all([
    getListPayload<Project>(`/projects?${query}`),
    fetchJson<ProjectFilters>("/projects/filters?group=interior", { categories: [], filters: {} }),
  ]);
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dự án", url: "/du-an" },
      { name: "Nội thất", url: "/du-an/noi-that" },
    ]),
    buildWebPageSchema({ name: "Dự án nội thất", description: "Dự án nội thất đã thực hiện.", url: "/du-an/noi-that", type: "CollectionPage" }),
  ];
  return <><SiteHeader /><JsonLd data={schemas} /><ProjectCatalog projects={payload.data} meta={payload.meta} filters={filters} group="interior" searchParams={params} /><SiteFooter /></>;
}

function cleanParams(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value));
}
