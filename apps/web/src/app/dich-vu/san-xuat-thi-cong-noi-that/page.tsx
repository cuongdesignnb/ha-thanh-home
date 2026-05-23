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
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { XayNhaQuoteForm } from "@/components/xay-nha-quote-form";
import {
  getListPayload,
  getSiteSettings,
  interiorImages,
  noiThatLandingWithDefaults,
  thumbnailUrl,
  type LandingListItem,
  type Project,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Sản xuất thi công nội thất | Hà Thành Home",
  description: "Dịch vụ sản xuất và thi công nội thất trọn gói tại Hà Thành Home — xưởng sản xuất riêng, thi công chuẩn thiết kế, bảo hành dài hạn.",
};

const benefitIcons: LucideIcon[] = [DraftingCompass, Factory, BadgeCheck, Clock3, ShieldCheck, UserRoundCheck];
const scopeIcons: LucideIcon[] = [UserRoundCheck, DraftingCompass, Factory, HardHat, Wrench, ClipboardCheck, ShieldCheck];
const processIcons: LucideIcon[] = [UserRoundCheck, DraftingCompass, Banknote, ClipboardCheck, Factory, HardHat, ShieldCheck];
const whyIcons: LucideIcon[] = [Factory, Medal, ShieldCheck, Clock3, BadgeCheck, Headphones];
const statIcons: LucideIcon[] = [TimerReset, Building2, Sparkles, Headphones];

export default async function SanXuatThiCongNoiThatPage() {
  const [settings, projectPayload] = await Promise.all([
    getSiteSettings(),
    getListPayload<Project>("/projects?group=interior&limit=6&sort=newest"),
  ]);
  const landing = noiThatLandingWithDefaults(settings["site.servicePages.sanXuatThiCongNoiThat"]);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero landing={landing} />
        <BenefitStrip items={landing.benefits} />
        <ServiceIntro landing={landing} />
        <ScopeSection landing={landing} />
        <ProcessTimeline landing={landing} />
        <ProjectShowcase projects={projectPayload.data} landing={landing} />
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

type LandingType = ReturnType<typeof noiThatLandingWithDefaults>;

function Hero({ landing }: { landing: LandingType }) {
  return (
    <section className="xay-nha-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 23, 18, 0.92) 0%, rgba(7, 23, 18, 0.72) 43%, rgba(7, 23, 18, 0.18) 78%), url(${landing.heroImageUrl})` }}>
      <div className="container">
        <nav className="xay-nha-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Trang chủ</a><span>/</span><a href="/dich-vu">Dịch vụ</a><span>/</span><strong>Sản xuất thi công nội thất</strong>
        </nav>
        <div className="xay-nha-hero-content">
          <span className="eyebrow">{landing.heroEyebrow}</span>
          <h1>{landing.heroTitle}</h1>
          <p>{landing.heroDescription}</p>
          <div className="xay-nha-actions">
            <a className="cta" href="#nhan-bao-gia">{landing.primaryCtaLabel} <ArrowRight size={18} /></a>
            <a className="cta secondary" href="/lien-he"><PhoneCall size={18} /> {landing.secondaryCtaLabel}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function IconText({ icon: Icon, item }: { icon: LucideIcon; item: LandingListItem }) {
  return (
    <article className="xay-nha-icon-text">
      <span><Icon size={22} /></span>
      <div>
        <strong>{item.title}</strong>
        {item.description ? <p>{item.description}</p> : null}
      </div>
    </article>
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

function ProjectShowcase({ projects, landing }: { projects: Project[]; landing: LandingType }) {
  return (
    <section className="section cream">
      <div className="container">
        <div className="xay-nha-section-head">
          <div><span className="eyebrow">{landing.projectsEyebrow}</span><h2>{landing.projectsTitle}</h2></div>
          <a className="section-link" href="/du-an/noi-that">Xem tất cả dự án <ArrowRight size={16} /></a>
        </div>
        {projects.length ? (
          <div className="xay-nha-project-grid">
            {projects.map((project, index) => (
              <article className="xay-nha-project-card" key={project.id}>
                <div className="xay-nha-project-image" style={{ backgroundImage: `url(${thumbnailUrl(project, interiorImages[index % interiorImages.length])})` }}><span>{project.categoryRef?.name || project.category || "Nội thất"}</span></div>
                <div className="xay-nha-project-body">
                  <h3>{project.title}</h3>
                  <div className="xay-nha-project-meta">
                    <span><MapPin size={15} /> {project.location || "Đang cập nhật"}</span>
                    <span><Ruler size={15} /> {project.area || project.scale || "Đang cập nhật"}</span>
                  </div>
                  <a href={`/du-an/${project.slug}`}>Xem chi tiết</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="xay-nha-empty">Chưa có dự án nội thất đã xuất bản. Vui lòng thêm dự án trong admin để hiển thị tại đây.</div>
        )}
      </div>
    </section>
  );
}

function QuoteSection({ landing }: { landing: LandingType }) {
  return (
    <section className="section xay-nha-quote-section" id="nhan-bao-gia">
      <div className="container xay-nha-quote">
        <div>
          <span className="eyebrow">{landing.quoteTitle}</span>
          <h2>Nhận báo giá & tư vấn miễn phí</h2>
          <p>{landing.quoteDescription}</p>
        </div>
        <XayNhaQuoteForm title={landing.quoteTitle} description={landing.quoteDescription} />
      </div>
    </section>
  );
}

function WhyChooseSection({ landing }: { landing: LandingType }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.whyEyebrow}</span><h2>{landing.whyTitle}</h2></div>
        <div className="xay-nha-why">
          {landing.whyChooseItems.map((item, index) => <IconText icon={whyIcons[index % whyIcons.length]} item={item} key={`${item.title}-${index}`} />)}
        </div>
      </div>
    </section>
  );
}

function StatsStrip({ items }: { items: LandingListItem[] }) {
  return (
    <section className="xay-nha-stats">
      <div className="container">
        {items.map((item, index) => {
          const Icon = statIcons[index % statIcons.length];
          return (
            <article key={`${item.title}-${index}`}>
              <Icon size={24} />
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Testimonials({ items, landing }: { items: LandingType["testimonials"]; landing: LandingType }) {
  return (
    <section className="section cream">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.testimonialsEyebrow}</span><h2>{landing.testimonialsTitle}</h2></div>
        <div className="xay-nha-testimonials">
          {items.map((item, index) => (
            <article className="xay-nha-testimonial" key={`${item.name}-${index}`}>
              <div className="xay-nha-stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
              <p>“{item.quote}”</p>
              <footer>
                <strong>{item.name}</strong>
                {item.project ? <small>{item.project}</small> : null}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ items, landing }: { items: LandingType["faqs"]; landing: LandingType }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{landing.faqEyebrow}</span><h2>{landing.faqTitle}</h2></div>
        <div className="xay-nha-faqs">
          {items.map((item, index) => (
            <details key={`${item.question}-${index}`}>
              <summary>{index + 1}. {item.question}</summary>
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
    <section className="xay-nha-final">
      <div className="container">
        <div>
          <span className="eyebrow">{landing.finalEyebrow}</span>
          <h2>{landing.finalTitle}</h2>
          <p>{landing.finalDescription}</p>
        </div>
        <div className="xay-nha-actions">
          <a className="cta" href="#nhan-bao-gia">{landing.primaryCtaLabel} <ArrowRight size={18} /></a>
          <a className="cta secondary" href="/lien-he"><PhoneCall size={18} /> {landing.secondaryCtaLabel}</a>
        </div>
      </div>
    </section>
  );
}
