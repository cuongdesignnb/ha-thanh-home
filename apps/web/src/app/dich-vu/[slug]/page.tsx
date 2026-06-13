import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type Service } from "@/lib/api";
import { buildBreadcrumbSchema, buildServiceSchema } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getDetail<Service>(`/services/${slug}`);
  return contentMetadata(service, "Dịch vụ | Hà Thành Home", `/dich-vu/${slug}`);
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getDetail<Service>(`/services/${slug}`);
  if (!service) notFound();

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dịch vụ", url: "/dich-vu" },
      { name: service.title, url: `/dich-vu/${service.slug}` },
    ]),
    buildServiceSchema({
      name: service.title,
      description: service.description || undefined,
      url: `/dich-vu/${service.slug}`,
      serviceType: service.title,
    }),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <ServiceDetail service={service} />
      <SiteFooter />
    </>
  );
}
