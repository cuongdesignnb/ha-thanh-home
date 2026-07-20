import { ArrowRight, Banknote, Building2, Filter, Home, MapPin, Ruler, UserRound } from "lucide-react";
import { TemplateGalleryModal } from "@/components/template-gallery-modal";
import { interiorImages, projectImages, thumbnailUrl, type Post, type PostCategory, type Project, type ProjectFilters, type ProjectGroup, type Service, getSiteSettings, PLACEHOLDER_IMAGE } from "@/lib/api";

type Meta = { total: number; page: number; limit: number; totalPages: number };

export function ProjectList({ title, projects }: { title: string; projects: Project[] }) {
  return (
    <><PageHero title={title} /><section className="section"><div className="container project-grid">{projects.map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}</div></section></>
  );
}

export function ProjectCatalog({ filters, group, meta, projects, searchParams }: { filters: ProjectFilters; group?: ProjectGroup; meta: Meta; projects: Project[]; searchParams: Record<string, string | undefined> }) {
  const basePath = group === "construction" ? "/du-an/cong-trinh" : group === "interior" ? "/du-an/noi-that" : "/du-an";
  const categories = filters.categories.filter((item) => {
    if (!group) return true;
    if (group === "construction") return item.group === "construction" || item.group === "xay_nha_tron_goi";
    return item.group === group;
  });
  return (
    <main className="project-catalog-page">
      <div className="container breadcrumb">Trang chủ <span>/</span> Dự án</div>
      <section className="project-catalog-hero">
        <div className="container">
          <span>Danh sách</span>
          <h1>Dự án đã thực hiện</h1>
        </div>
      </section>
      <section className="section project-catalog-section">
        <div className="container">
          <nav className="project-tabs">
            <a className={!searchParams.category ? "active" : ""} href={basePath}>Tất cả</a>
            {categories.map((category) => (
              <a className={searchParams.category === category.slug ? "active" : ""} href={`${basePath}?category=${category.slug}`} key={category.id}>{category.name}</a>
            ))}
          </nav>
          <ProjectFilterBar filters={filters} group={group} searchParams={searchParams} />
          <div className="project-count"><h2>Dự án</h2><p>Hiển thị {meta.total} dự án</p></div>
          <div className="project-catalog-grid">
            {projects.map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProjectFilterBar({ filters, group, searchParams }: { filters: ProjectFilters; group?: ProjectGroup; searchParams: Record<string, string | undefined> }) {
  return (
    <form className="template-filter-bar project-filter-bar">
      {group ? <input name="group" type="hidden" value={group} /> : null}
      {searchParams.category ? <input name="category" type="hidden" value={searchParams.category} /> : null}
      <button type="submit"><Filter size={17} /> Bộ lọc</button>
      <Select name="projectType" label="Loại dự án" value={searchParams.projectType} options={options(filters, "project_type", group)} />
      <Select name={group === "interior" ? "space" : "style"} label={group === "interior" ? "Không gian" : "Phong cách"} value={group === "interior" ? searchParams.space : searchParams.style} options={options(filters, group === "interior" ? "space" : "style", group)} />
      <Select name="scale" label="Quy mô" value={searchParams.scale} options={options(filters, "scale", group)} />
      <Select name="location" label="Địa điểm" value={searchParams.location} options={options(filters, "location", group)} />
      <Select name="sort" label="Xếp theo" value={searchParams.sort} options={["newest", "area_asc", "area_desc", "year_desc"]} labels={{ newest: "Mới nhất", area_asc: "Diện tích tăng", area_desc: "Diện tích giảm", year_desc: "Năm mới nhất" }} alignRight />
    </form>
  );
}

function Select({ alignRight, label, labels, name, options, value }: { alignRight?: boolean; label: string; labels?: Record<string, string>; name: string; options: string[]; value?: string }) {
  const className = [alignRight ? "push-right" : "", value ? "is-active" : ""].filter(Boolean).join(" ");

  return (
    <label className={className || undefined}>
      <span>{label}:</span>
      <select defaultValue={value || ""} name={name}>
        <option value="">Tất cả</option>
        {options.map((option) => <option key={option} value={option}>{labels?.[option] || option}</option>)}
      </select>
    </label>
  );
}

function options(filters: ProjectFilters, type: string, group?: ProjectGroup) {
  return Array.from(new Set(
    (filters.filters[type] || [])
      .filter((item) => {
        if (!group) return true;
        if (group === "construction") return item.group === "construction" || item.group === "xay_nha_tron_goi";
        return item.group === group;
      })
      .map((item) => item.name)
      .filter(isReadableOption),
  ));
}

function isReadableOption(value: string) {
  return !/[\u00c3\u00c2\u00c4\u00c5\u00c6]|\u00e1\u00ba|\u00e1\u00bb|\u00e2\u20ac/.test(value);
}

function ProjectCard({ index, project }: { index: number; project: Project }) {
  const image = thumbnailUrl(project, PLACEHOLDER_IMAGE);
  const categoryName = project.categoryRef?.name || project.category || (project.group === "interior" ? "Nội thất" : "Công trình");
  return (
    <a className="project-catalog-card" href={`/du-an/${project.slug}`}>
      <img alt={project.title} src={image} />
      <h3>{project.title}</h3>
      <div className="project-card-meta">
        <span><Home size={16} /><small>Danh mục</small><strong>{categoryName}</strong></span>
        <span><Ruler size={16} /><small>Quy mô</small><strong>{project.area || project.scale || "Đang cập nhật"}</strong></span>
        <span><MapPin size={16} /><small>Vị trí</small><strong>{project.location || "Hà Nội"}</strong></span>
        {project.clientName ? <span><UserRound size={16} /><small>Chủ đầu tư</small><strong>{project.clientName}</strong></span> : null}
      </div>
    </a>
  );
}

export async function ProjectDetail({ project }: { project: Project }) {
  const settings = await getSiteSettings();
  const hotline = settings["site.identity"]?.hotline || "0898 502 333";
  const hotlineClean = hotline.replace(/\s/g, "");
  const image = thumbnailUrl(project, "");
  const albumImages = buildProjectAlbum(project);
  const specs = [
    ["Nhóm", project.group === "interior" ? "Nội thất" : "Công trình"],
    ["Danh mục", project.categoryRef?.name || project.category],
    ["Loại dự án", project.projectType],
    ["Phong cách", project.style],
    ["Quy mô", project.scale],
    ["Diện tích", project.area || (project.areaValue ? `${project.areaValue}m2` : "")],
    ["Chủ đầu tư", project.clientName],
    ["Ngân sách", project.budgetRange],
    ["Năm", project.year],
    ["Địa điểm", project.location],
  ];
  return (
    <main>
      <section className="template-detail-hero" style={image ? { backgroundImage: `linear-gradient(90deg, rgba(15,61,46,.84), rgba(15,61,46,.2)), url(${image})` } : undefined}>
        <div className="container template-detail-hero-content">
          <span>Dự án đã thực hiện</span>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="template-detail-actions">
            <a className="cta" href={`/lien-he?du-an=${project.slug}`}>Tư vấn dự án tương tự</a>
            <a className="cta secondary" href={`tel:${hotlineClean}`}>Gọi {hotline}</a>
          </div>
        </div>
      </section>
      <section className="section template-detail-summary">
        <div className="container template-detail-grid">
          <aside className="template-specs-card">
            <div className="template-specs-heading"><span>Thông số dự án</span><strong>{project.categoryRef?.name || project.category || "Hà Thành Home"}</strong></div>
            <div className="template-specs">{specs.filter(([, value]) => value).map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{String(value)}</strong></div>)}</div>
            <a className="template-side-cta" href={`/lien-he?du-an=${project.slug}`}>Tư vấn dự án tương tự <ArrowRight size={16} /></a>
          </aside>
          <div className="template-detail-main">
            <section className="template-album">
              <div className="template-section-heading"><span><Building2 size={18} /> Album dự án</span><h2>Hình ảnh thực tế và phối cảnh dự án</h2></div>
              <TemplateGalleryModal images={albumImages} title={project.title} />
            </section>
            <article className="template-article">
              <div className="detail-content" dangerouslySetInnerHTML={{ __html: project.contentHtml || defaultProjectArticle(project) }} />
            </article>
            <section className="template-lead-box">
              <div><span>Tư vấn dự án tương tự</span><h2>Cần triển khai công trình hoặc nội thất theo phong cách tương tự?</h2><p>Hà Thành Home sẽ tư vấn lại theo diện tích, vị trí, ngân sách và yêu cầu vận hành thực tế của anh/chị.</p></div>
              <div className="template-lead-actions"><a className="cta" href={`/lien-he?du-an=${project.slug}`}>Đặt lịch tư vấn</a><a className="outline-cta" href={`tel:${hotlineClean}`}>Gọi ngay</a></div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export async function ServiceDetail({ service }: { service: Service }) {
  const settings = await getSiteSettings();
  const hotline = settings["site.identity"]?.hotline || "0898 502 333";
  const hotlineClean = hotline.replace(/\s/g, "");
  const fallback = service.group === "interior" ? interiorImages[0] : projectImages[0];
  const image = thumbnailUrl(service, fallback);
  const albumImages = buildServiceAlbum(service);
  const groupLabel = service.group === "interior" ? "Nội thất" : service.group === "xay_nha_tron_goi" ? "Xây nhà trọn gói" : "Công trình";
  const publishedAt = service.publishedAt ? new Date(service.publishedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long" }) : null;
  const specs = [
    ["Loại dịch vụ", groupLabel],
    ["Phụ trách", "Đội ngũ Hà Thành Home"],
    ["Hỗ trợ", "Khảo sát · Báo giá · Thi công"],
    publishedAt ? ["Cập nhật", publishedAt] as [string, string] : null,
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <main>
      <section className="template-detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(15,61,46,.84), rgba(15,61,46,.2)), url(${image})` }}>
        <div className="container template-detail-hero-content">
          <span>Dịch vụ — {groupLabel}</span>
          <h1>{service.title}</h1>
          {service.description ? <p>{service.description}</p> : null}
          <div className="template-detail-actions">
            <a className="cta" href={`/lien-he?dich-vu=${service.slug}`}>Đặt lịch tư vấn miễn phí</a>
            <a className="cta secondary" href={`tel:${hotlineClean}`}>Gọi {hotline}</a>
          </div>
        </div>
      </section>

      <section className="section template-detail-summary">
        <div className="container template-detail-grid">
          <aside className="template-specs-card">
            <div className="template-specs-heading"><span>Thông tin dịch vụ</span><strong>{groupLabel}</strong></div>
            <div className="template-specs">{specs.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
            <a className="template-side-cta" href={`/lien-he?dich-vu=${service.slug}`}>Yêu cầu báo giá <ArrowRight size={16} /></a>
          </aside>

          <div className="template-detail-main">
            {albumImages.length > 0 ? (
              <section className="template-album">
                <div className="template-section-heading"><span><Building2 size={18} /> Album dịch vụ</span><h2>Hình ảnh thực tế và phối cảnh dịch vụ</h2></div>
                <TemplateGalleryModal images={albumImages} title={service.title} />
              </section>
            ) : null}

            <article className="template-article">
              <div className="detail-content" dangerouslySetInnerHTML={{ __html: service.contentHtml || `<p>${service.description || "Nội dung dịch vụ đang được cập nhật."}</p>` }} />
            </article>

            <section className="template-lead-box">
              <div><span>Tư vấn dịch vụ này</span><h2>Cần triển khai dịch vụ tương tự?</h2><p>Hà Thành Home tư vấn miễn phí theo diện tích, vị trí, ngân sách và yêu cầu thực tế của anh/chị.</p></div>
              <div className="template-lead-actions"><a className="cta" href={`/lien-he?dich-vu=${service.slug}`}>Đặt lịch tư vấn</a><a className="outline-cta" href={`tel:${hotlineClean}`}>Gọi ngay</a></div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function buildServiceAlbum(service: Service) {
  const mediaImages = (service.galleryMedia || [])
    .map((media) => media.largeUrl || media.mediumUrl || media.webpUrl || media.thumbUrl)
    .filter(Boolean) as string[];
  const thumb = thumbnailUrl(service, "");
  const contentImages = extractContentImages(service.contentHtml || "");
  return Array.from(new Set([thumb, ...mediaImages, ...contentImages].filter(Boolean))).slice(0, 12);
}

function extractContentImages(html: string): string[] {
  if (!html) return [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) { if (m[1]) urls.push(m[1]); }
  return urls;
}

export function ServiceList({ title, services }: { title: string; services: Service[] }) {
  return (
    <><PageHero title={title} /><section className="section"><div className="container services">{services.map((service) => <a className="service-card" href={`/dich-vu/${service.slug}`} key={service.id}><h3>{service.title}</h3><p>{service.description}</p><span>Tìm hiểu thêm <ArrowRight size={14} /></span></a>)}</div></section></>
  );
}

export function PostList({ activeCategory, categories, posts }: { activeCategory?: string; categories?: PostCategory[]; posts: Post[] }) {
  return (
    <>
      <PageHero title="Tin tức & cảm hứng" />
      <section className="section">
        <div className="container">
          {categories?.length ? (
            <nav className="post-category-tabs" aria-label="Danh mục bài viết">
              <a className={!activeCategory ? "active" : ""} href="/tin-tuc">Tất cả</a>
              {categories.map((category) => <a className={activeCategory === category.slug ? "active" : ""} href={`/tin-tuc?category=${category.slug}`} key={category.id}>{category.name}</a>)}
            </nav>
          ) : null}
          <div className="news-grid">{posts.map((post, index) => <a className="news-card" href={`/tin-tuc/${post.slug}`} key={post.id}><div className="news-image" style={{ backgroundImage: `url(${thumbnailUrl(post, interiorImages[index % interiorImages.length])})` }} /><div className="card-body">{post.categoryRef ? <span className="post-category-badge">{post.categoryRef.name}</span> : null}<h3>{post.title}</h3><p>{post.excerpt}</p><span>Đọc thêm <ArrowRight size={14} /></span></div></a>)}</div>
        </div>
      </section>
    </>
  );
}

export function PageHero({ title, description }: { title: string; description?: string | null }) {
  return <section className="page-hero"><div className="container"><span className="eyebrow">Hà Thành Home</span><h1>{title}</h1>{description ? <p>{description}</p> : null}</div></section>;
}

function buildProjectAlbum(project: Project) {
  const mediaImages = (project.galleryMedia || [])
    .map((media) => media.largeUrl || media.mediumUrl || media.webpUrl || media.thumbUrl)
    .filter(Boolean) as string[];
  const thumbnail = thumbnailUrl(project, "");
  return Array.from(new Set([thumbnail, ...mediaImages].filter(Boolean)));
}

function defaultProjectArticle(project: Project) {
  const category = project.categoryRef?.name || project.category || (project.group === "interior" ? "dự án nội thất" : "dự án công trình");
  return `<p>${project.description || "Dự án được Hà Thành Home triển khai với định hướng rõ ràng về công năng, thẩm mỹ và chất lượng hoàn thiện."}</p><h3>Bài toán triển khai</h3><p>${category} cần được xử lý đồng bộ từ ý tưởng, bố cục không gian, vật liệu đến tiến độ thi công. Đội ngũ Hà Thành Home ưu tiên phương án phù hợp hiện trạng, ngân sách và thói quen sử dụng thực tế.</p><h3>Giải pháp của Hà Thành Home</h3><p>Phương án tập trung vào trải nghiệm sử dụng lâu dài, kiểm soát chi tiết kỹ thuật và tạo điểm nhấn nhận diện riêng cho từng công trình. Các hạng mục được tư vấn theo mức đầu tư và khả năng thi công thực tế.</p>`;
}
