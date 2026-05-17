import { ArrowRight, Banknote, CheckCircle2, Clock, Filter, Home, Images, LayoutGrid, MapPin, MessageCircle, Palette, Phone, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TemplateGalleryModal } from "@/components/template-gallery-modal";
import { interiorImages, projectImages, thumbnailUrl, type ArchitectureDesign, type CatalogFilters, type InteriorDesign } from "@/lib/api";

type Meta = { total: number; page: number; limit: number; totalPages: number };

export function ArchitectureDesignList({ designs, filters, meta, searchParams }: { designs: ArchitectureDesign[]; filters: CatalogFilters; meta: Meta; searchParams: Record<string, string | undefined> }) {
  return (
    <TemplatePageShell
      title="Mẫu thiết kế kiến trúc Hà Thành Home"
      subtitle="Mẫu thiết kế"
      count={meta.total}
      filters={<ArchitectureFilters filters={filters} values={searchParams} />}
    >
      <div className="template-grid">
        {designs.map((design, index) => <ArchitectureCard design={design} index={index} key={design.id} />)}
      </div>
    </TemplatePageShell>
  );
}

export function InteriorDesignList({ designs, filters, meta, searchParams }: { designs: InteriorDesign[]; filters: CatalogFilters; meta: Meta; searchParams: Record<string, string | undefined> }) {
  return (
    <TemplatePageShell
      title="Các phong cách nội thất Hà Thành Home cung cấp"
      subtitle="Mẫu thiết kế"
      count={meta.total}
      filters={<InteriorFilters filters={filters} values={searchParams} />}
    >
      <div className="template-grid">
        {designs.map((design, index) => <InteriorCard design={design} index={index} key={design.id} />)}
      </div>
    </TemplatePageShell>
  );
}

function TemplatePageShell({ children, count, filters, subtitle, title }: { children: ReactNode; count: number; filters: ReactNode; subtitle: string; title: string }) {
  return (
    <main className="template-page">
      <div className="container breadcrumb">Trang chủ <span>/</span> {title}</div>
      <section className="template-hero">
        <div className="container">
          <span>{subtitle}</span>
          <h1>{title}</h1>
        </div>
      </section>
      <section className="section template-section">
        <div className="container">
          {filters}
          <div className="template-count"><h2>Mẫu thiết kế</h2><p>Hiển thị {count} mẫu thiết kế</p></div>
          {children}
        </div>
      </section>
    </main>
  );
}

function ArchitectureFilters({ filters, values }: { filters: CatalogFilters; values: Record<string, string | undefined> }) {
  return (
    <form className="template-filter-bar">
      <button type="submit"><Filter size={17} /> Bộ lọc</button>
      <Select name="houseType" label="Loại nhà" value={values.houseType} options={catalogOptions(filters, "house_type")} />
      <Select name="style" label="Phong cách" value={values.style} options={catalogOptions(filters, "style")} />
      <Select name="floors" label="Số tầng" value={values.floors} options={catalogOptions(filters, "floors")} />
      <Select name="roofType" label="Kiểu mái" value={values.roofType} options={catalogOptions(filters, "roof_type")} />
      <Select name="location" label="Địa điểm" value={values.location} options={catalogOptions(filters, "location")} />
      <Select name="areaMin" label="Diện tích" value={values.areaMin} options={["100", "150", "200", "300"]} />
      <Select name="sort" label="Xếp theo" value={values.sort} options={["newest", "area_asc", "area_desc", "budget_asc", "budget_desc"]} labels={{ newest: "Mới nhất", area_asc: "Diện tích tăng", area_desc: "Diện tích giảm", budget_asc: "Ngân sách tăng", budget_desc: "Ngân sách giảm" }} alignRight />
    </form>
  );
}

