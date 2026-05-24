export type AboutPageConfig = {
  slug: "gioi-thieu";
  title: string;
  isActive: boolean;

  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
  };

  hero: {
    breadcrumbLabel: string;
    eyebrow: string;
    title: string;
    description: string;
    backgroundImageUrl: string;
    primaryCtaLabel: string;
    primaryCtaUrl: string;
    secondaryCtaLabel: string;
    secondaryCtaUrl: string;
  };

  intro: {
    imageUrl: string;
    eyebrow: string;
    title: string;
    description: string;
    checklist: string[];
  };

  identity: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };

  whyChoose: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };

  timeline: {
    title: string;
    items: Array<{
      year: string;
      title: string;
      description: string;
    }>;
  };

  people: {
    imageUrl: string;
    eyebrow: string;
    title: string;
    description: string;
    highlights: Array<{
      icon: string;
      value?: string;
      title: string;
      description?: string;
    }>;
  };

  stats: Array<{
    icon?: string;
    value: string;
    label: string;
  }>;

  strengths: {
    title: string;
    items: Array<{
      imageUrl: string;
      title: string;
      description: string;
    }>;
  };

  partners: {
    title: string;
    items: Array<{
      name: string;
      logoUrl?: string;
      url?: string;
    }>;
  };

  testimonials: {
    title: string;
    items: Array<{
      name: string;
      location?: string;
      avatarUrl?: string;
      rating?: number;
      quote: string;
    }>;
  };

  finalCta: {
    title: string;
    description: string;
    backgroundImageUrl?: string;
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
  };
};
