import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type Project } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getDetail<Project>(`/projects/${slug}`);
  return contentMetadata(project, "Dự án | Hà Thành Home");
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getDetail<Project>(`/projects/${slug}`);
  if (!project) notFound();
  return <><SiteHeader /><ProjectDetail project={project} /><SiteFooter /></>;
}
