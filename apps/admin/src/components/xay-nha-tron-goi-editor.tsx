"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/client-path";
import { ImageUrlPicker, useAdminFeedback } from "@/components/admin-app";

const apiFetch = adminApiFetch;

const xayNhaAdvancedDefaults = {
  introChecklist: [
    "Một đầu mối - chịu trách nhiệm trọn gói",
    "Minh bạch chi phí - hạn chế phát sinh",
    "Cam kết tiến độ - đúng chất lượng",
    "Vật tư chính hãng - nguồn gốc rõ ràng",
  ],
  benefits: [
    { title: "Thiết kế đồng bộ", description: "Đẹp - công năng - bền vững" },
    { title: "Tối ưu chi phí", description: "Minh bạch, hạn chế phát sinh" },
    { title: "Tiến độ rõ ràng", description: "Cam kết từng giai đoạn" },
    { title: "Vật tư minh bạch", description: "Nguồn gốc rõ ràng" },
    { title: "Bảo hành dài hạn", description: "Đồng hành sau bàn giao" },
    { title: "Đội ngũ chuyên môn", description: "Kinh nghiệm, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Đánh giá hiện trạng, tư vấn phương án phù hợp." },
    { title: "Thiết kế kiến trúc", description: "Bản vẽ kiến trúc, kết cấu, MEP hoàn chỉnh." },
    { title: "Xin phép xây dựng", description: "Hỗ trợ hồ sơ pháp lý và xin phép." },
    { title: "Thi công phần thô", description: "Móng, khung, sàn, mái và hệ thống kỹ thuật." },
    { title: "Hoàn thiện trọn gói", description: "Sơn, gạch, trần, điện nước hoàn thiện." },
    { title: "Bàn giao & bảo hành", description: "Nghiệm thu, bàn giao và bảo hành dài hạn." },
  ],
  processSteps: [
    { number: "01", title: "Tiếp nhận yêu cầu", description: "Lắng nghe nhu cầu, ngân sách và phong cách mong muốn." },
    { number: "02", title: "Khảo sát hiện trạng", description: "Đo đạc, đánh giá kết cấu và điều kiện thi công." },
    { number: "03", title: "Báo giá & ký hợp đồng", description: "Báo giá chi tiết, minh bạch chi phí trước khi ký." },
    { number: "04", title: "Thiết kế chi tiết", description: "Bản vẽ kiến trúc, kết cấu, MEP và phối cảnh 3D." },
    { number: "05", title: "Thi công phần thô", description: "Triển khai thi công đúng tiến độ và kỹ thuật." },
    { number: "06", title: "Hoàn thiện", description: "Lắp đặt hoàn thiện, kiểm tra chất lượng từng hạng mục." },
    { number: "07", title: "Bàn giao & bảo hành", description: "Nghiệm thu, bàn giao và bảo hành dài hạn." },
  ],
  whyChooseItems: [
    { title: "Kinh nghiệm 10+ năm", description: "Đội ngũ kiến trúc sư và kỹ sư giàu kinh nghiệm." },
    { title: "Quy trình chuẩn ISO", description: "Quản lý chất lượng theo tiêu chuẩn quốc tế." },
    { title: "Cam kết tiến độ", description: "Đền bù nếu chậm tiến độ theo hợp đồng." },
    { title: "Bảo hành dài hạn", description: "Lên đến 10 năm cho phần kết cấu chính." },
  ],
  stats: [
    { value: "10+", label: "Năm kinh nghiệm" },
    { value: "200+", label: "Dự án bàn giao" },
    { value: "98%", label: "Khách hàng hài lòng" },
    { value: "24/7", label: "Hỗ trợ sau bàn giao" },
  ],
  testimonials: [
    { name: "Anh Minh - Hà Nội", quote: "Hà Thành Home thi công đúng tiến độ, minh bạch chi phí. Gia đình rất hài lòng với ngôi nhà mới." },
    { name: "Chị Lan - Hưng Yên", quote: "Đội ngũ tư vấn nhiệt tình, chất lượng thi công vượt mong đợi. Sẽ giới thiệu cho bạn bè." },
  ],
  faqs: [
    { question: "Xây nhà trọn gói bao gồm những gì?", answer: "Bao gồm khảo sát, tư vấn, thiết kế, dự toán, thi công phần thô, hoàn thiện, nghiệm thu, bàn giao và bảo hành theo hợp đồng." },
    { question: "Chi phí xây nhà trọn gói bao nhiêu?", answer: "Tùy thuộc diện tích, phong cách, vật liệu. Hà Thành Home tư vấn báo giá miễn phí sau khi khảo sát." },
    { question: "Thời gian thi công bao lâu?", answer: "Thông thường 4-6 tháng cho nhà 2-3 tầng. Cam kết tiến độ trong hợp đồng." },
    { question: "Chính sách bảo hành như thế nào?", answer: "Bảo hành 5-10 năm cho kết cấu, 2 năm cho hoàn thiện. Hỗ trợ kỹ thuật trọn đời." },
  ],
};

