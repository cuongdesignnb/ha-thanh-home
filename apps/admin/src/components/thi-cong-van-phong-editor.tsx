"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/client-path";
import { ImageUrlPicker, useAdminFeedback } from "@/components/admin-app";
import { LandingAdvancedEditor, type LandingAdvancedData } from "@/components/landing-advanced-editor";
import { ProjectsSourcePicker, type ProjectsSourceValue } from "@/components/projects-source-picker";

const apiFetch = adminApiFetch;

const SETTING_KEY = "site.servicePages.thiCongNoiThatVanPhong";

const advancedDefaults = {
  introChecklist: [
    "Thi công theo bản vẽ, đảm bảo độ chính xác cao",
    "Tối ưu không gian làm việc, nâng cao hiệu suất làm việc",
    "Vật liệu bền vững, an toàn và thân thiện môi trường",
    "Quản lý dự án chặt chẽ, minh bạch chi phí",
    "Bảo hành dài hạn, đồng hành cùng doanh nghiệp",
  ],
  benefits: [
    { title: "Thi công chuẩn bản vẽ", description: "Đúng thiết kế – đúng chất lượng" },
    { title: "Tối ưu công năng", description: "Hiệu quả – linh hoạt – thoải mái" },
    { title: "Tiến độ rõ ràng", description: "Cam kết đúng thời hạn" },
    { title: "Vật liệu minh bạch", description: "Nguồn gốc rõ ràng" },
    { title: "Bảo hành tận tâm", description: "Bảo hành 12 – 24 tháng" },
    { title: "Đội ngũ chuyên môn", description: "Kinh nghiệm, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Phân tích nhu cầu và không gian." },
    { title: "Thiết kế kỹ thuật & triển khai", description: "Bản vẽ chi tiết cho thi công." },
    { title: "Sản xuất nội thất", description: "Bàn ghế, vách ngăn, tủ chế tác." },
    { title: "Thi công lắp đặt", description: "Lắp đặt chuẩn xác, an toàn." },
    { title: "Hoàn thiện chi tiết", description: "Tỉ mỉ từng chi tiết hoàn thiện." },
    { title: "Bàn giao & nghiệm thu", description: "Kiểm tra chất lượng kỹ lưỡng." },
    { title: "Bảo hành", description: "Đồng hành sau khi sử dụng." },
  ],
  processSteps: [
    { number: "01", title: "Tiếp nhận yêu cầu", description: "Khảo sát hiện trạng, trao đổi nhu cầu" },
    { number: "02", title: "Tư vấn & đề xuất", description: "Định hướng giải pháp, báo giá sơ bộ" },
    { number: "03", title: "Thiết kế & triển khai", description: "Thiết kế 2D/3D, hồ sơ kỹ thuật thi công" },
    { number: "04", title: "Ký hợp đồng", description: "Thống nhất phạm vi, tiến độ, chi phí" },
    { number: "05", title: "Sản xuất nội thất", description: "Sản xuất tại xưởng, kiểm soát chất lượng" },
    { number: "06", title: "Thi công lắp đặt", description: "Thi công tại công trình, đảm bảo an toàn" },
    { number: "07", title: "Nghiệm thu & bàn giao", description: "Nghiệm thu, bàn giao và hướng dẫn bảo hành" },
  ],
  whyChooseItems: [
    { title: "Kinh nghiệm thực chiến", description: "10+ năm trong lĩnh vực thi công văn phòng" },
    { title: "Giải pháp tối ưu", description: "Công năng hiệu quả, trải nghiệm nhân viên tốt hơn" },
    { title: "Thi công chuẩn xác", description: "Đảm bảo chất lượng, đúng thiết kế" },
    { title: "Cam kết tiến độ", description: "Quản lý dự án chặt chẽ" },
    { title: "Bảo hành dài hạn", description: "Hỗ trợ doanh nghiệp lâu dài" },
    { title: "Đội ngũ chuyên môn", description: "Đội thi công nhiều kinh nghiệm" },
  ],
  stats: [
    { title: "10+", description: "Năm kinh nghiệm" },
    { title: "500+", description: "Dự án văn phòng" },
    { title: "98%", description: "Khách hàng hài lòng" },
    { title: "24/7", description: "Hỗ trợ tư vấn" },
  ],
  testimonials: [
    { name: "Anh Nguyễn Quốc Bảo", project: "Giám đốc – FPT Software", quote: "Đội ngũ làm việc chuyên nghiệp, đúng tiến độ và chất lượng." },
    { name: "Chị Trần Minh Hằng", project: "HR Director – Unilever Việt Nam", quote: "Phối hợp nhịp nhàng, đảm bảo tiêu chuẩn cao." },
    { name: "Anh Lê Hoàng Nam", project: "CEO – StartupX", quote: "Chi phí hợp lý, thiết kế sáng tạo và thi công rất chỉn chu." },
  ],
  faqs: [
    { question: "Thời gian thi công nội thất văn phòng là bao lâu?", answer: "Tùy quy mô, thường 30 – 60 ngày cho văn phòng nhỏ, 60 – 90 ngày cho văn phòng lớn." },
    { question: "Có thiết kế 2D/3D trước khi thi công không?", answer: "Có. Toàn bộ phương án được thiết kế chi tiết và duyệt trước khi thi công." },
    { question: "Chi phí thi công bao gồm những gì?", answer: "Khảo sát, thiết kế, sản xuất, thi công lắp đặt, vật liệu và nghiệm thu bàn giao." },
    { question: "Doanh nghiệp có thể thi công ngoài giờ hành chính không?", answer: "Có. Hỗ trợ thi công ngoài giờ, cuối tuần để không ảnh hưởng vận hành." },
    { question: "Chính sách bảo hành ra sao?", answer: "Bảo hành 12 – 24 tháng theo từng hạng mục. Bảo trì miễn phí trọn đời." },
    { question: "Có hỗ trợ cải tạo văn phòng đang sử dụng không?", answer: "Có. Tư vấn và thi công cải tạo, nâng cấp nội thất văn phòng hiện hữu." },
  ],
  pricingTabs: [
    { key: "van-phong-nho", label: "Văn phòng nhỏ (Dưới 300m²)", priceText: "4.500.000 – 6.500.000đ/m²", items: ["Thi công theo thiết kế 2D/3D", "Nội thất công nghiệp cao cấp", "Hệ tủ, bàn ghế, vách ngăn, sàn, trần, đèn", "Hệ thống điện nhẹ, mạng, điều hòa", "Vệ sinh công nghiệp, bàn giao hoàn thiện"] },
    { key: "van-phong-vua", label: "Văn phòng vừa", priceText: "5.500.000 – 7.500.000đ/m²", items: ["Thiết kế và thi công đồng bộ", "Nội thất tiêu chuẩn doanh nghiệp", "Vật liệu cao cấp hơn", "MEP đầy đủ", "Tối ưu không gian làm việc"] },
    { key: "van-phong-cao-cap", label: "Văn phòng cao cấp", priceText: "7.500.000 – 12.000.000đ/m²", items: ["Thiết kế chuyên sâu, sáng tạo", "Vật liệu nhập khẩu cao cấp", "Hệ MEP đồng bộ, thẩm mỹ cao", "Nội thất chế tác riêng", "Bảo hành mở rộng"] },
    { key: "co-working", label: "Co-working", priceText: "4.000.000 – 6.500.000đ/m²", items: ["Tối ưu không gian linh hoạt", "Hệ vách ngăn di động", "Hạ tầng mạng – điện đồng bộ", "Khu vực sinh hoạt chung", "Không gian thư giãn"] },
  ],
};

