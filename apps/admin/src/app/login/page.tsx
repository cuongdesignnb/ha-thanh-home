"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { adminUrl } from "@/lib/client-path";

type LoginToast = {
  tone: "success" | "error";
  title: string;
  description?: string;
};

async function readLoginError(response: Response) {
  try {
    const payload = await response.json();
    const message = Array.isArray(payload?.message) ? payload.message.join("; ") : payload?.message;
    return message || payload?.error || "Email hoặc mật khẩu không đúng.";
  } catch {
    return `HTTP ${response.status}: Không đăng nhập được.`;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("admin@hathanhhome.vn");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<LoginToast | null>(null);
  const [loading, setLoading] = useState(false);

  function showToast(nextToast: LoginToast) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 4200);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(adminUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const detail = await readLoginError(response);
        setError(detail);
        showToast({ tone: "error", title: "Đăng nhập thất bại", description: detail });
        setLoading(false);
        return;
      }

      showToast({ tone: "success", title: "Đăng nhập thành công", description: "Đang chuyển vào dashboard." });
      window.location.href = adminUrl("/");
    } catch (submitError) {
      const detail = submitError instanceof Error ? submitError.message : "Không kết nối được API đăng nhập.";
      setError(detail);
      showToast({ tone: "error", title: "Đăng nhập thất bại", description: detail });
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <span className="brand-mark"><ShieldCheck size={26} /></span>
        <h1>Hà Thành Home Admin</h1>
        <p>Đăng nhập để quản trị dự án, dịch vụ, bài viết SEO và lead tư vấn.</p>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          Mật khẩu
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <button className="button" disabled={loading} type="submit">
          <LockKeyhole size={18} /> {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {toast ? (
        <div className="toast-stack login-toast-stack" aria-live="polite">
          <div className={`toast toast-${toast.tone}`}>
            <span>{toast.tone === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}</span>
            <div><strong>{toast.title}</strong>{toast.description ? <p>{toast.description}</p> : null}</div>
            <button type="button" onClick={() => setToast(null)} aria-label="Đóng thông báo"><X size={15} /></button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