type XayNhaValues = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  introEyebrow: string;
  introTitle: string;
  introDescription: string;
  introImageUrl: string;
  projectSectionEyebrow: string;
  projectSectionTitle: string;
  estimateEyebrow: string;
  estimateTitle: string;
  estimateNote: string;
  quoteTitle: string;
  quoteDescription: string;
  whyEyebrow: string;
  whyTitle: string;
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  faqEyebrow: string;
  faqTitle: string;
  finalEyebrow: string;
  finalTitle: string;
  finalDescription: string;
  advancedJson: string;
};

const defaults: XayNhaValues = {
  heroEyebrow: "Xây nhà trọn gói",
  heroTitle: "Giải pháp xây nhà trọn gói từ thiết kế đến bàn giao",
  heroDescription: "Hà Thành Home cung cấp giải pháp xây nhà trọn gói toàn diện, đảm bảo chất lượng - tiến độ - minh bạch chi phí - bảo hành dài hạn.",
  heroImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ xây nhà trọn gói",
  introTitle: "Xây tổ ấm bền vững. An tâm từ đầu đến cuối",
  introDescription: "Dịch vụ xây nhà trọn gói của Hà Thành Home bao gồm toàn bộ quy trình từ khảo sát, thiết kế, xin phép, thi công phần thô, hoàn thiện, bàn giao và bảo hành.",
  introImageUrl: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85",
  projectSectionEyebrow: "Dự án thực tế",
  projectSectionTitle: "Dự án xây nhà tiêu biểu",
  estimateEyebrow: "Dự toán chi phí xây nhà",
  estimateTitle: "Tham khảo chi phí xây nhà trọn gói",
  estimateNote: "Chi phí phụ thuộc diện tích, phong cách, vật tư và điều kiện thi công thực tế.",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để nhận tư vấn chi tiết từ chuyên gia Hà Thành Home.",
  whyEyebrow: "Năng lực triển khai",
  whyTitle: "Vì sao chọn Hà Thành Home?",
  testimonialsEyebrow: "Khách hàng",
  testimonialsTitle: "Khách hàng nói gì về chúng tôi",
  faqEyebrow: "FAQ",
  faqTitle: "Câu hỏi thường gặp",
  finalEyebrow: "Sẵn sàng khởi công",
  finalTitle: "Sẵn sàng xây tổ ấm mơ ước của bạn?",
  finalDescription: "Hà Thành Home đồng hành cùng bạn kiến tạo ngôi nhà bền vững - đẹp - tiện nghi.",
  advancedJson: JSON.stringify(xayNhaAdvancedDefaults, null, 2),
};

