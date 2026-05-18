"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Home, Loader2, MessageCircle, Phone, Send, X } from "lucide-react";

type FieldOption = {
  label: string;
  value: string;
};

type EstimatorField = {
  name: string;
  label: string;
  type: "select" | "number";
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: string | number;
  options?: FieldOption[];
};

type EstimatorConfig = {
  id?: number;
  name?: string;
  currency?: string;
  inputSchema?: EstimatorField[];
  disclaimer?: string;
  ctaTitle?: string;
  ctaDescription?: string;
};

type EstimateResult = {
  estimateId: number;
  input: Record<string, unknown>;
  variables?: Record<string, number>;
  lineItems: Array<{ code: string; label: string; amount: number }>;
  totalMin: number;
  totalMax: number;
  disclaimer?: string;
  ctaTitle?: string;
  ctaDescription?: string;
};

const apiBase = "/api";

export function ConstructionEstimatorWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<EstimatorConfig | null>(null);
  const [input, setInput] = useState<Record<string, string | number>>({});
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const fields = config?.inputSchema || [];
  const firstStepFields = fields.slice(0, 5);
  const secondStepFields = fields.slice(5);

  useEffect(() => {
    fetch(`${apiBase}/construction-estimator/config`)
      .then((response) => response.ok ? response.json() : null)
      .then((payload: EstimatorConfig | null) => {
        if (!payload) return;
        setConfig(payload);
        setInput(sampleInput(payload.inputSchema || []));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest("[data-estimator-open]");
      if (trigger) {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("estimator-open", open);
    return () => document.body.classList.remove("estimator-open");
  }, [open]);

  const canCalculate = useMemo(() => {
    return fields.every((field) => !field.required || String(input[field.name] ?? "").length > 0);
  }, [fields, input]);

  async function calculate() {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch(`${apiBase}/construction-estimator/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, sourceUrl: window.location.href }),
      });
      if (!response.ok) throw new Error("calculate failed");
      setResult(await response.json());
      setStep(2);
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Chưa tính được dự toán. Anh/chị vui lòng thử lại hoặc gọi hotline để được hỗ trợ.");
    }
  }

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result) return;
    const form = new FormData(event.currentTarget);
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch(`${apiBase}/construction-estimator/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId: result.estimateId,
          fullName: String(form.get("fullName") || ""),
          phone: String(form.get("phone") || ""),
          email: String(form.get("email") || ""),
          message: String(form.get("message") || ""),
          sourceUrl: window.location.href,
        }),
      });
      if (!response.ok) throw new Error("lead failed");
      setStatus("success");
      setMessage("Đã gửi thông tin dự toán. Hà Thành Home sẽ liên hệ tư vấn chi tiết.");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Chưa gửi được thông tin. Anh/chị vui lòng gọi hotline 0966 123 456 hoặc thử lại.");
    }
  }

  function close() {
    setOpen(false);
    setStep(result ? 2 : 0);
  }

  return (
    <>
      <MobileBottomCta onOpenEstimator={() => setOpen(true)} />
      {open ? (
        <div className="estimator-modal" role="dialog" aria-modal="true" aria-label="Dự toán chi phí xây dựng">
          <div className="estimator-backdrop" onClick={close} />
          <section className="estimator-sheet">
            <div className="estimator-head">
              <div>
                <span>Dự toán công trình</span>
                <h2>{config?.name || "Ước lượng chi phí xây dựng"}</h2>
              </div>
              <button type="button" onClick={close} aria-label="Đóng dự toán"><X size={20} /></button>
            </div>
            <div className="estimator-steps">
              {["Cơ bản", "Hệ số m2", "Kết quả"].map((label, index) => <span className={step === index ? "active" : ""} key={label}>{index + 1}. {label}</span>)}
            </div>
            {!config ? (
              <div className="estimator-loading"><Loader2 className="spin" size={22} /> Đang tải cấu hình...</div>
            ) : (
              <>
                {step === 0 ? <EstimatorFields fields={firstStepFields} input={input} setInput={setInput} /> : null}
                {step === 1 ? <EstimatorFields fields={secondStepFields} input={input} setInput={setInput} /> : null}
                {step === 2 && result ? <EstimateResultView message={message} result={result} status={status} submitLead={submitLead} /> : null}
                {status === "error" && message && step !== 2 ? <p className="estimator-message error">{message}</p> : null}
                <div className="estimator-actions">
                  {step > 0 ? <button className="outline-cta" type="button" onClick={() => setStep(step - 1)}>Quay lại</button> : <span />}
                  {step < 1 ? <button className="cta" disabled={!canCalculate} type="button" onClick={() => setStep(step + 1)}>Tiếp tục</button> : null}
                  {step === 1 ? <button className="cta" disabled={!canCalculate || status === "loading"} type="button" onClick={calculate}>{status === "loading" ? <Loader2 className="spin" size={17} /> : <Calculator size={17} />} Tính dự toán</button> : null}
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function EstimatorFields({ fields, input, setInput }: { fields: EstimatorField[]; input: Record<string, string | number>; setInput: (value: Record<string, string | number>) => void }) {
  return (
    <div className="estimator-form-grid">
      {fields.map((field) => (
        <label key={field.name}>
          <span>{field.label}{field.unit ? ` (${field.unit})` : ""}</span>
          {field.type === "select" ? (
            <select value={String(input[field.name] ?? field.defaultValue ?? "")} onChange={(event) => setInput({ ...input, [field.name]: event.target.value })}>
              {(field.options || []).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          ) : (
            <input type="number" min={field.min} max={field.max} step={field.step || 1} value={Number(input[field.name] ?? field.defaultValue ?? 0)} onChange={(event) => setInput({ ...input, [field.name]: Number(event.target.value) })} />
          )}
        </label>
      ))}
    </div>
  );
}

function EstimateResultView({ message, result, status, submitLead }: { message: string; result: EstimateResult; status: string; submitLead: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const pricedArea = Number(result.variables?.priced_area || 0);
  const unitPrice = Number(result.variables?.unit_price || 0);

  return (
    <div className="estimator-result">
      <div className="estimate-total">
        <span>Chi phí ước lượng</span>
        <strong>{money(result.totalMin)} - {money(result.totalMax)}</strong>
        <p>{result.disclaimer}</p>
      </div>
      <div className="estimate-lines">
        {pricedArea ? <div><span>Tổng diện tích tính giá</span><strong>{pricedArea.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} m2</strong></div> : null}
        {unitPrice ? <div><span>Đơn giá đang áp dụng</span><strong>{money(unitPrice)}/m2</strong></div> : null}
        {result.lineItems.map((item) => <div key={item.code}><span>{item.label}</span><strong>{money(item.amount)}</strong></div>)}
      </div>
      <form className="estimate-lead-form" onSubmit={submitLead}>
        <h3>{result.ctaTitle || "Nhận tư vấn dự toán chi tiết"}</h3>
        <p>{result.ctaDescription || "Gửi thông tin để đội ngũ Hà Thành Home tư vấn phương án phù hợp hơn."}</p>
        <div>
          <input name="fullName" placeholder="Họ và tên" required minLength={2} />
          <input name="phone" placeholder="Số điện thoại" required minLength={8} />
          <input name="email" type="email" placeholder="Email nếu có" />
        </div>
        <textarea name="message" rows={3} placeholder="Ghi chú thêm về khu đất, thời gian dự kiến, vật liệu mong muốn..." />
        <button className="cta" disabled={status === "submitting"} type="submit">{status === "submitting" ? <Loader2 className="spin" size={17} /> : <Send size={17} />} Gửi tư vấn</button>
        {message ? <p className={`estimator-message ${status}`}>{message}</p> : null}
      </form>
    </div>
  );
}

function MobileBottomCta({ onOpenEstimator }: { onOpenEstimator: () => void }) {
  const [path, setPath] = useState("/");
  useEffect(() => setPath(window.location.pathname), []);
  return (
    <nav className="mobile-bottom-cta" aria-label="Tác vụ nhanh">
      <a className={path === "/" ? "active" : ""} href="/"><Home size={21} /><span>Trang chủ</span></a>
      <button type="button" onClick={onOpenEstimator}><Calculator size={21} /><span>Dự toán</span></button>
      <a href="tel:0966123456"><Phone size={21} /><span>Gọi ngay</span></a>
      <a className={path.startsWith("/lien-he") ? "active" : ""} href="/lien-he"><MessageCircle size={21} /><span>Tư vấn</span></a>
    </nav>
  );
}

function sampleInput(fields: EstimatorField[]) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? (field.type === "number" ? field.min || 0 : field.options?.[0]?.value || "")]));
}

function money(value: number) {
  if (value >= 1000000000) return `${(value / 1000000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  return `${Math.round(value / 1000000).toLocaleString("vi-VN")} triệu`;
}
