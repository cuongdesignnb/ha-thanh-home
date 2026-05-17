import { notFound } from "next/navigation";
import { TemplateDetail } from "@/components/design-templates";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type InteriorDesign } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  return contentMetadata(item, "Mẫu thiết kế nội thất | Hà Thành Home");
}

export default async function InteriorDesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  if (!item) notFound();
  return <><SiteHeader /><TemplateDetail item={item} kind="interior" /><SiteFooter /></>;
}
