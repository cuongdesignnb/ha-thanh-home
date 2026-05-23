import type { Metadata } from "next";
import { ProjectCatalog } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type Project, type ProjectFilters } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema, buildItemListSchema } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Dự án",
  description: "Tổng hợp dự án thiết kế, thi công nhà ở, nội thất và công trình đã thực hiện bởi Hà Thành Home.",
  alternates: { canonical: "/du-an" },
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: "24", ...cleanParams(params) });
  const [payload, filters] = await Promise.all([
    getListPayload<Project>(`/projects?${query}`),
    fetchJson<ProjectFilters>("/projects/filters?group=all", { categories: [], filters: {} }),
  ]);

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dự án", url: "/du-an" },
    ]),
    buildWebPageSchema({
      name: "Dự án Hà Thành Home",
      description: "Tổng hợp dự án thiết kế, thi công nhà ở, nội thất và công trình.",
      url: "/du-an",
      type: "CollectionPage",
    }),
    buildItemListSchema(
      payload.data.map((p) => ({ name: p.title, url: `/du-an/${p.slug}` })),
    ),
  ].filter(Boolean);

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas as Record<string, unknown>[]} />
      <ProjectCatalog projects={payload.data} meta={payload.meta} filters={filters} searchParams={params} />
      <SiteFooter />
    </>
  );
}

function cleanParams(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value));
}
