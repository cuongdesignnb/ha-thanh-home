import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DraftingCompass,
  FileCheck2,
  HardHat,
  Headphones,
  Home,
  HousePlus,
  MapPin,
  Medal,
  MessageCircle,
  PhoneCall,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  UserRoundCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { interiorImages, projectImages } from "@/lib/api";

export const metadata: Metadata = {
  title: "Xây nhà trọn gói | Hà Thành Home",
  description: "Dịch vụ xây nhà trọn gói từ thiết kế, thi công phần thô, hoàn thiện đến bàn giao bởi Hà Thành Home.",
};

type IconItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type ProcessStep = IconItem & {
  number: string;
};

type ShowcaseProject = {
  title: string;
  location: string;
  area: string;
  image: string;
};

const heroImage = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85";

const benefits: IconItem[] = [
  { icon: DraftingCompass, title: "Thiết kế đồng bộ", description: "Đẹp - công năng - bền vững" },
  { icon: Banknote, title: "Tối ưu chi phí", description: "Minh bạch, hạn chế phát sinh" },
  { icon: Clock3, title: "Tiến độ rõ ràng", description: "Cam kết từng giai đoạn" },
  { icon: ShieldCheck, title: "Vật tư minh bạch", description: "Nguồn gốc rõ ràng" },
  { icon: Medal, title: "Bảo hành dài hạn", description: "Đồng hành sau bàn giao" },
  { icon: UserRoundCheck, title: "Đội ngũ chuyên môn", description: "Kinh nghiệm, tận tâm" },
];

