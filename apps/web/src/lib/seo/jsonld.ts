import { siteConfig, absoluteUrl, absoluteImageUrl } from "./site";

/* ------------------------------------------------------------------ */
/*  Global schemas (rendered once in root layout)                      */
/* ------------------------------------------------------------------ */

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: siteConfig.logo,
    description: siteConfig.description,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry,
    },
    sameAs: siteConfig.sameAs,
  };
}

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    image: siteConfig.defaultOgImage,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry,
    },
    areaServed: siteConfig.areaServed,
    priceRange: siteConfig.priceRange,
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "vi-VN",
  };
}

/* ------------------------------------------------------------------ */
/*  Per-page schemas                                                   */
/* ------------------------------------------------------------------ */

export type BreadcrumbItem = { name: string; url: string };

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function buildWebPageSchema(input: {
  name: string;
  description?: string;
  url: string;
  type?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "vi-VN",
  };
}

export function buildServiceSchema(input: {
  name: string;
  description?: string;
  url: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(input.url)}#service`,
    name: input.name,
    description: input.description,
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: siteConfig.areaServed,
    serviceType: input.serviceType,
    url: absoluteUrl(input.url),
  };
}

export function buildFAQSchema(
  items?: { question?: string; answer?: string }[] | null,
) {
  if (!items || !items.length) return null;
  const validItems = items.filter(
    (faq): faq is { question: string; answer: string } =>
      Boolean(faq.question && faq.answer),
  );
  if (!validItems.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildItemListSchema(
  items: { name: string; url: string; position?: number }[],
) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function buildArticleSchema(post: {
  title: string;
  excerpt?: string | null;
  metaDescription?: string | null;
  slug: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  thumbnailMedia?: { webpUrl?: string | null; mediumUrl?: string | null; largeUrl?: string | null } | null;
}) {
  const imageUrl = absoluteImageUrl(
    post.thumbnailMedia?.largeUrl ||
    post.thumbnailMedia?.mediumUrl ||
    post.thumbnailMedia?.webpUrl,
  );
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.metaDescription || undefined,
    image: imageUrl,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: absoluteUrl(`/tin-tuc/${post.slug}`),
    inLanguage: "vi-VN",
  };
}

export function buildProjectSchema(project: {
  title: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  area?: string | null;
  scale?: string | null;
  style?: string | null;
  year?: number | null;
  thumbnailMedia?: { webpUrl?: string | null; mediumUrl?: string | null; largeUrl?: string | null } | null;
}) {
  const imageUrl = absoluteImageUrl(
    project.thumbnailMedia?.largeUrl ||
    project.thumbnailMedia?.mediumUrl ||
    project.thumbnailMedia?.webpUrl,
  );
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description || undefined,
    image: imageUrl,
    url: absoluteUrl(`/du-an/${project.slug}`),
    creator: { "@id": `${siteConfig.url}/#organization` },
    locationCreated: project.location
      ? { "@type": "Place", name: project.location }
      : undefined,
    inLanguage: "vi-VN",
  };
}

export function buildImageObjectSchema(imageUrl: string, caption?: string) {
  return {
    "@type": "ImageObject",
    url: absoluteImageUrl(imageUrl),
    caption: caption || undefined,
    contentUrl: absoluteImageUrl(imageUrl),
  };
}

export function buildContactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Liên hệ Hà Thành Home",
    description: "Đặt lịch tư vấn thiết kế kiến trúc, thi công công trình và nội thất cùng Hà Thành Home.",
    url: absoluteUrl("/lien-he"),
    mainEntity: { "@id": `${siteConfig.url}/#localbusiness` },
  };
}

export function buildAboutPageSchema(name: string, description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${siteConfig.url}/gioi-thieu#about`,
    "url": absoluteUrl("/gioi-thieu"),
    "name": name,
    "description": description,
    "isPartOf": {
      "@id": `${siteConfig.url}/#website`
    },
    "about": {
      "@id": `${siteConfig.url}/#organization`
    },
    "inLanguage": "vi-VN"
  };
}

