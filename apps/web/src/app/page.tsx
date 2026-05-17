import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Factory,
  Hammer,
  MapPin,
  Phone,
  ShieldCheck,
  Sofa,
  Sparkles,
  Star,
} from "lucide-react";
import { ArchitectureCard, InteriorCard } from "@/components/design-templates";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import {
  defaultHomepage,
  getHome,
  getSiteSettings,
  homepageWithDefaults,
  interiorImages,
  projectImages,
  thumbnailUrl,
  type ArchitectureDesign,
  type HomeHeroSlide,
  type InteriorDesign,
  type Post,
  type Project,
  type Service,
  type SiteHomepage,
} from "@/lib/api";

export default async function HomePage() {
  const [data, settings] = await Promise.all([getHome(), getSiteSettings()]);
  const homepage = homepageWithDefaults(settings["site.homepage"]);

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection slide={homepage.heroSlides?.[0] || defaultHomepage.heroSlides[0]} />
        <AboutSection homepage={homepage} />
        <ExpertiseSection homepage={homepage} />
        <ProjectsSection id="projects" title="Dự án công trình tiêu biểu" projects={data.constructionProjects} images={projectImages} />
        <ProjectsSection title="Dự án nội thất nổi bật" projects={data.interiorProjects} images={interiorImages} cream />
        <ArchitectureTemplatesSection homepage={homepage} designs={data.architectureDesigns || []} />
        <InteriorTemplatesSection homepage={homepage} designs={data.interiorDesigns || []} />
        <ServicesSection homepage={homepage} services={data.services} />
        <ProcessAndStats homepage={homepage} />
        <Testimonials homepage={homepage} />
        <NewsSection homepage={homepage} posts={data.posts} />
      </main>
      <SiteFooter />
    </>
  );
}

