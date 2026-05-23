"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/client-path";
import { ImageUrlPicker, useAdminFeedback } from "@/components/admin-app";
import { LandingAdvancedEditor, type LandingAdvancedData } from "@/components/landing-advanced-editor";
import { ProjectsSourcePicker, type ProjectsSourceValue } from "@/components/projects-source-picker";

const apiFetch = adminApiFetch;

const SETTING_KEY = "site.servicePages.thiCongNhaXuong";

const advancedDefaults = {
  introChecklist: [
    "Tư vấn & thiết kế tối ưu công năng, phù hợp nhu cầu sản xuất",
    "Kết cấu thép chất lượng cao, tiêu chuẩn kỹ thuật rõ ràng",
    "Thi công nhanh chóng, an toàn, đảm bảo tiến độ",
    "Chi phí hợp lý, tối ưu hiệu quả đầu tư",
    "Bảo hành kết cấu dài hạn, đồng hành lâu dài cùng khách hàng",
  ],
  benefits: [
    { title: "Thiết kế tối ưu công năng", description: "Phù hợp dây chuyền sản xuất" },
    { title: "Kết cấu vững chắc", description: "Chuẩn kỹ thuật, bền vững" },
    { title: "Tiến độ rõ ràng", description: "Cam kết đúng hạn" },
    { title: "Chi phí minh bạch", description: "Không phát sinh ẩn" },
    { title: "An toàn thi công", description: "Tuyệt đối, đúng quy trình" },
    { title: "Đội ngũ chuyên môn", description: "Kinh nghiệm cao, tận tâm" },
  ],
  scopeItems: [
    { title: "Khảo sát & tư vấn", description: "Nắm rõ nhu cầu và hiện trạng." },
    { title: "Thiết kế kiến trúc, kết cấu", description: "Tối ưu công năng, kỹ thuật." },
    { title: "Thi công nền móng", description: "Móng vững chắc, đúng kết cấu." },
    { title: "Sản xuất & lắp dựng khung thép", description: "Gia công tại xưởng, lắp dựng nhanh." },
    { title: "Thi công hoàn thiện", description: "Tường, mái, nền xưởng hoàn thiện." },
    { title: "Hệ thống MEP", description: "Điện – Nước – PCCC đồng bộ." },
    { title: "Hệ thống PCCC", description: "Tuân thủ quy chuẩn an toàn." },
    { title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng trước bàn giao." },
  ],
  processSteps: [
    { number: "01", title: "Tiếp nhận yêu cầu", description: "Khảo sát và thu thập thông tin dự án" },
    { number: "02", title: "Tư vấn & thiết kế", description: "Đề xuất giải pháp, thiết kế kiến trúc, kết cấu" },
    { number: "03", title: "Báo giá & hợp đồng", description: "Báo giá chi tiết, thống nhất điều khoản và ký kết" },
    { number: "04", title: "Sản xuất cấu kiện", description: "Gia công cấu kiện thép tại nhà máy/xưởng" },
    { number: "05", title: "Thi công lắp dựng", description: "Thi công nền móng và lắp dựng khung thép" },
    { number: "06", title: "Thi công hoàn thiện", description: "Hoàn thiện hệ thống MEP, PCCC và hạng mục phụ trợ" },
    { number: "07", title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng, bàn giao và bảo hành" },
  ],
  whyChooseItems: [
    { title: "Kinh nghiệm thực chiến", description: "Nhiều công trình nhà xưởng, kho bãi đã bàn giao" },
    { title: "Năng lực sản xuất mạnh", description: "Nhà máy hiện đại, chủ động sản xuất cấu kiện" },
    { title: "Quy trình chuyên nghiệp", description: "Quản lý chặt chẽ từ thiết kế đến thi công" },
    { title: "Đúng tiến độ cam kết", description: "Tối ưu tiến độ, đảm bảo bàn giao đúng hạn" },
    { title: "An toàn là ưu tiên", description: "Thi công an toàn, tuân thủ quy trình nghiêm ngặt" },
    { title: "Bảo hành dài hạn", description: "Đồng hành sau bàn giao công trình" },
  ],
  stats: [
    { title: "10+", description: "Năm kinh nghiệm" },
    { title: "300+", description: "Dự án nhà xưởng" },
    { title: "98%", description: "Khách hàng hài lòng" },
    { title: "24/7", description: "Hỗ trợ tư vấn" },
  ],
  testimonials: [
    { name: "Ông Nguyễn Văn Hùng", project: "Giám đốc – Công ty ABC", quote: "Hà Thành Home thi công đúng tiến độ, chất lượng vượt mong đợi." },
    { name: "Bà Trần Thị Mai", project: "Giám đốc – Công ty HTech", quote: "Nhà xưởng được thiết kế đúng công năng, chi phí hợp lý." },
    { name: "Ông Phạm Quốc Tuấn", project: "CEO – Công ty VinaFoods", quote: "Dịch vụ trọn gói chuyên nghiệp từ tư vấn đến bàn giao." },
  ],
  faqs: [
    { question: "Thời gian thi công nhà xưởng mất bao lâu?", answer: "Tùy quy mô, thường từ 2 – 6 tháng hoặc hơn đối với dự án lớn." },
    { question: "Chi phí thi công nhà xưởng được tính thế nào?", answer: "Phụ thuộc diện tích, kết cấu, vật liệu, hệ thống MEP, PCCC và mức độ hoàn thiện." },
    { question: "Hà Thành Home có hỗ trợ xin giấy phép xây dựng không?", answer: "Có. Tư vấn hồ sơ pháp lý, giấy phép và các thủ tục liên quan tùy dự án." },
    { question: "Nhà xưởng có thể mở rộng trong tương lai không?", answer: "Có. Phương án thiết kế tính trước khả năng mở rộng để tối ưu chi phí đầu tư dài hạn." },
    { question: "Chính sách bảo hành công trình như thế nào?", answer: "Bảo hành theo từng hạng mục, đặc biệt là kết cấu, mái và hệ thống kỹ thuật." },
    { question: "Hà Thành Home có thi công trọn gói không?", answer: "Có. Trọn gói từ tư vấn, thiết kế, sản xuất cấu kiện, thi công đến nghiệm thu bàn giao." },
  ],
  pricingTabs: [
    { key: "khung-thep-tien-che", label: "Khung thép tiền chế", priceText: "2.500.000 – 4.500.000đ/m²", items: ["Thiết kế kiến trúc – kết cấu", "Thi công phần móng", "Sản xuất & lắp dựng khung thép", "Thi công hoàn thiện cơ bản", "Hệ thống MEP – PCCC cơ bản"] },
    { key: "nha-xuong-tieu-chuan", label: "Nhà xưởng tiêu chuẩn", priceText: "3.500.000 – 5.800.000đ/m²", items: ["Thiết kế và thi công đồng bộ", "Kết cấu thép tiêu chuẩn", "Tường bao, mái, nền xưởng", "MEP cơ bản", "Nghiệm thu và bàn giao"] },
    { key: "nha-kho", label: "Nhà kho", priceText: "2.200.000 – 4.000.000đ/m²", items: ["Tối ưu không gian lưu trữ", "Khung thép và mái tôn", "Nền chịu tải", "Hệ thống chiếu sáng cơ bản"] },
    { key: "nha-may", label: "Nhà máy", priceText: "4.500.000 – 8.500.000đ/m²", items: ["Thiết kế theo dây chuyền sản xuất", "Kết cấu chịu tải lớn", "Hệ thống MEP – PCCC đồng bộ", "Quản lý tiến độ và an toàn nghiêm ngặt"] },
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
  heroEyebrow: "Thi công nhà xưởng",
  heroTitle: "Giải pháp thi công nhà xưởng trọn gói",
  heroDescription: "Hà Thành Home cung cấp giải pháp thi công nhà xưởng trọn gói từ tư vấn, thiết kế, sản xuất cấu kiện đến thi công hoàn thiện.",
  heroImageUrl: "https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=2000&q=85",
  primaryCtaLabel: "Nhận báo giá",
  secondaryCtaLabel: "Tư vấn miễn phí",
  introEyebrow: "Dịch vụ thi công nhà xưởng",
  introTitle: "Giải pháp xây dựng nhà xưởng hiện đại – bền vững – hiệu quả",
  introDescription: "Cung cấp giải pháp thi công nhà xưởng trọn gói, phù hợp với mô hình sản xuất và kinh doanh.",
  introImageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1400&q=85",
  scopeEyebrow: "Phạm vi công việc",
  scopeTitle: "Trọn gói từ thiết kế đến hoàn thiện nhà xưởng",
  processEyebrow: "Quy trình thi công nhà xưởng",
  processTitle: "Rõ việc, rõ tiến độ – 7 bước chuẩn",
  projectsEyebrow: "Dự án nhà xưởng tiêu biểu",
  projectsTitle: "Công trình nhà xưởng đã triển khai",
  estimateEyebrow: "Dự toán chi phí thi công nhà xưởng",
  estimateTitle: "Tham khảo chi phí thi công nhà xưởng",
  quoteTitle: "Nhận báo giá & tư vấn miễn phí",
  quoteDescription: "Điền thông tin để nhận tư vấn chi tiết và báo giá phù hợp từ Hà Thành Home.",
  whyEyebrow: "Vì sao chọn Hà Thành Home?",
  whyTitle: "Đối tác tin cậy cho mọi công trình công nghiệp",
  testimonialsEyebrow: "Khách hàng nói gì về chúng tôi",
  testimonialsTitle: "Niềm tin đến từ trải nghiệm thật",
  faqEyebrow: "Câu hỏi thường gặp",
  faqTitle: "Những điều khách hàng thường hỏi",
  finalEyebrow: "Bắt đầu cùng Hà Thành Home",
  finalTitle: "Sẵn sàng xây dựng nhà xưởng hiện đại cho doanh nghiệp của bạn?",
  finalDescription: "Hà Thành Home – Đối tác tin cậy cho mọi công trình công nghiệp.",
  advancedData: advancedDefaults as LandingAdvancedData,
  projectsSource: { entity: "project", group: "construction", mode: "latest", limit: 6 },
};

export function ThiCongNhaXuongEditor({ roles }: { roles: string[] }) {
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
      .catch((error) => notify({ tone: "error", title: "Không tải được cấu hình Thi công Nhà xưởng", description: error instanceof Error ? error.message : String(error) }))
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
      notify({ tone: "success", title: "Đã lưu cấu hình Thi công Nhà xưởng" });
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
        <button className="primary-button" disabled={!canSave || saving} type="submit">{saving ? "Đang lưu..." : "Lưu cấu hình Thi công Nhà xưởng"}</button>
      </div>
    </form>
  );
}
