import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn | Hà Thành Home",
  description: "Đặt lịch tư vấn thiết kế kiến trúc, thi công công trình và nội thất cùng Hà Thành Home.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ mau?: string; loai?: string }> }) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="contact-hero">
          <div className="container contact-hero-grid">
            <div>
              <span className="eyebrow">Liên hệ Hà Thành Home</span>
              <h1>Đặt lịch tư vấn thiết kế và thi công theo nhu cầu thực tế</h1>
              <p>Gửi thông tin mẫu thiết kế, diện tích, vị trí và ngân sách dự kiến. Đội ngũ Hà Thành Home sẽ tư vấn phương án phù hợp trước khi triển khai hồ sơ chi tiết.</p>
              <div className="contact-points">
                <span><Phone size={18} /> 0966 123 456</span>
                <span><Mail size={18} /> info@hathanhhome.vn</span>
                <span><MapPin size={18} /> Hà Nội, Ninh Bình và khu vực miền Bắc</span>
              </div>
            </div>
            <LeadForm templateSlug={params.mau} templateType={params.loai} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
