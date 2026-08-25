import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCatalog } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type Project, type ProjectFilters } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/jsonld";
import { buildProjectCatalogApiQuery, buildProjectCatalogCanonical, hasCatalogFilters, isCatalogPageOutOfRange, parseCatalogPage } from "@/lib/project-catalog-pagination";

const description = "Tổng hợp dự án thiết kế, thi công công trình nhà ở, biệt thự, văn phòng, showroom bởi Hà Thành Home.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const page = parseCatalogPage(params.page);
  const filtered = hasCatalogFilters(params);
  return {
    title: !filtered && page > 1 ? `Dự án công trình – Trang ${page}` : "Dự án công trình",
    description,
    alternates: { canonical: buildProjectCatalogCanonical("/du-an/cong-trinh", params, page) },
  };
}

export default async function ConstructionProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = buildProjectCatalogApiQuery(params, "construction,xay_nha_tron_goi");
  const [payload, filters] = await Promise.all([
    getListPayload<Project>(`/projects?${query}`),
    fetchJson<ProjectFilters>("/projects/filters?group=construction,xay_nha_tron_goi", { categories: [], filters: {} }),
  ]);
  const requestedPage = parseCatalogPage(params.page);
  if (isCatalogPageOutOfRange(requestedPage, payload.meta.totalPages)) notFound();
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dự án", url: "/du-an" },
      { name: "Công trình", url: "/du-an/cong-trinh" },
    ]),
    buildWebPageSchema({ name: "Dự án công trình", description: "Dự án công trình đã thực hiện.", url: buildProjectCatalogCanonical("/du-an/cong-trinh", params, parseCatalogPage(params.page)), type: "CollectionPage" }),
  ];
  return <><SiteHeader /><JsonLd data={schemas} /><ProjectCatalog projects={payload.data} meta={payload.meta} filters={filters} group="construction" searchParams={params} /><SiteFooter /></>;
}