type Values = {
  heroEyebrow: string; heroTitle: string; heroDescription: string; heroImageUrl: string;
  primaryCtaLabel: string; secondaryCtaLabel: string;
  introEyebrow: string; introTitle: string; introDescription: string; introImageUrl: string;
  scopeEyebrow: string; scopeTitle: string;
  processEyebrow: string; processTitle: string;
  projectsEyebrow: string; projectsTitle: string;
  estimateEyebrow: string; estimateTitle: string;
  quoteTitle: string; quoteDescription: string;
  whyEyebrow: string; whyTitle: string;
  testimonialsEyebrow: string; testimonialsTitle: string;
  faqEyebrow: string; faqTitle: string;
  finalEyebrow: string; finalTitle: string; finalDescription: string;
  advancedData: LandingAdvancedData;
  projectsSource: ProjectsSourceValue;
};

const defaults: Values = {
  heroEyebrow: "Thi công nội thất văn phòng",
  heroTitle: "Kiến tạo không gian làm việc hiện đại",
  heroDescription: "Hà Thành Home đồng hành cùng doanh nghiệp trong thi công nội thất văn phòng trọn gói.",
  heroImageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ thi công nội thất văn phòng",
  introTitle: "Thi công trọn gói – Chuẩn công năng – Nâng tầm môi trường làm việc",
  introDescription: "Cung cấp giải pháp thi công nội thất văn phòng trọn gói cho doanh nghiệp.",
  introImageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85",
  scopeEyebrow: "Phạm vi công việc",
  scopeTitle: "Trọn gói từ tư vấn, thiết kế đến hoàn thiện văn phòng",
  processEyebrow: "Quy trình thi công nội thất văn phòng",
  processTitle: "Rõ việc, rõ tiến độ – 7 bước chuẩn",
  projectsEyebrow: "Dự án văn phòng tiêu biểu",
  projectsTitle: "Công trình văn phòng đã triển khai",
  estimateEyebrow: "Chi phí thi công nội thất văn phòng",
  estimateTitle: "Báo giá tham khảo theo quy mô",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để đội ngũ Hà Thành Home liên hệ và tư vấn chi tiết.",
  whyEyebrow: "Vì sao chọn Hà Thành Home?",
  whyTitle: "Nâng tầm môi trường làm việc cho doanh nghiệp",
  testimonialsEyebrow: "Khách hàng nói gì về chúng tôi",
  testimonialsTitle: "Niềm tin từ đối tác doanh nghiệp",
  faqEyebrow: "Câu hỏi thường gặp",
  faqTitle: "Những điều khách hàng thường hỏi",
  finalEyebrow: "Bắt đầu cùng Hà Thành Home",
  finalTitle: "Sẵn sàng nâng tầm không gian làm việc của bạn?",
  finalDescription: "Hà Thành Home đồng hành kiến tạo văn phòng hiện đại – hiệu quả – đậm dấu ấn thương hiệu.",
  advancedData: advancedDefaults as LandingAdvancedData,
  projectsSource: { entity: "project", group: "interior", mode: "latest", limit: 6 },
};

