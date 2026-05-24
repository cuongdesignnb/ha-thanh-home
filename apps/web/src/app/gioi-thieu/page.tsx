import type { Metadata } from "next";
import { getAboutPageConfig } from "@/lib/api";
import { buildMetadata } from "@/lib/seo/metadata";
import { AboutPage } from "@/components/pages/about-page";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAboutPageConfig();
  return buildMetadata({
    title: config.seo?.metaTitle || config.title,
    description: config.seo?.metaDescription || config.hero?.description,
    path: "/gioi-thieu",
    canonicalUrl: config.seo?.canonicalUrl,
    image: config.seo?.ogImage || config.hero?.backgroundImageUrl,
    noIndex: config.seo?.noIndex,
  });
}

export default async function GioiThieuPage() {
  const config = await getAboutPageConfig();

  return <AboutPage config={config} />;
}
