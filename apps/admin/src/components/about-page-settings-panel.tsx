"use client";

import { useEffect, useState } from "react";
import { adminApiFetch, adminUrl } from "@/lib/client-path";
import { ImageUrlPicker, useAdminFeedback } from "@/components/admin-app";
import type { AboutPageConfig } from "@/lib/about-page-config";
import { Plus, Trash2, Save, ExternalLink } from "lucide-react";

const apiFetch = adminApiFetch;

const defaultAboutSettings: AboutPageConfig = {
  slug: "gioi-thieu",
  title: "Giới thiệu",
  isActive: true,

  seo: {
    metaTitle: "Giới thiệu Hà Thành Home | Thiết kế, thi công nhà ở & nội thất",
    metaDescription: "Hà Thành Home là đơn vị thiết kế, thi công nhà ở và nội thất chuyên nghiệp, kiến tạo không gian sống đẳng cấp, bền vững và mang dấu ấn riêng.",
    canonicalUrl: "/gioi-thieu",
    ogTitle: "Giới thiệu Hà Thành Home",
    ogDescription: "Tìm hiểu về Hà Thành Home, năng lực thiết kế thi công, hành trình phát triển, đội ngũ và cam kết đồng hành cùng khách hàng.",
    ogImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&h=630&q=80",
    noIndex: false,
  },

  hero: {
    breadcrumbLabel: "Giới thiệu",
    eyebrow: "VỀ CHÚNG TÔI",
    title: "Kiến tạo không gian sống và công trình đẳng cấp",
    description: "Hà Thành Home thấu hiểu mọi mong muốn của bạn để biến ý tưởng thành những không gian sống tinh tế, bền vững và mang dấu ấn riêng.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    primaryCtaLabel: "Nhận tư vấn ngay",
    primaryCtaUrl: "/lien-he?nguon=gioi-thieu",
    secondaryCtaLabel: "Xem video giới thiệu",
    secondaryCtaUrl: "#video-gioi-thieu",
  },

  intro: {
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    eyebrow: "VỀ HÀ THÀNH HOME",
    title: "Kiến tạo giá trị – Nâng tầm cuộc sống",
    description: "Hà Thành Home là đơn vị chuyên nghiệp trong lĩnh vực thiết kế kiến trúc, thi công xây dựng trọn gói và nội thất cao cấp. Với hơn 10 năm kinh nghiệm, chúng tôi tự hào mang đến những giải pháp toàn diện – tinh tế – bền vững cho hàng trăm khách hàng trên khắp cả nước.",
    checklist: [
      "Thiết kế sáng tạo, tối ưu công năng và thẩm mỹ",
      "Thi công chuẩn xác, đúng tiến độ, đúng cam kết",
      "Vật liệu minh bạch, chất lượng cao",
      "Hậu mãi tận tâm, đồng hành dài lâu",
    ],
  },

  identity: {
    title: "TẦM NHÌN – SỨ MỆNH – GIÁ TRỊ CỐT LÕI",
    items: [
      { icon: "eye", title: "Tầm nhìn", description: "Trở thành thương hiệu kiến trúc – xây dựng – nội thất hàng đầu Việt Nam, kiến tạo không gian sống đẳng cấp và bền vững." },
      { icon: "target", title: "Sứ mệnh", description: "Mang đến giải pháp toàn diện, giúp khách hàng hiện thực hóa tổ ấm mơ ước bằng sự tận tâm, minh bạch và chuyên nghiệp." },
      { icon: "diamond", title: "Giá trị cốt lõi", description: "Tận tâm – Chất lượng – Minh bạch – Sáng tạo – Hiệu quả – Cam kết đồng hành cùng khách hàng trong suốt hành trình." }
    ],
  },

  whyChoose: {
    title: "VÌ SAO CHỌN HÀ THÀNH HOME?",
    items: [
      { icon: "design", title: "Thiết kế sáng tạo", description: "Kiến tạo tinh tế, công năng tối ưu, đậm dấu ấn riêng." },
      { icon: "progress", title: "Thi công đúng tiến độ", description: "Quản lý chuyên nghiệp, đảm bảo tiến độ và chất lượng từng hạng mục." },
      { icon: "materials", title: "Vật liệu minh bạch", description: "Cam kết vật liệu chính hãng, rõ nguồn gốc, chất lượng được kiểm soát." },
      { icon: "shield", title: "Bảo hành tận tâm", description: "Bảo hành dài hạn, hỗ trợ nhanh chóng sau bàn giao." },
      { icon: "team", title: "Đội ngũ chuyên môn", description: "Kiến trúc sư, kỹ sư, giám sát giàu kinh nghiệm, chuyên nghiệp và tận tâm." },
      { icon: "cost", title: "Tối ưu chi phí", description: "Giúp tối ưu ngân sách hiệu quả, không phát sinh chi phí ẩn." }
    ],
  },

  timeline: {
    title: "HÀNH TRÌNH PHÁT TRIỂN",
    items: [
      { year: "2014", title: "Khởi đầu", description: "Thành lập Hà Thành Home với sứ mệnh kiến tạo không gian sống chất lượng." },
      { year: "2016", title: "Bước tiến đầu tiên", description: "Hoàn thiện hệ thống quy trình, đội ngũ và chinh phục những công trình đầu tiên." },
      { year: "2018", title: "Mở rộng & khẳng định", description: "Mở rộng quy mô, khẳng định thương hiệu qua hàng trăm dự án lớn nhỏ." },
      { year: "2020", title: "Đổi mới & bứt phá", description: "Đầu tư công nghệ, nâng cao năng lực thiết kế và thi công toàn diện." },
      { year: "2022", title: "Phát triển bền vững", description: "Mở rộng hệ sinh thái dịch vụ, nâng cao trải nghiệm khách hàng." },
      { year: "2024", title: "Vươn tầm tương lai", description: "Tiếp tục đổi mới, kiến tạo những công trình biểu tượng và giá trị bền vững." }
    ],
  },

  people: {
    imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
    eyebrow: "CON NGƯỜI – NỀN TẢNG CỦA GIÁ TRỊ",
    title: "Đội ngũ tận tâm – Vận hành bền vững",
    description: "Chúng tôi tự hào quy tụ đội ngũ kiến trúc sư, kỹ sư, giám sát và chuyên viên giàu kinh nghiệm. Từng thành viên đều đặt sự tận tâm, trách nhiệm và chất lượng lên hàng đầu trong mỗi công trình.",
    highlights: [
      { icon: "users", value: "50+", title: "Kiến trúc sư, kỹ sư, chuyên viên" },
      { icon: "experience", value: "10+", title: "Năm kinh nghiệm trong ngành" },
      { icon: "quality", value: "100%", title: "Tận tâm, trách nhiệm với từng dự án" },
      { icon: "culture", title: "Văn hóa", description: "Hợp tác – Chia sẻ – Hướng tới khách hàng" }
    ],
  },

  stats: [
    { icon: "experience", value: "10+", label: "Năm kinh nghiệm" },
    { icon: "project", value: "500+", label: "Dự án đã hoàn thành" },
    { icon: "satisfaction", value: "98%", label: "Khách hàng hài lòng" },
    { icon: "support", value: "24/7", label: "Hỗ trợ khách hàng" }
  ],

  strengths: {
    title: "NĂNG LỰC & THẾ MẠNH",
    items: [
      { imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=85", title: "Thiết kế kiến trúc & nội thất", description: "Sáng tạo, đồng bộ, phù hợp phong cách sống." },
      { imageUrl: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800&q=85", title: "Thi công trọn gói", description: "Quy trình chuẩn, kiểm soát chặt chẽ từng giai đoạn." },
      { imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=85", title: "Xưởng sản xuất nội thất", description: "Trực tiếp thi công, đảm bảo chất lượng và tiến độ." },
      { imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=85", title: "Hệ thống cung ứng vật liệu", description: "Đối tác uy tín, nguồn hàng đa dạng, giá tốt." },
      { imageUrl: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=85", title: "Showroom trải nghiệm", description: "Trải nghiệm vật liệu, nội thất thực tế ngay tại showroom." }
    ],
  },

  partners: {
    title: "ĐỐI TÁC & KHÁCH HÀNG TIÊU BIỂU",
    items: [
      { name: "VinHomes", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Sun Group", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Ecopark", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Masterise Homes", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Nam Cường", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "An Cường", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" },
      { name: "Viglacera", logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=120&q=80", url: "" }
    ],
  },

  testimonials: {
    title: "KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI?",
    items: [
      { name: "Anh Minh Tuấn", location: "Biệt thự – Hà Nội", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80", rating: 5, quote: "Hà Thành Home làm việc rất chuyên nghiệp, thiết kế đẹp và thi công đúng tiến độ. Rất hài lòng với chất lượng và sự tận tâm của đội ngũ." },
      { name: "Chị Thu Hằng", location: "Nhà phố – Hải Phòng", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80", rating: 5, quote: "Không gian sống của gia đình tôi hoàn thiện hơn cả mong đợi. Cảm ơn Hà Thành Home đã kiến tạo nên tổ ấm mơ ước." },
      { name: "Anh Quốc Huy", location: "Căn hộ – Hà Nội", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80", rating: 5, quote: "Quá trình làm việc rõ ràng, vật liệu minh bạch và hậu mãi tận tâm. Tôi rất tin tưởng khi lựa chọn Hà Thành Home." }
    ],
  },

  finalCta: {
    title: "Sẵn sàng kiến tạo không gian mơ ước của bạn?",
    description: "Hà Thành Home đồng hành cùng bạn từ ý tưởng đến công trình hoàn thiện – đẳng cấp và bền vững.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    primaryLabel: "Nhận báo giá",
    primaryUrl: "/lien-he?nguon=gioi-thieu",
    secondaryLabel: "Nhận tư vấn ngay",
    secondaryUrl: "/lien-he?nguon=gioi-thieu",
  },
};

type SettingsTab = "overview" | "seo" | "hero" | "intro" | "identity" | "whychoose" | "timeline" | "people" | "stats" | "strengths" | "partners" | "testimonials" | "finalcta";

export function AboutPageSettingsPanel({ roles }: { roles: string[] }) {
  const { notify } = useAdminFeedback();
  const [values, setValues] = useState<AboutPageConfig>(defaultAboutSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const canSave = roles.includes("Super Admin") || roles.includes("Admin");

  useEffect(() => {
    apiFetch("/api/cms/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error("Không tải được cấu hình website.");
        return res.json();
      })
      .then((payload) => {
        const raw = payload["site.pages.about"];
        if (raw && typeof raw === "object") {
          const config = raw as AboutPageConfig;
          setValues({
            slug: "gioi-thieu",
            title: config.title || defaultAboutSettings.title,
            isActive: config.isActive !== undefined ? config.isActive : defaultAboutSettings.isActive,
            seo: { ...defaultAboutSettings.seo, ...(config.seo || {}) },
            hero: { ...defaultAboutSettings.hero, ...(config.hero || {}) },
            intro: { ...defaultAboutSettings.intro, ...(config.intro || {}) },
            identity: { ...defaultAboutSettings.identity, ...(config.identity || {}) },
            whyChoose: { ...defaultAboutSettings.whyChoose, ...(config.whyChoose || {}) },
            timeline: { ...defaultAboutSettings.timeline, ...(config.timeline || {}) },
            people: { ...defaultAboutSettings.people, ...(config.people || {}) },
            stats: Array.isArray(config.stats) ? config.stats : defaultAboutSettings.stats,
            strengths: { ...defaultAboutSettings.strengths, ...(config.strengths || {}) },
            partners: { ...defaultAboutSettings.partners, ...(config.partners || {}) },
            testimonials: { ...defaultAboutSettings.testimonials, ...(config.testimonials || {}) },
            finalCta: { ...defaultAboutSettings.finalCta, ...(config.finalCta || {}) },
          });
        }
      })
      .catch(() => notify({ tone: "info", title: "Sử dụng cấu hình mặc định", description: "Chưa có bản ghi cấu hình trên database." }))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const response = await apiFetch("/api/cms/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "site.pages.about", value: values }),
      });
      if (!response.ok) throw new Error(await response.text());
      notify({ tone: "success", title: "Lưu cấu hình thành công", description: "Đã cập nhật trang giới thiệu." });
    } catch (err) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: err instanceof Error ? err.message : String(err) });
    } finally {
      setSaving(false);
    }
  };

  const updateSubField = (section: keyof AboutPageConfig, field: string, val: unknown) => {
    setValues((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: val,
      },
    }));
  };

  if (loading) return <div className="empty-state">Đang tải cấu hình...</div>;

  return (
    <section className="settings-layout">
      <article className="panel settings-card">
        <div className="panel-heading">
          <div>
            <h2>Cấu hình trang giới thiệu</h2>
            <p>Thiết lập chi tiết nội dung, hình ảnh và SEO cho trang `/gioi-thieu`.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <a
              className="secondary-button"
              href={`${process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:31873"}/gioi-thieu`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} /> Xem website
            </a>
            <button
              className="primary-button"
              disabled={!canSave || saving}
              onClick={save}
              type="button"
            >
              <Save size={16} /> {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        </div>

        <div className="tabs-container" style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {/* Vertical Tabs navigation */}
          <nav className="service-page-section-list" style={{ width: "220px", flexShrink: 0 }} aria-label="Tabs">
            {[
              { id: "overview", label: "Tổng quan" },
              { id: "seo", label: "SEO & Social" },
              { id: "hero", label: "Phần đầu (Hero)" },
              { id: "intro", label: "Giới thiệu" },
              { id: "identity", label: "Tầm nhìn - Sứ mệnh" },
              { id: "whychoose", label: "Vì sao chọn" },
              { id: "timeline", label: "Hành trình" },
              { id: "people", label: "Con người" },
              { id: "stats", label: "Thống kê strip" },
              { id: "strengths", label: "Thế mạnh & Năng lực" },
              { id: "partners", label: "Đối tác thương hiệu" },
              { id: "testimonials", label: "Khách hàng đánh giá" },
              { id: "finalcta", label: "CTA cuối trang" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`service-page-section-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                type="button"
                style={{ textAlign: "left", width: "100%", display: "block" }}
              >
                <strong>{tab.label}</strong>
              </button>
            ))}
          </nav>

          {/* Form Content area */}
          <div className="service-page-section-form" style={{ flexGrow: 1 }}>
            {activeTab === "overview" && (
              <div className="cms-form">
                <label>
                  Tiêu đề trang quản trị
                  <input
                    value={values.title}
                    onChange={(e) => setValues({ ...values, title: e.target.value })}
                  />
                </label>
                <label>
                  Slug cố định
                  <input value={values.slug} disabled />
                </label>
                <label className="checkbox-label" style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", marginTop: "15px" }}>
                  <input
                    type="checkbox"
                    checked={values.isActive}
                    onChange={(e) => setValues({ ...values, isActive: e.target.checked })}
                    style={{ width: "auto", height: "auto" }}
                  />
                  <span>Bật hiển thị trang trên website public</span>
                </label>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="cms-form">
                <label>
                  Meta Title
                  <input
                    value={values.seo.metaTitle || ""}
                    onChange={(e) => updateSubField("seo", "metaTitle", e.target.value)}
                  />
                </label>
                <label>
                  Meta Description
                  <textarea
                    value={values.seo.metaDescription || ""}
                    onChange={(e) => updateSubField("seo", "metaDescription", e.target.value)}
                    rows={4}
                  />
                </label>
                <label>
                  Canonical URL
                  <input
                    value={values.seo.canonicalUrl || ""}
                    onChange={(e) => updateSubField("seo", "canonicalUrl", e.target.value)}
                  />
                </label>
                <label>
                  OG Title
                  <input
                    value={values.seo.ogTitle || ""}
                    onChange={(e) => updateSubField("seo", "ogTitle", e.target.value)}
                  />
                </label>
                <label>
                  OG Description
                  <textarea
                    value={values.seo.ogDescription || ""}
                    onChange={(e) => updateSubField("seo", "ogDescription", e.target.value)}
                    rows={3}
                  />
                </label>
                <ImageUrlPicker
                  label="OG Image"
                  value={values.seo.ogImage || ""}
                  onChange={(val) => updateSubField("seo", "ogImage", val)}
                />
                <label className="checkbox-label" style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", marginTop: "15px" }}>
                  <input
                    type="checkbox"
                    checked={values.seo.noIndex || false}
                    onChange={(e) => updateSubField("seo", "noIndex", e.target.checked)}
                    style={{ width: "auto", height: "auto" }}
                  />
                  <span>Chặn bot tìm kiếm index trang này (noindex)</span>
                </label>
              </div>
            )}

            {activeTab === "hero" && (
              <div className="cms-form">
                <label>
                  Breadcrumb Label
                  <input
                    value={values.hero.breadcrumbLabel}
                    onChange={(e) => updateSubField("hero", "breadcrumbLabel", e.target.value)}
                  />
                </label>
                <label>
                  Eyebrow
                  <input
                    value={values.hero.eyebrow}
                    onChange={(e) => updateSubField("hero", "eyebrow", e.target.value)}
                  />
                </label>
                <label>
                  Tiêu đề lớn (Hero Title)
                  <textarea
                    value={values.hero.title}
                    onChange={(e) => updateSubField("hero", "title", e.target.value)}
                    rows={2}
                  />
                </label>
                <label>
                  Mô tả (Hero Description)
                  <textarea
                    value={values.hero.description}
                    onChange={(e) => updateSubField("hero", "description", e.target.value)}
                    rows={4}
                  />
                </label>
                <ImageUrlPicker
                  label="Ảnh nền Hero"
                  value={values.hero.backgroundImageUrl}
                  onChange={(val) => updateSubField("hero", "backgroundImageUrl", val)}
                />
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
                  <label>
                    Nhãn nút chính
                    <input
                      value={values.hero.primaryCtaLabel}
                      onChange={(e) => updateSubField("hero", "primaryCtaLabel", e.target.value)}
                    />
                  </label>
                  <label>
                    URL nút chính
                    <input
                      value={values.hero.primaryCtaUrl}
                      onChange={(e) => updateSubField("hero", "primaryCtaUrl", e.target.value)}
                    />
                  </label>
                  <label>
                    Nhãn nút phụ
                    <input
                      value={values.hero.secondaryCtaLabel}
                      onChange={(e) => updateSubField("hero", "secondaryCtaLabel", e.target.value)}
                    />
                  </label>
                  <label>
                    URL nút phụ
                    <input
                      value={values.hero.secondaryCtaUrl}
                      onChange={(e) => updateSubField("hero", "secondaryCtaUrl", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === "intro" && (
              <div className="cms-form">
                <label>
                  Eyebrow
                  <input
                    value={values.intro.eyebrow}
                    onChange={(e) => updateSubField("intro", "eyebrow", e.target.value)}
                  />
                </label>
                <label>
                  Tiêu đề giới thiệu
                  <input
                    value={values.intro.title}
                    onChange={(e) => updateSubField("intro", "title", e.target.value)}
                  />
                </label>
                <label>
                  Mô tả chi tiết
                  <textarea
                    value={values.intro.description}
                    onChange={(e) => updateSubField("intro", "description", e.target.value)}
                    rows={5}
                  />
                </label>
                <ImageUrlPicker
                  label="Ảnh giới thiệu 2 cột"
                  value={values.intro.imageUrl}
                  onChange={(val) => updateSubField("intro", "imageUrl", val)}
                />

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Checklist nổi bật</strong></label>
                  {values.intro.checklist.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <input
                        value={item}
                        onChange={(e) => {
                          const next = [...values.intro.checklist];
                          next[idx] = e.target.value;
                          updateSubField("intro", "checklist", next);
                        }}
                      />
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.intro.checklist.filter((_, i) => i !== idx);
                          updateSubField("intro", "checklist", next);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "10px" }}
                    onClick={() => {
                      updateSubField("intro", "checklist", [...values.intro.checklist, ""]);
                    }}
                  >
                    <Plus size={14} /> Thêm checklist
                  </button>
                </div>
              </div>
            )}

            {activeTab === "identity" && (
              <div className="cms-form">
                <label>
                  Tiêu đề section
                  <input
                    value={values.identity.title}
                    onChange={(e) => updateSubField("identity", "title", e.target.value)}
                  />
                </label>

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Khối giá trị (Tối đa 3 mục)</strong></label>
                  {values.identity.items.map((item, idx) => (
                    <div key={idx} className="landing-card-row" style={{ marginTop: "15px", border: "1px solid var(--line)", padding: "15px", borderRadius: "10px" }}>
                      <div className="landing-card-grid">
                        <label>
                          Icon slug
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const next = [...values.identity.items];
                              next[idx] = { ...next[idx], icon: e.target.value };
                              updateSubField("identity", "items", next);
                            }}
                          >
                            <option value="eye">Con mắt (Tầm nhìn)</option>
                            <option value="target">Bia ngắm (Sứ mệnh)</option>
                            <option value="diamond">Kim cương (Giá trị cốt lõi)</option>
                          </select>
                        </label>
                        <label>
                          Tiêu đề
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const next = [...values.identity.items];
                              next[idx] = { ...next[idx], title: e.target.value };
                              updateSubField("identity", "items", next);
                            }}
                          />
                        </label>
                        <label className="wide">
                          Mô tả
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const next = [...values.identity.items];
                              next[idx] = { ...next[idx], description: e.target.value };
                              updateSubField("identity", "items", next);
                            }}
                            rows={3}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.identity.items.filter((_, i) => i !== idx);
                          updateSubField("identity", "items", next);
                        }}
                        style={{ marginTop: "10px" }}
                      >
                        <Trash2 size={16} /> Xóa mục
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "15px" }}
                    onClick={() => {
                      updateSubField("identity", "items", [...values.identity.items, { icon: "eye", title: "", description: "" }]);
                    }}
                  >
                    <Plus size={14} /> Thêm khối giá trị
                  </button>
                </div>
              </div>
            )}

            {activeTab === "whychoose" && (
              <div className="cms-form">
                <label>
                  Tiêu đề section
                  <input
                    value={values.whyChoose.title}
                    onChange={(e) => updateSubField("whyChoose", "title", e.target.value)}
                  />
                </label>

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Ưu điểm nổi bật (Vì sao chọn)</strong></label>
                  {values.whyChoose.items.map((item, idx) => (
                    <div key={idx} className="landing-card-row" style={{ marginTop: "15px", border: "1px solid var(--line)", padding: "15px", borderRadius: "10px" }}>
                      <div className="landing-card-grid">
                        <label>
                          Icon slug
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const next = [...values.whyChoose.items];
                              next[idx] = { ...next[idx], icon: e.target.value };
                              updateSubField("whyChoose", "items", next);
                            }}
                          >
                            <option value="design">Thiết kế sáng tạo</option>
                            <option value="progress">Tiến độ</option>
                            <option value="materials">Vật liệu minh bạch</option>
                            <option value="shield">Bảo hành</option>
                            <option value="team">Đội ngũ</option>
                            <option value="cost">Chi phí tối ưu</option>
                          </select>
                        </label>
                        <label>
                          Tiêu đề
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const next = [...values.whyChoose.items];
                              next[idx] = { ...next[idx], title: e.target.value };
                              updateSubField("whyChoose", "items", next);
                            }}
                          />
                        </label>
                        <label className="wide">
                          Mô tả
                          <input
                            value={item.description}
                            onChange={(e) => {
                              const next = [...values.whyChoose.items];
                              next[idx] = { ...next[idx], description: e.target.value };
                              updateSubField("whyChoose", "items", next);
                            }}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.whyChoose.items.filter((_, i) => i !== idx);
                          updateSubField("whyChoose", "items", next);
                        }}
                        style={{ marginTop: "10px" }}
                      >
                        <Trash2 size={16} /> Xóa mục
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "15px" }}
                    onClick={() => {
                      updateSubField("whyChoose", "items", [...values.whyChoose.items, { icon: "design", title: "", description: "" }]);
                    }}
                  >
                    <Plus size={14} /> Thêm ưu điểm
                  </button>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="cms-form">
                <label>
                  Tiêu đề section
                  <input
                    value={values.timeline.title}
                    onChange={(e) => updateSubField("timeline", "title", e.target.value)}
                  />
                </label>

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Mốc thời gian</strong></label>
                  {values.timeline.items.map((item, idx) => (
                    <div key={idx} className="landing-card-row" style={{ marginTop: "15px", border: "1px solid var(--line)", padding: "15px", borderRadius: "10px" }}>
                      <div className="landing-card-grid">
                        <label>
                          Năm
                          <input
                            value={item.year}
                            onChange={(e) => {
                              const next = [...values.timeline.items];
                              next[idx] = { ...next[idx], year: e.target.value };
                              updateSubField("timeline", "items", next);
                            }}
                            placeholder="Vd: 2014"
                          />
                        </label>
                        <label>
                          Tiêu đề mốc
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const next = [...values.timeline.items];
                              next[idx] = { ...next[idx], title: e.target.value };
                              updateSubField("timeline", "items", next);
                            }}
                            placeholder="Khởi đầu"
                          />
                        </label>
                        <label className="wide">
                          Mô tả sự kiện
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const next = [...values.timeline.items];
                              next[idx] = { ...next[idx], description: e.target.value };
                              updateSubField("timeline", "items", next);
                            }}
                            rows={2}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.timeline.items.filter((_, i) => i !== idx);
                          updateSubField("timeline", "items", next);
                        }}
                        style={{ marginTop: "10px" }}
                      >
                        <Trash2 size={16} /> Xóa mốc
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "15px" }}
                    onClick={() => {
                      updateSubField("timeline", "items", [...values.timeline.items, { year: "", title: "", description: "" }]);
                    }}
                  >
                    <Plus size={14} /> Thêm mốc lịch sử
                  </button>
                </div>
              </div>
            )}

            {activeTab === "people" && (
              <div className="cms-form">
                <label>
                  Eyebrow
                  <input
                    value={values.people.eyebrow}
                    onChange={(e) => updateSubField("people", "eyebrow", e.target.value)}
                  />
                </label>
                <label>
                  Tiêu đề section
                  <input
                    value={values.people.title}
                    onChange={(e) => updateSubField("people", "title", e.target.value)}
                  />
                </label>
                <label>
                  Mô tả chi tiết
                  <textarea
                    value={values.people.description}
                    onChange={(e) => updateSubField("people", "description", e.target.value)}
                    rows={4}
                  />
                </label>
                <ImageUrlPicker
                  label="Ảnh đội ngũ / con người"
                  value={values.people.imageUrl}
                  onChange={(val) => updateSubField("people", "imageUrl", val)}
                />

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Thông số/Đặc trưng nổi bật (Highlights)</strong></label>
                  {values.people.highlights.map((item, idx) => (
                    <div key={idx} className="landing-card-row" style={{ marginTop: "15px", border: "1px solid var(--line)", padding: "15px", borderRadius: "10px" }}>
                      <div className="landing-card-grid">
                        <label>
                          Icon slug
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const next = [...values.people.highlights];
                              next[idx] = { ...next[idx], icon: e.target.value };
                              updateSubField("people", "highlights", next);
                            }}
                          >
                            <option value="users">Nhân sự (Users)</option>
                            <option value="experience">Năm kinh nghiệm (Experience)</option>
                            <option value="quality">Tận tâm/Chất lượng (Quality)</option>
                            <option value="culture">Văn hóa (Culture)</option>
                          </select>
                        </label>
                        <label>
                          Giá trị nổi bật (Vd: 50+, 100%)
                          <input
                            value={item.value || ""}
                            onChange={(e) => {
                              const next = [...values.people.highlights];
                              next[idx] = { ...next[idx], value: e.target.value };
                              updateSubField("people", "highlights", next);
                            }}
                          />
                        </label>
                        <label>
                          Tiêu đề highlight
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const next = [...values.people.highlights];
                              next[idx] = { ...next[idx], title: e.target.value };
                              updateSubField("people", "highlights", next);
                            }}
                          />
                        </label>
                        <label className="wide">
                          Mô tả phụ
                          <input
                            value={item.description || ""}
                            onChange={(e) => {
                              const next = [...values.people.highlights];
                              next[idx] = { ...next[idx], description: e.target.value };
                              updateSubField("people", "highlights", next);
                            }}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.people.highlights.filter((_, i) => i !== idx);
                          updateSubField("people", "highlights", next);
                        }}
                        style={{ marginTop: "10px" }}
                      >
                        <Trash2 size={16} /> Xóa mục
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "15px" }}
                    onClick={() => {
                      updateSubField("people", "highlights", [...values.people.highlights, { icon: "users", value: "", title: "", description: "" }]);
                    }}
                  >
                    <Plus size={14} /> Thêm highlight
                  </button>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="cms-form">
                <label><strong>Các chỉ số thống kê (Stats)</strong></label>
                {values.stats.map((stat, idx) => (
                  <div key={idx} style={{ border: "1px solid var(--line)", padding: "15px", borderRadius: "10px", marginTop: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label>
                        Giá trị (Vd: 10+, 500+)
                        <input
                          value={stat.value}
                          onChange={(e) => {
                            const next = [...values.stats];
                            next[idx] = { ...next[idx], value: e.target.value };
                            setValues({ ...values, stats: next });
                          }}
                        />
                      </label>
                      <label>
                        Nhãn hiển thị (Vd: Năm kinh nghiệm)
                        <input
                          value={stat.label}
                          onChange={(e) => {
                            const next = [...values.stats];
                            next[idx] = { ...next[idx], label: e.target.value };
                            setValues({ ...values, stats: next });
                          }}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="landing-row-delete"
                      onClick={() => {
                        const next = values.stats.filter((_, i) => i !== idx);
                        setValues({ ...values, stats: next });
                      }}
                      style={{ marginTop: "10px" }}
                    >
                      <Trash2 size={16} /> Xóa stat
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="secondary-button"
                  style={{ marginTop: "15px" }}
                  onClick={() => {
                    setValues({ ...values, stats: [...values.stats, { value: "", label: "" }] });
                  }}
                >
                  <Plus size={14} /> Thêm thống kê
                </button>
              </div>
            )}

            {activeTab === "strengths" && (
              <div className="cms-form">
                <label>
                  Tiêu đề section
                  <input
                    value={values.strengths.title}
                    onChange={(e) => updateSubField("strengths", "title", e.target.value)}
                  />
                </label>

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Các mảng năng lực & thế mạnh (Tối đa 5 mục)</strong></label>
                  {values.strengths.items.map((item, idx) => (
                    <div key={idx} className="landing-card-row" style={{ marginTop: "15px", border: "1px solid var(--line)", padding: "15px", borderRadius: "10px" }}>
                      <div className="landing-card-grid">
                        <label>
                          Tiêu đề mảng thế mạnh
                          <input
                            value={item.title}
                            onChange={(e) => {
                              const next = [...values.strengths.items];
                              next[idx] = { ...next[idx], title: e.target.value };
                              updateSubField("strengths", "items", next);
                            }}
                          />
                        </label>
                        <label className="wide">
                          Mô tả ngắn
                          <input
                            value={item.description}
                            onChange={(e) => {
                              const next = [...values.strengths.items];
                              next[idx] = { ...next[idx], description: e.target.value };
                              updateSubField("strengths", "items", next);
                            }}
                          />
                        </label>
                        <ImageUrlPicker
                          label="Ảnh minh họa"
                          value={item.imageUrl}
                          onChange={(val) => {
                            const next = [...values.strengths.items];
                            next[idx] = { ...next[idx], imageUrl: val };
                            updateSubField("strengths", "items", next);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.strengths.items.filter((_, i) => i !== idx);
                          updateSubField("strengths", "items", next);
                        }}
                        style={{ marginTop: "10px" }}
                      >
                        <Trash2 size={16} /> Xóa mục
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "15px" }}
                    onClick={() => {
                      updateSubField("strengths", "items", [...values.strengths.items, { imageUrl: "", title: "", description: "" }]);
                    }}
                  >
                    <Plus size={14} /> Thêm thế mạnh
                  </button>
                </div>
              </div>
            )}

            {activeTab === "partners" && (
              <div className="cms-form">
                <label>
                  Tiêu đề section đối tác
                  <input
                    value={values.partners.title}
                    onChange={(e) => updateSubField("partners", "title", e.target.value)}
                  />
                </label>

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Danh sách logo đối tác</strong></label>
                  {values.partners.items.map((item, idx) => (
                    <div key={idx} className="landing-card-row" style={{ marginTop: "15px", border: "1px solid var(--line)", padding: "15px", borderRadius: "10px" }}>
                      <div className="landing-card-grid">
                        <label>
                          Tên đối tác
                          <input
                            value={item.name}
                            onChange={(e) => {
                              const next = [...values.partners.items];
                              next[idx] = { ...next[idx], name: e.target.value };
                              updateSubField("partners", "items", next);
                            }}
                          />
                        </label>
                        <label>
                          URL chuyển hướng
                          <input
                            value={item.url || ""}
                            onChange={(e) => {
                              const next = [...values.partners.items];
                              next[idx] = { ...next[idx], url: e.target.value };
                              updateSubField("partners", "items", next);
                            }}
                          />
                        </label>
                        <ImageUrlPicker
                          label="Logo đối tác (Nếu trống sẽ hiển thị chữ)"
                          value={item.logoUrl || ""}
                          onChange={(val) => {
                            const next = [...values.partners.items];
                            next[idx] = { ...next[idx], logoUrl: val };
                            updateSubField("partners", "items", next);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.partners.items.filter((_, i) => i !== idx);
                          updateSubField("partners", "items", next);
                        }}
                        style={{ marginTop: "10px" }}
                      >
                        <Trash2 size={16} /> Xóa đối tác
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "15px" }}
                    onClick={() => {
                      updateSubField("partners", "items", [...values.partners.items, { name: "", logoUrl: "", url: "" }]);
                    }}
                  >
                    <Plus size={14} /> Thêm đối tác
                  </button>
                </div>
              </div>
            )}

            {activeTab === "testimonials" && (
              <div className="cms-form">
                <label>
                  Tiêu đề section ý kiến khách hàng
                  <input
                    value={values.testimonials.title}
                    onChange={(e) => updateSubField("testimonials", "title", e.target.value)}
                  />
                </label>

                <div style={{ marginTop: "20px" }}>
                  <label><strong>Đánh giá thực tế (Testimonials)</strong></label>
                  {values.testimonials.items.map((item, idx) => (
                    <div key={idx} className="landing-card-row" style={{ marginTop: "15px", border: "1px solid var(--line)", padding: "15px", borderRadius: "10px" }}>
                      <div className="landing-card-grid">
                        <label>
                          Tên khách hàng
                          <input
                            value={item.name}
                            onChange={(e) => {
                              const next = [...values.testimonials.items];
                              next[idx] = { ...next[idx], name: e.target.value };
                              updateSubField("testimonials", "items", next);
                            }}
                          />
                        </label>
                        <label>
                          Khu vực / Loại nhà (Vd: Biệt thự – Hà Nội)
                          <input
                            value={item.location || ""}
                            onChange={(e) => {
                              const next = [...values.testimonials.items];
                              next[idx] = { ...next[idx], location: e.target.value };
                              updateSubField("testimonials", "items", next);
                            }}
                          />
                        </label>
                        <label>
                          Số sao đánh giá (Rating)
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={item.rating || 5}
                            onChange={(e) => {
                              const next = [...values.testimonials.items];
                              next[idx] = { ...next[idx], rating: Number(e.target.value) };
                              updateSubField("testimonials", "items", next);
                            }}
                          />
                        </label>
                        <ImageUrlPicker
                          label="Avatar khách hàng"
                          value={item.avatarUrl || ""}
                          onChange={(val) => {
                            const next = [...values.testimonials.items];
                            next[idx] = { ...next[idx], avatarUrl: val };
                            updateSubField("testimonials", "items", next);
                          }}
                        />
                        <label className="wide">
                          Lời trích dẫn (Quote)
                          <textarea
                            value={item.quote}
                            onChange={(e) => {
                              const next = [...values.testimonials.items];
                              next[idx] = { ...next[idx], quote: e.target.value };
                              updateSubField("testimonials", "items", next);
                            }}
                            rows={3}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        className="landing-row-delete"
                        onClick={() => {
                          const next = values.testimonials.items.filter((_, i) => i !== idx);
                          updateSubField("testimonials", "items", next);
                        }}
                        style={{ marginTop: "10px" }}
                      >
                        <Trash2 size={16} /> Xóa đánh giá
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ marginTop: "15px" }}
                    onClick={() => {
                      updateSubField("testimonials", "items", [...values.testimonials.items, { name: "", location: "", avatarUrl: "", rating: 5, quote: "" }]);
                    }}
                  >
                    <Plus size={14} /> Thêm đánh giá
                  </button>
                </div>
              </div>
            )}

            {activeTab === "finalcta" && (
              <div className="cms-form">
                <label>
                  Tiêu đề CTA cuối
                  <input
                    value={values.finalCta.title}
                    onChange={(e) => updateSubField("finalCta", "title", e.target.value)}
                  />
                </label>
                <label>
                  Mô tả CTA cuối
                  <textarea
                    value={values.finalCta.description}
                    onChange={(e) => updateSubField("finalCta", "description", e.target.value)}
                    rows={3}
                  />
                </label>
                <ImageUrlPicker
                  label="Ảnh nền CTA cuối"
                  value={values.finalCta.backgroundImageUrl || ""}
                  onChange={(val) => updateSubField("finalCta", "backgroundImageUrl", val)}
                />
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
                  <label>
                    Nhãn nút chính
                    <input
                      value={values.finalCta.primaryLabel}
                      onChange={(e) => updateSubField("finalCta", "primaryLabel", e.target.value)}
                    />
                  </label>
                  <label>
                    URL nút chính
                    <input
                      value={values.finalCta.primaryUrl}
                      onChange={(e) => updateSubField("finalCta", "primaryUrl", e.target.value)}
                    />
                  </label>
                  <label>
                    Nhãn nút phụ
                    <input
                      value={values.finalCta.secondaryLabel}
                      onChange={(e) => updateSubField("finalCta", "secondaryLabel", e.target.value)}
                    />
                  </label>
                  <label>
                    URL nút phụ
                    <input
                      value={values.finalCta.secondaryUrl}
                      onChange={(e) => updateSubField("finalCta", "secondaryUrl", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
