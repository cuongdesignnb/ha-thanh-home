import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { buildBreadcrumbSchema, buildContactPageSchema, buildLocalBusinessSchema } from "@/lib/seo/jsonld";
import { getSiteSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn",
  description: "Đặt lịch tư vấn thiết kế kiến trúc, thi công công trình và nội thất cùng Hà Thành Home.",
  alternates: { canonical: "/lien-he" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ mau?: string; loai?: string }> }) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const identity = settings["site.identity"] || {};
  const hotline = identity.hotline || "0898 502 333";
  const email = identity.email || "info@hathanhhome.vn";
  const address = identity.address || "Hà Nội, Việt Nam";

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Liên hệ", url: "/lien-he" },
    ]),
    buildContactPageSchema(),
    buildLocalBusinessSchema(),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <main>
        <section className="contact-hero">
          <div className="container contact-hero-grid">
            <div>
              <span className="eyebrow">Liên hệ Hà Thành Home</span>
              <h1>Đặt lịch tư vấn thiết kế và thi công theo nhu cầu thực tế</h1>
              <p>Gửi thông tin mẫu thiết kế, diện tích, vị trí và ngân sách dự kiến. Đội ngũ Hà Thành Home sẽ tư vấn phương án phù hợp trước khi triển khai hồ sơ chi tiết.</p>
              <div className="contact-points">
                <span><Phone size={18} /> {hotline}</span>
                <span><Mail size={18} /> {email}</span>
                <span><MapPin size={16} /> {address}</span>
              </div>
            </div>
            <LeadForm templateSlug={params.mau} templateType={params.loai} initialHotline={hotline} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
