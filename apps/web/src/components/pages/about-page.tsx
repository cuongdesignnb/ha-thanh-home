"use client";

import React, { useState } from "react";
import {
  Eye,
  Target,
  Diamond,
  PenTool,
  Calendar,
  ShieldCheck,
  Shield,
  Users,
  CircleDollarSign,
  Clock,
  Award,
  Heart,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Star,
  Check
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { buildBreadcrumbSchema, buildAboutPageSchema } from "@/lib/seo/jsonld";
import type { AboutPageConfig } from "@/lib/about-page-config";
import styles from "./about-page.module.css";

const iconMap: Record<string, React.ReactNode> = {
  eye: <Eye size={30} />,
  target: <Target size={30} />,
  diamond: <Diamond size={30} />,
  design: <PenTool size={22} />,
  progress: <Calendar size={22} />,
  materials: <ShieldCheck size={22} />,
  shield: <Shield size={22} />,
  team: <Users size={22} />,
  cost: <CircleDollarSign size={22} />,
  users: <Users size={22} />,
  experience: <Clock size={22} />,
  quality: <Award size={22} />,
  culture: <Heart size={22} />,
  project: <Briefcase size={22} />,
  satisfaction: <Award size={22} />,
  support: <Clock size={22} />,
};

const getIcon = (name?: string): React.ReactNode => {
  if (!name) return <Briefcase size={22} />;
  return iconMap[name.toLowerCase()] || <Briefcase size={22} />;
};

export function AboutPage({ config }: { config: AboutPageConfig }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: config.hero?.breadcrumbLabel || "Giới thiệu", url: "/gioi-thieu" },
    ]),
    buildAboutPageSchema(
      config.seo?.metaTitle || config.title,
      config.seo?.metaDescription || config.hero?.description
    ),
  ];

  const handlePrevTestimonial = () => {
    if (config.testimonials?.items?.length) {
      setActiveTestimonial((prev) =>
        prev === 0 ? config.testimonials.items.length - 1 : prev - 1
      );
    }
  };

  const handleNextTestimonial = () => {
    if (config.testimonials?.items?.length) {
      setActiveTestimonial((prev) =>
        prev === config.testimonials.items.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <>
      <SiteHeader />
      <JsonLd data={schemas} />
      <main className={styles.aboutPage}>
        {/* 2. Hero Section */}
        <section
          className={styles.hero}
          style={{ backgroundImage: `url(${config.hero?.backgroundImageUrl})` }}
        >
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <div className={styles.breadcrumb}>
                <a href="/">Trang chủ</a>
                <span>&gt;</span>
                <span className={styles.breadcrumbActive}>
                  {config.hero?.breadcrumbLabel || "Giới thiệu"}
                </span>
              </div>
              <h1 className={styles.heroTitle}>{config.hero?.title}</h1>
              <p className={styles.heroDesc}>{config.hero?.description}</p>
              <div className={styles.actions}>
                <a href={config.hero?.primaryCtaUrl} className={styles.btnPrimary}>
                  {config.hero?.primaryCtaLabel}
                </a>
                <a href={config.hero?.secondaryCtaUrl} className={styles.btnSecondary}>
                  {config.hero?.secondaryCtaLabel}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Intro Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.introGrid}>
              <div className={styles.introImageWrapper}>
                <img
                  src={config.intro?.imageUrl}
                  alt="Hà Thành Home interior"
                  className={styles.introImage}
                />
                <div className={styles.introBadge}>
                  <span className={styles.introBadgeVal}>10+ Năm</span>
                  <span className={styles.introBadgeLabel}>Kinh nghiệm thực tế</span>
                </div>
              </div>
              <div className={styles.introContent}>
                <span className={styles.eyebrow}>{config.intro?.eyebrow}</span>
                <h2>{config.intro?.title}</h2>
                <p className={styles.introText}>{config.intro?.description}</p>
                <ul className={styles.checklist}>
                  {config.intro?.checklist?.map((item, idx) => (
                    <li key={idx} className={styles.checklistItem}>
                      <Check className={styles.checkIcon} size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Identity Section (Vision, Mission, Core Values) */}
        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>GIÁ TRỊ CỐT LÕI</span>
              <h2 className={styles.sectionTitle}>{config.identity?.title}</h2>
            </div>
            <div className={styles.identityGrid}>
              {config.identity?.items?.map((item, idx) => (
                <div key={idx} className={styles.identityCard}>
                  <div className={styles.identityIconWrapper}>
                    {getIcon(item.icon)}
                  </div>
                  <h3 className={styles.identityCardTitle}>{item.title}</h3>
                  <p className={styles.identityCardDesc}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Why Choose Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>ƯU ĐIỂM VƯỢT TRỘI</span>
              <h2 className={styles.sectionTitle}>{config.whyChoose?.title}</h2>
            </div>
            <div className={styles.whyChooseGrid}>
              {config.whyChoose?.items?.map((item, idx) => (
                <div key={idx} className={styles.whyChooseCard}>
                  <div className={styles.whyChooseIconWrapper}>
                    {getIcon(item.icon)}
                  </div>
                  <div className={styles.whyChooseCardContent}>
                    <h3 className={styles.whyChooseCardTitle}>{item.title}</h3>
                    <p className={styles.whyChooseCardDesc}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Development Journey Section */}
        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>MỐC LỊCH SỬ</span>
              <h2 className={styles.sectionTitle}>{config.timeline?.title}</h2>
            </div>
            <div className={styles.timelineWrapper}>
              <div className={styles.timelineLine} />
              <div className={styles.timelineGrid}>
                {config.timeline?.items?.map((item, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <span className={styles.timelineYear}>{item.year}</span>
                    <h3 className={styles.timelineItemTitle}>{item.title}</h3>
                    <p className={styles.timelineItemDesc}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. People Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.peopleGrid}>
              <img
                src={config.people?.imageUrl}
                alt="Đội ngũ Hà Thành Home"
                className={styles.peopleImage}
              />
              <div className={styles.peopleContent}>
                <span className={styles.eyebrow}>{config.people?.eyebrow}</span>
                <h2>{config.people?.title}</h2>
                <p className={styles.peopleDesc}>{config.people?.description}</p>
                <div className={styles.highlightsGrid}>
                  {config.people?.highlights?.map((item, idx) => (
                    <div key={idx} className={styles.highlightItem}>
                      <div className={styles.highlightIcon}>
                        {getIcon(item.icon)}
                      </div>
                      <div className={styles.highlightItemContent}>
                        {item.value && (
                          <span className={styles.highlightVal}>{item.value}</span>
                        )}
                        <h3 className={styles.highlightTitle}>{item.title}</h3>
                        {item.description && (
                          <p className={styles.highlightDesc}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Stats Strip (Dark Green Background) */}
        <section className={styles.statsStrip}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              {config.stats?.map((stat, idx) => (
                <div key={idx} className={styles.statCard}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Strengths & Capacities Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>NĂNG LỰC TRIỂN KHAI</span>
              <h2 className={styles.sectionTitle}>{config.strengths?.title}</h2>
            </div>
            <div className={styles.strengthsGrid}>
              {config.strengths?.items?.map((item, idx) => (
                <div key={idx} className={styles.strengthCard}>
                  <div
                    className={styles.strengthBg}
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                  <div className={styles.strengthOverlay}>
                    <h3 className={styles.strengthTitle}>{item.title}</h3>
                    <p className={styles.strengthDesc}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Partners & Clients Section */}
        <section className={`${styles.section} ${styles.sectionLight}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>ĐỒNG HÀNH BỀN VỮNG</span>
              <h2 className={styles.sectionTitle}>{config.partners?.title}</h2>
            </div>
            <div className={styles.partnersGrid}>
              {config.partners?.items?.map((partner, idx) => (
                <a
                  key={idx}
                  href={partner.url || "#"}
                  target={partner.url ? "_blank" : undefined}
                  rel="noreferrer"
                  title={partner.name}
                >
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className={styles.partnerLogo}
                    />
                  ) : (
                    <span className={styles.partnerTextLogo}>{partner.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 11. Testimonials Section */}
        {config.testimonials?.items?.length ? (
          <section className={styles.section}>
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <span className={styles.eyebrow}>KHÁCH HÀNG</span>
                <h2 className={styles.sectionTitle}>{config.testimonials?.title}</h2>
              </div>
              <div className={styles.testimonialsWrapper}>
                <div className={styles.testimonialsGrid}>
                  {config.testimonials.items.map((item, idx) => (
                    <div key={idx} className={styles.testimonialCard}>
                      <div className={styles.testimonialClient}>
                        {item.avatarUrl && (
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            className={styles.clientAvatar}
                          />
                        )}
                        <div className={styles.clientMeta}>
                          <strong className={styles.clientName}>{item.name}</strong>
                          <span className={styles.clientLoc}>{item.location}</span>
                        </div>
                      </div>
                      <div className={styles.rating}>
                        {Array.from({ length: item.rating || 5 }).map((_, starIdx) => (
                          <Star key={starIdx} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <p className={styles.quote}>"{item.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* 12. Final CTA Section */}
        <section className={styles.finalCta}>
          <div className={styles.container}>
            <div
              className={styles.finalCtaBox}
              style={{ backgroundImage: `url(${config.finalCta?.backgroundImageUrl})` }}
            >
              <div className={styles.finalCtaContent}>
                <h2>{config.finalCta?.title}</h2>
                <p>{config.finalCta?.description}</p>
              </div>
              <div className={styles.finalCtaActions}>
                <a href={config.finalCta?.primaryUrl} className={styles.btnPrimary}>
                  {config.finalCta?.primaryLabel}
                </a>
                <a href={config.finalCta?.secondaryUrl} className={styles.btnSecondary}>
                  {config.finalCta?.secondaryLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
