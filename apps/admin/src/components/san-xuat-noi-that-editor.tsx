"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/client-path";
import { ImageUrlPicker, useAdminFeedback } from "@/components/admin-app";

const apiFetch = adminApiFetch;

const SETTING_KEY = "site.servicePages.sanXuatThiCongNoiThat";

const advancedDefaults = {
  introChecklist: [
    "Thiết kế đồng bộ, tối ưu công năng và thẩm mỹ",
    "Sản xuất trực tiếp tại xưởng, kiểm soát chất lượng",
    "Thi công chuẩn xác, hoàn thiện tỉ mỉ đến từng chi tiết",
    "Bảo hành dài hạn, đồng hành cùng khách hàng",
  ],
  benefits: [
    { title: "Thi công chuẩn thiết kế", description: "Đúng concept, đúng vật liệu" },
    { title: "Xưởng sản xuất trực tiếp", description: "Kiểm soát chất lượng từ gốc" },
    { title: "Chất liệu minh bạch", description: "Nguồn gốc rõ ràng" },
    { title: "Tiến độ rõ ràng", description: "Cam kết từng giai đoạn" },
    { title: "Bảo hành tận tâm", description: "Đồng hành sau bàn giao" },
    { title: "Đội ngũ lành nghề", description: "Tay nghề cao, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Hiểu nhu cầu và hiện trạng không gian." },
    { title: "Thiết kế kỹ thuật triển khai", description: "Bản vẽ chi tiết cho sản xuất và thi công." },
    { title: "Sản xuất tại xưởng", description: "Đồ gỗ, kệ, tủ chế tác chuyên nghiệp." },
    { title: "Thi công lắp đặt", description: "Lắp đặt chuẩn xác, kiểm soát chất lượng." },
    { title: "Hoàn thiện chi tiết", description: "Tỉ mỉ từng chi tiết hoàn thiện." },
    { title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng trước bàn giao." },
    { title: "Bảo hành & bảo trì", description: "Hỗ trợ dài hạn sau khi sử dụng." },
  ],
  processSteps: [
    { number: "01", title: "Tư vấn & khảo sát", description: "Tiếp nhận nhu cầu, khảo sát hiện trạng" },
    { number: "02", title: "Thiết kế / bóc tách", description: "Thiết kế 3D, kỹ thuật & bóc tách vật liệu" },
    { number: "03", title: "Báo giá chi tiết", description: "Lập dự toán minh bạch, cam kết không phát sinh" },
    { number: "04", title: "Ký hợp đồng", description: "Thống nhất điều khoản, tiến độ thi công" },
    { number: "05", title: "Sản xuất tại xưởng", description: "Sản xuất theo tiêu chuẩn, kiểm soát chất lượng" },
    { number: "06", title: "Thi công lắp đặt", description: "Vận chuyển, lắp đặt đúng kỹ thuật" },
    { number: "07", title: "Nghiệm thu & bàn giao", description: "Nghiệm thu, bàn giao và bảo hành theo cam kết" },
  ],
  whyChooseItems: [
    { title: "Xưởng sản xuất trực tiếp", description: "Chủ động sản xuất, kiểm soát chất lượng" },
    { title: "Thi công chuẩn thiết kế", description: "Đảm bảo thẩm mỹ, đúng concept thiết kế" },
    { title: "Vật liệu cao cấp", description: "Minh bạch nguồn gốc, an toàn sức khỏe" },
    { title: "Tiến độ cam kết", description: "Đảm bảo kế hoạch rõ ràng, đúng hạn" },
    { title: "Bảo hành dài hạn", description: "Bảo hành 12 – 24 tháng, bảo trì trọn đời" },
    { title: "Đội ngũ lành nghề", description: "Kỹ sư, thợ tay nghề cao và tận tâm" },
  ],
  stats: [
    { title: "10+", description: "Năm kinh nghiệm" },
    { title: "500+", description: "Dự án hoàn thiện" },
    { title: "98%", description: "Khách hàng hài lòng" },
    { title: "24/7", description: "Hỗ trợ tư vấn" },
  ],
  testimonials: [
    { name: "Anh Minh Tuấn", project: "Căn hộ Cầu Giấy – Hà Nội", quote: "Nội thất đẹp, thi công chuẩn từng chi tiết." },
    { name: "Chị Thu Hằng", project: "Biệt thự Long Biên – Hà Nội", quote: "Thiết kế tinh tế, tối ưu không gian rất tốt." },
    { name: "Anh Quốc Huy", project: "Nhà phố Bắc Từ Liêm – Hà Nội", quote: "Đúng tiến độ, cam kết và bảo hành rõ ràng." },
  ],
  faqs: [
    { question: "Thời gian sản xuất nội thất mất bao lâu?", answer: "Tùy khối lượng và mức hoàn thiện, thông thường 30-60 ngày cho căn hộ và 60-90 ngày cho biệt thự, văn phòng." },
    { question: "Hà Thành Home có xưởng sản xuất riêng không?", answer: "Có. Hà Thành Home sở hữu xưởng sản xuất riêng tại Hà Nội với máy móc CNC hiện đại." },
    { question: "Chi phí nội thất được tính như thế nào?", answer: "Chi phí phụ thuộc vào diện tích, phong cách, vật liệu và mức hoàn thiện. Tư vấn báo giá chi tiết và minh bạch." },
    { question: "Chính sách bảo hành nội thất ra sao?", answer: "Bảo hành 12 – 24 tháng cho phần nội thất, bảo trì miễn phí trọn đời." },
  ],
};

type Values = {
  heroEyebrow: string; heroTitle: string; heroDescription: string; heroImageUrl: string;
  primaryCtaLabel: string; secondaryCtaLabel: string;
  introEyebrow: string; introTitle: string; introDescription: string; introImageUrl: string;
  scopeEyebrow: string; scopeTitle: string;
  processEyebrow: string; processTitle: string;
  projectsEyebrow: string; projectsTitle: string;
  quoteTitle: string; quoteDescription: string;
  whyEyebrow: string; whyTitle: string;
  testimonialsEyebrow: string; testimonialsTitle: string;
  faqEyebrow: string; faqTitle: string;
  finalEyebrow: string; finalTitle: string; finalDescription: string;
  advancedJson: string;
};

const defaults: Values = {
  heroEyebrow: "Sản xuất thi công nội thất",
  heroTitle: "Sản xuất & thi công nội thất trọn gói",
  heroDescription: "Hà Thành Home cung cấp giải pháp nội thất trọn gói — từ thiết kế, sản xuất tại xưởng đến thi công hoàn thiện.",
  heroImageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ sản xuất thi công nội thất",
  introTitle: "Hoàn thiện không gian sống tinh tế – Đồng bộ từ xưởng đến công trình",
  introDescription: "Hà Thành Home sở hữu xưởng sản xuất hiện đại, quy trình khép kín và đội thi công lành nghề.",
  introImageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85",
  scopeEyebrow: "Phạm vi công việc",
  scopeTitle: "Trọn gói từ khảo sát, thiết kế đến hoàn thiện",
  processEyebrow: "Quy trình sản xuất thi công nội thất",
  processTitle: "Rõ việc, rõ tiến độ – 7 bước chuẩn",
  projectsEyebrow: "Dự án nội thất tiêu biểu",
  projectsTitle: "Công trình nội thất đã triển khai",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để nhận tư vấn chi tiết từ chuyên gia Hà Thành Home.",
  whyEyebrow: "Vì sao chọn Hà Thành Home?",
  whyTitle: "Đồng bộ từ thiết kế – sản xuất – thi công",
  testimonialsEyebrow: "Khách hàng nói gì về chúng tôi",
  testimonialsTitle: "Niềm tin đến từ trải nghiệm thật",
  faqEyebrow: "Câu hỏi thường gặp",
  faqTitle: "Những điều khách hàng thường hỏi",
  finalEyebrow: "Bắt đầu cùng Hà Thành Home",
  finalTitle: "Sẵn sàng kiến tạo không gian sống mơ ước?",
  finalDescription: "Hà Thành Home đồng hành cùng bạn từ thiết kế đến hoàn thiện nội thất.",
  advancedJson: JSON.stringify(advancedDefaults, null, 2),
};

export function SanXuatNoiThatEditor({ roles }: { roles: string[] }) {
  const { notify } = useAdminFeedback();
  const [values, setValues] = useState<Values>(defaults);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const canSave = roles.includes("Super Admin") || roles.includes("Admin");

  useEffect(() => {
    apiFetch("/api/cms/settings")
      .then(async (res) => { if (!res.ok) throw new Error("Không tải được cấu hình."); return res.json(); })
      .then((payload) => {
        const landing = typeof payload[SETTING_KEY] === "object" && payload[SETTING_KEY] ? payload[SETTING_KEY] as Record<string, unknown> : {};
        const advanced = {
          introChecklist: Array.isArray(landing.introChecklist) ? landing.introChecklist : advancedDefaults.introChecklist,
          benefits: Array.isArray(landing.benefits) ? landing.benefits : advancedDefaults.benefits,
          scopeItems: Array.isArray(landing.scopeItems) ? landing.scopeItems : advancedDefaults.scopeItems,
          processSteps: Array.isArray(landing.processSteps) ? landing.processSteps : advancedDefaults.processSteps,
          whyChooseItems: Array.isArray(landing.whyChooseItems) ? landing.whyChooseItems : advancedDefaults.whyChooseItems,
          stats: Array.isArray(landing.stats) ? landing.stats : advancedDefaults.stats,
          testimonials: Array.isArray(landing.testimonials) ? landing.testimonials : advancedDefaults.testimonials,
          faqs: Array.isArray(landing.faqs) ? landing.faqs : advancedDefaults.faqs,
        };
        setValues((current) => ({
          ...current,
          heroEyebrow: String(landing.heroEyebrow ?? current.heroEyebrow),
          heroTitle: String(landing.heroTitle ?? current.heroTitle),
          heroDescription: String(landing.heroDescription ?? current.heroDescription),
          heroImageUrl: String(landing.heroImageUrl ?? current.heroImageUrl),
          primaryCtaLabel: String(landing.primaryCtaLabel ?? current.primaryCtaLabel),
          secondaryCtaLabel: String(landing.secondaryCtaLabel ?? current.secondaryCtaLabel),
          introEyebrow: String(landing.introEyebrow ?? current.introEyebrow),
          introTitle: String(landing.introTitle ?? current.introTitle),
          introDescription: String(landing.introDescription ?? current.introDescription),
          introImageUrl: String(landing.introImageUrl ?? current.introImageUrl),
          scopeEyebrow: String(landing.scopeEyebrow ?? current.scopeEyebrow),
          scopeTitle: String(landing.scopeTitle ?? current.scopeTitle),
          processEyebrow: String(landing.processEyebrow ?? current.processEyebrow),
          processTitle: String(landing.processTitle ?? current.processTitle),
          projectsEyebrow: String(landing.projectsEyebrow ?? current.projectsEyebrow),
          projectsTitle: String(landing.projectsTitle ?? current.projectsTitle),
          quoteTitle: String(landing.quoteTitle ?? current.quoteTitle),
          quoteDescription: String(landing.quoteDescription ?? current.quoteDescription),
          whyEyebrow: String(landing.whyEyebrow ?? current.whyEyebrow),
          whyTitle: String(landing.whyTitle ?? current.whyTitle),
          testimonialsEyebrow: String(landing.testimonialsEyebrow ?? current.testimonialsEyebrow),
          testimonialsTitle: String(landing.testimonialsTitle ?? current.testimonialsTitle),
          faqEyebrow: String(landing.faqEyebrow ?? current.faqEyebrow),
          faqTitle: String(landing.faqTitle ?? current.faqTitle),
          finalEyebrow: String(landing.finalEyebrow ?? current.finalEyebrow),
          finalTitle: String(landing.finalTitle ?? current.finalTitle),
          finalDescription: String(landing.finalDescription ?? current.finalDescription),
          advancedJson: JSON.stringify(advanced, null, 2),
        }));
      })
      .catch((error) => notify({ tone: "error", title: "Không tải được cấu hình Sản xuất Thi công Nội thất", description: error instanceof Error ? error.message : String(error) }))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);

    let advanced: Record<string, unknown>;
    try {
      advanced = values.advancedJson.trim() ? JSON.parse(values.advancedJson) as Record<string, unknown> : {};
    } catch {
      notify({ tone: "error", title: "JSON nội dung nâng cao không hợp lệ", description: "Kiểm tra dấu phẩy, ngoặc kép và cấu trúc mảng." });
      setSaving(false);
      return;
    }

    const landing = {
      ...advanced,
      heroEyebrow: values.heroEyebrow, heroTitle: values.heroTitle, heroDescription: values.heroDescription, heroImageUrl: values.heroImageUrl,
      primaryCtaLabel: values.primaryCtaLabel, secondaryCtaLabel: values.secondaryCtaLabel,
      introEyebrow: values.introEyebrow, introTitle: values.introTitle, introDescription: values.introDescription, introImageUrl: values.introImageUrl,
      scopeEyebrow: values.scopeEyebrow, scopeTitle: values.scopeTitle,
      processEyebrow: values.processEyebrow, processTitle: values.processTitle,
      projectsEyebrow: values.projectsEyebrow, projectsTitle: values.projectsTitle,
      quoteTitle: values.quoteTitle, quoteDescription: values.quoteDescription,
      whyEyebrow: values.whyEyebrow, whyTitle: values.whyTitle,
      testimonialsEyebrow: values.testimonialsEyebrow, testimonialsTitle: values.testimonialsTitle,
      faqEyebrow: values.faqEyebrow, faqTitle: values.faqTitle,
      finalEyebrow: values.finalEyebrow, finalTitle: values.finalTitle, finalDescription: values.finalDescription,
    };

    try {
      const response = await apiFetch("/api/cms/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: SETTING_KEY, value: landing }),
      });
      if (!response.ok) {
        const text = await response.text();
        notify({ tone: "error", title: "Không lưu được cấu hình", description: text.slice(0, 200) });
        return;
      }
      notify({ tone: "success", title: "Đã lưu cấu hình Sản xuất Thi công Nội thất" });
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: error instanceof Error ? error.message : String(error) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Đang tải cấu hình...</div>;

  return (
    <form onSubmit={submit} className="cms-form xay-nha-form">
      <div className="form-grid">
        <label>Eyebrow hero<input value={values.heroEyebrow} onChange={(e) => setValues({ ...values, heroEyebrow: e.target.value })} /></label>
        <label className="wide">Tiêu đề hero<textarea value={values.heroTitle} onChange={(e) => setValues({ ...values, heroTitle: e.target.value })} rows={3} /></label>
        <label className="wide">Mô tả hero<textarea value={values.heroDescription} onChange={(e) => setValues({ ...values, heroDescription: e.target.value })} rows={3} /></label>
        <ImageUrlPicker label="Ảnh hero" value={values.heroImageUrl} onChange={(v) => setValues({ ...values, heroImageUrl: v })} />
        <label>Nút báo giá<input value={values.primaryCtaLabel} onChange={(e) => setValues({ ...values, primaryCtaLabel: e.target.value })} /></label>
        <label>Nút tư vấn<input value={values.secondaryCtaLabel} onChange={(e) => setValues({ ...values, secondaryCtaLabel: e.target.value })} /></label>

        <label>Eyebrow giới thiệu<input value={values.introEyebrow} onChange={(e) => setValues({ ...values, introEyebrow: e.target.value })} /></label>
        <label className="wide">Tiêu đề giới thiệu<textarea value={values.introTitle} onChange={(e) => setValues({ ...values, introTitle: e.target.value })} rows={2} /></label>
        <label className="wide">Mô tả giới thiệu<textarea value={values.introDescription} onChange={(e) => setValues({ ...values, introDescription: e.target.value })} rows={3} /></label>
        <ImageUrlPicker label="Ảnh giới thiệu" value={values.introImageUrl} onChange={(v) => setValues({ ...values, introImageUrl: v })} />

        <label>Eyebrow phạm vi<input value={values.scopeEyebrow} onChange={(e) => setValues({ ...values, scopeEyebrow: e.target.value })} /></label>
        <label>Tiêu đề phạm vi<input value={values.scopeTitle} onChange={(e) => setValues({ ...values, scopeTitle: e.target.value })} /></label>

        <label>Eyebrow quy trình<input value={values.processEyebrow} onChange={(e) => setValues({ ...values, processEyebrow: e.target.value })} /></label>
        <label>Tiêu đề quy trình<input value={values.processTitle} onChange={(e) => setValues({ ...values, processTitle: e.target.value })} /></label>

        <label>Eyebrow dự án<input value={values.projectsEyebrow} onChange={(e) => setValues({ ...values, projectsEyebrow: e.target.value })} /></label>
        <label>Tiêu đề dự án<input value={values.projectsTitle} onChange={(e) => setValues({ ...values, projectsTitle: e.target.value })} /></label>

        <label>Tiêu đề form báo giá<input value={values.quoteTitle} onChange={(e) => setValues({ ...values, quoteTitle: e.target.value })} /></label>
        <label>Mô tả form báo giá<input value={values.quoteDescription} onChange={(e) => setValues({ ...values, quoteDescription: e.target.value })} /></label>

        <label>Eyebrow vì sao chọn<input value={values.whyEyebrow} onChange={(e) => setValues({ ...values, whyEyebrow: e.target.value })} /></label>
        <label>Tiêu đề vì sao chọn<input value={values.whyTitle} onChange={(e) => setValues({ ...values, whyTitle: e.target.value })} /></label>

        <label>Eyebrow đánh giá<input value={values.testimonialsEyebrow} onChange={(e) => setValues({ ...values, testimonialsEyebrow: e.target.value })} /></label>
        <label>Tiêu đề đánh giá<input value={values.testimonialsTitle} onChange={(e) => setValues({ ...values, testimonialsTitle: e.target.value })} /></label>

        <label>Eyebrow FAQ<input value={values.faqEyebrow} onChange={(e) => setValues({ ...values, faqEyebrow: e.target.value })} /></label>
        <label>Tiêu đề FAQ<input value={values.faqTitle} onChange={(e) => setValues({ ...values, faqTitle: e.target.value })} /></label>

        <label>Eyebrow CTA cuối<input value={values.finalEyebrow} onChange={(e) => setValues({ ...values, finalEyebrow: e.target.value })} /></label>
        <label>Tiêu đề CTA cuối<input value={values.finalTitle} onChange={(e) => setValues({ ...values, finalTitle: e.target.value })} /></label>
        <label className="wide">Mô tả CTA cuối<textarea value={values.finalDescription} onChange={(e) => setValues({ ...values, finalDescription: e.target.value })} rows={2} /></label>

        <label className="wide">Nội dung nâng cao JSON (benefits, scopeItems, processSteps, whyChooseItems, stats, testimonials, faqs, introChecklist)<textarea value={values.advancedJson} onChange={(e) => setValues({ ...values, advancedJson: e.target.value })} rows={18} spellCheck={false} /></label>
      </div>

      <div className="form-actions wide">
        <button className="primary-button" disabled={!canSave || saving} type="submit">{saving ? "Đang lưu..." : "Lưu cấu hình Sản xuất Thi công Nội thất"}</button>
      </div>
    </form>
  );
}
