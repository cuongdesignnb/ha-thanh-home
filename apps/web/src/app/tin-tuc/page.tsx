import type { Metadata } from "next";
import { PostList } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, type Post, type PostCategory } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức, kiến thức và cảm hứng về thiết kế kiến trúc, thi công nhà ở và nội thất từ Hà Thành Home.",
  alternates: { canonical: "/tin-tuc" },
};

export default async function PostsPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: "24" });
  if (params?.category) query.set("category", params.category);
  const [posts, categoriesPayload] = await Promise.all([
    getList<Post>(`/posts?${query}`),
    getList<PostCategory>("/post-categories"),
  ]);

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Tin tức", url: "/tin-tuc" },
    ]),
    buildWebPageSchema({
      name: "Tin tức Hà Thành Home",
      description: "Tin tức, kiến thức và cảm hứng về thiết kế kiến trúc, thi công nhà ở và nội thất.",
      url: "/tin-tuc",
      type: "CollectionPage",
    }),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <PostList activeCategory={params?.category || ""} categories={categoriesPayload} posts={posts} />
      <SiteFooter />
    </>
  );
}
