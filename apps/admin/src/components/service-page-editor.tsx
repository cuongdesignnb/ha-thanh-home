"use client";

import { useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { getWebBaseUrl, type ServicePageRegistryItem, type ServicePageStatus } from "@/lib/service-page-registry";
import { XayNhaTronGoiEditor } from "@/components/xay-nha-tron-goi-editor";

const STATUS_LABEL: Record<ServicePageStatus, string> = {
  existing: "Đã có route",
  next: "Phase kế tiếp",
  planned: "Đang lên kế hoạch",
};

type Section = { key: string; label: string; description: string };

const SECTIONS: Section[] = [
  { key: "seo", label: "SEO & Open Graph", description: "Meta title, description, canonical, og image cho trang." },
  { key: "hero", label: "Hero", description: "Tiêu đề lớn, mô tả, ảnh nền và CTA chính/phụ." },
  { key: "benefits", label: "Dải lợi ích", description: "Các icon nhỏ thể hiện cam kết / lợi ích cốt lõi." },
  { key: "intro", label: "Giới thiệu 2 cột", description: "Ảnh + nội dung giới thiệu, checklist tóm tắt." },
  { key: "scopeItems", label: "Phạm vi công việc", description: "Grid hạng mục công việc kèm icon, mô tả ngắn." },
  { key: "processSteps", label: "Quy trình triển khai", description: "Các bước thực hiện, đánh số rõ ràng." },
  { key: "relatedProjects", label: "Dự án tiêu biểu", description: "Khối hiển thị dự án liên quan (group/category/manual)." },
  { key: "pricing", label: "Dự toán chi phí", description: "Bảng giá / gói dịch vụ dạng tabs." },
  { key: "quoteForm", label: "Form nhận báo giá", description: "Form thu lead với các field tùy chọn." },
  { key: "whyChooseItems", label: "Vì sao chọn Hà Thành Home", description: "Lý do lựa chọn, USP." },
  { key: "stats", label: "Stats", description: "Con số nổi bật (năm kinh nghiệm, dự án...)." },
  { key: "testimonials", label: "Testimonials", description: "Cảm nhận khách hàng, ảnh, đánh giá." },
  { key: "faqs", label: "FAQ", description: "Câu hỏi thường gặp dạng accordion." },
  { key: "finalCta", label: "Final CTA", description: "Khối kêu gọi hành động cuối trang." },
];

export function ServicePageEditor({ page, roles }: { page: ServicePageRegistryItem; roles: string[] }) {
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].key);
  const webBase = getWebBaseUrl();
  const activeSectionMeta = SECTIONS.find((s) => s.key === activeSection);
  const hasDedicatedEditor = page.slug === "xay-nha-tron-goi";

  return (
    <section className="service-page-editor">
      <article className="panel">
        <header className="service-page-editor-head">
          <div className="service-page-editor-head-left">
            <span className={`service-page-status status-${page.status}`}>{STATUS_LABEL[page.status]}</span>
            <h2>{page.label}</h2>
            <p className="muted">{page.description}</p>
            <div className="service-page-editor-meta">
              <code>{page.route}</code>
              <span className="muted">setting key: {page.settingKey}</span>
            </div>
          </div>
          <div className="service-page-editor-head-actions">
            <a className="secondary-button" href={`${webBase}${page.route}`} target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Xem website
            </a>
            {!hasDedicatedEditor ? (
              <button className="primary-button" type="button" disabled title="Form lưu sẽ có ở phase sau">
                <Save size={16} /> Lưu thay đổi
              </button>
            ) : null}
          </div>
        </header>

        {hasDedicatedEditor && page.slug === "xay-nha-tron-goi" ? (
          <XayNhaTronGoiEditor roles={roles} />
        ) : (
        <div className="service-page-editor-body">
          <nav className="service-page-section-list" aria-label="Sections">
            {SECTIONS.map((section) => (
              <button
                key={section.key}
                className={`service-page-section-item ${activeSection === section.key ? "active" : ""}`}
                onClick={() => setActiveSection(section.key)}
                type="button"
              >
                <strong>{section.label}</strong>
                <small>{section.description}</small>
              </button>
            ))}
          </nav>

          <div className="service-page-section-form">
            <div className="service-page-section-form-head">
              <h3>{activeSectionMeta?.label}</h3>
              <p className="muted">{activeSectionMeta?.description}</p>
            </div>
            <div className="service-page-section-form-body">
              <div className="empty-state">
                <strong>Form cấu hình section sẽ có ở phase sau</strong>
                <small>Phase 1 chỉ scaffold UI editor. Phase 2 sẽ thêm form chi tiết (hero text/image, benefits items, FAQ list…) lưu vào Setting JSON tại <code>{page.settingKey}</code>.</small>
              </div>
            </div>
          </div>
        </div>
        )}
      </article>
    </section>
  );
}
