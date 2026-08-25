import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCatalog } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type Project, type ProjectFilters } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema, buildItemListSchema } from "@/lib/seo/jsonld";
import { isUsableSlug } from "@/lib/content-validation";
import { buildProjectCatalogApiQuery, buildProjectCatalogCanonical, hasCatalogFilters, isCatalogPageOutOfRange, parseCatalogPage } from "@/lib/project-catalog-pagination";

const description = "Tổng hợp dự án thiết kế, thi công nhà ở, nội thất và công trình đã thực hiện bởi Hà Thành Home.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const page = parseCatalogPage(params.page);
  const filtered = hasCatalogFilters(params);
  return {
    title: !filtered && page > 1 ? `Dự án – Trang ${page}` : "Dự án",
    description,
    alternates: { canonical: buildProjectCatalogCanonical("/du-an", params, page) },
  };
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = buildProjectCatalogApiQuery(params);
  const [payload, filters] = await Promise.all([
    getListPayload<Project>(`/projects?${query}`),
    fetchJson<ProjectFilters>("/projects/filters?group=all", { categories: [], filters: {} }),
  ]);
  const requestedPage = parseCatalogPage(params.page);
  if (isCatalogPageOutOfRange(requestedPage, payload.meta.totalPages)) notFound();

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dự án", url: "/du-an" },
    ]),
    buildWebPageSchema({
      name: "Dự án Hà Thành Home",
      description: "Tổng hợp dự án thiết kế, thi công nhà ở, nội thất và công trình.",
      url: buildProjectCatalogCanonical("/du-an", params, parseCatalogPage(params.page)),
      type: "CollectionPage",
    }),
    buildItemListSchema(
      payload.data.filter((p) => isUsableSlug(p.slug)).map((p) => ({ name: p.title, url: `/du-an/${p.slug}` })),
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
