import { ArchitectureDesignList } from "@/components/design-templates";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type ArchitectureDesign, type CatalogFilters } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/jsonld";

export const metadata = {
  title: "Mẫu thiết kế kiến trúc",
  description: "Catalog mẫu thiết kế kiến trúc biệt thự, nhà phố, nhà cấp 4 với bộ lọc chi tiết.",
  alternates: { canonical: "/mau-thiet-ke-kien-truc" },
};

export default async function ArchitectureDesignsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value); });
  query.set("limit", params.limit || "24");
  const [payload, filters] = await Promise.all([
    getListPayload<ArchitectureDesign>(`/architecture-designs?${query}`),
    fetchJson<CatalogFilters>("/architecture-designs/filters", { filters: {} }),
  ]);
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Mẫu thiết kế kiến trúc", url: "/mau-thiet-ke-kien-truc" },
    ]),
    buildWebPageSchema({ name: "Mẫu thiết kế kiến trúc", description: "Catalog mẫu thiết kế kiến trúc.", url: "/mau-thiet-ke-kien-truc", type: "CollectionPage" }),
  ];
  return <><SiteHeader /><JsonLd data={schemas} /><ArchitectureDesignList designs={payload.data} filters={filters} meta={payload.meta} searchParams={params} /><SiteFooter /></>;
}
