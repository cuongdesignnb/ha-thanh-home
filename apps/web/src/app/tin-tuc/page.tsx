import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/content-list";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, getListPayload, type Post, type PostCategory } from "@/lib/api";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/jsonld";
import { buildPostCatalogApiQuery, buildPostCatalogCanonical, isPostCatalogPageOutOfRange, parsePostCatalogPage } from "@/lib/post-catalog-pagination";

const description = "Tin tức, kiến thức và cảm hứng về thiết kế kiến trúc, thi công nhà ở và nội thất từ Hà Thành Home.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePostCatalogPage(params.page);
  return {
    title: !params.category && page > 1 ? `Tin tức – Trang ${page}` : "Tin tức",
    description,
    alternates: { canonical: buildPostCatalogCanonical("/tin-tuc", params, page) },
  };
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = buildPostCatalogApiQuery(params);
  const [payload, categoriesPayload] = await Promise.all([
    getListPayload<Post>(`/posts?${query}`),
    getList<PostCategory>("/post-categories"),
  ]);
  const requestedPage = parsePostCatalogPage(params.page);
  if (isPostCatalogPageOutOfRange(requestedPage, payload.meta.totalPages)) notFound();

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Tin tức", url: "/tin-tuc" },
    ]),
    buildWebPageSchema({
      name: "Tin tức Hà Thành Home",
      description: "Tin tức, kiến thức và cảm hứng về thiết kế kiến trúc, thi công nhà ở và nội thất.",
      url: buildPostCatalogCanonical("/tin-tuc", params, requestedPage),
      type: "CollectionPage",
    }),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <PostList activeCategory={params.category || ""} categories={categoriesPayload} meta={payload.meta} posts={payload.data} searchParams={params} />
      <SiteFooter />
    </>
  );
}
