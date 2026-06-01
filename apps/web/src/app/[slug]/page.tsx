import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type CustomPage } from "@/lib/api";
import { buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await getDetail<CustomPage>(`/pages/${slug}`);
    return contentMetadata(page, "Trang | Hà Thành Home");
  } catch {
    return { title: "Không tìm thấy trang | Hà Thành Home" };
  }
}

export default async function CustomPageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let page: CustomPage | null = null;
  try {
    page = await getDetail<CustomPage>(`/pages/${slug}`);
  } catch {
    notFound();
  }
  
  if (!page) {
    notFound();
  }

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
