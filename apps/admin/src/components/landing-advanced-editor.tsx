"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Fragment } from "react";

export type AdvancedItem = { title?: string; description?: string };
export type AdvancedProcessStep = { number?: string; title?: string; description?: string };
export type AdvancedTestimonial = { name?: string; project?: string; quote?: string };
export type AdvancedFaq = { question?: string; answer?: string };
export type AdvancedPricingTab = { key?: string; label?: string; priceText?: string; items?: string[] };

export type LandingAdvancedData = {
  introChecklist?: string[];
  benefits?: AdvancedItem[];
  scopeItems?: AdvancedItem[];
  processSteps?: AdvancedProcessStep[];
  whyChooseItems?: AdvancedItem[];
  stats?: AdvancedItem[];
  testimonials?: AdvancedTestimonial[];
  faqs?: AdvancedFaq[];
  pricingTabs?: AdvancedPricingTab[];
};

export function LandingAdvancedEditor({
  value,
  onChange,
  includePricingTabs = false,
}: {
  value: LandingAdvancedData;
  onChange: (next: LandingAdvancedData) => void;
  includePricingTabs?: boolean;
}) {
  function patch<K extends keyof LandingAdvancedData>(key: K, next: LandingAdvancedData[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="landing-advanced">
      <ChecklistEditor value={value.introChecklist || []} onChange={(v) => patch("introChecklist", v)} />
      <IconTextRepeater label="Lợi ích (Benefits)" icon="✨" value={value.benefits || []} onChange={(v) => patch("benefits", v)} />
      <IconTextRepeater label="Phạm vi công việc (Scope items)" icon="🛠️" value={value.scopeItems || []} onChange={(v) => patch("scopeItems", v)} />
      <ProcessStepsRepeater value={value.processSteps || []} onChange={(v) => patch("processSteps", v)} />
      <IconTextRepeater label="Vì sao chọn (Why choose)" icon="⭐" value={value.whyChooseItems || []} onChange={(v) => patch("whyChooseItems", v)} />
      <StatsRepeater value={value.stats || []} onChange={(v) => patch("stats", v)} />
      <TestimonialsRepeater value={value.testimonials || []} onChange={(v) => patch("testimonials", v)} />
      <FaqsRepeater value={value.faqs || []} onChange={(v) => patch("faqs", v)} />
      {includePricingTabs ? <PricingTabsRepeater value={value.pricingTabs || []} onChange={(v) => patch("pricingTabs", v)} /> : null}
    </div>
  );
}

function Section({ label, icon, count, children }: { label: string; icon?: string; count: number; children: React.ReactNode }) {
  return (
    <details className="landing-section" open={count > 0 && count < 6}>
      <summary>
        <span className="landing-section-summary">
          {icon ? <span className="landing-section-icon">{icon}</span> : null}
          <strong>{label}</strong>
          <span className="landing-section-count">{count} mục</span>
        </span>
        <ChevronDown size={16} className="landing-section-chev" />
      </summary>
      <div className="landing-section-body">{children}</div>
    </details>
  );
}

function RepeaterActions({ onAdd, addLabel }: { onAdd: () => void; addLabel: string }) {
  return (
    <div className="landing-repeater-actions">
      <button type="button" className="secondary-button" onClick={onAdd}>
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

function RowDelete({ onDelete }: { onDelete: () => void }) {
  return (
    <button type="button" className="landing-row-delete" onClick={onDelete} title="Xoá mục này" aria-label="Xoá">
      <Trash2 size={14} />
    </button>
  );
}

function ChecklistEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function add() { onChange([...value, ""]); }
  function update(i: number, v: string) { const next = [...value]; next[i] = v; onChange(next); }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  return (
    <Section label="Checklist phần giới thiệu" icon="✅" count={value.length}>
      {value.map((item, i) => (
        <div className="landing-row" key={i}>
          <input value={item} onChange={(e) => update(i, e.target.value)} placeholder="Một dòng checklist" />
          <RowDelete onDelete={() => remove(i)} />
        </div>
      ))}
      <RepeaterActions onAdd={add} addLabel="Thêm dòng checklist" />
    </Section>
  );
}

function IconTextRepeater({ label, icon, value, onChange }: { label: string; icon?: string; value: AdvancedItem[]; onChange: (v: AdvancedItem[]) => void }) {
  function add() { onChange([...value, { title: "", description: "" }]); }
  function update(i: number, field: keyof AdvancedItem, v: string) {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  return (
    <Section label={label} icon={icon} count={value.length}>
      {value.map((item, i) => (
        <div className="landing-card-row" key={i}>
          <div className="landing-card-grid">
            <label>Tiêu đề<input value={item.title || ""} onChange={(e) => update(i, "title", e.target.value)} placeholder="Vd: Thiết kế đồng bộ" /></label>
            <label>Mô tả<input value={item.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Mô tả ngắn (tùy chọn)" /></label>
          </div>
          <RowDelete onDelete={() => remove(i)} />
        </div>
      ))}
      <RepeaterActions onAdd={add} addLabel="Thêm mục" />
    </Section>
  );
}

function ProcessStepsRepeater({ value, onChange }: { value: AdvancedProcessStep[]; onChange: (v: AdvancedProcessStep[]) => void }) {
  function add() {
    const nextNum = String(value.length + 1).padStart(2, "0");
    onChange([...value, { number: nextNum, title: "", description: "" }]);
  }
  function update(i: number, field: keyof AdvancedProcessStep, v: string) {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  return (
    <Section label="Quy trình (Process steps)" icon="🔢" count={value.length}>
      {value.map((item, i) => (
        <div className="landing-card-row" key={i}>
          <div className="landing-card-grid landing-grid-3">
            <label>Số bước<input value={item.number || ""} onChange={(e) => update(i, "number", e.target.value)} placeholder="01" /></label>
            <label>Tiêu đề<input value={item.title || ""} onChange={(e) => update(i, "title", e.target.value)} placeholder="Tư vấn & khảo sát" /></label>
            <label>Mô tả<input value={item.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Mô tả bước" /></label>
          </div>
          <RowDelete onDelete={() => remove(i)} />
        </div>
      ))}
      <RepeaterActions onAdd={add} addLabel="Thêm bước" />
    </Section>
  );
}

function StatsRepeater({ value, onChange }: { value: AdvancedItem[]; onChange: (v: AdvancedItem[]) => void }) {
  function add() { onChange([...value, { title: "", description: "" }]); }
  function update(i: number, field: keyof AdvancedItem, v: string) {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  return (
    <Section label="Thống kê (Stats)" icon="📊" count={value.length}>
      {value.map((item, i) => (
        <div className="landing-card-row" key={i}>
          <div className="landing-card-grid">
            <label>Giá trị<input value={item.title || ""} onChange={(e) => update(i, "title", e.target.value)} placeholder="10+" /></label>
            <label>Nhãn<input value={item.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Năm kinh nghiệm" /></label>
          </div>
          <RowDelete onDelete={() => remove(i)} />
        </div>
      ))}
      <RepeaterActions onAdd={add} addLabel="Thêm stat" />
    </Section>
  );
}

function TestimonialsRepeater({ value, onChange }: { value: AdvancedTestimonial[]; onChange: (v: AdvancedTestimonial[]) => void }) {
  function add() { onChange([...value, { name: "", project: "", quote: "" }]); }
  function update(i: number, field: keyof AdvancedTestimonial, v: string) {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  return (
    <Section label="Khách hàng (Testimonials)" icon="💬" count={value.length}>
      {value.map((item, i) => (
        <div className="landing-card-row" key={i}>
          <div className="landing-card-grid landing-grid-3">
            <label>Tên khách hàng<input value={item.name || ""} onChange={(e) => update(i, "name", e.target.value)} placeholder="Anh Nguyễn Văn A" /></label>
            <label>Dự án / Công ty<input value={item.project || ""} onChange={(e) => update(i, "project", e.target.value)} placeholder="Giám đốc - Công ty ABC" /></label>
            <label>Trích dẫn<textarea value={item.quote || ""} onChange={(e) => update(i, "quote", e.target.value)} rows={2} placeholder="Khách hàng nói gì..." /></label>
          </div>
          <RowDelete onDelete={() => remove(i)} />
        </div>
      ))}
      <RepeaterActions onAdd={add} addLabel="Thêm khách hàng" />
    </Section>
  );
}

function FaqsRepeater({ value, onChange }: { value: AdvancedFaq[]; onChange: (v: AdvancedFaq[]) => void }) {
  function add() { onChange([...value, { question: "", answer: "" }]); }
  function update(i: number, field: keyof AdvancedFaq, v: string) {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  return (
    <Section label="Câu hỏi thường gặp (FAQ)" icon="❓" count={value.length}>
      {value.map((item, i) => (
        <div className="landing-card-row" key={i}>
          <div className="landing-card-grid">
            <label>Câu hỏi<input value={item.question || ""} onChange={(e) => update(i, "question", e.target.value)} placeholder="Câu hỏi của khách" /></label>
            <label>Trả lời<textarea value={item.answer || ""} onChange={(e) => update(i, "answer", e.target.value)} rows={3} placeholder="Câu trả lời chi tiết" /></label>
          </div>
          <RowDelete onDelete={() => remove(i)} />
        </div>
      ))}
      <RepeaterActions onAdd={add} addLabel="Thêm câu hỏi" />
    </Section>
  );
}

function PricingTabsRepeater({ value, onChange }: { value: AdvancedPricingTab[]; onChange: (v: AdvancedPricingTab[]) => void }) {
  function add() { onChange([...value, { key: "", label: "", priceText: "", items: [] }]); }
  function update(i: number, field: keyof AdvancedPricingTab, v: string) {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next);
  }
  function updateItems(i: number, items: string[]) {
    const next = [...value]; next[i] = { ...next[i], items }; onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)); }
  return (
    <Section label="Bảng giá theo tab (Pricing tabs)" icon="💰" count={value.length}>
      {value.map((tab, i) => {
        const items = tab.items || [];
        return (
          <div className="landing-card-row landing-pricing-row" key={i}>
            <div className="landing-card-grid landing-grid-3">
              <label>Key (slug nội bộ)<input value={tab.key || ""} onChange={(e) => update(i, "key", e.target.value)} placeholder="khung-thep-tien-che" /></label>
              <label>Tên tab<input value={tab.label || ""} onChange={(e) => update(i, "label", e.target.value)} placeholder="Khung thép tiền chế" /></label>
              <label>Khoảng giá<input value={tab.priceText || ""} onChange={(e) => update(i, "priceText", e.target.value)} placeholder="2.500.000 – 4.500.000đ/m²" /></label>
            </div>
            <div className="landing-pricing-items">
              <span className="landing-pricing-items-label">Checklist trong tab</span>
              {items.map((item, j) => (
                <div className="landing-row" key={j}>
                  <input value={item} onChange={(e) => updateItems(i, items.map((it, k) => k === j ? e.target.value : it))} placeholder="Một dòng checklist trong tab" />
                  <RowDelete onDelete={() => updateItems(i, items.filter((_, k) => k !== j))} />
                </div>
              ))}
              <button type="button" className="secondary-button ghost" onClick={() => updateItems(i, [...items, ""])}>
                <Plus size={14} /> Thêm dòng
              </button>
            </div>
            <RowDelete onDelete={() => remove(i)} />
          </div>
        );
      })}
      <RepeaterActions onAdd={add} addLabel="Thêm tab giá" />
    </Section>
  );
}

// Helper: parse JSON string into LandingAdvancedData with fallback
export function parseAdvancedJson(text: string): LandingAdvancedData {
  if (!text || !text.trim()) return {};
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return parsed as LandingAdvancedData;
  } catch {
    return {};
  }
}

// Helper: serialize back to JSON
export function serializeAdvancedJson(data: LandingAdvancedData): string {
  return JSON.stringify(data, null, 2);
}

export { Fragment };