function HeroSection({ slide }: { slide: HomeHeroSlide }) {
  const image = slide.imageUrl || defaultHomepage.heroSlides[0].imageUrl;
  return (
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 23, 18, 0.86) 0%, rgba(7, 23, 18, 0.62) 40%, rgba(7, 23, 18, 0.2) 72%, rgba(7, 23, 18, 0.06) 100%), url(${image})` }}>
      <div className="hero-shine" aria-hidden="true" />
      <div className="container hero-layout">
        <div className="hero-content">
          <span className="eyebrow">{slide.eyebrow || "Hà Thành Home"}</span>
          <h1>{slide.title || defaultHomepage.heroSlides[0].title}</h1>
          <p>{slide.description || defaultHomepage.heroSlides[0].description}</p>
          <div className="hero-actions">
            <a className="cta" href={slide.primaryUrl || "#projects"}>{slide.primaryLabel || "Xem dự án nổi bật"} <ArrowRight size={18} /></a>
            <a className="cta secondary" href={slide.secondaryUrl || "/lien-he"}><Phone size={18} /> {slide.secondaryLabel || "Tư vấn miễn phí"}</a>
            <a className="cta estimator" href="#du-toan" data-estimator-open>Dự toán nhanh <ArrowRight size={18} /></a>
          </div>
          <div className="hero-trust">
            <span><strong>10+</strong> năm kinh nghiệm</span>
            <span><strong>500+</strong> dự án hoàn thiện</span>
            <span><strong>98%</strong> khách hàng hài lòng</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ homepage }: { homepage: SiteHomepage }) {
  const benefitIcons = [Sparkles, ClipboardCheck, BadgeCheck, ShieldCheck];
  return (
    <section className="section about-section">
      <div className="container about-grid">
        <div className="image-card" style={{ backgroundImage: `url(${homepage.aboutImageUrl || defaultHomepage.aboutImageUrl})` }} aria-label="Không gian nội thất cao cấp" />
        <div className="about-copy">
          <span className="eyebrow">{homepage.aboutEyebrow || defaultHomepage.aboutEyebrow}</span>
          <h2>{homepage.aboutTitle || defaultHomepage.aboutTitle}</h2>
          <p>{homepage.aboutDescription || defaultHomepage.aboutDescription}</p>
          <div className="benefits">
            {(homepage.aboutBenefits || defaultHomepage.aboutBenefits).slice(0, 4).map((benefit, index) => {
              const Icon = benefitIcons[index % benefitIcons.length];
              return (
                <div className="benefit" key={`${benefit.title}-${index}`}>
                  <span className="icon-round"><Icon size={20} /></span>
                  <strong>{benefit.title}</strong>
                  {benefit.description ? <small>{benefit.description}</small> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExpertiseSection({ homepage }: { homepage: SiteHomepage }) {
  return (
    <section className="section cream">
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">{homepage.expertiseEyebrow || defaultHomepage.expertiseEyebrow}</span>
          <h2>{homepage.expertiseTitle || defaultHomepage.expertiseTitle}</h2>
        </div>
        <div className="split-cards">
          <article className="feature-card construction">
            <div>
              <h3>Khối Công Trình</h3>
              <ul><li>Thiết kế kiến trúc</li><li>Thi công xây dựng, phần thô, hoàn thiện</li><li>Biệt thự, nhà phố, văn phòng, tòa nhà</li><li>Showroom, nhà xưởng, giám sát công trình</li></ul>
              <a className="cta secondary" href="/du-an/cong-trinh">Tìm hiểu công trình</a>
            </div>
          </article>
          <article className="feature-card interior">
            <div>
              <h3>Khối Nội Thất</h3>
              <ul><li>Thiết kế, sản xuất và thi công nội thất</li><li>Căn hộ, biệt thự, văn phòng, showroom</li><li>Cải tạo nội thất và tối ưu không gian</li><li>Vật liệu, sản phẩm, hoàn thiện trọn gói</li></ul>
              <a className="cta secondary" href="/du-an/noi-that">Tìm hiểu nội thất</a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ id, title, projects, images, cream }: { id?: string; title: string; projects: Project[]; images: string[]; cream?: boolean }) {
  return (
    <section className={`section ${cream ? "cream" : ""}`} id={id}>
      <div className="container">
        <div className="section-title"><h2>{title}</h2></div>
        <div className="project-grid home-slider-grid">
          {projects.slice(0, 4).map((project, index) => (
            <a className="card" key={project.id} href={`/du-an/${project.slug}`}>
              <div className="project-image" style={{ backgroundImage: `url(${thumbnailUrl(project, images[index % images.length])})` }} />
              <div className="card-body">
                <h3>{project.title}</h3>
                <span className="meta"><MapPin size={15} /> {project.location || "Hà Nội"}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureTemplatesSection({ designs, homepage }: { designs: ArchitectureDesign[]; homepage: SiteHomepage }) {
  if (!designs.length) return null;
  return (
    <section className="section home-template-section">
      <div className="container">
        <div className="section-title with-link">
          <span className="eyebrow">{homepage.architectureTemplatesEyebrow || defaultHomepage.architectureTemplatesEyebrow}</span>
          <h2>{homepage.architectureTemplatesTitle || defaultHomepage.architectureTemplatesTitle}</h2>
          <a className="section-link" href="/mau-thiet-ke-kien-truc">Xem tất cả <ArrowRight size={16} /></a>
        </div>
        <div className="template-grid home-template-grid">{designs.slice(0, 3).map((design, index) => <ArchitectureCard design={design} index={index} key={design.id} />)}</div>
      </div>
    </section>
  );
}

function InteriorTemplatesSection({ designs, homepage }: { designs: InteriorDesign[]; homepage: SiteHomepage }) {
  if (!designs.length) return null;
  return (
    <section className="section cream home-template-section">
      <div className="container">
        <div className="section-title with-link">
          <span className="eyebrow">{homepage.interiorTemplatesEyebrow || defaultHomepage.interiorTemplatesEyebrow}</span>
          <h2>{homepage.interiorTemplatesTitle || defaultHomepage.interiorTemplatesTitle}</h2>
          <a className="section-link" href="/mau-thiet-ke-noi-that">Xem tất cả <ArrowRight size={16} /></a>
        </div>
        <div className="template-grid home-template-grid">{designs.slice(0, 3).map((design, index) => <InteriorCard design={design} index={index} key={design.id} />)}</div>
      </div>
    </section>
  );
}

function ServicesSection({ services, homepage }: { services: Service[]; homepage: SiteHomepage }) {
  const icons = [Building2, Hammer, Sofa, Factory];
  return (
    <section className="section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">{homepage.servicesEyebrow || defaultHomepage.servicesEyebrow}</span><h2>{homepage.servicesTitle || defaultHomepage.servicesTitle}</h2></div>
        <div className="services">
          {services.slice(0, 4).map((service, index) => {
            const Icon = icons[index % icons.length];
            return (
              <a className="service-card" key={service.id} href={`/dich-vu/${service.slug}`}>
                <Icon size={42} strokeWidth={1.5} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span>Tìm hiểu thêm <ArrowRight size={14} /></span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProcessAndStats({ homepage }: { homepage: SiteHomepage }) {
  return (
    <>
      <section className="section cream"><div className="container"><div className="section-title"><h2>{homepage.processTitle || defaultHomepage.processTitle}</h2></div><div className="timeline">{["Khảo sát & tư vấn", "Lên ý tưởng", "Thiết kế chi tiết", "Báo giá & ký hợp đồng", "Thi công hoàn thiện", "Bàn giao & bảo hành"].map((step, index) => <div className="step" key={step}><span className="step-number">{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}</div></div></section>
      <section className="stats"><div className="container stats-grid">{(homepage.stats || defaultHomepage.stats).slice(0, 5).map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></section>
    </>
  );
}

function Testimonials({ homepage }: { homepage: SiteHomepage }) {
  return (
    <section className="section"><div className="container"><div className="section-title"><h2>{homepage.testimonialsTitle || defaultHomepage.testimonialsTitle}</h2></div><div className="testimonials">{["Anh Minh Tuấn - Biệt thự Hà Nội", "Chị Thu Hằng - Nội thất căn hộ Ninh Bình", "Anh Quốc Huy - Văn phòng Hải Phòng"].map((name) => <article className="testimonial" key={name}><div className="avatar" /><strong>{name}</strong><div className="stars">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} fill="currentColor" />)}</div><p>Hà Thành Home làm việc chuyên nghiệp, tư vấn rõ ràng và hoàn thiện đúng tinh thần thiết kế ban đầu.</p></article>)}</div></div></section>
  );
}

function NewsSection({ posts, homepage }: { posts: Post[]; homepage: SiteHomepage }) {
  return (
    <section className="section cream"><div className="container"><div className="section-title"><h2>{homepage.newsTitle || defaultHomepage.newsTitle}</h2></div><div className="news-grid">{posts.slice(0, 4).map((post, index) => <a className="news-card" key={post.id} href={`/tin-tuc/${post.slug}`}><div className="news-image" style={{ backgroundImage: `url(${thumbnailUrl(post, interiorImages[index % interiorImages.length])})` }} /><span className="date-badge"><CalendarDays size={14} /> 13.05</span><div className="card-body"><h3>{post.title}</h3><p>{post.excerpt}</p><span>Đọc thêm <ArrowRight size={14} /></span></div></a>)}</div></div></section>
  );
}
