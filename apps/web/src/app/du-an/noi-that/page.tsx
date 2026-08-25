import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCatalog } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type Project, type ProjectFilters } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/jsonld";
import { buildProjectCatalogApiQuery, buildProjectCatalogCanonical, hasCatalogFilters, isCatalogPageOutOfRange, parseCatalogPage } from "@/lib/project-catalog-pagination";

const description = "Tổng hợp dự án thiết kế, sản xuất và thi công nội thất trọn gói bởi Hà Thành Home.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const page = parseCatalogPage(params.page);
  const filtered = hasCatalogFilters(params);
  return {
    title: !filtered && page > 1 ? `Dự án nội thất – Trang ${page}` : "Dự án nội thất",
    description,
    alternates: { canonical: buildProjectCatalogCanonical("/du-an/noi-that", params, page) },
  };
}

export default async function InteriorProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = buildProjectCatalogApiQuery(params, "interior");
  const [payload, filters] = await Promise.all([
    getListPayload<Project>(`/projects?${query}`),
    fetchJson<ProjectFilters>("/projects/filters?group=interior", { categories: [], filters: {} }),
  ]);
  const requestedPage = parseCatalogPage(params.page);
  if (isCatalogPageOutOfRange(requestedPage, payload.meta.totalPages)) notFound();
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dự án", url: "/du-an" },
      { name: "Nội thất", url: "/du-an/noi-that" },
    ]),
    buildWebPageSchema({ name: "Dự án nội thất", description: "Dự án nội thất đã thực hiện.", url: buildProjectCatalogCanonical("/du-an/noi-that", params, parseCatalogPage(params.page)), type: "CollectionPage" }),
  ];
  return <><SiteHeader /><JsonLd data={schemas} /><ProjectCatalog projects={payload.data} meta={payload.meta} filters={filters} group="interior" searchParams={params} /><SiteFooter /></>;
}
