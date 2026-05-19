import type { Metadata } from "next";
import { PostList } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, type Post, type PostCategory } from "@/lib/api";

export const metadata: Metadata = { title: "Tin tức | Hà Thành Home" };

export default async function PostsPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: "24" });
  if (params?.category) query.set("category", params.category);
  const [posts, categoriesPayload] = await Promise.all([
    getList<Post>(`/posts?${query}`),
    getList<PostCategory>("/post-categories"),
  ]);
  return <><SiteHeader /><PostList activeCategory={params?.category || ""} categories={categoriesPayload} posts={posts} /><SiteFooter /></>;
}
