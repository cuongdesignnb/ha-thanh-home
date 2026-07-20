import { notFound } from "next/navigation";
import { TemplateDetail } from "@/components/design-templates";
import { RelatedContent } from "@/components/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, thumbnailUrl, type ArchitectureDesign } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema, buildImageObjectSchema } from "@/lib/seo/jsonld";
import { getRelatedArchitecture } from "@/lib/related-content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<ArchitectureDesign>(`/architecture-designs/${slug}`);
  return contentMetadata(item, "Mẫu thiết kế kiến trúc | Hà Thành Home", `/mau-thiet-ke-kien-truc/${slug}`);
}

export default async function ArchitectureDesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<ArchitectureDesign>(`/architecture-designs/${slug}`);
  if (!item) notFound();
  const related = await getRelatedArchitecture(item);

  const imageUrl = thumbnailUrl(item, "");
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Mẫu thiết kế kiến trúc", url: "/mau-thiet-ke-kien-truc" },
      { name: item.title, url: `/mau-thiet-ke-kien-truc/${item.slug}` },
    ]),
    buildWebPageSchema({
      name: item.title,
      description: item.description || undefined,
      url: `/mau-thiet-ke-kien-truc/${item.slug}`,
      type: "WebPage",
    }),
    ...(imageUrl ? [buildImageObjectSchema(imageUrl, item.title)] : []),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <TemplateDetail item={item} kind="architecture" />
      <RelatedContent items={related} title="Mẫu kiến trúc liên quan" />
      <SiteFooter />
    </>
  );
}
