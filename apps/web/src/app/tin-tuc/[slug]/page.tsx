import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, thumbnailUrl, type Post } from "@/lib/api";
import { prepareDetailHtml } from "@/lib/rich-content";
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
  const imageUrl = thumbnailUrl(post, "");

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
      <section
        className="template-detail-hero post-detail-hero"
        style={imageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(15,61,46,.88), rgba(15,61,46,.28)), url(${imageUrl})` } : undefined}
      >
        <div className="container template-detail-hero-content">
          <span>Tin tức &amp; cảm hứng</span>
          <h1>{post.title}</h1>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          <div className="template-detail-actions">
            <a className="cta" href="/lien-he">Nhận tư vấn</a>
            <a className="cta secondary" href="/tin-tuc">Xem tin tức khác</a>
          </div>
        </div>
      </section>
      <section className="section">
        <article className="detail-content">
          <div dangerouslySetInnerHTML={{ __html: prepareDetailHtml(post.contentHtml || `<p>${post.excerpt || "Nội dung bài viết đang được cập nhật."}</p>`) }} />
        </article>
      </section>
      <RelatedContent items={related} title="Bài viết liên quan" />
      <SiteFooter />
    </>
  );
}
