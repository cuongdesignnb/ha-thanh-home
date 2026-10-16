import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/content-list";
import { RelatedContent } from "@/components/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, thumbnailUrl, type Project } from "@/lib/api";
import { buildBreadcrumbSchema, buildProjectSchema, buildImageObjectSchema, buildServiceSchema, buildWebPageSchema } from "@/lib/seo/jsonld";
import { getProjectPageInfo, parentServices } from "@/lib/project-page-kind";
import { absoluteImageUrl } from "@/lib/seo/site";
import { getRelatedProjects } from "@/lib/related-content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getDetail<Project>(`/projects/${slug}`);
  return contentMetadata(project, "Dự án | Hà Thành Home", `/du-an/${slug}`);
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getDetail<Project>(`/projects/${slug}`);
  if (!project) notFound();
  const related = await getRelatedProjects(project);

  const imageUrl = thumbnailUrl(project, "");
  const pageUrl = `/du-an/${project.slug}`;
  const pageInfo = getProjectPageInfo(project.slug);
  const parent = pageInfo ? parentServices[pageInfo.parent] : undefined;
  const schemas = pageInfo && parent
    ? [
        buildBreadcrumbSchema([
          { name: "Trang chủ", url: "/" },
          { name: "Dịch vụ", url: "/dich-vu" },
          { name: parent.name, url: parent.path },
          { name: project.title, url: pageUrl },
        ]),
        pageInfo.kind === "guide"
          ? buildWebPageSchema({ name: project.title, description: project.description || undefined, url: pageUrl })
          : buildServiceSchema({
              name: project.title,
              description: project.description || undefined,
              url: pageUrl,
              serviceType: parent.name,
              areaServed: pageInfo.region,
              image: imageUrl || undefined,
            }),
      ]
    : [
        buildBreadcrumbSchema([
          { name: "Trang chủ", url: "/" },
          { name: "Dự án", url: "/du-an" },
          { name: project.title, url: pageUrl },
        ]),
        buildProjectSchema(project),
        ...(imageUrl ? [buildImageObjectSchema(imageUrl, project.title)] : []),
      ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <ProjectDetail project={project} />
      <RelatedContent items={related} title={pageInfo ? "Có thể bạn quan tâm" : "Dự án liên quan"} />
      <SiteFooter />
    </>
  );
}
