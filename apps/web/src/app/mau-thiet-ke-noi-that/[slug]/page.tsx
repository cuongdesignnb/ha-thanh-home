import { notFound } from "next/navigation";
import { TemplateDetail } from "@/components/design-templates";
import { RelatedContent } from "@/components/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, thumbnailUrl, type InteriorDesign } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema, buildImageObjectSchema } from "@/lib/seo/jsonld";
import { getRelatedInterior } from "@/lib/related-content";
import { heroImageFor, preloadHeroImage } from "@/lib/preload-hero-image";
import { redirectToCanonicalSlug } from "@/lib/canonical-slug";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  return contentMetadata(item, "Mẫu thiết kế nội thất | Hà Thành Home", `/mau-thiet-ke-noi-that/${item?.slug ?? slug}`);
}

export default async function InteriorDesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  if (!item) notFound();
  redirectToCanonicalSlug(slug, item, "/mau-thiet-ke-noi-that");
  // Before any further await, so the hint is emitted before the document head is flushed.
  preloadHeroImage(await heroImageFor(thumbnailUrl(item, "")));
  const related = await getRelatedInterior(item);

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
      <RelatedContent items={related} title="Mẫu nội thất liên quan" />
      <SiteFooter />
    </>
  );
}