function InteriorFilters({ filters, values }: { filters: CatalogFilters; values: Record<string, string | undefined> }) {
  return (
    <form className="template-filter-bar">
      <button type="submit"><Filter size={17} /> Bộ lọc</button>
      <Select name="interiorStyle" label="Phong cách" value={values.interiorStyle} options={catalogOptions(filters, "interior_style")} />
      <Select name="houseType" label="Loại nhà" value={values.houseType} options={catalogOptions(filters, "house_type")} />
      <Select name="roomType" label="Loại phòng" value={values.roomType} options={catalogOptions(filters, "room_type")} />
      <Select name="budgetRange" label="Ngân sách" value={values.budgetRange} options={catalogOptions(filters, "budget_range")} />
      <Select name="location" label="Địa điểm" value={values.location} options={catalogOptions(filters, "location")} />
      <Select name="areaMin" label="Diện tích" value={values.areaMin} options={["30", "60", "100", "200"]} />
      <Select name="sort" label="Xếp theo" value={values.sort} options={["newest", "area_asc", "area_desc", "budget_asc", "budget_desc"]} labels={{ newest: "Mới nhất", area_asc: "Diện tích tăng", area_desc: "Diện tích giảm", budget_asc: "Ngân sách tăng", budget_desc: "Ngân sách giảm" }} alignRight />
    </form>
  );
}

function catalogOptions(filters: CatalogFilters, type: string) {
  return Array.from(new Set((filters.filters[type] || []).map((item) => item.name).filter(isReadableOption)));
}

function isReadableOption(value: string) {
  return !/[\u00c3\u00c2\u00c4\u00c5\u00c6]|\u00e1\u00ba|\u00e1\u00bb|\u00e2\u20ac/.test(value);
}

function Select({ alignRight, label, labels, name, options, value }: { alignRight?: boolean; label: string; labels?: Record<string, string>; name: string; options: string[]; value?: string }) {
  return (
    <label className={alignRight ? "push-right" : ""}>
      <span>{label}:</span>
      <select defaultValue={value || ""} name={name}>
        <option value="">Tất cả</option>
        {options.map((option) => <option key={option} value={option}>{labels?.[option] || option}</option>)}
      </select>
    </label>
  );
}

export function ArchitectureCard({ design, index }: { design: ArchitectureDesign; index: number }) {
  const image = thumbnailUrl(design, projectImages[index % projectImages.length]);
  return (
    <a className="template-card" href={`/mau-thiet-ke-kien-truc/${design.slug}`}>
      <img alt={design.title} src={image} />
      <h3>{design.title}{design.code ? ` - ${design.code}` : ""}</h3>
      <div className="template-meta">
        <Meta icon={Home} label="Loại nhà" value={design.houseType} />
        <Meta icon={Palette} label="Phong cách" value={design.style} />
        <Meta icon={Ruler} label="Diện tích" value={design.area ? `${design.area}m2` : undefined} />
        <Meta icon={Clock} label="Thời gian" value={design.constructionTime} />
        <Meta icon={Banknote} label="Ngân sách" value={formatMoney(design.estimatedBudget)} />
        <Meta icon={MapPin} label="Vị trí" value={design.location} />
      </div>
    </a>
  );
}

export function InteriorCard({ design, index }: { design: InteriorDesign; index: number }) {
  const image = thumbnailUrl(design, interiorImages[index % interiorImages.length]);
  return (
    <a className="template-card" href={`/mau-thiet-ke-noi-that/${design.slug}`}>
      <img alt={design.title} src={image} />
      <h3>{design.title}{design.code ? ` - ${design.code}` : ""}</h3>
      <div className="template-meta">
        <Meta icon={Palette} label="Phong cách" value={design.interiorStyle} />
        <Meta icon={Home} label="Loại nhà" value={design.houseType} />
        <Meta icon={LayoutGrid} label="Loại phòng" value={design.roomType} />
        <Meta icon={Ruler} label="Diện tích" value={design.area ? `${design.area}m2` : undefined} />
        <Meta icon={Banknote} label="Ngân sách" value={design.budgetRange || formatMoney(design.budgetMin)} />
        <Meta icon={MapPin} label="Vị trí" value={design.location} />
      </div>
    </a>
  );
}

function Meta({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string | null }) {
  if (!value) return null;
  return <span><Icon size={16} /><small>{label}</small><strong>{value}</strong></span>;
}

