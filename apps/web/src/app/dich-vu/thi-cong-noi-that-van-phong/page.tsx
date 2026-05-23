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
  Factory,
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
import { XayNhaQuoteForm } from "@/components/xay-nha-quote-form";
import {
  fetchLandingProjects,
  getSiteSettings,
  vanPhongLandingWithDefaults,
  type LandingFaq,
  type LandingListItem,
  type LandingProjectCard,
  type LandingTestimonial,
} from "@/lib/api";
import { buildBreadcrumbSchema, buildServiceSchema, buildFAQSchema } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Thi công nội thất văn phòng",
  description: "Dịch vụ thi công nội thất văn phòng trọn gói — chuẩn công năng, đúng tiến độ, nâng tầm thương hiệu cho doanh nghiệp.",
  alternates: { canonical: "/dich-vu/thi-cong-noi-that-van-phong" },
};

const benefitIcons: LucideIcon[] = [DraftingCompass, BadgeCheck, Clock3, ShieldCheck, Medal, UserRoundCheck];
const scopeIcons: LucideIcon[] = [UserRoundCheck, DraftingCompass, Factory, HardHat, Wrench, ClipboardCheck, ShieldCheck];
const processIcons: LucideIcon[] = [UserRoundCheck, DraftingCompass, Banknote, ClipboardCheck, Factory, HardHat, ShieldCheck];
const whyIcons: LucideIcon[] = [Medal, Sparkles, ClipboardCheck, Clock3, BadgeCheck, Headphones];
const statIcons: LucideIcon[] = [TimerReset, Building2, Sparkles, Headphones];

type LandingType = ReturnType<typeof vanPhongLandingWithDefaults>;

export default async function ThiCongNoiThatVanPhongPage() {
  const settings = await getSiteSettings();
  const landing = vanPhongLandingWithDefaults(settings["site.servicePages.thiCongNoiThatVanPhong"]);
  const projects = await fetchLandingProjects(landing.projectsSource, { entity: "project", group: "interior" });

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Dịch vụ", url: "/dich-vu" },
      { name: "Thi công nội thất văn phòng", url: "/dich-vu/thi-cong-noi-that-van-phong" },
    ]),
    buildServiceSchema({
      name: "Thi công nội thất văn phòng",
      description: "Dịch vụ thi công nội thất văn phòng trọn gói.",
      url: "/dich-vu/thi-cong-noi-that-van-phong",
      serviceType: "Thi công nội thất văn phòng",
    }),
    buildFAQSchema(landing.faqs),
  ].filter(Boolean);

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas as Record<string, unknown>[]} />
      <main>
        <Hero landing={landing} />
        <BenefitStrip items={landing.benefits} />
        <ServiceIntro landing={landing} />
        <ScopeSection landing={landing} />
        <ProcessTimeline landing={landing} />
        <ProjectShowcase projects={projects} landing={landing} />
        <QuoteSection landing={landing} />
        <WhyChooseSection landing={landing} />
        <StatsStrip items={landing.stats} />
        <Testimonials items={landing.testimonials} landing={landing} />
        <FAQSection items={landing.faqs} landing={landing} />
        <FinalCTA landing={landing} />
      </main>
      <SiteFooter />
    </>
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

function Hero({ landing }: { landing: LandingType }) {
  return (
    <section className="xay-nha-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 23, 18, 0.92) 0%, rgba(7, 23, 18, 0.72) 43%, rgba(7, 23, 18, 0.18) 78%), url(${landing.heroImageUrl})` }}>
      <div className="container">
        <nav className="xay-nha-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Trang chủ</a><span>/</span><a href="/dich-vu">Dịch vụ</a><span>/</span><strong>Thi công nội thất văn phòng</strong>
        </nav>
        <div className="xay-nha-hero-content">
          <span className="eyebrow">{landing.heroEyebrow}</span>
          <h1>{landing.heroTitle}</h1>
          <p>{landing.heroDescription}</p>
          <div className="xay-nha-actions">
            <a className="cta" href="#nhan-bao-gia">{landing.primaryCtaLabel} <ArrowRight size={18} /></a>
            <a className="cta secondary" href="/lien-he?nguon=thi-cong-noi-that-van-phong"><PhoneCall size={18} /> {landing.secondaryCtaLabel}</a>
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

function ServiceIntro({ landing }: { landing: LandingType }) {
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

function ScopeSection({ landing }: { landing: LandingType }) {
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

function ProcessTimeline({ landing }: { landing: LandingType }) {
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

function ProjectShowcase({ projects, landing }: { projects: LandingProjectCard[]; landing: LandingType }) {
  return (
    <section className="section cream">
      <div className="container">
        <div className="xay-nha-section-head">
          <div><span className="eyebrow">{landing.projectsEyebrow}</span><h2>{landing.projectsTitle}</h2></div>
          <a className="section-link" href="/du-an/noi-that">Xem tất cả dự án <ArrowRight size={16} /></a>
        </div>
        {projects.length ? (
          <div className="xay-nha-project-grid">
            {projects.map((project) => (
              <article className="xay-nha-project-card" key={project.id}>
                <div className="xay-nha-project-image" style={{ backgroundImage: `url(${project.thumbnailUrl})` }}><span>{project.categoryLabel || "Văn phòng"}</span></div>
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
          <div className="xay-nha-empty">Chưa có dự án văn phòng đã xuất bản. Vui lòng thêm dự án trong admin để hiển thị tại đây.</div>
        )}
      </div>
    </section>
  );
}

function QuoteSection({ landing }: { landing: LandingType }) {
  return (
    <section className="section" id="nhan-bao-gia">
      <div className="container">
        <XayNhaQuoteForm title={landing.quoteTitle} description={landing.quoteDescription} />
      </div>
    </section>
  );
}

function WhyChooseSection({ landing }: { landing: LandingType }) {
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

function Testimonials({ items, landing }: { items: LandingTestimonial[]; landing: LandingType }) {
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

function FAQSection({ items, landing }: { items: LandingFaq[]; landing: LandingType }) {
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

function FinalCTA({ landing }: { landing: LandingType }) {
  return (
    <section className="section">
      <div className="container xay-nha-final-cta">
        <div>
          <span className="eyebrow">{landing.finalEyebrow}</span>
          <h2>{landing.finalTitle}</h2>
          <p>{landing.finalDescription}</p>
        </div>
        <div className="xay-nha-actions">
          <a className="cta secondary" href="#nhan-bao-gia">{landing.primaryCtaLabel}</a>
          <a className="cta" href="/lien-he?nguon=thi-cong-noi-that-van-phong"><MessageCircle size={18} /> {landing.secondaryCtaLabel}</a>
        </div>
      </div>
    </section>
  );
}
