import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedPosts } from "@/components/featured-posts";
import { RelatedContent } from "@/components/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { contentMetadata, getDetail, thumbnailUrl, type Post } from "@/lib/api";
import { prepareDetailHtml } from "@/lib/rich-content";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/jsonld";
import { withTurnkeyContextLink } from "@/lib/service-context-links";
import { getRelatedPosts } from "@/lib/related-content";
import { getFeaturedPosts } from "@/lib/featured-posts";
import { heroImageFor, preloadHeroImage } from "@/lib/preload-hero-image";
import { redirectToCanonicalSlug } from "@/lib/canonical-slug";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getDetail<Post>(`/posts/${slug}`);
  return contentMetadata(post, "Tin tức | Hà Thành Home", `/tin-tuc/${post?.slug ?? slug}`);
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getDetail<Post>(`/posts/${slug}`);
  if (!post) notFound();
  redirectToCanonicalSlug(slug, post, "/tin-tuc");
  // Before any further await, so the hint is emitted before the document head is flushed.
  const imageUrl = await heroImageFor(thumbnailUrl(post, ""));
  preloadHeroImage(imageUrl);
  const [related, featuredPosts] = await Promise.all([getRelatedPosts(post), getFeaturedPosts({ exclude: post.slug, limit: 8 })]);

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
          <div dangerouslySetInnerHTML={{ __html: prepareDetailHtml(withTurnkeyContextLink(post.slug, post.contentHtml || `<p>${post.excerpt || "Nội dung bài viết đang được cập nhật."}</p>`)) }} />
        </article>
      </section>
      <RelatedContent items={related} title="Bài viết liên quan" />
      <FeaturedPosts posts={featuredPosts} />
      <SiteFooter />
    </>
  );
}
