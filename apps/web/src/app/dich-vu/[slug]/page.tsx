import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type Service } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getDetail<Service>(`/services/${slug}`);
  return contentMetadata(service, "Dịch vụ | Hà Thành Home");
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getDetail<Service>(`/services/${slug}`);
  if (!service) notFound();
  return <><SiteHeader /><ServiceDetail service={service} /><SiteFooter /></>;
}
