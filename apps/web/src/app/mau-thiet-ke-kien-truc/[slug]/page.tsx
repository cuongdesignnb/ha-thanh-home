import { notFound } from "next/navigation";
import { TemplateDetail } from "@/components/design-templates";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type ArchitectureDesign } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<ArchitectureDesign>(`/architecture-designs/${slug}`);
  return contentMetadata(item, "Mẫu thiết kế kiến trúc | Hà Thành Home");
}

export default async function ArchitectureDesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getDetail<ArchitectureDesign>(`/architecture-designs/${slug}`);
  if (!item) notFound();
  return <><SiteHeader /><TemplateDetail item={item} kind="architecture" /><SiteFooter /></>;
}