export function ThiCongVanPhongEditor({ roles }: { roles: string[] }) {
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
        const advanced: Record<string, unknown> = {};
        for (const k of Object.keys(advancedDefaults)) {
          const v = (landing as Record<string, unknown>)[k];
          advanced[k] = Array.isArray(v) ? v : (advancedDefaults as Record<string, unknown>)[k];
        }
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
          estimateEyebrow: String(landing.estimateEyebrow ?? current.estimateEyebrow),
          estimateTitle: String(landing.estimateTitle ?? current.estimateTitle),
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
          advancedData: advanced as LandingAdvancedData,
          projectsSource: (typeof landing.projectsSource === "object" && landing.projectsSource ? landing.projectsSource : current.projectsSource) as ProjectsSourceValue,
        }));
      })
      .catch((error) => notify({ tone: "error", title: "Không tải được cấu hình Thi công Văn phòng", description: error instanceof Error ? error.message : String(error) }))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);

    const landing = {
      ...(values.advancedData as Record<string, unknown>),
      heroEyebrow: values.heroEyebrow, heroTitle: values.heroTitle, heroDescription: values.heroDescription, heroImageUrl: values.heroImageUrl,
      primaryCtaLabel: values.primaryCtaLabel, secondaryCtaLabel: values.secondaryCtaLabel,
      introEyebrow: values.introEyebrow, introTitle: values.introTitle, introDescription: values.introDescription, introImageUrl: values.introImageUrl,
      scopeEyebrow: values.scopeEyebrow, scopeTitle: values.scopeTitle,
      processEyebrow: values.processEyebrow, processTitle: values.processTitle,
      projectsEyebrow: values.projectsEyebrow, projectsTitle: values.projectsTitle,
      estimateEyebrow: values.estimateEyebrow, estimateTitle: values.estimateTitle,
      quoteTitle: values.quoteTitle, quoteDescription: values.quoteDescription,
      whyEyebrow: values.whyEyebrow, whyTitle: values.whyTitle,
      testimonialsEyebrow: values.testimonialsEyebrow, testimonialsTitle: values.testimonialsTitle,
      faqEyebrow: values.faqEyebrow, faqTitle: values.faqTitle,
      finalEyebrow: values.finalEyebrow, finalTitle: values.finalTitle, finalDescription: values.finalDescription,
      projectsSource: values.projectsSource,
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
      notify({ tone: "success", title: "Đã lưu cấu hình Thi công Văn phòng" });
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

        <label>Eyebrow dự toán<input value={values.estimateEyebrow} onChange={(e) => setValues({ ...values, estimateEyebrow: e.target.value })} /></label>
        <label>Tiêu đề dự toán<input value={values.estimateTitle} onChange={(e) => setValues({ ...values, estimateTitle: e.target.value })} /></label>

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

        <ProjectsSourcePicker value={values.projectsSource} onChange={(next) => setValues({ ...values, projectsSource: next })} />

        <LandingAdvancedEditor value={values.advancedData} onChange={(next) => setValues({ ...values, advancedData: next })} includePricingTabs />
      </div>

      <div className="form-actions wide">
        <button className="primary-button" disabled={!canSave || saving} type="submit">{saving ? "Đang lưu..." : "Lưu cấu hình Thi công Văn phòng"}</button>
      </div>
    </form>
  );
}
