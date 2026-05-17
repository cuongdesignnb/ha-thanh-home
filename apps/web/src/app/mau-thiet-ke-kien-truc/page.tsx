import { ArchitectureDesignList } from "@/components/design-templates";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type ArchitectureDesign, type CatalogFilters } from "@/lib/api";

export const metadata = {
  title: "Mẫu thiết kế kiến trúc | Hà Thành Home",
  description: "Catalog mẫu thiết kế kiến trúc biệt thự, nhà phố, nhà cấp 4 với bộ lọc chi tiết.",
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
  return <><SiteHeader /><ArchitectureDesignList designs={payload.data} filters={filters} meta={payload.meta} searchParams={params} /><SiteFooter /></>;
}
