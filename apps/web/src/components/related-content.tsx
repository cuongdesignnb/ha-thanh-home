import { ArrowRight } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "@/lib/api";
import { isLegacyRedirectSource } from "@/lib/legacy-redirects";

export type RelatedContentItem = {
  id: number;
  title: string;
  href: string;
  imageUrl?: string | null;
  label?: string | null;
  description?: string | null;
};

export function RelatedContent({ items, title = "Nội dung liên quan" }: { items: RelatedContentItem[]; title?: string }) {
  // Merged pages redirect away; linking them would add a hop for users and crawlers.
  const visible = items.filter((item) => !isLegacyRedirectSource(item.href.split(/[?#]/, 1)[0]));
  if (!visible.length) return null;
  return (
    <section className="section related-content-section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">Khám phá thêm</span><h2>{title}</h2></div>
        <div className="related-content-grid">
          {visible.slice(0, 4).map((item) => (
            <a className="related-content-card" href={item.href} key={`${item.href}-${item.id}`}>
              <img alt={item.title} loading="lazy" src={item.imageUrl || PLACEHOLDER_IMAGE} />
              <div>
                {item.label ? <span>{item.label}</span> : null}
                <h3>{item.title}</h3>
                {item.description ? <p>{item.description}</p> : null}
                <strong>Xem chi tiết <ArrowRight size={15} /></strong>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
