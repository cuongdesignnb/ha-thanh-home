"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type XayNhaQuoteFormProps = {
  title: string;
  description: string;
};

export function XayNhaQuoteForm({ title, description }: XayNhaQuoteFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    setMessage("");

    const details = [
      `Địa điểm xây dựng: ${String(data.get("location") || "")}`,
      `Diện tích dự kiến: ${String(data.get("area") || "")}`,
      `Ngân sách dự kiến: ${String(data.get("budget") || "")}`,
      `Yêu cầu thêm: ${String(data.get("message") || "")}`,
    ].join("\n");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(data.get("fullName") || ""),
          phone: String(data.get("phone") || ""),
          email: "",
          demandType: "Xây nhà trọn gói",
          projectType: String(data.get("projectType") || ""),
          area: String(data.get("area") || ""),
          budget: String(data.get("budget") || ""),
          location: String(data.get("location") || ""),
          message: details,
          sourceUrl: window.location.href,
          sourceType: "xay_nha_tron_goi_landing",
        }),
      });
      if (!response.ok) throw new Error("lead failed");
      setStatus("success");
      setMessage("Đã gửi yêu cầu tư vấn. Hà Thành Home sẽ liên hệ lại trong thời gian sớm nhất.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Chưa gửi được yêu cầu. Anh/chị vui lòng gọi hotline hoặc thử lại sau.");
    }
  }

  return (
    <form className="xay-nha-quote-form" onSubmit={submit}>
      <div>
        <span className="eyebrow">Nhận báo giá</span>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
      <div className="xay-nha-form-grid">
        <input name="fullName" placeholder="Họ và tên" required minLength={2} />
        <input name="phone" placeholder="Số điện thoại" required minLength={8} />
        <input name="location" placeholder="Địa điểm xây dựng" />
        <input name="area" placeholder="Diện tích dự kiến (m2)" />
        <select name="projectType" defaultValue="">
          <option value="" disabled>Loại công trình</option>
          <option>Nhà phố</option>
          <option>Biệt thự</option>
          <option>Nhà cấp 4</option>
          <option>Công trình khác</option>
        </select>
        <select name="budget" defaultValue="">
          <option value="" disabled>Ngân sách dự kiến</option>
          <option>Dưới 1 tỷ</option>
          <option>1 - 2 tỷ</option>
          <option>2 - 5 tỷ</option>
          <option>Trên 5 tỷ</option>
        </select>
      </div>
      <textarea name="message" placeholder="Nhu cầu & yêu cầu thêm" rows={4} />
      <button className="xay-nha-gold-button" disabled={status === "submitting"} type="submit">
        {status === "submitting" ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
        Nhận tư vấn ngay
      </button>
      {message ? (
        <p className={`xay-nha-form-message ${status}`}>
          {status === "success" ? <CheckCircle2 size={17} /> : null}
          {message}
        </p>
      ) : (
        <small><CheckCircle2 size={16} /> Cam kết bảo mật thông tin tuyệt đối</small>
      )}
    </form>
  );
}
