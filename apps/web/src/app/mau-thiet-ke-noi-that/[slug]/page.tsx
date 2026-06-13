import { notFound } from "next/navigation";
import { TemplateDetail } from "@/components/design-templates";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, thumbnailUrl, type InteriorDesign } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema, buildImageObjectSchema } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  return contentMetadata(item, "Mẫu thiết kế nội thất | Hà Thành Home", `/mau-thiet-ke-noi-that/${slug}`);
}

export default async function InteriorDesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  if (!item) notFound();

  const imageUrl = thumbnailUrl(item, "");
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Mẫu thiết kế nội thất", url: "/mau-thiet-ke-noi-that" },
      { name: item.title, url: `/mau-thiet-ke-noi-that/${item.slug}` },
    ]),
    buildWebPageSchema({
      name: item.title,
      description: item.description || undefined,
      url: `/mau-thiet-ke-noi-that/${item.slug}`,
      type: "WebPage",
    }),
    ...(imageUrl ? [buildImageObjectSchema(imageUrl, item.title)] : []),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <TemplateDetail item={item} kind="interior" />
      <SiteFooter />
    </>
  );
}
