import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DraftingCompass,
  FileCheck2,
  HardHat,
  Headphones,
  MapPin,
  Medal,
  MessageCircle,
  PhoneCall,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  UserRoundCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { RelatedContent } from "@/components/related-content";
import { XayNhaQuoteForm } from "@/components/xay-nha-quote-form";
import {
  fetchLandingProjects,
  getConstructionEstimatorConfig,
  getSiteSettings,
  projectImages,
  type EstimatorPublicConfig,
  type LandingFaq,
  type LandingListItem,
  type LandingProjectCard,
  type LandingTestimonial,
  xayNhaLandingWithDefaults,
} from "@/lib/api";
import { buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from "@/lib/seo/jsonld";
import { getConstructionGuidePosts } from "@/lib/related-content";

export const metadata: Metadata = {
  title: "Xây nhà trọn gói",
  description: "Dịch vụ xây nhà trọn gói từ thiết kế, thi công phần thô, hoàn thiện đến bàn giao bởi Hà Thành Home.",
  alternates: { canonical: "/dich-vu/xay-nha-tron-goi" },
};

const benefitIcons = [DraftingCompass, Banknote, Clock3, ShieldCheck, Medal, UserRoundCheck];
const scopeIcons = [UserRoundCheck, DraftingCompass, FileCheck2, HardHat, Wrench, ClipboardCheck, BadgeCheck, ShieldCheck];
const processIcons = [UserRoundCheck, DraftingCompass, Banknote, FileCheck2, HardHat, ClipboardCheck, ShieldCheck];
const whyIcons = [Medal, ClipboardCheck, Banknote, ShieldCheck, Headphones, BadgeCheck];
const statIcons = [TimerReset, Building2, Sparkles, Headphones];

export default async function XayNhaTronGoiPage() {
  const [settings, estimatorConfig, guidePosts] = await Promise.all([
    getSiteSettings(),
    getConstructionEstimatorConfig(),
    getConstructionGuidePosts(),
  ]);
  const landing = xayNhaLandingWithDefaults(settings["site.landing.xayNhaTronGoi"]);
  const projects = await fetchLandingProjects(landing.projectsSource, { entity: "project", group: "construction" });

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dịch vụ", url: "/dich-vu" },
      { name: "Xây nhà trọn gói", url: "/dich-vu/xay-nha-tron-goi" },
    ]),
    buildServiceSchema({
      name: "Xây nhà trọn gói",
      description: "Dịch vụ xây nhà trọn gói từ thiết kế, thi công phần thô, hoàn thiện đến bàn giao.",
      url: "/dich-vu/xay-nha-tron-goi",
      serviceType: "Xây nhà trọn gói",
    }),
    buildFAQSchema(landing.faqs),
  ].filter(Boolean);

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas as Record<string, unknown>[]} />
      <main>
        <XayNhaHero landing={landing} />
        <BenefitStrip items={landing.benefits} />
        <ServiceIntro landing={landing} />
        <DetailedIntroSection landing={landing} />
        <ScopeSection landing={landing} />
        <ProcessTimeline landing={landing} />
        <ProjectShowcase projects={projects} landing={landing} />
        <EstimateSection config={estimatorConfig} landing={landing} />
        <WhyChooseSection landing={landing} />
        <StatsStrip items={landing.stats} />
        <Testimonials items={landing.testimonials} landing={landing} />
        <RelatedContent items={guidePosts} title="Cẩm nang xây dựng hữu ích" />
        <FAQSection items={landing.faqs} landing={landing} />
        <FinalCTA landing={landing} />
      </main>
      <SiteFooter />
    </>
  );
}

