"use client";

import { ExternalLink, Settings } from "lucide-react";
import { SERVICE_PAGE_REGISTRY, getWebBaseUrl, type ServicePageStatus } from "@/lib/service-page-registry";

const STATUS_LABEL: Record<ServicePageStatus, string> = {
  existing: "Đã có route",
  next: "Phase kế tiếp",
  planned: "Đang lên kế hoạch",
};

export function ServicePagesPanel() {
  const webBase = getWebBaseUrl();

  return (
    <section className="service-pages-panel">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <h2>Cấu hình trang dịch vụ</h2>
            <p>Quản lý các landing page dịch vụ cố định, không dùng đăng dịch vụ động.</p>
          </div>
        </div>

        <div className="service-page-card-grid">
          {SERVICE_PAGE_REGISTRY.map((item) => (
            <article className={`service-page-card status-${item.status}`} key={item.slug}>
              <span className={`service-page-status status-${item.status}`}>{STATUS_LABEL[item.status]}</span>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
              <code>{item.route}</code>
              <small>setting key: {item.settingKey}</small>
              <div className="service-page-card-actions">
                <a className="secondary-button" href={`${webBase}${item.route}`} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Xem website
                </a>
                <button className="secondary-button" type="button" disabled title="Sẽ mở form cấu hình section ở phase sau">
                  <Settings size={16} /> Cấu hình section · phase sau
                </button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