export function XayNhaTronGoiEditor({ roles }: { roles: string[] }) {
  const { notify } = useAdminFeedback();
  const [values, setValues] = useState<XayNhaValues>(defaults);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const canSave = roles.includes("Super Admin") || roles.includes("Admin");

  useEffect(() => {
    apiFetch("/api/cms/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error("Không tải được cấu hình.");
        return res.json();
      })
      .then((payload) => {
        const landing = typeof payload["site.landing.xayNhaTronGoi"] === "object" && payload["site.landing.xayNhaTronGoi"] ? payload["site.landing.xayNhaTronGoi"] as Record<string, unknown> : {};
        const advanced = {
          introChecklist: Array.isArray(landing.introChecklist) ? landing.introChecklist : xayNhaAdvancedDefaults.introChecklist,
          benefits: Array.isArray(landing.benefits) ? landing.benefits : xayNhaAdvancedDefaults.benefits,
          scopeItems: Array.isArray(landing.scopeItems) ? landing.scopeItems : xayNhaAdvancedDefaults.scopeItems,
          processSteps: Array.isArray(landing.processSteps) ? landing.processSteps : xayNhaAdvancedDefaults.processSteps,
          whyChooseItems: Array.isArray(landing.whyChooseItems) ? landing.whyChooseItems : xayNhaAdvancedDefaults.whyChooseItems,
          stats: Array.isArray(landing.stats) ? landing.stats : xayNhaAdvancedDefaults.stats,
          testimonials: Array.isArray(landing.testimonials) ? landing.testimonials : xayNhaAdvancedDefaults.testimonials,
          faqs: Array.isArray(landing.faqs) ? landing.faqs : xayNhaAdvancedDefaults.faqs,
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
          projectSectionEyebrow: String(landing.projectSectionEyebrow ?? current.projectSectionEyebrow),
          projectSectionTitle: String(landing.projectSectionTitle ?? current.projectSectionTitle),
          estimateEyebrow: String(landing.estimateEyebrow ?? current.estimateEyebrow),
          estimateTitle: String(landing.estimateTitle ?? current.estimateTitle),
          estimateNote: String(landing.estimateNote ?? current.estimateNote),
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
      .catch((error) => notify({ tone: "error", title: "Không tải được cấu hình Xây nhà trọn gói", description: error instanceof Error ? error.message : String(error) }))
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
      heroEyebrow: values.heroEyebrow,
      heroTitle: values.heroTitle,
      heroDescription: values.heroDescription,
      heroImageUrl: values.heroImageUrl,
      primaryCtaLabel: values.primaryCtaLabel,
      secondaryCtaLabel: values.secondaryCtaLabel,
      introEyebrow: values.introEyebrow,
      introTitle: values.introTitle,
      introDescription: values.introDescription,
      introImageUrl: values.introImageUrl,
      projectSectionEyebrow: values.projectSectionEyebrow,
      projectSectionTitle: values.projectSectionTitle,
      estimateEyebrow: values.estimateEyebrow,
      estimateTitle: values.estimateTitle,
      estimateNote: values.estimateNote,
      quoteTitle: values.quoteTitle,
      quoteDescription: values.quoteDescription,
      whyEyebrow: values.whyEyebrow,
      whyTitle: values.whyTitle,
      testimonialsEyebrow: values.testimonialsEyebrow,
      testimonialsTitle: values.testimonialsTitle,
      faqEyebrow: values.faqEyebrow,
      faqTitle: values.faqTitle,
      finalEyebrow: values.finalEyebrow,
      finalTitle: values.finalTitle,
      finalDescription: values.finalDescription,
    };

    try {
      const response = await apiFetch("/api/cms/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "site.landing.xayNhaTronGoi", value: landing }),
      });
      if (!response.ok) {
        const text = await response.text();
        notify({ tone: "error", title: "Không lưu được cấu hình", description: text.slice(0, 200) });
        return;
      }
      notify({ tone: "success", title: "Đã lưu cấu hình Xây nhà trọn gói" });
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: error instanceof Error ? error.message : String(error) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Đang tải cấu hình...</div>;

  return (
    <form onSubmit={submit} className="xay-nha-form">
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

        <label>Eyebrow dự án<input value={values.projectSectionEyebrow} onChange={(e) => setValues({ ...values, projectSectionEyebrow: e.target.value })} /></label>
        <label>Tiêu đề dự án<input value={values.projectSectionTitle} onChange={(e) => setValues({ ...values, projectSectionTitle: e.target.value })} /></label>

        <label>Eyebrow dự toán<input value={values.estimateEyebrow} onChange={(e) => setValues({ ...values, estimateEyebrow: e.target.value })} /></label>
        <label>Tiêu đề dự toán<input value={values.estimateTitle} onChange={(e) => setValues({ ...values, estimateTitle: e.target.value })} /></label>
        <label className="wide">Ghi chú dự toán<textarea value={values.estimateNote} onChange={(e) => setValues({ ...values, estimateNote: e.target.value })} rows={2} /></label>

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
        <button className="primary-button" disabled={!canSave || saving} type="submit">{saving ? "Đang lưu..." : "Lưu cấu hình Xây nhà trọn gói"}</button>
      </div>
    </form>
  );
}
