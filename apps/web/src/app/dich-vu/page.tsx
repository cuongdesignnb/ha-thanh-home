import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { buildBreadcrumbSchema, buildWebPageSchema, buildItemListSchema } from "@/lib/seo/jsonld";
import { ArrowRight, Compass, Layers, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getSiteSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Dịch vụ Thiết kế & Thi công trọn gói - Hà Thành Home",
  description: "Tổng hợp dịch vụ xây nhà trọn gói, thiết kế thi công nội thất biệt thự, nhà phố, thi công nhà xưởng và nội thất văn phòng chuyên nghiệp bởi Hà Thành Home.",
  alternates: { canonical: "/dich-vu" },
};

const coreServices = [
  {
    title: "Xây nhà trọn gói",
    description: "Giải pháp thi công trọn gói toàn diện từ khảo sát, thiết kế bản vẽ, xin phép xây dựng đến bàn giao chìa khóa trao tay.",
    href: "/dich-vu/xay-nha-tron-goi",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    features: ["Bảo hành kết cấu 10 năm", "Không phát sinh chi phí", "Đúng chủng loại vật tư"],
  },
  {
    title: "Sản xuất & Thi công nội thất",
    description: "Thiết kế và thi công hoàn thiện nội thất biệt thự, nhà phố, chung cư cao cấp với xưởng gỗ sản xuất trực tiếp.",
    href: "/dich-vu/san-xuat-thi-cong-noi-that",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    features: ["Xưởng sản xuất trực tiếp", "Tối ưu hóa không gian", "Bảo hành 2 năm hoàn thiện"],
  },
  {
    title: "Thi công nhà xưởng",
    description: "Thiết kế và gia công lắp dựng kết cấu thép nhà xưởng, nhà kho tiền chế khẩu độ lớn, đạt chuẩn kỹ thuật công nghiệp.",
    href: "/dich-vu/thi-cong-nha-xuong",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    features: ["Tiến độ thi công nhanh", "Kết cấu thép bền vững", "Tối ưu chi phí đầu tư"],
  },
  {
    title: "Thi công nội thất văn phòng",
    description: "Giải pháp kiến tạo không gian làm việc chuyên nghiệp, hiện đại, tối ưu công suất hoạt động và nâng tầm nhận diện thương hiệu.",
    href: "/dich-vu/thi-cong-noi-that-van-phong",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    features: ["Tối ưu không gian làm việc", "Tiến độ cam kết chặt chẽ", "Báo giá chi tiết minh bạch"],
  },
];

const whyChooseUs = [
  {
    title: "Kinh nghiệm thực tế",
    description: "Hơn 10 năm triển khai các dự án nhà ở dân dụng, biệt thự, nhà xưởng và văn phòng quy mô lớn.",
    icon: Sparkles,
  },
  {
    title: "Quy trình chuyên nghiệp",
    description: "Lên kế hoạch, quản lý vật tư và giám sát thi công chặt chẽ theo tiêu chuẩn kỹ thuật nghiêm ngặt.",
    icon: Compass,
  },
  {
    title: "Cam kết không phát sinh",
    description: "Báo giá chi tiết từng hạng mục trước khi ký hợp đồng, cam kết không phát sinh thêm chi phí ngoài hợp đồng.",
    icon: Layers,
  },
  {
    title: "Bảo hành dài hạn",
    description: "Chính sách bảo hành lên tới 10 năm cho phần kết cấu và hỗ trợ bảo trì nhanh chóng 24/7.",
    icon: ShieldCheck,
  },
];

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  const hotline = settings["site.identity"]?.hotline || "0898 502 333";
  const hotlineClean = hotline.replace(/\s/g, "");

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dịch vụ", url: "/dich-vu" },
    ]),
    buildWebPageSchema({
      name: "Dịch vụ Thiết kế & Thi công - Hà Thành Home",
      description: "Tổng hợp các giải pháp xây dựng, hoàn thiện kiến trúc và thiết kế sản xuất nội thất trọn gói của Hà Thành Home.",
      url: "/dich-vu",
      type: "CollectionPage",
    }),
    buildItemListSchema([
      ...coreServices.map((s) => ({ name: s.title, url: s.href })),
    ]),
  ].filter(Boolean);

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas as Record<string, unknown>[]} />
      
      <main className="services-landing-page">
        {/* Page Hero */}
        <section className="services-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumbs">
              <a href="/">Trang chủ</a> <span>/</span> <span>Dịch vụ</span>
            </nav>
            <div className="hero-content">
              <span className="eyebrow">Hà Thành Home</span>
              <h1>Dịch vụ Thiết kế & Thi công trọn gói</h1>
              <p>
                Chúng tôi mang đến giải pháp trọn gói toàn diện từ khâu tư vấn thiết kế, pháp lý xin phép xây dựng, thi công xây lắp phần thô cho tới sản xuất và lắp đặt nội thất hoàn thiện chìa khóa trao tay.
              </p>
            </div>
          </div>
        </section>

        {/* Core Services Section */}
        <section className="section core-services-section">
          <div className="container">
            <div className="section-title text-center">
              <span className="eyebrow">Lĩnh vực cốt lõi</span>
              <h2>4 Dịch Vụ Trọng Tâm Của Hà Thành Home</h2>
              <p className="section-subtitle">
                Các mảng chuyên môn trọng tâm được chúng tôi tổ chức và vận hành bởi các đội ngũ kỹ sư, kiến trúc sư và xưởng sản xuất chuyên biệt.
              </p>
            </div>

            <div className="core-services-grid">
              {coreServices.map((service, index) => (
                <article className="core-service-card" key={index}>
                  <div 
                    className="card-image" 
                    style={{ backgroundImage: `linear-gradient(to top, rgba(8, 20, 16, 0.9) 0%, rgba(8, 20, 16, 0.4) 60%, rgba(8, 20, 16, 0.1) 100%), url(${service.imageUrl})` }}
                  />
                  <div className="card-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <ul className="card-features">
                      {service.features.map((feat, fIdx) => (
                        <li key={fIdx}><CheckCircle2 size={15} /> {feat}</li>
                      ))}
                    </ul>
                    <a className="card-cta" href={service.href}>
                      Xem chi tiết dịch vụ <ArrowRight size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>


        {/* Why Choose Us */}
        <section className="section why-choose-services">
          <div className="container">
            <div className="section-title text-center">
              <span className="eyebrow">Cam kết chất lượng</span>
              <h2>Năng Lực Triển Khai Tại Hà Thành Home</h2>
            </div>

            <div className="why-choose-grid">
              {whyChooseUs.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div className="why-card" key={idx}>
                    <span className="icon-round"><Icon size={24} /></span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="services-cta-banner">
          <div className="container">
            <div className="cta-banner-content">
              <h2>Bạn đang tìm kiếm giải pháp xây dựng tối ưu?</h2>
              <p>
                Hãy gửi thông tin hoặc liên hệ ngay với kiến trúc sư và kỹ sư trưởng của Hà Thành Home để được khảo sát thực tế và lên báo giá dự toán miễn phí.
              </p>
              <div className="cta-banner-actions">
                <a className="cta" href="/lien-he">Yêu cầu báo giá & Tư vấn</a>
                <a className="cta secondary" href={`tel:${hotlineClean}`}>Hotline: {hotline}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </>
  );
}
