import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/content-list";
import { RelatedContent } from "@/components/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, type Post } from "@/lib/api";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/jsonld";
import { getRelatedPosts } from "@/lib/related-content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getDetail<Post>(`/posts/${slug}`);
  return contentMetadata(post, "Tin tức | Hà Thành Home", `/tin-tuc/${slug}`);
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getDetail<Post>(`/posts/${slug}`);
  if (!post) notFound();
  const related = await getRelatedPosts(post);

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
      <RelatedContent items={related} title="Bài viết liên quan" />
      <SiteFooter />
    </>
  );
}