export function TemplateDetail({ item, kind }: { item: ArchitectureDesign | InteriorDesign; kind: "architecture" | "interior" }) {
  const isArchitecture = kind === "architecture";
  const image = thumbnailUrl(item, isArchitecture ? projectImages[0] : interiorImages[0]);
  const architecture = item as ArchitectureDesign;
  const interior = item as InteriorDesign;
  const albumImages = buildAlbumImages(item, isArchitecture ? projectImages : interiorImages);
  const specs = isArchitecture
    ? [["Mã mẫu", item.code], ["Loại nhà", architecture.houseType], ["Phong cách", architecture.style], ["Diện tích", architecture.area ? `${architecture.area}m2` : ""], ["Số tầng", architecture.floors], ["Kiểu mái", architecture.roofType], ["Ngân sách", formatMoney(architecture.estimatedBudget)], ["Thời gian", architecture.constructionTime], ["Vị trí", architecture.location]]
    : [["Mã mẫu", item.code], ["Phong cách", interior.interiorStyle], ["Loại nhà", interior.houseType], ["Loại phòng", interior.roomType], ["Diện tích", interior.area ? `${interior.area}m2` : ""], ["Layout", interior.layoutType], ["Tone vật liệu", interior.materialTone], ["Ngân sách", interior.budgetRange || formatMoney(interior.budgetMin)], ["Vị trí", interior.location]];

  return (
    <main>
      <section className="template-detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(15,61,46,.84), rgba(15,61,46,.2)), url(${image})` }}>
        <div className="container template-detail-hero-content">
          <span>Mẫu thiết kế</span>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <div className="template-detail-actions">
            <a className="cta" href="#lead"><MessageCircle size={18} /> Đặt tư vấn mẫu này</a>
            <a className="cta secondary" href="tel:0966123456"><Phone size={18} /> Gọi 0966 123 456</a>
          </div>
        </div>
      </section>

      <section className="section template-detail-summary">
        <div className="container template-detail-grid">
          <aside className="template-specs-card">
            <div className="template-specs-heading">
              <span>Thông số mẫu</span>
              <strong>{item.code || "Hà Thành Home"}</strong>
            </div>
            <div className="template-specs">{specs.filter(([, value]) => value).map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{String(value)}</strong></div>)}</div>
            <a className="template-side-cta" href="#lead">Nhận báo giá theo mẫu <ArrowRight size={16} /></a>
          </aside>

          <div className="template-detail-main">
            <section className="template-album">
              <div className="template-section-heading">
                <span><Images size={18} /> Album hình ảnh</span>
                <h2>Không gian tham khảo của mẫu thiết kế</h2>
              </div>
              <TemplateGalleryModal images={albumImages} title={item.title} />
            </section>

            <article className="template-article">
              <div className="template-section-heading">
                <span>Bài viết mẫu thiết kế</span>
                <h2>Chi tiết ý tưởng và phương án triển khai</h2>
              </div>
              {item.contentHtml
                ? <div className="detail-content" dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
                : <DefaultTemplateArticle item={item} kind={kind} />}
            </article>

            <section className="template-lead-box" id="lead">
              <div>
                <span>Tư vấn theo mẫu</span>
                <h2>Muốn điều chỉnh mẫu này theo diện tích, ngân sách và vị trí thực tế?</h2>
                <p>Đội ngũ Hà Thành Home sẽ khảo sát nhu cầu, tư vấn phương án mặt bằng, phong cách, vật liệu và lộ trình triển khai phù hợp.</p>
              </div>
              <div className="template-lead-actions">
                <a className="cta" href={`/lien-he?mau=${item.slug}&loai=${kind}`}>Đặt lịch tư vấn</a>
                <a className="outline-cta" href="tel:0966123456"><Phone size={18} /> Gọi ngay</a>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function DefaultTemplateArticle({ item, kind }: { item: ArchitectureDesign | InteriorDesign; kind: "architecture" | "interior" }) {
  const isArchitecture = kind === "architecture";
  const architecture = item as ArchitectureDesign;
  const interior = item as InteriorDesign;
  const highlights = isArchitecture
    ? [
        `${architecture.houseType || "Công trình"} được tổ chức theo phong cách ${architecture.style || "hiện đại"}, ưu tiên hình khối gọn, mặt tiền sáng và công năng dễ sử dụng.`,
        architecture.area ? `Diện tích tham khảo ${architecture.area}m2, phù hợp để phát triển mặt bằng theo nhu cầu sinh hoạt, tiếp khách và nghỉ ngơi của gia đình.` : "Diện tích có thể điều chỉnh theo hiện trạng khu đất và nhu cầu sử dụng thực tế.",
        architecture.estimatedBudget ? `Ngân sách tham khảo khoảng ${formatMoney(architecture.estimatedBudget)}, có thể bóc tách lại theo vật liệu, địa điểm thi công và mức hoàn thiện.` : "Ngân sách sẽ được dự toán lại sau khi khảo sát hiện trạng và thống nhất vật liệu.",
      ]
    : [
        `Không gian được định hướng theo phong cách ${interior.interiorStyle || "hiện đại"}, cân bằng giữa thẩm mỹ, công năng và cảm giác sống lâu dài.`,
        interior.area ? `Diện tích tham khảo ${interior.area}m2, phù hợp để bố trí nội thất theo thói quen sinh hoạt và nhu cầu lưu trữ thực tế.` : "Diện tích có thể thay đổi theo mặt bằng hiện trạng.",
        interior.materialTone ? `Tone vật liệu đề xuất: ${interior.materialTone}, giúp tổng thể có chiều sâu và giữ được cảm giác cao cấp.` : "Vật liệu sẽ được tư vấn theo ngân sách, tần suất sử dụng và phong cách mong muốn.",
      ];

  return (
    <div className="detail-content generated-article">
      <p>{item.description || "Mẫu thiết kế này được Hà Thành Home phát triển như một phương án tham khảo để khách hàng hình dung rõ phong cách, công năng và mức đầu tư trước khi triển khai hồ sơ chi tiết."}</p>
      <h3>Ý tưởng thiết kế</h3>
      <p>{isArchitecture
        ? "Phương án tập trung vào tỷ lệ mặt đứng, sự cân bằng giữa khoảng đặc - rỗng, ánh sáng tự nhiên và khả năng thi công thực tế. Các chi tiết được tiết chế để công trình giữ được vẻ sang trọng mà không bị nặng nề."
        : "Phương án nội thất ưu tiên bố cục mạch lạc, lối đi thoáng, điểm nhấn vật liệu vừa đủ và hệ tủ được thiết kế theo nhu cầu sử dụng thật. Mục tiêu là tạo không gian đẹp khi nhìn tổng thể và tiện khi sống hàng ngày."}</p>
      <div className="template-highlights">
        {highlights.map((text) => <p key={text}><CheckCircle2 size={18} /> {text}</p>)}
      </div>
      <h3>Khả năng tùy biến</h3>
      <p>Mẫu này có thể điều chỉnh theo kích thước đất, hướng nắng gió, số thành viên, ngân sách, vật liệu yêu thích và tiến độ mong muốn. Khi khách hàng liên hệ, Hà Thành Home sẽ tư vấn lại phương án để phù hợp với hiện trạng riêng thay vì áp dụng máy móc.</p>
      <h3>Quy trình triển khai</h3>
      <p>Sau khi tiếp nhận yêu cầu, đội ngũ sẽ tư vấn sơ bộ, khảo sát hoặc nhận mặt bằng hiện trạng, đề xuất concept, hoàn thiện hồ sơ thiết kế, lập dự toán và đồng hành trong quá trình thi công nếu khách hàng cần giải pháp trọn gói.</p>
    </div>
  );
}

function buildAlbumImages(item: ArchitectureDesign | InteriorDesign, fallbacks: string[]) {
  const mediaImages = (item.galleryMedia || [])
    .map((media) => media.largeUrl || media.mediumUrl || media.webpUrl || media.thumbUrl)
    .filter(Boolean) as string[];
  const thumbnail = thumbnailUrl(item, "");
  return Array.from(new Set([thumbnail, ...mediaImages, ...fallbacks].filter(Boolean))).slice(0, 6);
}

function formatMoney(value?: number | null) {
  if (!value) return "";
  if (value < 100000) return value >= 1000 ? `${(value / 1000).toLocaleString("vi-VN")} tỷ` : `${value.toLocaleString("vi-VN")} triệu`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("vi-VN")} tỷ`;
  return `${(value / 1_000_000).toLocaleString("vi-VN")} triệu`;
}
