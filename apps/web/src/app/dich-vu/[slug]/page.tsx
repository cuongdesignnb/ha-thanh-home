import { notFound, permanentRedirect } from "next/navigation";
import {
  getDetail,
  getLegacyServiceDetail,
  hasMeaningfulContentHtml,
  type ArchitectureDesign,
  type InteriorDesign,
  type Post,
  type Project,
} from "@/lib/api";

/**
 * Historical service URLs are compatibility aliases only. Static service
 * landing pages live in sibling directories and continue to own their routes.
 */
export default async function LegacyServiceAliasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await getDetail<Project>(`/projects/${slug}`);
  if (project) permanentRedirect(`/du-an/${slug}`);

  const post = await getDetail<Post>(`/posts/${slug}`);
  if (post) permanentRedirect(`/tin-tuc/${slug}`);

  const arch = await getDetail<ArchitectureDesign>(`/architecture-designs/${slug}`);
  if (arch) permanentRedirect(`/mau-thiet-ke-kien-truc/${slug}`);

  const interior = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  if (interior) permanentRedirect(`/mau-thiet-ke-noi-that/${slug}`);

  const service = await getLegacyServiceDetail(slug);
  if (service && hasMeaningfulContentHtml(service.contentHtml)) {
    permanentRedirect(`/${slug}`);
  }

  notFound();
}

