"use client";

import { useEffect } from "react";
import type { SiteTheme } from "@/lib/api";

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

function applyTheme(theme: SiteTheme) {
  let style = document.getElementById("hathanh-theme");
  if (!style) {
    style = document.createElement("style");
    style.id = "hathanh-theme";
    document.head.appendChild(style);
  }
  style.textContent = themeCss(theme);
}

export function ThemeRuntimeSync() {
  useEffect(() => {
    let cancelled = false;

    async function syncTheme() {
      try {
        const response = await fetch("/api/site-settings", { cache: "no-store" });
        if (!response.ok) return;
        const settings = await response.json();
        if (!cancelled) applyTheme(settings["site.theme"] || {});
      } catch {
        // Keep the server-rendered theme if runtime sync cannot reach the API.
      }
    }

    syncTheme();

    const onFocus = () => syncTheme();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") syncTheme();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
