import type { Metadata } from "next";
import { ServiceList } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, type Service } from "@/lib/api";

export const metadata: Metadata = { title: "Dịch vụ nội thất | Hà Thành Home" };

export default async function InteriorServicesPage() {
  const services = await getList<Service>("/services?group=interior&limit=24");
  return <><SiteHeader /><ServiceList title="Dịch vụ nội thất" services={services} /><SiteFooter /></>;
}
