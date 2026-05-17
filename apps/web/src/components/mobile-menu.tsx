"use client";

import { Calculator, Menu, PhoneCall, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { MenuItem } from "@/lib/api";

export function MobileMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  return (
    <div className="mobile-menu-shell">
      <button className="mobile-menu-toggle" type="button" onClick={() => setOpen(true)} aria-label="Mở menu">
        <Menu size={22} />
        <span>Menu</span>
      </button>
      <button className={`mobile-menu-backdrop ${open ? "open" : ""}`} type="button" aria-label="Đóng menu" onClick={() => setOpen(false)} />
      <aside className={`mobile-float-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobile-float-head">
          <div>
            <strong>Hà Thành Home</strong>
            <span>Thiết kế - Thi công - Nội thất</span>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={20} /></button>
        </div>
        <nav className="mobile-float-links" aria-label="Menu mobile">
          {items.map((item) => <MobileMenuItem item={item} key={item.id} onNavigate={() => setOpen(false)} />)}
        </nav>
        <div className="mobile-float-actions">
          <a href="#du-toan" data-estimator-open onClick={() => setOpen(false)}><Calculator size={17} /> Dự toán</a>
          <a href="/lien-he" onClick={() => setOpen(false)}><PhoneCall size={17} /> Nhận tư vấn</a>
        </div>
      </aside>
    </div>
  );
}

function MobileMenuItem({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  return (
    <div className="mobile-float-item">
      <a href={item.url} rel={item.rel || undefined} target={item.target === "blank" ? "_blank" : undefined} onClick={onNavigate}>{item.label}</a>
      {item.children?.length ? (
        <div>
          {item.children.map((child) => <MobileMenuItem item={child} key={child.id} onNavigate={onNavigate} />)}
        </div>
      ) : null}
    </div>
  );
}