const scopeItems: IconItem[] = [
  { icon: UserRoundCheck, title: "Khảo sát & tư vấn", description: "Nắm nhu cầu và hiện trạng." },
  { icon: DraftingCompass, title: "Thiết kế kiến trúc - kết cấu", description: "Đồng bộ công năng và kỹ thuật." },
  { icon: FileCheck2, title: "Xin phép xây dựng", description: "Hỗ trợ hồ sơ pháp lý cần thiết." },
  { icon: HardHat, title: "Thi công phần thô", description: "Kết cấu chuẩn, kiểm soát an toàn." },
  { icon: Wrench, title: "Thi công hoàn thiện", description: "Hoàn thiện vật tư theo cam kết." },
  { icon: ClipboardCheck, title: "Giám sát công trình", description: "Theo sát tiến độ từng hạng mục." },
  { icon: BadgeCheck, title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng trước bàn giao." },
  { icon: ShieldCheck, title: "Bảo hành & bảo trì", description: "Đồng hành sau khi sử dụng." },
];

const processSteps: ProcessStep[] = [
  { number: "01", icon: UserRoundCheck, title: "Tư vấn & khảo sát", description: "Tìm hiểu nhu cầu, khảo sát hiện trạng" },
  { number: "02", icon: DraftingCompass, title: "Lên phương án", description: "Thiết kế sơ bộ, phương án công năng" },
  { number: "03", icon: Banknote, title: "Báo giá chi tiết", description: "Dự toán minh bạch, cam kết rõ ràng" },
  { number: "04", icon: FileCheck2, title: "Ký hợp đồng", description: "Thống nhất điều khoản và tiến độ" },
  { number: "05", icon: HardHat, title: "Thi công", description: "Thi công phần thô và hoàn thiện" },
  { number: "06", icon: ClipboardCheck, title: "Nghiệm thu & bàn giao", description: "Kiểm tra chất lượng, bàn giao công trình" },
  { number: "07", icon: ShieldCheck, title: "Bảo hành", description: "Bảo hành và hỗ trợ sau bàn giao" },
];

const projects: ShowcaseProject[] = [
  { title: "Biệt thự tân cổ điển Vinhomes Riverside", location: "Hà Nội", area: "320m2", image: projectImages[1] },
  { title: "Nhà phố hiện đại Hải Phòng", location: "Hải Phòng", area: "120m2", image: projectImages[0] },
  { title: "Biệt thự hiện đại Flamingo Đại Lải", location: "Vĩnh Phúc", area: "350m2", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85" },
  { title: "Nhà phố 3 tầng Tân Cổ Điển", location: "Hà Nội", area: "200m2", image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=85" },
  { title: "Biệt thự vườn Long Biên", location: "Hà Nội", area: "450m2", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85" },
  { title: "Biệt thự hiện đại The Zen", location: "Hà Nội", area: "280m2", image: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=900&q=85" },
];

const whyChooseItems: IconItem[] = [
  { icon: Medal, title: "Kinh nghiệm thực chiến", description: "10+ năm trong lĩnh vực thiết kế & thi công" },
  { icon: ClipboardCheck, title: "Quy trình chuyên nghiệp", description: "Kiểm soát chặt chẽ từng giai đoạn" },
  { icon: Banknote, title: "Chi phí minh bạch", description: "Báo giá chi tiết, hạn chế phát sinh" },
  { icon: ShieldCheck, title: "Vật tư chất lượng", description: "Vật tư chính hãng, nguồn gốc rõ ràng" },
  { icon: Headphones, title: "Tận tâm đồng hành", description: "Hỗ trợ trước, trong và sau thi công" },
  { icon: BadgeCheck, title: "Bảo hành uy tín", description: "Chính sách rõ ràng, hỗ trợ dài hạn" },
];

const stats: IconItem[] = [
  { icon: TimerReset, title: "10+", description: "Năm kinh nghiệm" },
  { icon: Building2, title: "500+", description: "Dự án hoàn thiện" },
  { icon: Sparkles, title: "98%", description: "Khách hàng hài lòng" },
  { icon: Headphones, title: "24/7", description: "Hỗ trợ tư vấn" },
];

const testimonials = [
  {
    name: "Anh Minh Tuấn",
    project: "Biệt thự Hà Nội",
    quote: "Hà Thành Home làm việc rất chuyên nghiệp, tiến độ đúng cam kết. Ngôi nhà hoàn thiện đẹp hơn mong đợi!",
  },
  {
    name: "Chị Thu Hằng",
    project: "Nhà phố Hải Phòng",
    quote: "Từ thiết kế đến thi công đều rất chỉn chu, đội ngũ tận tâm, hỗ trợ nhiệt tình.",
  },
  {
    name: "Anh Quốc Huy",
    project: "Nhà phố Vĩnh Phúc",
    quote: "Chi phí hợp lý, chất lượng vượt mong đợi. Tôi rất hài lòng với dịch vụ trọn gói.",
  },
];

const faqs = [
  ["Xây nhà trọn gói bao gồm những gì?", "Bao gồm khảo sát, tư vấn, thiết kế, dự toán, thi công phần thô, hoàn thiện, nghiệm thu, bàn giao và bảo hành theo hợp đồng."],
  ["Thời gian thi công mất bao lâu?", "Tùy quy mô và mức hoàn thiện, nhà phố thường từ 4-7 tháng, biệt thự có thể từ 7-12 tháng hoặc hơn."],
  ["Có phát sinh chi phí trong quá trình thi công không?", "Hà Thành Home bóc tách báo giá rõ ràng ngay từ đầu. Phát sinh chỉ xảy ra khi khách hàng thay đổi phạm vi, vật tư hoặc yêu cầu mới."],
  ["Hà Thành Home sử dụng vật tư loại gì?", "Vật tư được thống nhất theo hồ sơ báo giá, có thương hiệu, nguồn gốc rõ ràng và được nghiệm thu theo từng giai đoạn."],
  ["Chính sách bảo hành như thế nào?", "Công trình được bảo hành theo từng hạng mục, có biên bản bàn giao và quy trình tiếp nhận hỗ trợ sau thi công."],
  ["Tôi có thể theo dõi tiến độ công trình không?", "Có. Khách hàng được cập nhật tiến độ, hình ảnh thi công và các mốc nghiệm thu quan trọng trong quá trình triển khai."],
];

export default function XayNhaTronGoiPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <XayNhaHero />
        <BenefitStrip />
        <ServiceIntro />
        <ScopeSection />
        <ProcessTimeline />
        <ProjectShowcase />
        <EstimateSection />
        <WhyChooseSection />
        <StatsStrip />
        <Testimonials />
        <FAQSection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function XayNhaHero() {
  return (
    <section className="xay-nha-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 23, 18, 0.92) 0%, rgba(7, 23, 18, 0.72) 43%, rgba(7, 23, 18, 0.18) 78%), url(${heroImage})` }}>
      <div className="container">
        <nav className="xay-nha-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Trang chủ</a><span>/</span><a href="/dich-vu">Dịch vụ</a><span>/</span><strong>Xây nhà trọn gói</strong>
        </nav>
        <div className="xay-nha-hero-content">
          <span className="eyebrow">Xây nhà trọn gói</span>
          <h1>Giải pháp xây nhà trọn gói từ thiết kế đến bàn giao</h1>
          <p>Hà Thành Home cung cấp giải pháp xây nhà trọn gói toàn diện, đảm bảo chất lượng - tiến độ - minh bạch chi phí - bảo hành dài hạn.</p>
          <div className="xay-nha-actions">
            <a className="cta" href="#du-toan-chi-phi" data-estimator-open>Nhận báo giá <ArrowRight size={18} /></a>
            <a className="cta secondary" href="/lien-he"><PhoneCall size={18} /> Tư vấn miễn phí</a>
            <a className="xay-nha-ghost-link" href="#du-toan-chi-phi" data-estimator-open>Dự toán nhanh <ArrowRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitStrip() {
  return (
    <section className="xay-nha-benefit-strip">
      <div className="container xay-nha-benefits">
        {benefits.map((item) => <IconText item={item} key={item.title} />)}
      </div>
    </section>
  );
}

function ServiceIntro() {
  return (
    <section className="section">
      <div className="container xay-nha-intro">
        <div className="xay-nha-intro-image" style={{ backgroundImage: `url(${interiorImages[0]})` }} />
        <div>
          <span className="eyebrow">Dịch vụ xây nhà trọn gói</span>
          <h2>Xây tổ ấm bền vững An tâm từ đầu đến cuối</h2>
          <p>Dịch vụ xây nhà trọn gói của Hà Thành Home bao gồm toàn bộ quy trình từ khảo sát, thiết kế, xin phép, thi công phần thô, hoàn thiện, bàn giao và bảo hành.</p>
          <ul className="xay-nha-checklist">
            {["Một đầu mối - chịu trách nhiệm trọn gói", "Minh bạch chi phí - hạn chế phát sinh", "Cam kết tiến độ - đúng chất lượng", "Vật tư chính hãng - nguồn gốc rõ ràng"].map((item) => (
              <li key={item}><CheckCircle2 size={18} /> {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ScopeSection() {
  return (
    <section className="section cream">
      <div className="container">
        <div className="section-title"><span className="eyebrow">Phạm vi công việc</span><h2>Trọn gói từ pháp lý, kỹ thuật đến hoàn thiện</h2></div>
        <div className="xay-nha-scope">
          {scopeItems.map((item) => <IconText item={item} key={item.title} />)}
        </div>
      </div>
    </section>
  );
}

function ProcessTimeline() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">Quy trình xây nhà trọn gói</span><h2>Rõ việc, rõ người, rõ tiến độ</h2></div>
        <div className="xay-nha-process">
          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="xay-nha-process-step" key={step.number}>
                <span>{step.number}</span>
                <Icon size={22} />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectShowcase() {
  return (
    <section className="section cream">
      <div className="container">
        <div className="xay-nha-section-head">
          <div><span className="eyebrow">Dự án xây nhà tiêu biểu</span><h2>Công trình đã triển khai</h2></div>
          <a className="section-link" href="/du-an/cong-trinh">Xem tất cả dự án <ArrowRight size={16} /></a>
        </div>
        <div className="xay-nha-project-grid">
          {projects.map((project) => (
            <article className="xay-nha-project-card" key={project.title}>
              <div className="xay-nha-project-image" style={{ backgroundImage: `url(${project.image})` }}><span>Công trình</span></div>
              <div className="xay-nha-project-body">
                <h3>{project.title}</h3>
                <div className="xay-nha-project-meta"><span><MapPin size={15} /> {project.location}</span><span><Ruler size={15} /> {project.area}</span></div>
                <a href="/du-an/cong-trinh">Xem chi tiết</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EstimateSection() {
  return (
    <section className="section" id="du-toan-chi-phi">
      <div className="container xay-nha-estimate">
        <div className="xay-nha-cost-card">
          <span className="eyebrow">Dự toán chi phí xây nhà</span>
          <h2>Tham khảo chi phí xây nhà trọn gói</h2>
          <div className="xay-nha-tabs" role="list" aria-label="Loại công trình">
            {["Nhà phố", "Biệt thự", "Nhà hiện đại", "Nhà cấp 4"].map((tab, index) => <span className={index === 0 ? "active" : ""} key={tab}>{tab}</span>)}
          </div>
          <div className="xay-nha-price-box">
            <div className="xay-nha-price-image" style={{ backgroundImage: `url(${projectImages[0]})` }} />
            <div>
              <small>Chi phí tham khảo</small>
              <strong>5.500.000 - 7.000.000đ/m2</strong>
              <ul className="xay-nha-checklist">
                {["Thiết kế kiến trúc - kết cấu", "Thi công phần thô", "Thi công hoàn thiện", "Vật tư hoàn thiện cơ bản - cao cấp"].map((item) => <li key={item}><CheckCircle2 size={17} /> {item}</li>)}
              </ul>
            </div>
          </div>
          <p className="xay-nha-note">* Chi phí phụ thuộc diện tích, phong cách, vật tư và điều kiện thi công thực tế.</p>
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}

function QuoteForm() {
  return (
    <form className="xay-nha-quote-form" action="/lien-he" method="get">
      <div>
        <span className="eyebrow">Nhận báo giá</span>
        <h2>Nhận báo giá & tư vấn miễn phí</h2>
        <p>Điền thông tin để nhận tư vấn chi tiết từ chuyên gia Hà Thành Home.</p>
      </div>
      <div className="xay-nha-form-grid">
        <input name="ho-ten" placeholder="Họ và tên *" required />
        <input name="so-dien-thoai" placeholder="Số điện thoại *" required />
        <input name="dia-diem" placeholder="Địa điểm xây dựng" />
        <input name="dien-tich" placeholder="Diện tích dự kiến" />
        <select name="loai-cong-trinh" defaultValue="">
          <option value="" disabled>Loại công trình</option>
          <option>Nhà phố</option>
          <option>Biệt thự</option>
          <option>Nhà cấp 4</option>
          <option>Công trình khác</option>
        </select>
        <select name="ngan-sach" defaultValue="">
          <option value="" disabled>Ngân sách dự kiến</option>
          <option>Dưới 1 tỷ</option>
          <option>1 - 2 tỷ</option>
          <option>2 - 5 tỷ</option>
          <option>Trên 5 tỷ</option>
        </select>
      </div>
      <textarea name="yeu-cau" rows={4} placeholder="Nhu cầu & yêu cầu thêm" />
      <button className="xay-nha-gold-button" type="submit">Nhận tư vấn ngay</button>
      <small><ShieldCheck size={15} /> Cam kết bảo mật thông tin tuyệt đối</small>
    </form>
  );
}

function WhyChooseSection() {
  return (
    <section className="section xay-nha-why-section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">Vì sao chọn Hà Thành Home?</span><h2>Năng lực triển khai thực tế, không chỉ là bản vẽ đẹp</h2></div>
        <div className="xay-nha-why-grid">
          {whyChooseItems.map((item) => <IconText item={item} key={item.title} />)}
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="xay-nha-stats-section">
      <div className="container">
        <div className="xay-nha-stats">
          {stats.map((item) => <IconText item={item} key={item.title} />)}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title"><span className="eyebrow">Khách hàng nói gì về chúng tôi</span><h2>Niềm tin đến từ trải nghiệm thật</h2></div>
        <div className="xay-nha-testimonials">
          {testimonials.map((item, index) => (
            <article className="xay-nha-testimonial" key={item.name}>
              <div className="xay-nha-avatar">{index + 1}</div>
              <strong>{item.name}</strong>
              <span>{item.project}</span>
              <div className="xay-nha-stars">{Array.from({ length: 5 }, (_, star) => <Star fill="currentColor" size={16} key={star} />)}</div>
              <p>“{item.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="section cream">
      <div className="container">
        <div className="section-title"><span className="eyebrow">Câu hỏi thường gặp</span><h2>Những điều khách hàng thường hỏi trước khi xây nhà</h2></div>
        <div className="xay-nha-faq">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="section">
      <div className="container xay-nha-final-cta">
        <div>
          <span className="eyebrow">Bắt đầu cùng Hà Thành Home</span>
          <h2>Sẵn sàng xây tổ ấm mơ ước của bạn?</h2>
          <p>Hà Thành Home đồng hành cùng bạn kiến tạo ngôi nhà bền vững - đẹp - tiện nghi.</p>
        </div>
        <div className="xay-nha-actions">
          <a className="cta secondary" href="#du-toan-chi-phi" data-estimator-open>Nhận báo giá</a>
          <a className="cta" href="/lien-he"><MessageCircle size={18} /> Tư vấn miễn phí</a>
        </div>
      </div>
    </section>
  );
}

function IconText({ item }: { item: IconItem }) {
  const Icon = item.icon;
  return (
    <article className="xay-nha-icon-item">
      <span><Icon size={23} /></span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}
