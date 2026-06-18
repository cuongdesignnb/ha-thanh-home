import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, Inter, Playfair_Display, Roboto } from "next/font/google";
import { ConstructionEstimatorWidget } from "@/components/construction-estimator-widget";
import { ContactWidget } from "@/components/contact-widget";
import { JsonLd } from "@/components/seo/json-ld";
import { ThemeRuntimeSync } from "@/components/theme-runtime-sync";
import { getSiteSettings, type SiteTheme } from "@/lib/api";
import { buildOrganizationSchema, buildLocalBusinessSchema, buildWebSiteSchema } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/seo/site";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

const body = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "Hà Thành Home | Thiết kế - Thi công - Nội thất",
    template: "%s | Hà Thành Home",
  },
  description:
    "Hà Thành Home mang đến giải pháp thiết kế kiến trúc, thi công công trình và nội thất trọn gói cho nhà ở, biệt thự, văn phòng và showroom.",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: "Hà Thành Home | Thiết kế - Thi công - Nội thất",
    description: "Kiến tạo không gian sống và công trình đẳng cấp.",
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hà Thành Home | Thiết kế - Thi công - Nội thất",
    description: "Kiến tạo không gian sống và công trình đẳng cấp.",
    images: [siteConfig.defaultOgImage],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteConfig.url },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const headingFonts: Record<string, string> = {
  cormorant: "var(--font-heading), Georgia, serif",
  playfair: "var(--font-playfair), Georgia, serif",
  roboto: "var(--font-roboto), Roboto, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

const bodyFonts: Record<string, string> = {
  inter: "var(--font-body), Inter, system-ui, sans-serif",
  beVietnam: "var(--font-be-vietnam), 'Be Vietnam Pro', system-ui, sans-serif",
  roboto: "var(--font-roboto), Roboto, system-ui, sans-serif",
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

function color(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function containerMax(value: unknown) {
  if (typeof value !== "string") return "1500px";
  const parsed = Number(value.replace("px", ""));
  return Number.isFinite(parsed) && parsed >= 1180 && parsed <= 1680 ? `${parsed}px` : "1500px";
}

function themeCss(theme: SiteTheme = {}) {
  const headingFont = headingFonts[theme.headingFont || "cormorant"] || headingFonts.cormorant;
  const bodyFont = bodyFonts[theme.bodyFont || "inter"] || bodyFonts.inter;
  return `:root{
    --green:${color(theme.forestGreen, "#0f3d2e")};
    --green-deep:${color(theme.forestGreen, "#0b3026")};
    --gold:${color(theme.gold, "#c99a4a")};
    --cream:${color(theme.cream, "#f8f5ef")};
    --charcoal:${color(theme.charcoal, "#1e1e1e")};
    --heading:${color(theme.headingColor, "#183b2d")};
    --muted:${color(theme.mutedColor, "#6b6b63")};
    --line:${color(theme.lineColor, "#e8ddca")};
    --site-heading-font:${headingFont};
    --site-body-font:${bodyFont};
    --container-max:${containerMax(theme.containerMax)};
  }`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html lang="vi" className={`${heading.variable} ${body.variable} ${playfair.variable} ${beVietnam.variable} ${roboto.variable}`}>
      <head>
        <style id="hathanh-theme" dangerouslySetInnerHTML={{ __html: themeCss(settings["site.theme"]) }} />
        {settings["site.identity"]?.faviconUrl ? (
          <link rel="icon" href={settings["site.identity"].faviconUrl} />
        ) : null}
      </head>
      <body>
        <ThemeRuntimeSync />
        <JsonLd data={[
          buildOrganizationSchema(),
          buildLocalBusinessSchema(),
          buildWebSiteSchema(),
        ]} />
        {children}
        <ConstructionEstimatorWidget initialHotline={settings["site.identity"]?.hotline || "0898 502 333"} />
        <ContactWidget identity={settings["site.identity"]} />
      </body>
    </html>
  );
}
