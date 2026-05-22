export type ServicePageGroup = "construction" | "interior" | "xay_nha_tron_goi";

export type ServicePageRelatedTab = {
  label: string;
  key: string;
  group?: ServicePageGroup;
  categoryIds?: number[];
  projectIds?: number[];
};

export type ServicePagePricingTab = {
  label: string;
  key: string;
  imageUrl?: string;
  priceText?: string;
  items?: string[];
};

export type ServicePageConfig = {
  slug: string;
  title: string;
  isActive: boolean;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };

  hero: {
    eyebrow?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    primaryCtaLabel?: string;
    primaryCtaUrl?: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
  };

  benefits: Array<{ icon?: string; title: string; description?: string }>;

  intro: {
    eyebrow?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    checklist?: string[];
  };

  scopeItems: Array<{ icon?: string; title: string; description?: string }>;

  processSteps: Array<{ number?: string; title: string; description?: string }>;

  relatedProjects?: {
    title?: string;
    group?: ServicePageGroup;
    categoryIds?: number[];
    categorySlugs?: string[];
    projectIds?: number[];
    limit?: number;
    mode?: "latest" | "featured" | "manual" | "category";
    tabs?: ServicePageRelatedTab[];
  };

  pricing?: {
    enabled: boolean;
    title?: string;
    description?: string;
    tabs?: ServicePagePricingTab[];
  };

  quoteForm?: {
    enabled: boolean;
    title?: string;
    description?: string;
    fields?: string[];
  };

  whyChooseItems?: Array<{ icon?: string; title: string; description?: string }>;

  stats?: Array<{ value: string; label: string }>;

  testimonials?: Array<{
    name: string;
    project?: string;
    avatarUrl?: string;
    rating?: number;
    quote: string;
  }>;

  faqs: Array<{ question: string; answer: string }>;

  finalCta: {
    eyebrow?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    primaryLabel?: string;
    primaryUrl?: string;
    secondaryLabel?: string;
    secondaryUrl?: string;
  };
};
