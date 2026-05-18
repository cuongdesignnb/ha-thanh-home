"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type LeadFormProps = {
  templateSlug?: string;
  templateType?: string;
};

export function LeadForm({ templateSlug, templateType }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    setMessage("");

    const payload = {
      fullName: String(data.get("fullName") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      demandType: String(data.get("demandType") || ""),
      projectType: String(data.get("projectType") || ""),
      budget: String(data.get("budget") || ""),
      message: String(data.get("message") || ""),
      sourceUrl: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Lead request failed");
      setStatus("success");
      setMessage("Đã gửi yêu cầu tư vấn. Hà Thành Home sẽ liên hệ lại trong thời gian sớm nhất.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Chưa gửi được yêu cầu. Anh/chị vui lòng gọi hotline 0966 123 456 hoặc thử lại sau.");
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      {(templateSlug || templateType) && (
        <div className="lead-context">
          <CheckCircle2 size={18} />
          <span>Đang tư vấn theo mẫu: <strong>{templateSlug || "mẫu thiết kế"}</strong></span>
        </div>
      )}
      <div className="lead-form-grid">
        <label>
          <span>Họ và tên</span>
          <input name="fullName" placeholder="Nhập họ tên" required minLength={2} />
        </label>
        <label>
          <span>Số điện thoại</span>
          <input name="phone" placeholder="Nhập số điện thoại" required minLength={8} />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="Email nếu có" />
        </label>
        <label>
          <span>Nhu cầu</span>
          <select name="demandType" defaultValue={templateType === "interior" ? "Mẫu thiết kế nội thất" : "Mẫu thiết kế kiến trúc"}>
            <option>Mẫu thiết kế kiến trúc</option>
            <option>Mẫu thiết kế nội thất</option>
            <option>Thiết kế & thi công trọn gói</option>
            <option>Tư vấn báo giá</option>
          </select>
        </label>
        <label>
          <span>Loại công trình</span>
          <input name="projectType" placeholder="Biệt thự, nhà phố, căn hộ..." />
        </label>
        <label>
          <span>Ngân sách dự kiến</span>
          <input name="budget" placeholder="Ví dụ: 1.5 tỷ, 500 triệu..." />
        </label>
      </div>
      <label>
        <span>Nội dung cần tư vấn</span>
        <textarea name="message" rows={5} placeholder="Diện tích, vị trí, thời gian dự kiến, mong muốn điều chỉnh mẫu..." defaultValue={templateSlug ? `Tôi muốn tư vấn theo mẫu ${templateSlug}.` : ""} />
      </label>
      <button className="cta" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
        Gửi yêu cầu tư vấn
      </button>
      {message && <p className={`lead-message ${status}`}>{message}</p>}
    </form>
  );
}
