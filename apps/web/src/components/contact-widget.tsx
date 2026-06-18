"use client";

import { useEffect, useState } from "react";
import { Calculator, Home, MessageCircle, Phone } from "lucide-react";
import { type SiteIdentity } from "@/lib/api";

type ContactWidgetProps = {
  identity?: SiteIdentity;
};

export function ContactWidget({ identity }: ContactWidgetProps) {
  const [path, setPath] = useState("/");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  if (!identity) return null;

  const {
    hotline = "0898 502 333",
    zalo = "",
    zaloIconUrl = "",
    phoneIconUrl = "",
    zaloLabel = "Chat Zalo",
    phoneLabel = "Gọi điện",
  } = identity;

  const zaloUrl = zalo
    ? zalo.trim().startsWith("http")
      ? zalo.trim()
      : `https://zalo.me/${zalo.trim().replace(/\D/g, "")}`
    : "";
  const phoneUrl = hotline ? `tel:${hotline.trim().replace(/\s/g, "")}` : "";

  // SVGs for PC floating fallbacks (beautiful custom SVGs inside circles)
  const renderZaloIcon = (size = 28) => {
    if (zaloIconUrl) {
      return (
        <img
          src={zaloIconUrl}
          alt={zaloLabel}
          style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain" }}
        />
      );
    }
    return (
      <div className="zalo-fallback-circle" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", borderRadius: "50%", background: "#0068FF" }}>
        <span style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: "bold", fontFamily: "system-ui, sans-serif" }}>Z</span>
      </div>
    );
  };

  const renderPhoneIcon = (size = 26) => {
    if (phoneIconUrl) {
      return (
        <img
          src={phoneIconUrl}
          alt={phoneLabel}
          style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain" }}
        />
      );
    }
    return (
      <div className="phone-fallback-circle" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", borderRadius: "50%", background: "#4CAF50" }}>
        <Phone size={size - 6} strokeWidth={2.5} style={{ color: "#FFFFFF" }} />
      </div>
    );
  };

  return (
    <>
      {/* PC Floating Buttons (hidden on mobile via CSS) */}
      <div className="pc-contact-float" aria-label="Liên hệ nhanh">
        {phoneUrl && (
          <a href={phoneUrl} className="pc-float-btn phone-btn" title={`${phoneLabel}: ${hotline}`}>
            <span className="pulse-ring green"></span>
            <div className="btn-icon-wrapper">
              {renderPhoneIcon(26)}
            </div>
            <span className="float-btn-label">{phoneLabel}</span>
          </a>
        )}
        {zaloUrl && (
          <a href={zaloUrl} target="_blank" rel="noreferrer" className="pc-float-btn zalo-btn" title={zaloLabel}>
            <span className="pulse-ring blue"></span>
            <div className="btn-icon-wrapper">
              {renderZaloIcon(28)}
            </div>
            <span className="float-btn-label">{zaloLabel}</span>
          </a>
        )}
      </div>

      {/* Mobile Sticky Footer Bar (hidden on PC via CSS) */}
      <nav className="mobile-bottom-cta" aria-label="Tác vụ nhanh">
        <a className={path === "/" ? "active" : ""} href="/">
          <Home size={21} />
          <span>Trang chủ</span>
        </a>
        <button type="button" data-estimator-open>
          <Calculator size={21} />
          <span>Dự toán</span>
        </button>
        {zaloUrl && (
          <a href={zaloUrl} target="_blank" rel="noreferrer">
            {zaloIconUrl ? (
              <img src={zaloIconUrl} alt={zaloLabel} style={{ width: "21px", height: "21px", objectFit: "contain" }} />
            ) : (
              <MessageCircle size={21} />
            )}
            <span>Zalo</span>
          </a>
        )}
        {phoneUrl && (
          <a href={phoneUrl}>
            {phoneIconUrl ? (
              <img src={phoneIconUrl} alt={phoneLabel} style={{ width: "21px", height: "21px", objectFit: "contain" }} />
            ) : (
              <Phone size={21} />
            )}
            <span>{phoneLabel}</span>
          </a>
        )}
      </nav>
    </>
  );
}
