import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type Post } from "@/lib/api";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getDetail<Post>(`/posts/${slug}`);
  return contentMetadata(post, "Tin tức | Hà Thành Home");
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getDetail<Post>(`/posts/${slug}`);
  if (!post) notFound();

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Tin tức", url: "/tin-tuc" },
      { name: post.title, url: `/tin-tuc/${post.slug}` },
    ]),
    buildArticleSchema(post),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <PageHero title={post.title} description={post.excerpt} />
      <section className="section">
        <article className="detail-content">
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml || `<p>${post.excerpt || "Nội dung bài viết đang được cập nhật."}</p>` }} />
        </article>
      </section>
      <SiteFooter />
    </>
  );
}