function XayNhaHero({ landing }: { landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="xay-nha-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 23, 18, 0.92) 0%, rgba(7, 23, 18, 0.72) 43%, rgba(7, 23, 18, 0.18) 78%), url(${landing.heroImageUrl})` }}>
      <div className="container">
        <nav className="xay-nha-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Trang chủ</a><span>/</span><a href="/dich-vu">Dịch vụ</a><span>/</span><strong>Xây nhà trọn gói</strong>
        </nav>
        <div className="xay-nha-hero-content">
          <span className="eyebrow">{landing.heroEyebrow}</span>
          <h1>{landing.heroTitle}</h1>
          <p>{landing.heroDescription}</p>
          <div className="xay-nha-actions">
            <a className="cta" href="#du-toan-chi-phi" data-estimator-open>{landing.primaryCtaLabel} <ArrowRight size={18} /></a>
            <a className="cta secondary" href="/lien-he"><PhoneCall size={18} /> {landing.secondaryCtaLabel}</a>
            <a className="xay-nha-ghost-link" href="#du-toan-chi-phi" data-estimator-open>Dự toán nhanh <ArrowRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitStrip({ items }: { items: LandingListItem[] }) {
  return (
    <section className="xay-nha-benefit-strip">
      <div className="container xay-nha-benefits">
        {items.map((item, index) => <IconText icon={benefitIcons[index % benefitIcons.length]} item={item} key={`${item.title}-${index}`} />)}
      </div>
    </section>
  );
}

function ServiceIntro({ landing }: { landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section">
      <div className="container xay-nha-intro">
        <div className="xay-nha-intro-image" style={{ backgroundImage: `url(${landing.introImageUrl})` }} />
        <div>
          <span className="eyebrow">{landing.introEyebrow}</span>
          <h2>{landing.introTitle}</h2>
          <p>{landing.introDescription}</p>
          <ul className="xay-nha-checklist">
            {landing.introChecklist.map((item) => <li key={item}><CheckCircle2 size={18} /> {item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ScopeSection({ landing }: { landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section cream">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.scopeEyebrow}</span><h2>{landing.scopeTitle}</h2></div>
        <div className="xay-nha-scope">
          {landing.scopeItems.map((item, index) => <IconText icon={scopeIcons[index % scopeIcons.length]} item={item} key={`${item.title}-${index}`} />)}
        </div>
      </div>
    </section>
  );
}

function ProcessTimeline({ landing }: { landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.processEyebrow}</span><h2>{landing.processTitle}</h2></div>
        <div className="xay-nha-process">
          {landing.processSteps.map((step, index) => {
            const Icon = processIcons[index % processIcons.length];
            return (
              <article className="xay-nha-process-step" key={`${step.number}-${step.title}`}>
                <span>{step.number || String(index + 1).padStart(2, "0")}</span>
                <Icon size={22} />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectShowcase({ projects, landing }: { projects: LandingProjectCard[]; landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section cream">
      <div className="container">
        <div className="xay-nha-section-head">
          <div><span className="eyebrow">{landing.projectsEyebrow}</span><h2>{landing.projectsTitle}</h2></div>
          <a className="section-link" href="/du-an/cong-trinh">Xem tất cả dự án <ArrowRight size={16} /></a>
        </div>
        {projects.length ? (
          <div className="xay-nha-project-grid">
            {projects.map((project) => (
              <article className="xay-nha-project-card" key={project.id}>
                <div className="xay-nha-project-image" style={{ backgroundImage: `url(${project.thumbnailUrl})` }}><span>{project.categoryLabel || "Công trình"}</span></div>
                <div className="xay-nha-project-body">
                  <h3>{project.title}</h3>
                  <div className="xay-nha-project-meta">
                    <span><MapPin size={15} /> {project.location || "Đang cập nhật"}</span>
                    <span><Ruler size={15} /> {project.meta || "Đang cập nhật"}</span>
                  </div>
                  <a href={project.href}>Xem chi tiết</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="xay-nha-empty">Chưa có dự án công trình đã xuất bản. Vui lòng thêm dự án trong admin để hiển thị tại đây.</div>
        )}
      </div>
    </section>
  );
}

function EstimateSection({ config, landing }: { config: EstimatorPublicConfig; landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  const scopeField = config.inputSchema?.find((field) => field.name === "scope");
  const scopeOptions = scopeField?.options?.length ? scopeField.options : [];
  const prices = scopeOptions.map((option) => Number(option.variables?.unit_price || 0)).filter(Boolean);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  return (
    <section className="section" id="du-toan-chi-phi">
      <div className="container xay-nha-estimate">
        <div className="xay-nha-cost-card">
          <span className="eyebrow">{landing.estimateEyebrow}</span>
          <h2>{landing.estimateTitle}</h2>
          <div className="xay-nha-tabs" role="list" aria-label={scopeField?.label || "Gói thi công"}>
            {(scopeOptions.length ? scopeOptions : [{ label: "Mở dự toán", value: "du-toan" }]).slice(0, 4).map((option, index) => <span className={index === 0 ? "active" : ""} key={option.value}>{shortScopeLabel(option.label)}</span>)}
          </div>
          <div className="xay-nha-price-box">
            <div className="xay-nha-price-image" style={{ backgroundImage: `url(${projectImages[0]})` }} />
            <div>
              <small>{config.name || "Cấu hình dự toán công trình"}</small>
              <strong>{min && max ? `${moneyPerM2(min)} - ${moneyPerM2(max)}` : "Mở dự toán để tính chi tiết"}</strong>
              <ul className="xay-nha-checklist">
                {scopeOptions.slice(0, 4).map((option) => <li key={option.value}><CheckCircle2 size={17} /> {option.label}</li>)}
              </ul>
              <a className="cta" href="#du-toan-chi-phi" data-estimator-open>Mở dự toán nhanh <ArrowRight size={17} /></a>
            </div>
          </div>
          <p className="xay-nha-note">{config.disclaimer || "* Chi phí phụ thuộc diện tích, phong cách, vật tư và điều kiện thi công thực tế."}</p>
        </div>
        <XayNhaQuoteForm title={landing.quoteTitle} description={landing.quoteDescription} />
      </div>
    </section>
  );
}

function WhyChooseSection({ landing }: { landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section xay-nha-why-section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.whyEyebrow}</span><h2>{landing.whyTitle}</h2></div>
        <div className="xay-nha-why-grid">
          {landing.whyChooseItems.map((item, index) => <IconText icon={whyIcons[index % whyIcons.length]} item={item} key={`${item.title}-${index}`} />)}
        </div>
      </div>
    </section>
  );
}

function StatsStrip({ items }: { items: LandingListItem[] }) {
  return (
    <section className="xay-nha-stats-section">
      <div className="container">
        <div className="xay-nha-stats">
          {items.map((item, index) => <IconText icon={statIcons[index % statIcons.length]} item={item} key={`${item.title}-${index}`} />)}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ items, landing }: { items: LandingTestimonial[]; landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.testimonialsEyebrow}</span><h2>{landing.testimonialsTitle}</h2></div>
        <div className="xay-nha-testimonials">
          {items.map((item, index) => (
            <article className="xay-nha-testimonial" key={`${item.name}-${index}`}>
              <div className="xay-nha-avatar">{index + 1}</div>
              <strong>{item.name}</strong>
              <span>{item.project}</span>
              <div className="xay-nha-stars">{Array.from({ length: 5 }, (_, star) => <Star fill="currentColor" size={16} key={star} />)}</div>
              <p>“{item.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ items, landing }: { items: LandingFaq[]; landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section cream">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.faqEyebrow}</span><h2>{landing.faqTitle}</h2></div>
        <div className="xay-nha-faq">
          {items.map((item, index) => (
            <details key={`${item.question}-${index}`}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ landing }: { landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  return (
    <section className="section">
      <div className="container xay-nha-final-cta">
        <div>
          <span className="eyebrow">{landing.finalEyebrow}</span>
          <h2>{landing.finalTitle}</h2>
          <p>{landing.finalDescription}</p>
        </div>
        <div className="xay-nha-actions">
          <a className="cta secondary" href="#du-toan-chi-phi" data-estimator-open>{landing.primaryCtaLabel}</a>
          <a className="cta" href="/lien-he"><MessageCircle size={18} /> {landing.secondaryCtaLabel}</a>
        </div>
      </div>
    </section>
  );
}

function IconText({ icon: Icon, item }: { icon: LucideIcon; item: LandingListItem }) {
  return (
    <article className="xay-nha-icon-item">
      <span><Icon size={23} /></span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}

function moneyPerM2(value: number) {
  return `${value.toLocaleString("vi-VN")}đ/m2`;
}

function shortScopeLabel(label: string) {
  if (label.includes("-")) {
    return label.split("-")[0]?.trim() || label;
  }
  // Check if label contains a price pattern (digit + currency/unit indicator)
  if (/\d/.test(label) && (label.includes("triệu") || label.includes("đ") || label.includes("tr/") || label.includes("đ/"))) {
    // Find space followed by a digit or parenthesis
    const priceMatch = label.match(/\s+[\(\d]/);
    if (priceMatch && priceMatch.index !== undefined) {
      return label.substring(0, priceMatch.index).trim();
    }
  }
  return label;
}

function DetailedIntroSection({ landing }: { landing: ReturnType<typeof xayNhaLandingWithDefaults> }) {
  if (!landing.detailedIntroHtml) return null;

  const hasImage = !!landing.detailedIntroImageUrl;

  return (
    <section className="section detailed-intro-section">
      <div className={`container xay-nha-detailed-intro ${hasImage ? "has-image" : ""}`}>
        <div className="detailed-intro-text">
          <div className="detail-content" dangerouslySetInnerHTML={{ __html: landing.detailedIntroHtml }} />
          {landing.detailedIntroCtaLabel && landing.detailedIntroCtaUrl && (
            <div className="detailed-intro-actions">
              <a className="cta" href={landing.detailedIntroCtaUrl}>
                {landing.detailedIntroCtaLabel} <ArrowRight size={18} />
              </a>
            </div>
          )}
        </div>
        {hasImage && (
          <div className="detailed-intro-image-container">
            <div
              className="detailed-intro-image"
              style={{ backgroundImage: `url(${landing.detailedIntroImageUrl})` }}
              aria-label="Hình ảnh giới thiệu xây nhà trọn gói"
            />
          </div>
        )}
      </div>
    </section>
  );
}
