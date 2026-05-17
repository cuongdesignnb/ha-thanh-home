import type { Metadata } from "next";
import { ServiceList } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, type Service } from "@/lib/api";

export const metadata: Metadata = { title: "Dịch vụ công trình | Hà Thành Home" };

export default async function ConstructionServicesPage() {
  const services = await getList<Service>("/services?group=construction&limit=24");
  return <><SiteHeader /><ServiceList title="Dịch vụ công trình" services={services} /><SiteFooter /></>;
}
