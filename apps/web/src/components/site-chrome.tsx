import { Building2, Facebook, Mail, MapPin, Phone, PhoneCall } from "lucide-react";
import { MobileMenu } from "@/components/mobile-menu";
import { getMenu, getSiteSettings, type MenuItem } from "@/lib/api";

const defaultIdentity = {
  name: "Hà Thành Home",
  tagline: "Thiết kế - Thi công - Nội thất",
  hotline: "0898 502 333",
  email: "info@hathanhhome.vn",
  address: "Hà Nội, Việt Nam",
  facebook: "",
  zalo: "",
  workingHours: "08:00 - 18:00, Thứ 2 - Thứ 7",
};

export async function SiteHeader() {
  const [menu, settings] = await Promise.all([getMenu("header"), getSiteSettings()]);
  const identity = { ...defaultIdentity, ...(settings["site.identity"] || {}) };
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="/">
          {identity.logoUrl ? (
            <img src={identity.logoUrl} alt={identity.name} style={{ height: "45px", width: "auto", objectFit: "contain", display: "block" }} />
          ) : (
            <>
              <Building2 className="brand-mark" strokeWidth={1.5} />
              <span>
                <span className="brand-name">{identity.name}</span>
                <span className="brand-tagline">{identity.tagline}</span>
              </span>
            </>
          )}
        </a>
        <nav className="nav" aria-label="Menu chính">
          {menu.items.map((item) => <HeaderMenuItem item={item} key={item.id} />)}
        </nav>
        <div className="header-actions">
          <a className="header-estimator" href="#du-toan" data-estimator-open>Dự toán</a>
          <a className="header-cta" href="/lien-he"><PhoneCall size={18} /> Nhận tư vấn</a>
        </div>
        <MobileMenu items={menu.items} />
      </div>
    </header>
  );
}

function HeaderMenuItem({ item }: { item: MenuItem }) {
  const children = item.children || [];
  return (
    <div className={`nav-item ${children.length ? "has-children" : ""}`}>
      <a href={item.url} rel={item.rel || undefined} target={item.target === "blank" ? "_blank" : undefined}>{item.label}</a>
      {children.length ? (
        <div className="nav-dropdown">
          {children.map((child) => <HeaderMenuItem item={child} key={child.id} />)}
        </div>
      ) : null}
    </div>
  );
}

export async function SiteFooter() {
  const [footerMenu, settings] = await Promise.all([getMenu("footer"), getSiteSettings()]);
  const identity = { ...defaultIdentity, ...(settings["site.identity"] || {}) };
  return (
    <footer className="footer" id="lead">
      <div className="container footer-top">
        <div className="footer-brand">
          <a className="footer-logo" href="/">
            {identity.logoUrl ? (
              <img src={identity.logoUrl} alt={identity.name} style={{ height: "48px", width: "auto", objectFit: "contain", display: "block", marginBottom: "8px" }} />
            ) : (
              <>
                <Building2 strokeWidth={1.5} />
                <span>{identity.name}</span>
              </>
            )}
          </a>
          <p>{identity.tagline} chuyên nghiệp, kiến tạo không gian sống và công trình đẳng cấp.</p>
          <div className="footer-socials">
            {identity.facebook ? <a aria-label="Facebook" href={identity.facebook} target="_blank" rel="noreferrer"><Facebook size={18} /></a> : null}
            {identity.zalo ? <a aria-label="Zalo" href={identity.zalo} target="_blank" rel="noreferrer">Zalo</a> : null}
          </div>
        </div>
        <div className="footer-contact-card">
          <h4>Thông tin liên hệ</h4>
          <a href={`tel:${String(identity.hotline || "").replace(/\s/g, "")}`}><Phone size={16} /> {identity.hotline}</a>
          <a href={`mailto:${identity.email}`}><Mail size={16} /> {identity.email}</a>
          <p><MapPin size={16} /> {identity.address}</p>
          {identity.workingHours ? <p>{identity.workingHours}</p> : null}
        </div>
        <div className="footer-menu-grid">
          {footerMenu.items.map((item) => (
            <div className="footer-menu-col" key={item.id}>
              <h4><a href={item.url} rel={item.rel || undefined} target={item.target === "blank" ? "_blank" : undefined}>{item.label}</a></h4>
              <FooterLinks items={item.children || []} />
            </div>
          ))}
        </div>
      </div>
      <div className="container copyright">© 2026 {identity.name}. All rights reserved.</div>
    </footer>
  );
}

function FooterLinks({ items }: { items: MenuItem[] }) {
  return (
    <>
      {items.map((item) => (
        <span className="footer-link-group" key={item.id}>
          <a href={item.url} rel={item.rel || undefined} target={item.target === "blank" ? "_blank" : undefined}>{item.label}</a>
          {item.children?.length ? <FooterLinks items={item.children} /> : null}
        </span>
      ))}
    </>
  );
}
