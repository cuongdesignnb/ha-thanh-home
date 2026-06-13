import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageHero } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type CustomPage, type Post, type Project, type Service, type ArchitectureDesign, type InteriorDesign } from "@/lib/api";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const page = await getDetail<CustomPage>(`/pages/${slug}`);
  if (page) {
    return contentMetadata(page, "Trang | Hà Thành Home", `/${slug}`);
  }

  const post = await getDetail<Post>(`/posts/${slug}`);
  if (post) {
    return contentMetadata(post, "Tin tức | Hà Thành Home", `/tin-tuc/${slug}`);
  }

  const project = await getDetail<Project>(`/projects/${slug}`);
  if (project) {
    return contentMetadata(project, "Dự án | Hà Thành Home", `/du-an/${slug}`);
  }

  const service = await getDetail<Service>(`/services/${slug}`);
  if (service) {
    return contentMetadata(service, "Dịch vụ | Hà Thành Home", `/dich-vu/${slug}`);
  }

  const arch = await getDetail<ArchitectureDesign>(`/architecture-designs/${slug}`);
  if (arch) {
    return contentMetadata(arch, "Mẫu thiết kế kiến trúc | Hà Thành Home", `/mau-thiet-ke-kien-truc/${slug}`);
  }

  const interior = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  if (interior) {
    return contentMetadata(interior, "Mẫu thiết kế nội thất | Hà Thành Home", `/mau-thiet-ke-noi-that/${slug}`);
  }

  return { title: "Không tìm thấy trang | Hà Thành Home" };
}

export default async function CustomPageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const page = await getDetail<CustomPage>(`/pages/${slug}`);
  if (page) {
    const schemas = [
      buildBreadcrumbSchema([
        { name: "Trang chủ", url: "/" },
        { name: page.title, url: `/${page.slug}` },
      ]),
    ];

    return (
      <>
        <SiteHeader />
        <JsonLd data={schemas} />
        <PageHero title={page.title} description={page.description} />
        <section className="section">
          <article className="detail-content">
            <div dangerouslySetInnerHTML={{ __html: page.contentHtml || `<p>Nội dung trang đang được cập nhật.</p>` }} />
          </article>
        </section>
        <SiteFooter />
      </>
    );
  }

  // Check if slug belongs to a blog post (tin-tuc)
  const post = await getDetail<Post>(`/posts/${slug}`);
  if (post) {
    permanentRedirect(`/tin-tuc/${slug}`);
  }

  // Check if slug belongs to a project (du-an)
  const project = await getDetail<Project>(`/projects/${slug}`);
  if (project) {
    permanentRedirect(`/du-an/${slug}`);
  }

  // Check if slug belongs to a service (dich-vu)
  const service = await getDetail<Service>(`/services/${slug}`);
  if (service) {
    permanentRedirect(`/dich-vu/${slug}`);
  }

  // Check if slug belongs to an architecture design template (mau-thiet-ke-kien-truc)
  const arch = await getDetail<ArchitectureDesign>(`/architecture-designs/${slug}`);
  if (arch) {
    permanentRedirect(`/mau-thiet-ke-kien-truc/${slug}`);
  }

  // Check if slug belongs to an interior design template (mau-thiet-ke-noi-that)
  const interior = await getDetail<InteriorDesign>(`/interior-designs/${slug}`);
  if (interior) {
    permanentRedirect(`/mau-thiet-ke-noi-that/${slug}`);
  }

  notFound();
}
