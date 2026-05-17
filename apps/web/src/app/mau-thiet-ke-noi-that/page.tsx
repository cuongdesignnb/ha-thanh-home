import { InteriorDesignList } from "@/components/design-templates";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fetchJson, getListPayload, type CatalogFilters, type InteriorDesign } from "@/lib/api";

export const metadata = {
  title: "Mẫu thiết kế nội thất | Hà Thành Home",
  description: "Catalog mẫu thiết kế nội thất theo phong cách, loại nhà, loại phòng, diện tích và ngân sách.",
};

export default async function InteriorDesignsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value); });
  query.set("limit", params.limit || "24");
  const [payload, filters] = await Promise.all([
    getListPayload<InteriorDesign>(`/interior-designs?${query}`),
    fetchJson<CatalogFilters>("/interior-designs/filters", { filters: {} }),
  ]);
  return <><SiteHeader /><InteriorDesignList designs={payload.data} filters={filters} meta={payload.meta} searchParams={params} /><SiteFooter /></>;
}
