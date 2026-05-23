import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, thumbnailUrl, type Project } from "@/lib/api";
import { buildBreadcrumbSchema, buildProjectSchema, buildImageObjectSchema } from "@/lib/seo/jsonld";
import { absoluteImageUrl } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getDetail<Project>(`/projects/${slug}`);
  return contentMetadata(project, "Dự án | Hà Thành Home");
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getDetail<Project>(`/projects/${slug}`);
  if (!project) notFound();

  const imageUrl = thumbnailUrl(project, "");
  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dự án", url: "/du-an" },
      { name: project.title, url: `/du-an/${project.slug}` },
    ]),
    buildProjectSchema(project),
    ...(imageUrl ? [buildImageObjectSchema(imageUrl, project.title)] : []),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <ProjectDetail project={project} />
      <SiteFooter />
    </>
  );
}
