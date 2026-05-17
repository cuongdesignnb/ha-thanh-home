import type { Metadata } from "next";
import { ServiceList } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, type Service } from "@/lib/api";

export const metadata: Metadata = { title: "Dịch vụ | Hà Thành Home" };

export default async function ServicesPage() {
  const services = await getList<Service>("/services?limit=24");
  return <><SiteHeader /><ServiceList title="Tất cả dịch vụ" services={services} /><SiteFooter /></>;
}
