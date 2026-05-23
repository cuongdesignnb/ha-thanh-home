import type { Metadata } from "next";
import { ServiceList } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, type Service } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema, buildItemListSchema } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description: "Tổng hợp dịch vụ thiết kế, thi công nhà ở, nội thất và công trình trọn gói bởi Hà Thành Home.",
  alternates: { canonical: "/dich-vu" },
};

export default async function ServicesPage() {
  const services = await getList<Service>("/services?limit=24");

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dịch vụ", url: "/dich-vu" },
    ]),
    buildWebPageSchema({
      name: "Dịch vụ Hà Thành Home",
      description: "Tổng hợp dịch vụ thiết kế, thi công nhà ở, nội thất và công trình trọn gói.",
      url: "/dich-vu",
      type: "CollectionPage",
    }),
    buildItemListSchema(
      services.map((s) => ({ name: s.title, url: `/dich-vu/${s.slug}` })),
    ),
  ].filter(Boolean);

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas as Record<string, unknown>[]} />
      <ServiceList title="Tất cả dịch vụ" services={services} />
      <SiteFooter />
    </>
  );
}
