import type { Metadata } from "next";
import { PostList } from "@/components/content-list";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getList, type Post } from "@/lib/api";

export const metadata: Metadata = { title: "Tin tức | Hà Thành Home" };

export default async function PostsPage() {
  const posts = await getList<Post>("/posts?limit=24");
  return <><SiteHeader /><PostList posts={posts} /><SiteFooter /></>;
}
