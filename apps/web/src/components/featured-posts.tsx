import { ArrowRight } from "lucide-react";
import type { FeaturedPostLink } from "@/lib/featured-posts";

export function FeaturedPosts({ posts, title = "Bài viết được quan tâm", cream = false }: { posts: FeaturedPostLink[]; title?: string; cream?: boolean }) {
  if (!posts.length) return null;
  return (
    <section className={`section featured-posts-section${cream ? " cream" : ""}`}>
      <div className="container">
        <div className="section-title"><span className="eyebrow">Kinh nghiệm xây nhà</span><h2>{title}</h2></div>
        <ul className="featured-posts-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <a href={post.href}>
                <span>{post.title}</span>
                <ArrowRight aria-hidden="true" size={15} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
