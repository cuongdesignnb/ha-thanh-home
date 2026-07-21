"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { EditorContent, useEditor } from "@tiptap/react";
import { Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import {
  ArrowLeft,
  AlertTriangle,
  BadgeCheck,
  Bold,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarClock,
  ChevronRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  FolderKanban,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image,
  ImagePlus,
  Italic,
  LayoutDashboard,
  LinkIcon,
  List,
  ListOrdered,
  LogOut,
  Menu as MenuIcon,
  Minus,
  Newspaper,
  Pilcrow,
  PenTool,
  PhoneCall,
  Plus,
  Quote,
  Redo2,
  Search,
  Settings,
  Sofa,
  Sparkles,
  Strikethrough,
  Table2,
  Undo2,
  UploadCloud,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { adminApiFetch, adminUrl } from "@/lib/client-path";
import { ServicePagesPanel } from "@/components/service-pages-panel";
import { ServicePageEditor } from "@/components/service-page-editor";
import { SERVICE_PAGE_REGISTRY } from "@/lib/service-page-registry";
import { AboutPageSettingsPanel } from "@/components/about-page-settings-panel";


const apiFetch = adminApiFetch;

const ImageFigure = Node.create({
  name: "imageFigure",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null, parseHTML: (element) => element.querySelector("img")?.getAttribute("src") },
      alt: { default: "", parseHTML: (element) => element.querySelector("img")?.getAttribute("alt") || "" },
      caption: { default: "", parseHTML: (element) => element.querySelector("figcaption")?.textContent || "" },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-content-image]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const caption = String(HTMLAttributes.caption || "");
    return [
      "figure",
      { "data-content-image": "", class: "content-image" },
      ["img", { src: HTMLAttributes.src, alt: HTMLAttributes.alt || "", loading: "lazy" }],
      ...(caption ? [["figcaption", {}, caption]] : []),
    ];
  },
});

function askUploadMetadata(file: File) {
  const suggested = file.name.replace(/\.[^.]+$/, "");
  const altText = window.prompt(`Mô tả ảnh (alt) - bắt buộc\n${file.name}`, suggested)?.trim();
  if (!altText) return null;
  const caption = window.prompt(`Chú thích ảnh (không bắt buộc)\n${file.name}`, "")?.trim() || "";
  return { altText, caption };
}

type User = { email: string; roles: string[] };
type Entity = "dashboard" | "projects" | "project-categories" | "project-filter-options" | "architecture-designs" | "interior-designs" | "services" | "service-pages" | "posts" | "post-categories" | "leads" | "media" | "ai" | "menus" | "estimator" | "settings" | "about-settings" | "pages";
type CmsItem = Record<string, unknown> & {
  id: number;
  title?: string;
  fullName?: string;
  slug?: string;
  status?: string;
  group?: string;
  module?: string;
  name?: string;
  type?: string;
  isActive?: boolean;
  phone?: string;
  email?: string;
  demandType?: string;
  projectType?: string;
  area?: string;
  budget?: string;
  location?: string;
  message?: string;
  sourceUrl?: string;
  sourceType?: string;
  note?: string;
  assignedTo?: number | null;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  categoryId?: number | null;
  categoryRef?: CmsItem | null;
  postCategoryId?: number | null;
  excerpt?: string;
  description?: string;
  contentHtml?: string;
  focusKeyword?: string;
  scheduledAt?: string;
  sortOrder?: number;
  areaValue?: number;
  scale?: string;
  clientName?: string;
  code?: string;
  houseType?: string;
  interiorStyle?: string;
  roomType?: string;
  layoutType?: string;
  materialTone?: string;
  roofType?: string;
  floors?: number;
  facadeWidth?: number;
  depth?: number;
  bedrooms?: number;
  bathrooms?: number;
  estimatedBudget?: number;
  constructionTime?: string;
  budgetRange?: string;
  budgetMin?: number;
  budgetMax?: number;
  galleryMediaIds?: number[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  isFeatured?: boolean;
  thumbnailMediaId?: number | null;
  thumbnailMedia?: CmsItem | null;
  altText?: string;
  fileName?: string;
  webpUrl?: string;
  thumbUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  originalName?: string;
};
type LeadNote = {
  id: number;
  leadId: number;
  note: string;
  createdAt: string;
  user?: { id: number; fullName: string; email: string } | null;
};
type ListResponse<T> = { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } };
type MenuItem = CmsItem & {
  menuId: number;
  parentId?: number | null;
  label: string;
  url: string;
  target?: "self" | "blank";
  rel?: string | null;
  itemType?: string;
  referenceType?: string | null;
  referenceId?: number | null;
  children?: MenuItem[];
};
type MenuRecord = CmsItem & {
  location: "header" | "footer";
  isActive: boolean;
  items: MenuItem[];
};
type MenuSuggestion = {
  label: string;
  url: string;
  type: string;
  referenceId?: number;
  status?: string;
};

const contentSchema = z.object({
  title: z.string().min(2, "Tiêu đề cần ít nhất 2 ký tự").optional(),
  name: z.string().nullish(),
  module: z.string().nullish(),
  type: z.string().nullish(),
  group: z.enum(["construction", "interior", "xay_nha_tron_goi"]).nullish(),
  status: z.string().nullish(),
  location: z.string().nullish(),
  category: z.string().nullish(),
  categoryId: z.any().optional(),
  projectType: z.string().nullish(),
  area: z.any().optional(),
  areaValue: z.any().optional(),
  scale: z.string().nullish(),
  clientName: z.string().nullish(),
  excerpt: z.string().nullish(),
  focusKeyword: z.string().nullish(),
  description: z.string().nullish(),
  contentHtml: z.string().nullish(),
  slug: z.string().nullish(),
  scheduledAt: z.string().nullish(),
  publishedAt: z.string().nullish(),
  code: z.string().nullish(),
  houseType: z.string().nullish(),
  interiorStyle: z.string().nullish(),
  roomType: z.string().nullish(),
  layoutType: z.string().nullish(),
  materialTone: z.string().nullish(),
  roofType: z.string().nullish(),
  floors: z.any().optional(),
  facadeWidth: z.any().optional(),
  depth: z.any().optional(),
  bedrooms: z.any().optional(),
  bathrooms: z.any().optional(),
  estimatedBudget: z.any().optional(),
  constructionTime: z.string().nullish(),
  budgetRange: z.string().nullish(),
  budgetMin: z.any().optional(),
  budgetMax: z.any().optional(),
  galleryMediaIds: z.array(z.number()).nullish(),
  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
  canonicalUrl: z.string().nullish(),
  ogTitle: z.string().nullish(),
  ogDescription: z.string().nullish(),
  thumbnailMediaId: z.number().nullable().optional(),
  isFeatured: z.boolean().nullish(),
  isActive: z.boolean().nullish(),
  note: z.string().nullish(),
});

const modules = [
  {
    group: "Tổng quan",
    items: [
      { id: "dashboard", label: "Dashboard", description: "Số liệu và tác vụ nhanh", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "SEO Editor", "Sales", "Viewer"] },
    ],
  },
  {
    group: "Công trình & Nội thất",
    items: [
      { id: "projects", label: "Dự án", description: "Công trình, nội thất, showroom", icon: FolderKanban, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "project-categories", label: "Danh mục dự án", description: "Tabs và nhóm dự án public", icon: List, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "project-filter-options", label: "Bộ lọc dự án", description: "Option filter động cho public", icon: Search, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "architecture-designs", label: "Mẫu kiến trúc", description: "Catalog biệt thự, nhà phố, nhà cấp 4", icon: Building2, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "interior-designs", label: "Mẫu nội thất", description: "Catalog phong cách, loại phòng, diện tích", icon: Sofa, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "estimator", label: "Dự toán công trình", description: "Cấu hình công thức và lượt tính", icon: Calculator, roles: ["Super Admin", "Admin", "Sales", "Viewer"] },
    ],
  },
  {
    group: "Dịch vụ",
    items: [
      { id: "services", label: "Dịch vụ", description: "Các trang /dich-vu/[slug] đang xuất bản", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "service-pages", label: "Xây nhà trọn gói", description: "Landing /dich-vu/xay-nha-tron-goi", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "Viewer"], serviceSlug: "xay-nha-tron-goi" },
      { id: "service-pages", label: "Sản Xuất Thi Công Nội Thất", description: "Landing /dich-vu/san-xuat-thi-cong-noi-that", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "Viewer"], serviceSlug: "san-xuat-thi-cong-noi-that" },
      { id: "service-pages", label: "Thi Công Nhà Xưởng", description: "Landing /dich-vu/thi-cong-nha-xuong", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "Viewer"], serviceSlug: "thi-cong-nha-xuong" },
      { id: "service-pages", label: "Thi Công Nội Thất Văn Phòng", description: "Landing /dich-vu/thi-cong-noi-that-van-phong", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "Viewer"], serviceSlug: "thi-cong-noi-that-van-phong" },
    ],
  },
  {
    group: "Nội dung",
    items: [
      { id: "posts", label: "Bài viết SEO", description: "Draft, scheduled, published", icon: Newspaper, roles: ["Super Admin", "Admin", "SEO Editor", "Viewer"] },
      { id: "post-categories", label: "Danh mục bài viết", description: "Nhóm chủ đề để chọn khi viết bài", icon: List, roles: ["Super Admin", "Admin", "SEO Editor", "Viewer"] },
      { id: "pages", label: "Chuyên trang", description: "Quản lý trang chính sách, điều khoản", icon: FileText, roles: ["Super Admin", "Admin", "SEO Editor", "Viewer"] },
      { id: "media", label: "Media Library", description: "Ảnh WebP và thư viện dùng lại", icon: Image, roles: ["Super Admin", "Admin", "SEO Editor", "Viewer"] },
      { id: "ai", label: "AI Content Studio", description: "Outline, meta, bài viết draft", icon: Sparkles, roles: ["Super Admin", "Admin", "SEO Editor"] },
    ],
  },
  {
    group: "Kinh doanh",
    items: [
      { id: "leads", label: "Lead tư vấn", description: "Nguồn khách hàng và trạng thái", icon: Users, roles: ["Super Admin", "Admin", "Sales"] },
    ],
  },
  {
    group: "Hệ thống",
    items: [
      { id: "menus", label: "Menu", description: "Header, footer và kéo thả 3 cấp", icon: MenuIcon, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "about-settings", label: "Trang giới thiệu", description: "Cấu hình trang giới thiệu", icon: FileText, roles: ["Super Admin", "Admin"] },
      { id: "settings", label: "Cấu hình", description: "Thông tin website", icon: Settings, roles: ["Super Admin", "Admin"] },
    ],
  },

] satisfies Array<{ group: string; items: Array<{ id: string; label: string; description: string; icon: LucideIcon; roles: string[]; serviceSlug?: string }> }>;

const moduleMeta: Record<Entity, { title: string; subtitle: string; createLabel?: string }> = {
  dashboard: { title: "Tổng quan vận hành", subtitle: "Theo dõi dữ liệu thật từ CMS, lead và lịch đăng bài." },
  projects: { title: "Quản lý dự án", subtitle: "Tách rõ khối Công Trình và khối Nội Thất.", createLabel: "Thêm dự án" },
  "project-categories": { title: "Danh mục dự án", subtitle: "Quản lý tab danh mục trên trang Dự án đã thực hiện.", createLabel: "Thêm danh mục" },
  "project-filter-options": { title: "Bộ lọc dự án", subtitle: "Quản lý option dropdown lọc dự án ngoài website.", createLabel: "Thêm option lọc" },
  "architecture-designs": { title: "Mẫu thiết kế kiến trúc", subtitle: "Catalog mẫu biệt thự, nhà phố, nhà cấp 4 với bộ lọc chi tiết.", createLabel: "Thêm mẫu kiến trúc" },
  "interior-designs": { title: "Mẫu thiết kế nội thất", subtitle: "Catalog phong cách nội thất, loại phòng, diện tích và ngân sách.", createLabel: "Thêm mẫu nội thất" },
  services: { title: "Quản lý dịch vụ", subtitle: "Quản lý các trang dịch vụ dạng /dich-vu/[slug] đang có trong hệ thống.", createLabel: "Thêm dịch vụ" },
  "service-pages": { title: "Cấu hình trang dịch vụ", subtitle: "Quản lý các landing page dịch vụ cố định." },
  posts: { title: "Bài viết SEO", subtitle: "Soạn bài, lưu nháp, đặt lịch và xuất bản.", createLabel: "Thêm bài viết" },
  "post-categories": { title: "Danh mục bài viết", subtitle: "Tạo nhóm chủ đề để chọn đúng danh mục khi viết bài SEO.", createLabel: "Thêm danh mục" },
  pages: { title: "Quản lý chuyên trang", subtitle: "Tạo và cấu hình các trang chính sách, điều khoản dịch vụ.", createLabel: "Thêm chuyên trang" },
  leads: { title: "Lead tư vấn", subtitle: "Theo dõi nguồn lead, trạng thái xử lý và ghi chú nội bộ." },
  media: { title: "Media Library", subtitle: "Upload, chuyển WebP, tạo thumbnail và tái sử dụng ảnh." },
  ai: { title: "AI Content Studio", subtitle: "Tạo outline, meta SEO và bài viết draft bằng AI theo cấu hình hệ thống." },
  menus: { title: "Quản lý Menu", subtitle: "Kéo thả menu header/footer tối đa 3 cấp, chọn link gợi ý hoặc tự nhập URL." },
  estimator: { title: "Dự toán công trình", subtitle: "Cấu hình input, công thức tính chi phí và xem lượt dự toán từ website." },
  settings: { title: "Cấu hình website", subtitle: "Quản lý hotline, email, địa chỉ, social và thông tin thương hiệu." },
  "about-settings": { title: "Trang giới thiệu", subtitle: "Quản lý nội dung, hình ảnh và SEO cho trang Giới thiệu." },
};

const entitySingular: Record<Entity, string> = {
  dashboard: "dashboard",
  projects: "dự án",
  "project-categories": "danh mục dự án",
  "project-filter-options": "option lọc dự án",
  "architecture-designs": "mẫu kiến trúc",
  "interior-designs": "mẫu nội thất",
  services: "dịch vụ",
  "service-pages": "trang dịch vụ",
  posts: "bài viết",
  "post-categories": "danh mục bài viết",
  pages: "trang chính sách",
  leads: "lead",
  media: "media",
  ai: "AI content",
  menus: "menu",
  estimator: "dự toán công trình",
  settings: "cấu hình",
  "about-settings": "trang giới thiệu",
};


const statusLabels: Record<string, string> = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  scheduled: "Đặt lịch",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
  active: "Đang bật",
  inactive: "Đang tắt",
  new: "Mới",
  contacted: "Đã liên hệ",
  consulting: "Đang tư vấn",
  won: "Đã chốt",
  lost: "Không tiềm năng",
  spam: "Spam",
};

type ToastTone = "success" | "error" | "info" | "warning";
type ToastItem = { id: number; tone: ToastTone; title: string; description?: string };
type ConfirmOptions = { title: string; description?: string; confirmLabel?: string; cancelLabel?: string; tone?: "danger" | "default" };
type FeedbackContextValue = {
  notify: (toast: Omit<ToastItem, "id">) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function AdminApp({ user }: { user: User }) {
  const [active, setActive] = useState<Entity>("dashboard");
  const [activeServiceSlug, setActiveServiceSlug] = useState<string>(SERVICE_PAGE_REGISTRY[0]?.slug ?? "");
  const visibleGroups = (repairVietnamese(modules) as typeof modules)
    .map((group) => ({ ...group, items: group.items.filter((item) => can(user.roles, item.roles)) }))
    .filter((group) => group.items.length > 0);
  const activeServicePage = SERVICE_PAGE_REGISTRY.find((page) => page.slug === activeServiceSlug);
  const meta = active === "service-pages" && activeServicePage
    ? { title: activeServicePage.label, subtitle: activeServicePage.description }
    : (repairVietnamese(moduleMeta[active]) as typeof moduleMeta[Entity]);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = adminUrl("/login");
  }

  return (
    <FeedbackProvider>
      <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark"><Building2 size={28} strokeWidth={1.6} /></span>
          <div>
            <strong>{T("Hà Thành Home")}</strong>
            <span>{T("Thiết kế - Thi công - Nội thất")}</span>
          </div>
        </div>

        <nav className="admin-nav">
          {visibleGroups.map((group) => (
            <div className="admin-nav-group" key={group.group}>
              <p>{T(group.group)}</p>
              {group.items.map((item) => {
                const itemSlug = (item as { serviceSlug?: string }).serviceSlug;
                const isActive = itemSlug
                  ? active === "service-pages" && activeServiceSlug === itemSlug
                  : active === item.id;
                const onClick = itemSlug
                  ? () => { setActive("service-pages"); setActiveServiceSlug(itemSlug); }
                  : () => setActive(item.id as Entity);
                return (
                  <button className={`admin-nav-item ${isActive ? "active" : ""}`} key={`${item.id}:${itemSlug ?? ""}`} onClick={onClick} type="button">
                    <span className="nav-icon"><item.icon size={18} /></span>
                    <span><strong>{T(item.label)}</strong><small>{T(item.description)}</small></span>
                    <ChevronRight className="nav-chevron" size={15} />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-account">
          <div>
            <strong>{user.email}</strong>
            <span>{user.roles.join(", ")}</span>
          </div>
          <button onClick={logout} type="button"><LogOut size={16} /> Đăng xuất</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="breadcrumb">Admin{active === "service-pages" ? " / Dịch vụ" : ""} / {meta.title}</span>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <span className="api-pill"><BadgeCheck size={15} /> API online</span>
            <a className="primary-button ghost" href={getWebBaseUrl()} target="_blank"><ExternalLink size={16} /> Xem website</a>
          </div>
        </header>

        {active === "dashboard" ? (
          <Dashboard setActive={setActive} />
        ) : active === "media" ? (
          <MediaLibrary roles={user.roles} />
        ) : active === "ai" ? (
          <AiContentStudio setActive={setActive} />
        ) : active === "menus" ? (
          <MenuBuilder roles={user.roles} />
        ) : active === "estimator" ? (
          <EstimatorPanel roles={user.roles} />
        ) : active === "settings" ? (
          <ThemeSettingsPanel roles={user.roles} />
        ) : active === "about-settings" ? (
          <AboutPageSettingsPanel roles={user.roles} />
        ) : active === "service-pages" ? (
          activeServicePage ? <ServicePageEditor page={activeServicePage} roles={user.roles} /> : <ServicePagesPanel />
        ) : (
          <EntityPanel entity={active} roles={user.roles} />
        )}

      </main>
      </div>
    </FeedbackProvider>
  );
}

function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);

  const notify = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...toast, title: T(toast.title), description: toast.description ? T(toast.description) : undefined, id }].slice(-4));
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4200);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setConfirmState({ ...options, resolve }));
  }, []);

  function closeConfirm(value: boolean) {
    confirmState?.resolve(value);
    setConfirmState(null);
  }

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.tone}`} key={toast.id}>
            <span>{toast.tone === "success" ? <CheckCircle2 size={18} /> : toast.tone === "error" || toast.tone === "warning" ? <AlertTriangle size={18} /> : <BadgeCheck size={18} />}</span>
            <div><strong>{T(toast.title)}</strong>{toast.description ? <p>{T(toast.description)}</p> : null}</div>
            <button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Đóng thông báo"><X size={15} /></button>
          </div>
        ))}
      </div>
      {confirmState ? (
        <div className="modal-backdrop confirm-backdrop" role="presentation" onMouseDown={() => closeConfirm(false)}>
          <section className="confirm-dialog" aria-modal="true" role="dialog" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className={`confirm-icon ${confirmState.tone === "danger" ? "danger" : ""}`}>{confirmState.tone === "danger" ? <AlertTriangle size={24} /> : <BadgeCheck size={24} />}</span>
            <h2 id="confirm-title">{T(confirmState.title)}</h2>
            {confirmState.description ? <p>{T(confirmState.description)}</p> : null}
            <div className="confirm-actions">
              <button className="secondary-button" type="button" onClick={() => closeConfirm(false)}>{confirmState.cancelLabel ? T(confirmState.cancelLabel) : "Hủy"}</button>
              <button className={`primary-button ${confirmState.tone === "danger" ? "danger-button" : ""}`} type="button" onClick={() => closeConfirm(true)}>{confirmState.confirmLabel ? T(confirmState.confirmLabel) : "Xác nhận"}</button>
            </div>
          </section>
        </div>
      ) : null}
    </FeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useAdminFeedback must be used inside FeedbackProvider");
  return context;
}

async function readApiError(response: Response, fallback: string) {
  let detail = "";
  const responseText = response.clone();
  try {
    const payload = await response.json();
    const message = Array.isArray(payload?.message) ? payload.message.join("; ") : payload?.message;
    detail = [message, payload?.error, payload?.details].filter(Boolean).join(" - ");
  } catch {
    try {
      detail = await responseText.text();
    } catch {
      detail = "";
    }
  }
  const status = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
  return detail ? `${status}: ${detail}` : `${status}: ${fallback}`;
}

function describeClientError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getWebBaseUrl() {
  return (process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:31873").replace(/\/$/, "");
}

function getPublicEntityPath(entity: Entity, row: CmsItem) {
  if (!row.slug) return null;
  const slug = encodeURIComponent(row.slug);
  const paths: Partial<Record<Entity, string>> = {
    projects: `/du-an/${slug}`,
    services: `/dich-vu/${slug}`,
    posts: `/tin-tuc/${slug}`,
    "architecture-designs": `/mau-thiet-ke-kien-truc/${slug}`,
    "interior-designs": `/mau-thiet-ke-noi-that/${slug}`,
    pages: `/${slug}`,
  };
  return paths[entity] || null;
}

function getPublicEntityUrl(entity: Entity, row: CmsItem) {
  const path = getPublicEntityPath(entity, row);
  return path ? `${getWebBaseUrl()}${path}` : null;
}

function Dashboard({ setActive }: { setActive: (entity: Entity) => void }) {
  const { notify } = useAdminFeedback();
  const [data, setData] = useState<{ metrics: Record<string, number>; recentLeads: CmsItem[] } | null>(null);

  useEffect(() => {
    apiFetch("/api/cms/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error(await readApiError(res, "Không tải được dashboard."));
        return res.json();
      })
      .then(setData)
      .catch((error) => notify({ tone: "error", title: "Không tải được dashboard", description: describeClientError(error, "Kiểm tra API hoặc phiên đăng nhập.") }));
  }, [notify]);

  const metrics = data?.metrics || {};
  const cards = [
    ["Tổng dự án", metrics.totalProjects || 0, FolderKanban],
    ["Dự án công trình", metrics.constructionProjects || 0, Building2],
    ["Dự án nội thất", metrics.interiorProjects || 0, PenTool],
    ["Mẫu kiến trúc", metrics.architectureDesigns || 0, Building2],
    ["Mẫu nội thất", metrics.interiorDesigns || 0, Sofa],
    ["Lead mới", metrics.newLeads || 0, PhoneCall],
  ] satisfies Array<[string, number, LucideIcon]>;

  return (
    <div className="dashboard-stack">
      <section className="metric-grid">
        {cards.map(([label, value, Icon]) => (
          <article className="metric-card" key={label}>
            <span><Icon size={22} /></span>
            <div><small>{label}</small><strong>{value}</strong></div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel large">
          <div className="panel-heading"><div><h2>Lead mới gần đây</h2><p>Danh sách lead được ghi nhận từ form tư vấn.</p></div><button onClick={() => setActive("leads")} type="button">Xem lead</button></div>
          <SimpleTable rows={data?.recentLeads || []} columns={["fullName", "phone", "status"]} emptyText="Chưa có lead mới." />
        </article>

        <article className="panel">
          <div className="panel-heading"><div><h2>Tác vụ nhanh</h2><p>Đi nhanh đến màn hình thường dùng.</p></div></div>
          <div className="quick-actions">
            <button onClick={() => setActive("projects")} type="button"><FolderKanban size={18} /> Thêm dự án</button>
            <button onClick={() => setActive("posts")} type="button"><Newspaper size={18} /> Viết bài SEO</button>
            <button onClick={() => setActive("media")} type="button"><UploadCloud size={18} /> Upload ảnh</button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><h2>Lịch nội dung</h2><p>Bài viết đang đặt lịch xuất bản.</p></div></div>
          <div className="content-status-row"><CalendarClock size={20} /><strong>{metrics.scheduledPosts || 0}</strong><span>bài đang đặt lịch</span></div>
          <div className="content-status-row"><FileText size={20} /><strong>{metrics.totalPosts || 0}</strong><span>tổng bài viết</span></div>
        </article>
      </section>
    </div>
  );
}

function MediaLibrary({ roles }: { roles: string[] }) {
  const { notify } = useAdminFeedback();
  const [rows, setRows] = useState<CmsItem[]>([]);
  const [selected, setSelected] = useState<CmsItem | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const canUpload = roles.includes("Super Admin") || roles.includes("Admin") || roles.includes("SEO Editor");

  async function load(preferredId?: number, requestedSort = sort) {
    try {
      const params = new URLSearchParams({ page: "1", limit: "60", sort: requestedSort });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      const response = await apiFetch(`/api/cms/media?${params}`);
      if (response.status === 401) {
        window.location.href = adminUrl("/login");
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được Media Library."));
      const payload: ListResponse<CmsItem> = await response.json();
      setRows(payload.data || []);
      setSelected((current) => {
        if (preferredId) return payload.data.find((item) => item.id === preferredId) || payload.data?.[0] || null;
        return current && payload.data.some((item) => item.id === current.id) ? payload.data.find((item) => item.id === current.id) || null : payload.data?.[0] || null;
      });
    } catch (error) {
      notify({ tone: "error", title: "Không tải được Media Library", description: describeClientError(error, "Kiểm tra API hoặc kết nối mạng.") });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let failed = 0;
    let newestUploadId: number | undefined;
    for (const file of Array.from(files)) {
      try {
        const metadata = askUploadMetadata(file);
        if (!metadata) {
          failed += 1;
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type || "general");
        formData.append("altText", metadata.altText);
        if (metadata.caption) formData.append("caption", metadata.caption);
        const response = await apiFetch("/api/cms/media/upload", { method: "POST", body: formData });
        if (!response.ok) {
          failed += 1;
          notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${await readApiError(response, "File không hợp lệ hoặc vượt quá dung lượng.")}` });
        } else {
          const payload = await response.json();
          newestUploadId = Number(payload.media?.id) || newestUploadId;
        }
      } catch (error) {
        failed += 1;
        notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${describeClientError(error, "Không kết nối được API upload.")}` });
      }
    }
    setUploading(false);
    setSort("newest");
    await load(newestUploadId, "newest");
    if (failed < files.length) notify({ tone: "success", title: "Upload hoàn tất", description: failed ? `Đã upload ${files.length - failed}/${files.length} ảnh.` : "Thư viện ảnh đã được cập nhật." });
  }

  async function copyUrl(url?: string) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    notify({ tone: "success", title: "Đã copy URL ảnh" });
  }

  async function saveSelected() {
    if (!selected) return;
    const altText = String(selected.altText || "").trim();
    if (!altText) {
      notify({ tone: "error", title: "Thiếu mô tả ảnh", description: "Alt text là bắt buộc." });
      return;
    }
    setSaving(true);
    try {
      const response = await apiFetch(`/api/cms/media/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText, caption: String(selected.caption || "").trim(), type: selected.type || "general" }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không lưu được thông tin ảnh."));
      const saved = await response.json();
      setSelected(saved);
      setRows((current) => current.map((item) => item.id === saved.id ? saved : item));
      notify({ tone: "success", title: "Đã lưu thông tin ảnh" });
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được ảnh", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="media-layout">
      <article className="panel media-browser">
        <div className="entity-toolbar">
          <div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên file, alt, caption..." /></div>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Tất cả loại ảnh</option>
            {["project", "construction", "interior", "blog", "banner", "service", "general"].map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option></select>
          <button className="secondary-button" onClick={() => load()} type="button">Lọc</button>
          {canUpload ? <label className="primary-button upload-control">{uploading ? "Đang upload..." : "Upload ảnh"}<input accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => upload(event.target.files)} type="file" /></label> : null}
        </div>
        <div className="media-grid">
          {rows.map((media) => (
            <button className={`media-tile ${selected?.id === media.id ? "active" : ""}`} key={media.id} onClick={() => setSelected(media)} type="button">
              <img alt={String(media.altText || media.originalName || "Media")} loading="lazy" src={String(media.thumbUrl || media.mediumUrl || media.webpUrl)} />
              <span>{String(media.originalName || media.fileName)}</span>
            </button>
          ))}
          {rows.length === 0 ? <div className="empty-state">Chưa có ảnh nào. Upload ảnh đầu tiên để bắt đầu thư viện.</div> : null}
        </div>
      </article>

      <aside className="panel media-detail">
        <h2>Chi tiết ảnh</h2>
        {selected ? (
          <>
            <img alt={String(selected.altText || selected.originalName || "Media")} src={String(selected.webpUrl)} />
            <dl>
              <div><dt>Tên file</dt><dd>{String(selected.originalName || selected.fileName)}</dd></div>
              <div><dt>URL WebP</dt><dd>{String(selected.webpUrl)}</dd></div>
            </dl>
            <div className="media-edit-fields">
              <label><span>Alt text *</span><input value={String(selected.altText || "")} onChange={(event) => setSelected({ ...selected, altText: event.target.value })} /></label>
              <label><span>Chú thích</span><textarea rows={3} value={String(selected.caption || "")} onChange={(event) => setSelected({ ...selected, caption: event.target.value })} /></label>
              <label><span>Loại</span><select value={String(selected.type || "general")} onChange={(event) => setSelected({ ...selected, type: event.target.value })}>{["project", "construction", "interior", "blog", "banner", "service", "general"].map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            </div>
            <div className="media-detail-actions"><button className="primary-button" disabled={saving} onClick={saveSelected} type="button">{saving ? "Đang lưu..." : "Lưu thông tin"}</button><button className="secondary-button" onClick={() => copyUrl(selected.webpUrl)} type="button">Copy URL WebP</button></div>
          </>
        ) : <p className="muted">Chọn một ảnh để xem thông tin.</p>}
      </aside>
    </section>
  );
}

type AiOutput = Record<string, unknown> | null;

function AiContentStudio({ setActive }: { setActive: (entity: Entity) => void }) {
  const { notify } = useAdminFeedback();
  const [form, setForm] = useState({
    topic: "Xu hướng thiết kế nội thất cao cấp cho biệt thự hiện đại",
    focusKeyword: "thiết kế nội thất biệt thự",
    secondaryKeywords: "nội thất cao cấp, biệt thự hiện đại, Hà Thành Home",
    group: "interior",
    audience: "Chủ biệt thự, chủ đầu tư nhà phố cao cấp",
    tone: "Chuyên gia, sang trọng, tư vấn bán hàng",
    articleType: "Cẩm nang",
    length: "1200 từ",
    imagePrompt: "Ảnh hero thực tế phong cách premium architecture & interior, biệt thự hiện đại với phòng khách sang trọng, ánh sáng tự nhiên, vật liệu gỗ đá cao cấp, không chữ, không logo.",
  });
  const [loading, setLoading] = useState("");
  const [output, setOutput] = useState<AiOutput>(null);
  const [history, setHistory] = useState<CmsItem[]>([]);

  // Bulk Generator states
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [keywordsText, setKeywordsText] = useState("");
  const [bulkStartTime, setBulkStartTime] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    tomorrow.setMilliseconds(0);
    // Convert to local time string format YYYY-MM-DDTHH:mm
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  });
  const [bulkInterval, setBulkInterval] = useState(24); // hours
  const [bulkWithImage, setBulkWithImage] = useState(true);
  const [bulkProgress, setBulkProgress] = useState<Array<{ keyword: string; status: string; error?: string; scheduledAt?: string; postId?: number }>>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  async function loadHistory() {
    try {
      const response = await apiFetch("/api/cms/ai/generations");
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được lịch sử AI."));
      setHistory(await response.json());
    } catch (error) {
      notify({ tone: "error", title: "Không tải được lịch sử AI", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function run(action: "generate-outline" | "generate-meta" | "generate-article", createDraft = false) {
    if (!form.topic.trim() || !form.focusKeyword.trim()) {
      notify({ tone: "error", title: "Thiếu dữ liệu AI", description: "Chủ đề và từ khóa chính là bắt buộc." });
      return;
    }
    setLoading(action + (createDraft ? "-draft" : ""));
    let payload: Record<string, unknown>;
    try {
      const response = await apiFetch(`/api/cms/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, createDraft }),
      });
      if (!response.ok) {
        notify({ tone: "error", title: "AI chưa chạy được", description: await readApiError(response, "Kiểm tra cấu hình AI Provider trong trang Cấu hình hoặc biến môi trường backend.") });
        setLoading("");
        return;
      }
      payload = await response.json();
    } catch (error) {
      setLoading("");
      notify({ tone: "error", title: "AI chưa chạy được", description: describeClientError(error, "Không kết nối được API AI.") });
      return;
    }
    setLoading("");
    setOutput(payload);
    await loadHistory();
    notify({ tone: "success", title: createDraft ? "Đã tạo bài nháp" : "AI đã tạo nội dung" });
    if (createDraft) setActive("posts");
  }

  async function generateImage() {
    if (!form.imagePrompt.trim()) {
      notify({ tone: "error", title: "Thiếu prompt ảnh", description: "Nhập mô tả ảnh cần tạo trước khi gọi AI." });
      return;
    }
    setLoading("generate-image");
    let payload: Record<string, unknown>;
    try {
      const response = await apiFetch("/api/cms/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: form.imagePrompt,
          topic: form.topic,
          type: "blog",
          size: "1536x1024",
          quality: "medium",
          altText: form.topic,
        }),
      });
      if (!response.ok) {
        notify({ tone: "error", title: "Chưa tạo được ảnh", description: await readApiError(response, "Kiểm tra OpenAI Image API Key, model ảnh và billing trong trang Cấu hình.") });
        setLoading("");
        return;
      }
      payload = await response.json();
    } catch (error) {
      setLoading("");
      notify({ tone: "error", title: "Chưa tạo được ảnh", description: describeClientError(error, "Không kết nối được API tạo ảnh.") });
      return;
    }
    setLoading("");
    setOutput(payload);
    await loadHistory();
    notify({ tone: "success", title: "Đã tạo ảnh và lưu vào Media Library" });
  }

  async function runBulkGeneration() {
    const lines = keywordsText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      notify({ tone: "error", title: "Thiếu từ khóa", description: "Vui lòng nhập ít nhất một từ khóa." });
      return;
    }

    const start = new Date(bulkStartTime);
    if (Number.isNaN(start.getTime())) {
      notify({ tone: "error", title: "Lịch đăng không hợp lệ", description: "Vui lòng chọn thời gian bắt đầu hợp lệ." });
      return;
    }

    setBulkLoading(true);
    const initialProgress = lines.map(kw => ({ keyword: kw, status: "pending" }));
    setBulkProgress(initialProgress);

    for (let i = 0; i < lines.length; i++) {
      const keyword = lines[i];
      
      // Update status to writing_article
      setBulkProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: "writing_article" } : item));

      // Calculate scheduledAt for this keyword
      const scheduledTime = new Date(start.getTime() + i * bulkInterval * 3600 * 1000);
      const scheduledAtStr = scheduledTime.toISOString();
      const localTimeString = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(scheduledTime);

      setBulkProgress(prev => prev.map((item, idx) => idx === i ? { ...item, scheduledAt: localTimeString } : item));

      let articlePayload: any;
      try {
        // 1. Sinh bài viết (createDraft: false để chúng ta tự gán ảnh cover)
        const response = await apiFetch("/api/cms/ai/generate-article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: keyword,
            focusKeyword: keyword,
            secondaryKeywords: form.secondaryKeywords,
            group: form.group,
            audience: form.audience,
            tone: form.tone,
            articleType: form.articleType,
            length: form.length,
            createDraft: false,
          }),
        });

        if (!response.ok) {
          throw new Error(await readApiError(response, "Lỗi sinh bài viết."));
        }
        articlePayload = await response.json();
      } catch (err: any) {
        setBulkProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: "failed", error: err.message } : item));
        continue;
      }

      let thumbnailMediaId: number | null = null;
      let finalContentHtml = articlePayload.contentHtml || "";

      // 2. Sinh ảnh đại diện bằng AI
      if (bulkWithImage) {
        setBulkProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: "generating_image" } : item));

        try {
          const imagePrompt = getDynamicImagePrompt(keyword, form.group);
          const imageResponse = await apiFetch("/api/cms/ai/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: imagePrompt,
              topic: keyword,
              type: "blog",
              size: "1536x1024",
              quality: "medium",
              altText: keyword,
            }),
          });

          if (!imageResponse.ok) {
            throw new Error(await readApiError(imageResponse, "Lỗi sinh ảnh."));
          }

          const imagePayload = await imageResponse.json();
          const media = imagePayload.media;
          if (media) {
            thumbnailMediaId = media.id;
            const mediaUrl = media.largeUrl || media.webpUrl || media.mediumUrl;
            const imageHtml = `<p><img src="${mediaUrl}" alt="${keyword}" style="width:100%; max-width:800px; height:auto; border-radius:8px; display:block; margin: 0 auto 20px;" /></p>`;
            finalContentHtml = imageHtml + finalContentHtml;
          }
        } catch (err: any) {
          console.warn("Failed to generate image for keyword:", keyword, err);
        }
      }

      // 3. Tạo bài viết với trạng thái scheduled
      setBulkProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: "saving" } : item));

      try {
        const postResponse = await apiFetch("/api/cms/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: articlePayload.title || keyword,
            slug: articlePayload.slug || "",
            contentHtml: finalContentHtml,
            excerpt: articlePayload.excerpt || "",
            focusKeyword: articlePayload.focusKeyword || keyword,
            metaTitle: articlePayload.metaTitle || articlePayload.title || keyword,
            metaDescription: articlePayload.metaDescription || "",
            thumbnailMediaId,
            status: "scheduled",
            scheduledAt: scheduledAtStr,
            isFeatured: false,
          }),
        });

        if (!postResponse.ok) {
          throw new Error(await readApiError(postResponse, "Lỗi lưu bài viết."));
        }

        const savedPost = await postResponse.json();
        setBulkProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: "completed", postId: savedPost.id } : item));
      } catch (err: any) {
        setBulkProgress(prev => prev.map((item, idx) => idx === i ? { ...item, status: "failed", error: err.message } : item));
      }
    }

    setBulkLoading(false);
    notify({ tone: "success", title: "Sinh bài viết hàng loạt hoàn tất" });
    await loadHistory();
  }

  return (
    <section className="ai-layout">
      <article className="panel ai-studio-card">
        <div className="panel-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2>Tạo nội dung SEO</h2>
            <p>AI chỉ tạo draft, không tự xuất bản. Model và API key lấy từ trang Cấu hình, có fallback theo biến môi trường backend.</p>
          </div>
          <div style={{ display: "flex", gap: "4px", background: "#f0ece4", padding: "4px", borderRadius: "6px" }}>
            <button
              type="button"
              onClick={() => setTab("single")}
              style={{
                border: "none",
                background: tab === "single" ? "#fff" : "transparent",
                color: tab === "single" ? "var(--admin-forest-green, #1b4332)" : "#666",
                fontWeight: tab === "single" ? "600" : "normal",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s"
              }}
            >
              Tạo một bài
            </button>
            <button
              type="button"
              onClick={() => setTab("bulk")}
              style={{
                border: "none",
                background: tab === "bulk" ? "#fff" : "transparent",
                color: tab === "bulk" ? "var(--admin-forest-green, #1b4332)" : "#666",
                fontWeight: tab === "bulk" ? "600" : "normal",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s"
              }}
            >
              Tạo hàng loạt
            </button>
          </div>
        </div>

        {tab === "single" ? (
          <>
            <div className="cms-form two-columns">
              <label className="wide">Chủ đề<input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} /></label>
              <label>Từ khóa chính<input value={form.focusKeyword} onChange={(event) => setForm({ ...form, focusKeyword: event.target.value })} /></label>
              <label>Từ khóa phụ<input value={form.secondaryKeywords} onChange={(event) => setForm({ ...form, secondaryKeywords: event.target.value })} /></label>
              <label>Nhóm nội dung<select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })}><option value="construction">Công trình</option><option value="interior">Nội thất</option><option value="xay_nha_tron_goi">Xây nhà trọn gói</option></select></label>
              <label>Loại bài<select value={form.articleType} onChange={(event) => setForm({ ...form, articleType: event.target.value })}><option>Cẩm nang</option><option>Dịch vụ</option><option>Dự án/case study</option><option>So sánh</option><option>Báo giá tham khảo</option></select></label>
              <label>Giọng văn<select value={form.tone} onChange={(event) => setForm({ ...form, tone: event.target.value })}><option>Chuyên gia</option><option>Thân thiện</option><option>Sang trọng</option><option>Tư vấn bán hàng</option><option>Chuyên gia, sang trọng, tư vấn bán hàng</option></select></label>
              <label>Độ dài<select value={form.length} onChange={(event) => setForm({ ...form, length: event.target.value })}><option>800 từ</option><option>1200 từ</option><option>1800 từ</option><option>2500 từ</option></select></label>
              <label className="wide">Đối tượng khách hàng<input value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} /></label>
              <label className="wide">Prompt tạo ảnh bài viết<textarea value={form.imagePrompt} onChange={(event) => setForm({ ...form, imagePrompt: event.target.value })} rows={4} placeholder="Mô tả ảnh cover cần tạo, không cần thêm chữ/logo." /></label>
            </div>
            <div className="ai-actions">
              <button className="secondary-button" disabled={Boolean(loading)} onClick={() => run("generate-outline")} type="button"><Sparkles size={16} /> {loading === "generate-outline" ? "Đang tạo..." : "Tạo outline"}</button>
              <button className="secondary-button" disabled={Boolean(loading)} onClick={() => run("generate-meta")} type="button"><FileText size={16} /> {loading === "generate-meta" ? "Đang tạo..." : "Tạo meta SEO"}</button>
              <button className="primary-button" disabled={Boolean(loading)} onClick={() => run("generate-article", true)} type="button"><Newspaper size={16} /> {loading === "generate-article-draft" ? "Đang tạo draft..." : "Tạo bài viết draft"}</button>
              <button className="secondary-button" disabled={Boolean(loading)} onClick={generateImage} type="button"><ImagePlus size={16} /> {loading === "generate-image" ? "Đang tạo ảnh..." : "Tạo ảnh lưu Media"}</button>
            </div>
          </>
        ) : (
          <>
            <div className="cms-form two-columns">
              <label className="wide">
                Danh sách từ khóa (mỗi từ khóa một dòng)
                <textarea
                  value={keywordsText}
                  onChange={(event) => setKeywordsText(event.target.value)}
                  rows={6}
                  placeholder="Ví dụ:&#10;Thiết kế phòng khách biệt thự hiện đại&#10;Xu hướng thiết kế phòng ngủ 2026&#10;Cách dự toán chi phí xây nhà trọn gói"
                  disabled={bulkLoading}
                />
              </label>
              <label>
                Lịch đăng bắt đầu
                <input
                  type="datetime-local"
                  value={bulkStartTime}
                  onChange={(event) => setBulkStartTime(event.target.value)}
                  disabled={bulkLoading}
                />
              </label>
              <label>
                Khoảng cách đăng bài
                <select
                  value={bulkInterval}
                  onChange={(event) => setBulkInterval(Number(event.target.value))}
                  disabled={bulkLoading}
                >
                  <option value={4}>4 giờ/bài</option>
                  <option value={6}>6 giờ/bài</option>
                  <option value={8}>8 giờ/bài</option>
                  <option value={12}>12 giờ/bài</option>
                  <option value={24}>24 giờ/bài (1 ngày)</option>
                  <option value={48}>48 giờ/bài (2 ngày)</option>
                </select>
              </label>
              <label>Nhóm nội dung<select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })} disabled={bulkLoading}><option value="construction">Công trình</option><option value="interior">Nội thất</option><option value="xay_nha_tron_goi">Xây nhà trọn gói</option></select></label>
              <label>Loại bài<select value={form.articleType} onChange={(event) => setForm({ ...form, articleType: event.target.value })} disabled={bulkLoading}><option>Cẩm nang</option><option>Dịch vụ</option><option>Dự án/case study</option><option>So sánh</option><option>Báo giá tham khảo</option></select></label>
              <label>Giọng văn<select value={form.tone} onChange={(event) => setForm({ ...form, tone: event.target.value })} disabled={bulkLoading}><option>Chuyên gia</option><option>Thân thiện</option><option>Sang trọng</option><option>Tư vấn bán hàng</option><option>Chuyên gia, sang trọng, tư vấn bán hàng</option></select></label>
              <label>Độ dài<select value={form.length} onChange={(event) => setForm({ ...form, length: event.target.value })} disabled={bulkLoading}><option>800 từ</option><option>1200 từ</option><option>1800 từ</option><option>2500 từ</option></select></label>
              <label className="wide">Đối tượng khách hàng<input value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} disabled={bulkLoading} /></label>
              <label className="wide check-row">
                <input
                  type="checkbox"
                  checked={bulkWithImage}
                  onChange={(event) => setBulkWithImage(event.target.checked)}
                  disabled={bulkLoading}
                />
                Tự động tạo ảnh đại diện (AI Cover Image)
              </label>
            </div>
            
            <div className="ai-actions">
              <button
                className="primary-button"
                disabled={bulkLoading}
                onClick={runBulkGeneration}
                type="button"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Sparkles size={16} />
                {bulkLoading ? "Đang xử lý sinh bài viết hàng loạt..." : "Bắt đầu sinh bài viết hàng loạt"}
              </button>
            </div>

            {bulkProgress.length > 0 ? (
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ fontSize: "14px" }}>Tiến độ sinh bài viết:</strong>
                <div style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "10px",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                  {bulkProgress.map((item, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "13px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: item.status === "completed" ? "#e8f5e9" : item.status === "failed" ? "#ffebee" : item.status === "pending" ? "#f5f5f5" : "#e3f2fd"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: "500" }}>{item.keyword}</span>
                        {item.scheduledAt ? <small style={{ color: "#666" }}>Lên lịch: {item.scheduledAt}</small> : null}
                        {item.error ? <small style={{ color: "red" }}>Lỗi: {item.error}</small> : null}
                      </div>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        color: "#fff",
                        background: item.status === "completed" ? "#2e7d32" : item.status === "failed" ? "#c62828" : item.status === "pending" ? "#757575" : "#1565c0"
                      }}>
                        {item.status === "pending" && "Chờ xử lý"}
                        {item.status === "writing_article" && "Đang viết bài..."}
                        {item.status === "generating_image" && "Đang tạo ảnh..."}
                        {item.status === "saving" && "Đang lưu..."}
                        {item.status === "completed" && "Thành công"}
                        {item.status === "failed" && "Thất bại"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </article>

      <article className="panel ai-output-card">
        <div className="panel-heading"><div><h2>Kết quả AI</h2><p>Kiểm tra nội dung trước khi dùng cho bài viết hoặc SEO.</p></div></div>
        {output ? <AiOutputView output={output} /> : <div className="empty-state">Chưa có kết quả AI. Chọn một tác vụ ở bên trái để bắt đầu.</div>}
      </article>

      <aside className="panel ai-history-card">
        <h2>Lịch sử gần đây</h2>
        <div className="ai-history-list">
          {history.slice(0, 8).map((item) => (
            <article key={item.id}>
              <strong>{String(item.model || "AI model")}</strong>
              <span>{String(item.status || "success")}</span>
              <p>{String(item.prompt || "").slice(0, 110)}...</p>
            </article>
          ))}
          {history.length === 0 ? <div className="empty-state">Chưa có lịch sử AI.</div> : null}
        </div>
      </aside>
    </section>
  );
}

function AiOutputView({ output }: { output: Record<string, unknown> }) {
  const draft = output.draftPost as { id?: number; title?: string; slug?: string } | undefined;
  const media = output.media as CmsItem | undefined;
  const mediaUrl = media ? String(media.largeUrl || media.webpUrl || media.mediumUrl || media.thumbUrl || "") : "";
  return (
    <div className="ai-output">
      {media?.id ? (
        <div className="ai-generated-media">
          <img alt={String(media.altText || media.originalName || "AI generated image")} src={mediaUrl} />
          <div>
            <strong>Ảnh đã lưu vào Media Library</strong>
            <p>{String(media.originalName || media.fileName || "")}</p>
            <code>{String(media.webpUrl || "")}</code>
          </div>
        </div>
      ) : null}
      {draft?.id ? <div className="ai-draft-banner"><CheckCircle2 size={18} /><span>Đã tạo draft: <strong>{draft.title}</strong></span></div> : null}
      {"title" in output ? <h3>{String(output.title)}</h3> : null}
      {"h1" in output ? <h3>{String(output.h1)}</h3> : null}
      {"metaTitle" in output ? <p><strong>Meta title:</strong> {String(output.metaTitle)}</p> : null}
      {"metaDescription" in output ? <p><strong>Meta description:</strong> {String(output.metaDescription)}</p> : null}
      {"slug" in output ? <p><strong>Slug:</strong> {String(output.slug)}</p> : null}
      {"contentHtml" in output ? <div className="ai-html-preview" dangerouslySetInnerHTML={{ __html: String(output.contentHtml || "") }} /> : null}
      <details>
        <summary>Xem JSON đầy đủ</summary>
        <pre>{JSON.stringify(output, null, 2)}</pre>
      </details>
    </div>
  );
}

type FlatMenuItem = MenuItem & { depth: number };

function MenuBuilder({ roles }: { roles: string[] }) {
  const { confirm, notify } = useAdminFeedback();
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [tree, setTree] = useState<MenuItem[]>([]);
  const [suggestions, setSuggestions] = useState<MenuSuggestion[]>([]);
  const [newItem, setNewItem] = useState({ label: "", url: "", suggestion: "" });
  const [savingOrder, setSavingOrder] = useState(false);
  const canWrite = roles.includes("Super Admin") || roles.includes("Admin");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const activeMenu = menus.find((menu) => menu.id === activeMenuId) || menus[0];
  const flatItems = useMemo(() => flattenMenuItems(tree), [tree]);

  async function load() {
    try {
      const [menusResponse, suggestionsResponse] = await Promise.all([
        apiFetch("/api/cms/menus"),
        apiFetch("/api/cms/menu-link-suggestions"),
      ]);
      if (!menusResponse.ok) throw new Error(await readApiError(menusResponse, "Không tải được danh sách menu."));
      if (!suggestionsResponse.ok) throw new Error(await readApiError(suggestionsResponse, "Không tải được danh sách link gợi ý."));
      const nextMenus: MenuRecord[] = await menusResponse.json();
      const nextSuggestions: MenuSuggestion[] = await suggestionsResponse.json();
      setMenus(nextMenus);
      setSuggestions(nextSuggestions);
      const nextActive = nextMenus.find((menu) => menu.id === activeMenuId) || nextMenus[0] || null;
      setActiveMenuId(nextActive?.id || null);
      setTree(buildMenuTree(nextActive?.items || []));
    } catch (error) {
      notify({ tone: "error", title: "Không tải được Menu Builder", description: describeClientError(error, "Kiểm tra API hoặc phiên đăng nhập.") });
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const menu = menus.find((item) => item.id === activeMenuId);
    setTree(buildMenuTree(menu?.items || []));
  }, [activeMenuId]);

  function patchLocal(id: number, patch: Partial<MenuItem>) {
    setTree((current) => updateMenuTree(current, id, patch));
  }

  function applySuggestion(value: string, targetId?: number) {
    const suggestion = suggestions.find((item) => item.url === value);
    if (!suggestion) return;
    if (targetId) {
      patchLocal(targetId, { label: suggestion.label, url: suggestion.url, itemType: suggestion.type, referenceType: suggestion.type, referenceId: suggestion.referenceId || null });
    } else {
      setNewItem({ label: suggestion.label, url: suggestion.url, suggestion: value });
    }
  }

  async function createMenu(location: "header" | "footer") {
    if (!canWrite) return;
    try {
      const response = await apiFetch("/api/cms/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: location === "header" ? "Menu chính" : "Menu footer", location, isActive: true }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không tạo được menu."));
      notify({ tone: "success", title: "Đã tạo menu" });
      await load();
    } catch (error) {
      notify({ tone: "error", title: "Không tạo được menu", description: describeClientError(error, "Kiểm tra quyền tài khoản.") });
    }
  }

  async function createItem(parentId: number | null = null) {
    if (!activeMenu || !canWrite) return;
    try {
      const parent = parentId ? flatItems.find((item) => item.id === parentId) : null;
      if (parent && parent.depth >= 2) {
        notify({ tone: "error", title: "Không thể thêm cấp 4", description: "Menu chỉ hỗ trợ tối đa 3 cấp." });
        return;
      }
      const payload = {
        menuId: activeMenu.id,
        parentId,
        label: newItem.label.trim() || "Menu mới",
        url: newItem.url.trim() || "#",
        target: "self",
        itemType: suggestions.find((item) => item.url === newItem.suggestion)?.type || "custom",
        referenceType: suggestions.find((item) => item.url === newItem.suggestion)?.type,
        referenceId: suggestions.find((item) => item.url === newItem.suggestion)?.referenceId,
        sortOrder: parentId ? childrenOf(tree, parentId).length : tree.length,
        isActive: true,
      };
      const response = await apiFetch("/api/cms/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không thêm được menu item."));
      setNewItem({ label: "", url: "", suggestion: "" });
      notify({ tone: "success", title: "Đã thêm menu item" });
      await load();
    } catch (error) {
      notify({ tone: "error", title: "Không thêm được menu item", description: describeClientError(error, "Kiểm tra dữ liệu nhập.") });
    }
  }

  async function saveItem(item: MenuItem) {
    if (!canWrite) return;
    try {
      const response = await apiFetch(`/api/cms/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: item.menuId,
          parentId: item.parentId || null,
          label: item.label,
          url: item.url,
          target: item.target || "self",
          rel: item.rel || "",
          itemType: item.itemType || "custom",
          referenceType: item.referenceType || undefined,
          referenceId: item.referenceId || undefined,
          sortOrder: item.sortOrder || 0,
          isActive: item.isActive !== false,
        }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không lưu được menu item."));
      notify({ tone: "success", title: "Đã lưu menu item" });
      await load();
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được menu item", description: describeClientError(error, "Kiểm tra dữ liệu hoặc quyền tài khoản.") });
    }
  }

  async function deleteItem(item: MenuItem) {
    if (!canWrite) return;
    const accepted = await confirm({ tone: "danger", title: "Xóa menu item?", description: `Menu "${item.label}" và các menu con sẽ bị xóa.`, confirmLabel: "Xóa" });
    if (!accepted) return;
    try {
      const response = await apiFetch(`/api/cms/menu-items/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await readApiError(response, "Không xóa được menu item."));
      notify({ tone: "success", title: "Đã xóa menu item" });
      await load();
    } catch (error) {
      notify({ tone: "error", title: "Không xóa được menu item", description: describeClientError(error, "Kiểm tra quyền tài khoản.") });
    }
  }

  async function duplicateItem(item: MenuItem) {
    if (!activeMenu || !canWrite) return;
    try {
      const response = await apiFetch("/api/cms/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: activeMenu.id,
          parentId: item.parentId || null,
          label: `${item.label} copy`,
          url: item.url,
          target: item.target || "self",
          rel: item.rel || "",
          itemType: item.itemType || "custom",
          referenceType: item.referenceType || undefined,
          referenceId: item.referenceId || undefined,
          sortOrder: flatItems.length + 1,
          isActive: item.isActive !== false,
        }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không nhân bản được menu item."));
      notify({ tone: "success", title: "Đã nhân bản menu item" });
      await load();
    } catch (error) {
      notify({ tone: "error", title: "Không nhân bản được menu item", description: describeClientError(error, "Kiểm tra quyền tài khoản.") });
    }
  }

  async function saveOrder() {
    if (!activeMenu || !canWrite) return;
    setSavingOrder(true);
    try {
      const response = await apiFetch(`/api/cms/menus/${activeMenu.id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tree: serializeMenuTree(tree) }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không lưu được thứ tự menu."));
      notify({ tone: "success", title: "Đã lưu thứ tự menu" });
      await load();
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được thứ tự menu", description: describeClientError(error, "Kiểm tra cấu trúc menu tối đa 3 cấp.") });
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const nextFlat = moveFlatMenuBlock(flatItems, Number(event.active.id), Number(event.over.id), event.delta.x);
    setTree(treeFromFlatMenu(nextFlat));
  }

  return (
    <section className="menu-builder">
      <div className="menu-builder-header">
        <div className="menu-tabs">
          {menus.map((menu) => <button className={activeMenuId === menu.id ? "active" : ""} key={menu.id} onClick={() => setActiveMenuId(menu.id)} type="button">{menu.location === "header" ? "Header" : "Footer"}<span>{menu.name}</span></button>)}
          {menus.length === 0 && canWrite ? <><button onClick={() => createMenu("header")} type="button">Tạo Header</button><button onClick={() => createMenu("footer")} type="button">Tạo Footer</button></> : null}
        </div>
        <button className="primary-button" disabled={!canWrite || savingOrder || !activeMenu} onClick={saveOrder} type="button">{savingOrder ? "Đang lưu..." : "Lưu thứ tự"}</button>
      </div>

      <div className="menu-builder-layout">
        <article className="panel menu-tree-panel">
          <div className="panel-heading"><div><h2>{activeMenu?.name || "Chưa có menu"}</h2><p>Kéo item lên xuống để đổi vị trí. Kéo lệch sang phải/trái để đổi cấp, tối đa 3 cấp.</p></div></div>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
            <SortableContext items={flatItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="menu-item-list">
                {flatItems.map((item) => (
                  <SortableMenuItem
                    canWrite={canWrite}
                    item={item}
                    key={item.id}
                    onApplySuggestion={applySuggestion}
                    onCreateChild={createItem}
                    onDelete={deleteItem}
                    onDuplicate={duplicateItem}
                    onPatch={patchLocal}
                    onSave={saveItem}
                    suggestions={suggestions}
                  />
                ))}
                {flatItems.length === 0 ? <div className="empty-state">Menu này chưa có item. Thêm item đầu tiên ở panel bên phải.</div> : null}
              </div>
            </SortableContext>
          </DndContext>
        </article>

        <aside className="panel menu-create-panel">
          <h2>Thêm menu item</h2>
          <label>Đường dẫn gợi ý<select value={newItem.suggestion} onChange={(event) => applySuggestion(event.target.value)}><option value="">Chọn route hoặc nội dung</option>{suggestions.map((item) => <option key={`${item.type}-${item.url}`} value={item.url}>{item.label} - {item.url}</option>)}</select></label>
          <label>Label<input value={newItem.label} onChange={(event) => setNewItem({ ...newItem, label: event.target.value })} placeholder="Tên menu" /></label>
          <label>URL<input value={newItem.url} onChange={(event) => setNewItem({ ...newItem, url: event.target.value })} placeholder="/du-an hoặc https://..." /></label>
          <button className="primary-button" disabled={!canWrite || !activeMenu} onClick={() => createItem(null)} type="button"><Plus size={16} /> Thêm cấp 1</button>
        </aside>
      </div>
    </section>
  );
}

function SortableMenuItem({ canWrite, item, onApplySuggestion, onCreateChild, onDelete, onDuplicate, onPatch, onSave, suggestions }: {
  canWrite: boolean;
  item: FlatMenuItem;
  onApplySuggestion: (value: string, targetId?: number) => void;
  onCreateChild: (parentId: number) => void;
  onDelete: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onPatch: (id: number, patch: Partial<MenuItem>) => void;
  onSave: (item: MenuItem) => void;
  suggestions: MenuSuggestion[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <article className={`menu-builder-item depth-${item.depth} ${item.isActive === false ? "inactive" : ""}`} ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <button className="drag-handle" type="button" {...attributes} {...listeners} aria-label="Kéo thả menu item"><GripVertical size={17} /></button>
      <div className="menu-builder-fields">
        <label>Label<input disabled={!canWrite} value={item.label || ""} onChange={(event) => onPatch(item.id, { label: event.target.value })} /></label>
        <label>URL<input disabled={!canWrite} value={item.url || ""} onChange={(event) => onPatch(item.id, { url: event.target.value, itemType: "custom", referenceType: null, referenceId: null })} /></label>
        <label>Gợi ý<select disabled={!canWrite} defaultValue="" onChange={(event) => onApplySuggestion(event.target.value, item.id)}><option value="">Chọn link</option>{suggestions.map((suggestion) => <option key={`${item.id}-${suggestion.type}-${suggestion.url}`} value={suggestion.url}>{suggestion.label} - {suggestion.url}</option>)}</select></label>
        <label>Target<select disabled={!canWrite} value={item.target || "self"} onChange={(event) => onPatch(item.id, { target: event.target.value as "self" | "blank", rel: event.target.value === "blank" ? "noopener noreferrer" : "" })}><option value="self">Cùng tab</option><option value="blank">Tab mới</option></select></label>
      </div>
      <div className="menu-builder-actions">
        <label className="check-row"><input checked={item.isActive !== false} disabled={!canWrite} onChange={(event) => onPatch(item.id, { isActive: event.target.checked })} type="checkbox" /> Hiện</label>
        <button className="secondary-button" disabled={!canWrite} onClick={() => onSave(item)} type="button">Lưu</button>
        <button className="secondary-button" disabled={!canWrite || item.depth >= 2} onClick={() => onCreateChild(item.id)} type="button">Thêm con</button>
        <button className="secondary-button" disabled={!canWrite} onClick={() => onDuplicate(item)} type="button"><Copy size={14} /> Nhân bản</button>
        <button className="secondary-button danger" disabled={!canWrite} onClick={() => onDelete(item)} type="button">Xóa</button>
      </div>
    </article>
  );
}

function buildMenuTree(items: MenuItem[]) {
  const map = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];
  for (const item of items) map.set(item.id, { ...item, children: [] });
  for (const item of map.values()) {
    if (item.parentId && map.has(item.parentId)) map.get(item.parentId)?.children?.push(item);
    else roots.push(item);
  }
  return sortMenuTree(roots);
}

function sortMenuTree(items: MenuItem[]): MenuItem[] {
  return [...items].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || a.id - b.id).map((item) => ({ ...item, children: sortMenuTree(item.children || []) }));
}

function flattenMenuItems(items: MenuItem[], depth = 0): FlatMenuItem[] {
  return items.flatMap((item) => [{ ...item, depth }, ...flattenMenuItems(item.children || [], depth + 1)]);
}

function treeFromFlatMenu(items: FlatMenuItem[]) {
  const roots: MenuItem[] = [];
  const stack: MenuItem[] = [];
  for (const flat of items) {
    const item: MenuItem = { ...flat, parentId: null, children: [] };
    delete (item as Partial<FlatMenuItem>).depth;
    const depth = Math.min(2, Math.max(0, flat.depth));
    if (depth === 0 || !stack[depth - 1]) {
      item.parentId = null;
      roots.push(item);
      stack[0] = item;
    } else {
      item.parentId = stack[depth - 1].id;
      stack[depth - 1].children = [...(stack[depth - 1].children || []), item];
      stack[depth] = item;
    }
    stack.length = depth + 1;
  }
  return roots;
}

function moveFlatMenuBlock(flat: FlatMenuItem[], activeId: number, overId: number, deltaX: number) {
  const oldIndex = flat.findIndex((item) => item.id === activeId);
  const overIndex = flat.findIndex((item) => item.id === overId);
  if (oldIndex < 0 || overIndex < 0) return flat;
  const activeDepth = flat[oldIndex].depth;
  let end = oldIndex + 1;
  while (end < flat.length && flat[end].depth > activeDepth) end += 1;
  if (overIndex >= oldIndex && overIndex < end) return flat;
  const block = flat.slice(oldIndex, end);
  const rest = [...flat.slice(0, oldIndex), ...flat.slice(end)];
  const targetIndex = Math.max(0, rest.findIndex((item) => item.id === overId) + (overIndex > oldIndex ? 1 : 0));
  const previous = rest[targetIndex - 1];
  const requestedDepth = Math.max(0, Math.min(2, activeDepth + Math.round(deltaX / 42)));
  const nextDepth = previous ? Math.min(requestedDepth, previous.depth + 1, 2) : 0;
  const depthDelta = nextDepth - activeDepth;
  const moved = block.map((item) => ({ ...item, depth: Math.max(0, Math.min(2, item.depth + depthDelta)) }));
  return [...rest.slice(0, targetIndex), ...moved, ...rest.slice(targetIndex)];
}

function serializeMenuTree(items: MenuItem[]): Array<{ id: number; children: unknown[] }> {
  return items.map((item) => ({ id: item.id, children: serializeMenuTree(item.children || []) }));
}

function updateMenuTree(items: MenuItem[], id: number, patch: Partial<MenuItem>): MenuItem[] {
  return items.map((item) => item.id === id ? { ...item, ...patch } : { ...item, children: updateMenuTree(item.children || [], id, patch) });
}

function childrenOf(items: MenuItem[], parentId: number): MenuItem[] {
  for (const item of items) {
    if (item.id === parentId) return item.children || [];
    const nested = childrenOf(item.children || [], parentId);
    if (nested.length) return nested;
  }
  return [];
}

function EstimatorPanel({ roles }: { roles: string[] }) {
  const { notify } = useAdminFeedback();
  const canWrite = canWriteEntity("estimator", roles);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [inputSchemaText, setInputSchemaText] = useState("[]");
  const [formulaText, setFormulaText] = useState("[]");
  const [previewInputText, setPreviewInputText] = useState("{}");
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [estimates, setEstimates] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const schema = useMemo(() => parseEstimatorSchema(inputSchemaText), [inputSchemaText]);
  const formulaItems = useMemo(() => parseJsonArray(formulaText), [formulaText]);
  const previewInput = useMemo(() => parseJsonObject(previewInputText), [previewInputText]);

  async function load() {
    setLoading(true);
    try {
      const [configResponse, estimatesResponse] = await Promise.all([
        apiFetch("/api/cms/construction-estimator/config"),
        apiFetch("/api/cms/construction-estimator/estimates?limit=8"),
      ]);
      if (!configResponse.ok) throw new Error(await readApiError(configResponse, "Không tải được cấu hình dự toán."));
      const payload = repairVietnamese(await configResponse.json()) as Record<string, unknown>;
      setConfig(payload);
      setInputSchemaText(JSON.stringify(payload.inputSchemaJson || [], null, 2));
      setFormulaText(JSON.stringify(payload.formulaItemsJson || [], null, 2));
      setPreviewInputText(JSON.stringify(sampleEstimatorInput(payload.inputSchemaJson || []), null, 2));
      if (estimatesResponse.ok) {
        const list: ListResponse<CmsItem> = await estimatesResponse.json();
        setEstimates(list.data || []);
      }
    } catch (error) {
      notify({ tone: "error", title: "Không tải được dự toán", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function buildPayload() {
    if (!config) throw new Error("Cấu hình chưa sẵn sàng.");
    return {
      id: Number(config.id || 1),
      name: String(config.name || "Dự toán công trình"),
      isActive: Boolean(config.isActive ?? true),
      currency: String(config.currency || "VND"),
      minFactor: Number(config.minFactor || 0.9),
      maxFactor: Number(config.maxFactor || 1.15),
      disclaimer: String(config.disclaimer || ""),
      ctaTitle: String(config.ctaTitle || ""),
      ctaDescription: String(config.ctaDescription || ""),
      inputSchemaJson: JSON.parse(inputSchemaText),
      formulaItemsJson: JSON.parse(formulaText),
    };
  }

  async function runPreview() {
    let payload: Record<string, unknown>;
    try {
      payload = { ...buildPayload(), input: JSON.parse(previewInputText || "{}") };
    } catch (error) {
      notify({ tone: "error", title: "Dữ liệu preview chưa hợp lệ", description: describeClientError(error, "Kiểm tra diện tích mẫu hoặc phần nâng cao.") });
      return;
    }
    const response = await apiFetch("/api/cms/construction-estimator/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      notify({ tone: "error", title: "Preview công thức lỗi", description: await readApiError(response, "Kiểm tra hệ số hoặc công thức nâng cao.") });
      return;
    }
    setPreview(await response.json());
    notify({ tone: "success", title: "Công thức hợp lệ" });
  }

  async function saveConfig() {
    let payload: Record<string, unknown>;
    try {
      payload = buildPayload();
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: describeClientError(error, "Cấu hình hoặc phần nâng cao chưa hợp lệ.") });
      return;
    }
    const response = await apiFetch("/api/cms/construction-estimator/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: await readApiError(response, "Công thức có thể đang lỗi hoặc thiếu biến.") });
      return;
    }
    notify({ tone: "success", title: "Đã lưu cấu hình dự toán" });
    await load();
  }

  async function resetDefaultConfig() {
    const response = await apiFetch("/api/cms/construction-estimator/reset-default", { method: "POST" });
    if (!response.ok) {
      notify({ tone: "error", title: "Không reset được cấu hình", description: await readApiError(response, "Kiểm tra quyền admin hoặc API.") });
      return;
    }
    notify({ tone: "success", title: "Đã nạp công thức m2 tính giá", description: "Cấu hình dự toán đã chuyển sang mô hình móng, mái, tầng hầm quy đổi theo hệ số." });
    await load();
  }

  function updateSchema(nextSchema: EstimatorAdminField[]) {
    setInputSchemaText(JSON.stringify(nextSchema, null, 2));
  }

  function updateOptionVariable(fieldName: string, optionValue: string, variableName: string, value: number) {
    const nextSchema = schema.map((field) => {
      if (field.name !== fieldName) return field;
      return {
        ...field,
        options: (field.options || []).map((option) =>
          option.value === optionValue ? { ...option, variables: { ...(option.variables || {}), [variableName]: value } } : option,
        ),
      };
    });
    updateSchema(nextSchema);
  }

  function updatePreviewValue(name: string, value: string | number) {
    setPreviewInputText(JSON.stringify({ ...previewInput, [name]: value }, null, 2));
  }

  const getOptionVariable = (fieldName: string, optionValue: string, variableName: string, fallback: number) => {
    const field = schema.find((item) => item.name === fieldName);
    const option = field?.options?.find((item) => item.value === optionValue);
    return Number(option?.variables?.[variableName] ?? fallback);
  };

  if (loading) return <section className="panel"><p className="muted">Đang tải cấu hình dự toán...</p></section>;
  if (!config) return <section className="panel"><p className="muted">Chưa có cấu hình dự toán.</p></section>;

  return (
    <section className="estimator-admin-layout">
      <article className="panel estimator-config-panel">
        <div className="panel-heading">
          <div><h2>Cấu hình dự toán theo m2</h2><p>Cài đơn giá và hệ số quy đổi. Hệ thống tự tính diện tích tính giá rồi nhân đơn giá/m2.</p></div>
          <div className="heading-actions">
            <button className="secondary-button" onClick={runPreview} type="button">Preview</button>
            {canWrite ? <button className="secondary-button" onClick={resetDefaultConfig} type="button">Nạp chuẩn m2</button> : null}
            {canWrite ? <button className="primary-button" onClick={saveConfig} type="button">Lưu cấu hình</button> : null}
          </div>
        </div>

        <div className="estimator-guide">
          <strong>Cách hiểu cấu hình này</strong>
          <p>Tổng diện tích tính giá = sàn các tầng + móng quy đổi + mái quy đổi + tầng hầm quy đổi. Chi phí dự kiến = tổng diện tích tính giá x đơn giá/m2, sau đó nhân hệ số loại công trình và khu vực.</p>
        </div>

        <div className="form-grid">
          <label>Tên cấu hình<input value={String(config.name || "")} onChange={(event) => setConfig({ ...config, name: event.target.value })} /></label>
          <label>Tiền tệ<input value={String(config.currency || "VND")} onChange={(event) => setConfig({ ...config, currency: event.target.value })} /></label>
          <label>Biên thấp nhất<input type="number" step="0.01" value={Number(config.minFactor || 0.9)} onChange={(event) => setConfig({ ...config, minFactor: Number(event.target.value) })} /></label>
          <label>Biên cao nhất<input type="number" step="0.01" value={Number(config.maxFactor || 1.15)} onChange={(event) => setConfig({ ...config, maxFactor: Number(event.target.value) })} /></label>
        </div>

        <div className="estimator-simple-grid">
          <EstimatorSettingCard title="Đơn giá xây dựng / m2" description="Giá này là giá nhân với diện tích tính giá. Admin có thể điều chỉnh theo thị trường.">
            <EstimatorNumber label="Phần thô" value={getOptionVariable("scope", "phan-tho", "unit_price", 3500000)} suffix="đ/m2" onChange={(value) => updateOptionVariable("scope", "phan-tho", "unit_price", value)} />
            <EstimatorNumber label="Trọn gói cơ bản" value={getOptionVariable("scope", "tron-goi-co-ban", "unit_price", 4800000)} suffix="đ/m2" onChange={(value) => updateOptionVariable("scope", "tron-goi-co-ban", "unit_price", value)} />
            <EstimatorNumber label="Trọn gói tiêu chuẩn" value={getOptionVariable("scope", "tron-goi-tieu-chuan", "unit_price", 5800000)} suffix="đ/m2" onChange={(value) => updateOptionVariable("scope", "tron-goi-tieu-chuan", "unit_price", value)} />
            <EstimatorNumber label="Trọn gói cao cấp" value={getOptionVariable("scope", "tron-goi-cao-cap", "unit_price", 7000000)} suffix="đ/m2" onChange={(value) => updateOptionVariable("scope", "tron-goi-cao-cap", "unit_price", value)} />
          </EstimatorSettingCard>

          <EstimatorSettingCard title="Hệ số móng" description="Ví dụ móng băng 1 phương 50% nghĩa là cộng thêm 50% diện tích một sàn vào diện tích tính giá.">
            <EstimatorNumber label="Móng đơn" value={getOptionVariable("foundationType", "mong-don", "foundation_area_factor", 0)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("foundationType", "mong-don", "foundation_area_factor", value)} />
            <EstimatorNumber label="Móng băng 1 phương" value={getOptionVariable("foundationType", "mong-bang-1-phuong", "foundation_area_factor", 0.5)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("foundationType", "mong-bang-1-phuong", "foundation_area_factor", value)} />
            <EstimatorNumber label="Móng băng 2 phương" value={getOptionVariable("foundationType", "mong-bang-2-phuong", "foundation_area_factor", 0.7)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("foundationType", "mong-bang-2-phuong", "foundation_area_factor", value)} />
            <EstimatorNumber label="Móng cọc/đài móng" value={getOptionVariable("foundationType", "mong-coc", "foundation_area_factor", 0.25)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("foundationType", "mong-coc", "foundation_area_factor", value)} />
          </EstimatorSettingCard>

          <EstimatorSettingCard title="Hệ số mái" description="Mái được quy đổi theo phần trăm diện tích một sàn.">
            <EstimatorNumber label="Mái tôn" value={getOptionVariable("roofType", "mai-ton", "roof_area_factor", 0.2)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("roofType", "mai-ton", "roof_area_factor", value)} />
            <EstimatorNumber label="Mái BTCT" value={getOptionVariable("roofType", "mai-btct", "roof_area_factor", 0.5)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("roofType", "mai-btct", "roof_area_factor", value)} />
            <EstimatorNumber label="Mái ngói kèo sắt" value={getOptionVariable("roofType", "mai-ngoi-keo-sat", "roof_area_factor", 0.7)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("roofType", "mai-ngoi-keo-sat", "roof_area_factor", value)} />
            <EstimatorNumber label="Mái ngói BTCT / Nhật / Thái" value={getOptionVariable("roofType", "mai-ngoi-btct", "roof_area_factor", 1)} suffix="x diện tích" step={0.05} onChange={(value) => updateOptionVariable("roofType", "mai-ngoi-btct", "roof_area_factor", value)} />
          </EstimatorSettingCard>

          <EstimatorSettingCard title="Hệ số tầng hầm" description="Nếu khách nhập diện tích hầm, hệ số này dùng để quy đổi vào diện tích tính giá.">
            <EstimatorNumber label="Không hầm" value={getOptionVariable("basementType", "khong-ham", "basement_area_factor", 0)} suffix="x diện tích hầm" step={0.1} onChange={(value) => updateOptionVariable("basementType", "khong-ham", "basement_area_factor", value)} />
            <EstimatorNumber label="Hầm nông" value={getOptionVariable("basementType", "ham-150", "basement_area_factor", 1.5)} suffix="x diện tích hầm" step={0.1} onChange={(value) => updateOptionVariable("basementType", "ham-150", "basement_area_factor", value)} />
            <EstimatorNumber label="Hầm tiêu chuẩn" value={getOptionVariable("basementType", "ham-200", "basement_area_factor", 2)} suffix="x diện tích hầm" step={0.1} onChange={(value) => updateOptionVariable("basementType", "ham-200", "basement_area_factor", value)} />
            <EstimatorNumber label="Hầm sâu/phức tạp" value={getOptionVariable("basementType", "ham-250", "basement_area_factor", 2.5)} suffix="x diện tích hầm" step={0.1} onChange={(value) => updateOptionVariable("basementType", "ham-250", "basement_area_factor", value)} />
          </EstimatorSettingCard>

          <EstimatorSettingCard title="Dữ liệu mẫu để preview" description="Dùng để kiểm tra ngay sau khi đổi đơn giá hoặc hệ số.">
            <EstimatorNumber label="Diện tích một sàn" value={Number(previewInput.area || 100)} suffix="m2" onChange={(value) => updatePreviewValue("area", value)} />
            <EstimatorNumber label="Số tầng nổi" value={Number(previewInput.floors || 2)} suffix="tầng" step={1} onChange={(value) => updatePreviewValue("floors", value)} />
            <EstimatorNumber label="Diện tích tầng hầm" value={Number(previewInput.basementArea || 0)} suffix="m2" onChange={(value) => updatePreviewValue("basementArea", value)} />
          </EstimatorSettingCard>

          <div className="estimator-preview-box">
            <span>Kết quả preview</span>
            {preview ? (
              <>
                <strong>{formatMoneyRange(Number(preview.totalMin || 0), Number(preview.totalMax || 0))}</strong>
                <dl>
                  <div><dt>Diện tích tính giá</dt><dd>{Number((preview.variables as Record<string, unknown> | undefined)?.priced_area || 0).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} m2</dd></div>
                  <div><dt>Đơn giá</dt><dd>{formatMoney(Number((preview.variables as Record<string, unknown> | undefined)?.unit_price || 0))}/m2</dd></div>
                </dl>
                <pre>{JSON.stringify(preview.lineItems || [], null, 2)}</pre>
              </>
            ) : <p className="muted">Chưa preview.</p>}
          </div>
        </div>

        <details className="estimator-advanced">
          <summary>Nâng cao: xem JSON và công thức</summary>
          <div className="estimator-json-grid">
            <label>Input schema JSON<textarea value={inputSchemaText} onChange={(event) => setInputSchemaText(event.target.value)} spellCheck={false} /></label>
            <label>Formula items JSON<textarea value={formulaText} onChange={(event) => setFormulaText(event.target.value)} spellCheck={false} /></label>
            <label>Preview input JSON<textarea value={previewInputText} onChange={(event) => setPreviewInputText(event.target.value)} spellCheck={false} /></label>
            <div className="estimator-preview-box"><span>Công thức hiện tại</span><pre>{JSON.stringify(formulaItems, null, 2)}</pre></div>
          </div>
        </details>

        <div className="form-grid">
          <label className="wide">Ghi chú báo giá<textarea rows={3} value={String(config.disclaimer || "")} onChange={(event) => setConfig({ ...config, disclaimer: event.target.value })} /></label>
          <label>Tiêu đề CTA<input value={String(config.ctaTitle || "")} onChange={(event) => setConfig({ ...config, ctaTitle: event.target.value })} /></label>
          <label>Mô tả CTA<input value={String(config.ctaDescription || "")} onChange={(event) => setConfig({ ...config, ctaDescription: event.target.value })} /></label>
        </div>
      </article>
      <aside className="panel estimator-history-panel">
        <div className="panel-heading"><div><h2>Lượt dự toán mới</h2><p>Các lượt tính từ popup ngoài website.</p></div></div>
        <div className="estimate-history-list">
          {estimates.map((item) => (
            <article key={item.id}>
              <strong>{formatMoneyRange(Number(item.totalMin || 0), Number(item.totalMax || 0))}</strong>
              <span>{formatDateTime(item.createdAt)} {item.leadId ? `- Lead #${item.leadId}` : ""}</span>
              <p>{String(item.sourceUrl || "Không có nguồn")}</p>
            </article>
          ))}
          {estimates.length === 0 ? <div className="empty-state">Chưa có lượt dự toán nào.</div> : null}
        </div>
      </aside>
    </section>
  );
}

type EstimatorAdminOption = { label: string; value: string; variables?: Record<string, number> };
type EstimatorAdminField = { name: string; label?: string; type?: string; defaultValue?: unknown; min?: number; options?: EstimatorAdminOption[] };

function parseEstimatorSchema(value: string): EstimatorAdminField[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonArray(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function EstimatorSettingCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="estimator-setting-card"><h3>{title}</h3><p>{description}</p><div>{children}</div></section>;
}

function EstimatorNumber({ label, value, suffix, step = 100000, onChange }: { label: string; value: number; suffix: string; step?: number; onChange: (value: number) => void }) {
  return <label className="estimator-number"><span>{label}</span><input type="number" step={step} value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(Number(event.target.value))} /><em>{suffix}</em></label>;
}

function formatMoney(value: number) {
  if (value >= 1000000000) return `${(value / 1000000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  return `${Math.round(value / 1000000).toLocaleString("vi-VN")} triệu`;
}

function repairVietnamese(value: unknown): unknown {
  if (typeof value === "string") return repairMojibake(value);
  if (Array.isArray(value)) return value.map(repairVietnamese);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairVietnamese(item)]));
  return value;
}

function repairMojibake(value: string) {
  if (!/[\u00c3\u00c2\u00c4\u00c5\u00c6]|\u00e1\u00ba|\u00e1\u00bb|\u00e2\u20ac/.test(value)) return value;
  const bytes = Array.from(value, (char) => cp1252Byte(char));
  try {
    const repaired = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
    return repaired;
  } catch {
    return value;
  }
}

function cp1252Byte(char: string) {
  const code = char.charCodeAt(0);
  const map: Record<number, number> = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
  return code <= 0xff ? code : map[code] ?? 0x3f;
}

function T(value: unknown) {
  return typeof value === "string" ? repairMojibake(value) : String(value ?? "");
}

function sampleEstimatorInput(schema: unknown) {
  if (!Array.isArray(schema)) return {};
  return Object.fromEntries(schema.map((field) => {
    const item = field as { name?: string; type?: string; defaultValue?: unknown; min?: number; options?: Array<{ value: string }> };
    return [item.name || "", item.defaultValue ?? (item.type === "number" ? item.min || 0 : item.options?.[0]?.value || "")];
  }).filter(([name]) => Boolean(name)));
}

function formatMoneyRange(min: number, max: number) {
  return `${Math.round(min / 1000000).toLocaleString("vi-VN")} - ${Math.round(max / 1000000).toLocaleString("vi-VN")} triệu`;
}

export function ImageUrlPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function selectMedia(media: CmsItem) {
    const url = String(media.largeUrl || media.mediumUrl || media.webpUrl || media.thumbUrl || "");
    if (url) onChange(url);
    setPickerOpen(false);
  }

  return (
    <div className="form-field image-url-picker">
      <span>{label}</span>
      <div className="image-url-preview">
        {value ? <img alt={label} src={value} /> : <div><ImagePlus size={20} /> Chưa chọn ảnh</div>}
        <div>
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="URL ảnh hoặc chọn từ Media Library" />
          <button className="secondary-button" onClick={() => setPickerOpen(true)} type="button"><ImagePlus size={16} /> Chọn từ Media Library</button>
        </div>
      </div>
      {pickerOpen ? <MediaPickerModal onClose={() => setPickerOpen(false)} onSelect={selectMedia} /> : null}
    </div>
  );
}

function ThemeSettingsPanel({ roles }: { roles: string[] }) {
  const { notify } = useAdminFeedback();
  const [values, setValues] = useState<Record<string, string>>({
    name: "Hà Thành Home",
    tagline: "Thiết kế - Thi công - Nội thất",
    hotline: "0966 123 456",
    email: "info@hathanhhome.vn",
    address: "Hà Nội, Việt Nam",
    facebook: "",
    zalo: "",
    workingHours: "",
    forestGreen: "#0f3d2e",
    gold: "#c99a4a",
    cream: "#f8f5ef",
    charcoal: "#1e1e1e",
    headingColor: "#183b2d",
    mutedColor: "#6b6b63",
    lineColor: "#e8ddca",
    headingFont: "cormorant",
    bodyFont: "inter",
    containerMax: "1500",
    heroEyebrow: "Hà Thành Home",
    heroTitle: "Thiết kế & thi công công trình, nội thất hiện đại",
    heroDescription: "Hà Thành Home mang đến giải pháp trọn gói từ ý tưởng, thiết kế đến thi công hoàn thiện cho nhà ở, biệt thự, văn phòng và showroom.",
    heroImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    heroPrimaryLabel: "Xem dự án nổi bật",
    heroPrimaryUrl: "#projects",
    heroSecondaryLabel: "Tư vấn miễn phí",
    heroSecondaryUrl: "/lien-he",
    aboutEyebrow: "Về Hà Thành Home",
    aboutTitle: "Kiến tạo không gian sống và công trình đẳng cấp",
    aboutDescription: "Với hơn 10 năm kinh nghiệm trong lĩnh vực thiết kế, thi công và nội thất, Hà Thành Home tư vấn giải pháp tối ưu, bền vững, thẩm mỹ và phù hợp chi phí.",
    aboutImageUrl: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85",
    expertiseEyebrow: "Hai khối chuyên môn",
    expertiseTitle: "Công trình và nội thất được vận hành tách biệt",
    architectureTemplatesTitle: "Mẫu thiết kế kiến trúc nổi bật",
    interiorTemplatesTitle: "Mẫu thiết kế nội thất nổi bật",
    servicesTitle: "Dịch vụ của chúng tôi",
    processTitle: "Quy trình làm việc",
    testimonialsTitle: "Khách hàng nói gì về chúng tôi",
    newsTitle: "Tin tức & cảm hứng",
    openaiApiKey: "",
    openaiBaseUrl: "https://modelapi.vn/v1",
    openaiWireApi: "chat_completions",
    openaiModel: "gpt-5.5",
    openaiReasoningEffort: "high",
    openaiMaxTokens: "4096",
    openaiModelWriter: "gpt-5.5",
    openaiModelFast: "gpt-5.5",
    openaiImageApiKey: "",
    openaiImageBaseUrl: "https://api.openai.com/v1",
    openaiImageModel: "gpt-image-2",
    openaiImageQuality: "medium",
    imageProvider: "openai",
    geminiApiKey: "",
    logoUrl: "",
    faviconUrl: "",
    zaloIconUrl: "",
    phoneIconUrl: "",
    zaloLabel: "",
    phoneLabel: "",
    smtpHost: "",
    smtpPort: "587",
    smtpSecure: "false",
    smtpUser: "",
    smtpPass: "",
    smtpFromName: "Hà Thành Home",
    smtpFromEmail: "",
    smtpToEmail: "",
    smtpEnabled: "false",
  });
  const [saving, setSaving] = useState(false);
  const canSave = roles.includes("Super Admin") || roles.includes("Admin");

  useEffect(() => {
    apiFetch("/api/cms/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error(await readApiError(res, "Không tải được cấu hình website."));
        return res.json();
      })
      .then((payload) => {
        const identity = typeof payload["site.identity"] === "object" && payload["site.identity"] ? payload["site.identity"] as Record<string, unknown> : {};
        const theme = typeof payload["site.theme"] === "object" && payload["site.theme"] ? payload["site.theme"] as Record<string, unknown> : {};
        const homepage = typeof payload["site.homepage"] === "object" && payload["site.homepage"] ? payload["site.homepage"] as Record<string, unknown> : {};
        const ai = typeof payload["site.ai"] === "object" && payload["site.ai"] ? payload["site.ai"] as Record<string, unknown> : {};
        const smtp = typeof payload["site.smtp"] === "object" && payload["site.smtp"] ? payload["site.smtp"] as Record<string, unknown> : {};
        const heroSlides = Array.isArray(homepage.heroSlides) ? homepage.heroSlides as Array<Record<string, unknown>> : [];
        const hero = heroSlides[0] || {};
        setValues((current) => ({
          ...current,
          name: String(identity.name || current.name),
          tagline: String(identity.tagline || current.tagline),
          hotline: String(identity.hotline || current.hotline),
          email: String(identity.email || current.email),
          address: String(identity.address || current.address),
          facebook: String(identity.facebook || ""),
          zalo: String(identity.zalo || ""),
          workingHours: String(identity.workingHours || ""),
          logoUrl: String(identity.logoUrl || ""),
          faviconUrl: String(identity.faviconUrl || ""),
          zaloIconUrl: String(identity.zaloIconUrl || ""),
          phoneIconUrl: String(identity.phoneIconUrl || ""),
          zaloLabel: String(identity.zaloLabel || ""),
          phoneLabel: String(identity.phoneLabel || ""),
          forestGreen: String(theme.forestGreen || current.forestGreen),
          gold: String(theme.gold || current.gold),
          cream: String(theme.cream || current.cream),
          charcoal: String(theme.charcoal || current.charcoal),
          headingColor: String(theme.headingColor || current.headingColor),
          mutedColor: String(theme.mutedColor || current.mutedColor),
          lineColor: String(theme.lineColor || current.lineColor),
          headingFont: String(theme.headingFont || current.headingFont),
          bodyFont: String(theme.bodyFont || current.bodyFont),
          containerMax: String(theme.containerMax || current.containerMax),
          heroEyebrow: String(hero.eyebrow || current.heroEyebrow),
          heroTitle: String(hero.title || current.heroTitle),
          heroDescription: String(hero.description || current.heroDescription),
          heroImageUrl: String(hero.imageUrl || current.heroImageUrl),
          heroPrimaryLabel: String(hero.primaryLabel || current.heroPrimaryLabel),
          heroPrimaryUrl: String(hero.primaryUrl || current.heroPrimaryUrl),
          heroSecondaryLabel: String(hero.secondaryLabel || current.heroSecondaryLabel),
          heroSecondaryUrl: String(hero.secondaryUrl || current.heroSecondaryUrl),
          aboutEyebrow: String(homepage.aboutEyebrow || current.aboutEyebrow),
          aboutTitle: String(homepage.aboutTitle || current.aboutTitle),
          aboutDescription: String(homepage.aboutDescription || current.aboutDescription),
          aboutImageUrl: String(homepage.aboutImageUrl || current.aboutImageUrl),
          expertiseEyebrow: String(homepage.expertiseEyebrow || current.expertiseEyebrow),
          expertiseTitle: String(homepage.expertiseTitle || current.expertiseTitle),
          architectureTemplatesTitle: String(homepage.architectureTemplatesTitle || current.architectureTemplatesTitle),
          interiorTemplatesTitle: String(homepage.interiorTemplatesTitle || current.interiorTemplatesTitle),
          servicesTitle: String(homepage.servicesTitle || current.servicesTitle),
          processTitle: String(homepage.processTitle || current.processTitle),
          testimonialsTitle: String(homepage.testimonialsTitle || current.testimonialsTitle),
          newsTitle: String(homepage.newsTitle || current.newsTitle),
          openaiApiKey: String(ai.openaiApiKey || ai.openai_api_key || ""),
          openaiBaseUrl: String(ai.openaiBaseUrl || ai.openai_base_url || "https://modelapi.vn/v1"),
          openaiWireApi: String(ai.openaiWireApi || ai.openai_wire_api || "chat_completions"),
          openaiModel: String(ai.openaiModel || ai.openai_model || ai.openaiModelWriter || "gpt-5.5"),
          openaiReasoningEffort: String(ai.openaiReasoningEffort || ai.openai_reasoning_effort || "high"),
          openaiMaxTokens: String(ai.openaiMaxTokens || ai.openai_max_tokens || "4096"),
          openaiModelWriter: String(ai.openaiModelWriter || ai.openaiModel || ai.openai_model || "gpt-5.5"),
          openaiModelFast: String(ai.openaiModelFast || ai.openaiModel || ai.openai_model || "gpt-5.5"),
          openaiImageApiKey: String(ai.openaiImageApiKey || ai.openai_image_api_key || ""),
          openaiImageBaseUrl: String(ai.openaiImageBaseUrl || ai.openai_image_base_url || "https://api.openai.com/v1"),
          openaiImageModel: String(ai.openaiImageModel || ai.openai_image_model || "gpt-image-2"),
          openaiImageQuality: String(ai.openaiImageQuality || ai.openai_image_quality || "medium"),
          imageProvider: String(ai.imageProvider || "openai"),
          geminiApiKey: String(ai.geminiApiKey || ""),
          smtpHost: String(smtp.smtpHost || ""),
          smtpPort: String(smtp.smtpPort || "587"),
          smtpSecure: String(smtp.smtpSecure === true || smtp.smtpSecure === "true" ? "true" : "false"),
          smtpUser: String(smtp.smtpUser || ""),
          smtpPass: String(smtp.smtpPass || ""),
          smtpFromName: String(smtp.smtpFromName || "Hà Thành Home"),
          smtpFromEmail: String(smtp.smtpFromEmail || ""),
          smtpToEmail: String(smtp.smtpToEmail || ""),
          smtpEnabled: String(smtp.smtpEnabled === true || smtp.smtpEnabled === "true" ? "true" : "false"),
        }));
      })
      .catch((error) => notify({ tone: "error", title: "Không tải được cấu hình", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") }));
  }, [notify]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    const identity = {
      name: values.name,
      tagline: values.tagline,
      logoUrl: values.logoUrl,
      faviconUrl: values.faviconUrl,
      hotline: values.hotline,
      email: values.email,
      address: values.address,
      facebook: values.facebook,
      zalo: values.zalo,
      workingHours: values.workingHours,
      zaloIconUrl: values.zaloIconUrl,
      phoneIconUrl: values.phoneIconUrl,
      zaloLabel: values.zaloLabel,
      phoneLabel: values.phoneLabel,
    };
    const theme = {
      forestGreen: values.forestGreen,
      gold: values.gold,
      cream: values.cream,
      charcoal: values.charcoal,
      headingColor: values.headingColor,
      mutedColor: values.mutedColor,
      lineColor: values.lineColor,
      headingFont: values.headingFont,
      bodyFont: values.bodyFont,
      containerMax: values.containerMax,
    };
    const homepage = {
      heroSlides: [{
        eyebrow: values.heroEyebrow,
        title: values.heroTitle,
        description: values.heroDescription,
        imageUrl: values.heroImageUrl,
        primaryLabel: values.heroPrimaryLabel,
        primaryUrl: values.heroPrimaryUrl,
        secondaryLabel: values.heroSecondaryLabel,
        secondaryUrl: values.heroSecondaryUrl,
      }],
      aboutEyebrow: values.aboutEyebrow,
      aboutTitle: values.aboutTitle,
      aboutDescription: values.aboutDescription,
      aboutImageUrl: values.aboutImageUrl,
      aboutBenefits: [
        { title: "Thiết kế sáng tạo", description: "Ý tưởng khác biệt, bám sát nhu cầu sử dụng." },
        { title: "Thi công đúng tiến độ", description: "Quản trị rõ ràng từ kế hoạch đến bàn giao." },
        { title: "Vật liệu chất lượng", description: "Kiểm soát vật liệu, kỹ thuật và hoàn thiện." },
        { title: "Bảo hành tận tâm", description: "Đồng hành sau bàn giao." },
      ],
      expertiseEyebrow: values.expertiseEyebrow,
      expertiseTitle: values.expertiseTitle,
      architectureTemplatesEyebrow: "Mẫu thiết kế",
      architectureTemplatesTitle: values.architectureTemplatesTitle,
      interiorTemplatesEyebrow: "Mẫu thiết kế",
      interiorTemplatesTitle: values.interiorTemplatesTitle,
      servicesEyebrow: "Dịch vụ",
      servicesTitle: values.servicesTitle,
      processTitle: values.processTitle,
      stats: [
        { value: "10+", label: "Năm kinh nghiệm" },
        { value: "500+", label: "Dự án hoàn thiện" },
        { value: "98%", label: "Khách hàng hài lòng" },
        { value: "24/7", label: "Hỗ trợ tư vấn" },
        { value: "50+", label: "Nhân sự chuyên môn" },
      ],
      testimonialsTitle: values.testimonialsTitle,
      newsTitle: values.newsTitle,
    };
    const ai = {
      openaiApiKey: values.openaiApiKey,
      openaiBaseUrl: values.openaiBaseUrl,
      openaiWireApi: values.openaiWireApi,
      openaiModel: values.openaiModel,
      openaiReasoningEffort: values.openaiReasoningEffort,
      openaiMaxTokens: values.openaiMaxTokens,
      geminiApiKey: values.geminiApiKey,
      openaiModelWriter: values.openaiModel,
      openaiModelFast: values.openaiModel,
      openaiImageApiKey: values.openaiImageApiKey,
      openaiImageBaseUrl: values.openaiImageBaseUrl,
      openaiImageModel: values.openaiImageModel,
      openaiImageQuality: values.openaiImageQuality,
      imageProvider: values.imageProvider,
    };
    const smtp = {
      smtpHost: values.smtpHost,
      smtpPort: Number(values.smtpPort) || 587,
      smtpSecure: values.smtpSecure === "true",
      smtpUser: values.smtpUser,
      smtpPass: values.smtpPass,
      smtpFromName: values.smtpFromName,
      smtpFromEmail: values.smtpFromEmail,
      smtpToEmail: values.smtpToEmail,
      smtpEnabled: values.smtpEnabled === "true",
    };
    try {
      const responses = await Promise.all([
        apiFetch("/api/cms/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.identity", value: identity }),
        }),
        apiFetch("/api/cms/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.theme", value: theme }),
        }),
        apiFetch("/api/cms/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.homepage", value: homepage }),
        }),
        apiFetch("/api/cms/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.ai", value: ai }),
        }),
        apiFetch("/api/cms/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.smtp", value: smtp }),
        }),
      ]);
      const failed = responses.find((response) => !response.ok);
      if (failed) {
        notify({ tone: "error", title: "Không lưu được cấu hình", description: await readApiError(failed, "Kiểm tra quyền tài khoản hoặc dữ liệu nhập.") });
        return;
      }
      notify({ tone: "success", title: "Đã lưu cấu hình website", description: "Màu sắc, font chữ và độ rộng frontend sẽ tự đồng bộ khi mở lại tab hoặc tải lại trang." });
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: describeClientError(error, "Không kết nối được API.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-layout">
      <article className="panel settings-card">
        <div className="panel-heading">
          <div>
            <h2>Thông tin thương hiệu</h2>
            <p>Dữ liệu này dùng cho header, footer, form tư vấn và các trang public.</p>
          </div>
        </div>
        <form className="cms-form two-columns" onSubmit={submit}>
          <label>Tên thương hiệu<input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} placeholder="Hà Thành Home" /></label>
          <label>Tagline<input value={values.tagline} onChange={(event) => setValues({ ...values, tagline: event.target.value })} placeholder="Thiết kế - Thi công - Nội thất" /></label>
          <LogoPickerField label="Logo thương hiệu chính" value={values.logoUrl || ""} onChange={(url) => setValues({ ...values, logoUrl: url })} />
          <LogoPickerField label="Favicon website (Biểu tượng thanh địa chỉ)" value={values.faviconUrl || ""} onChange={(url) => setValues({ ...values, faviconUrl: url })} />
          <label>Hotline<input value={values.hotline} onChange={(event) => setValues({ ...values, hotline: event.target.value })} placeholder="0966 123 456" /></label>
          <label>Email<input value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} placeholder="info@hathanhhome.vn" /></label>
          <label className="wide">Địa chỉ<textarea value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} rows={3} placeholder="Số 123 Nguyễn Trãi, Hà Nội" /></label>
          <label>Facebook<input value={values.facebook} onChange={(event) => setValues({ ...values, facebook: event.target.value })} placeholder="https://facebook.com/..." /></label>
          <label>Số điện thoại Zalo hoặc link Zalo chat<input value={values.zalo} onChange={(event) => setValues({ ...values, zalo: event.target.value })} placeholder="Ví dụ: 0966123456 hoặc https://zalo.me/..." /></label>
          <label>Nhãn nút Zalo (PC/Mobile)<input value={values.zaloLabel} onChange={(event) => setValues({ ...values, zaloLabel: event.target.value })} placeholder="Mặc định: Chat Zalo" /></label>
          <label>Nhãn nút Gọi điện (PC/Mobile)<input value={values.phoneLabel} onChange={(event) => setValues({ ...values, phoneLabel: event.target.value })} placeholder="Mặc định: Gọi điện" /></label>
          <LogoPickerField label="Icon Zalo tùy chỉnh (bỏ trống để dùng mặc định)" value={values.zaloIconUrl || ""} onChange={(url) => setValues({ ...values, zaloIconUrl: url })} />
          <LogoPickerField label="Icon Gọi Điện tùy chỉnh (bỏ trống để dùng mặc định)" value={values.phoneIconUrl || ""} onChange={(url) => setValues({ ...values, phoneIconUrl: url })} />
          <label className="wide">Giờ làm việc<input value={values.workingHours} onChange={(event) => setValues({ ...values, workingHours: event.target.value })} placeholder="08:00 - 18:00, Thứ 2 - Thứ 7" /></label>

          <div className="form-section wide theme-settings-section">
            <div className="form-section-title">
              <span>SMTP Email</span>
              <div>
                <h3>Cấu hình Email thông báo</h3>
                <p>Cài đặt tài khoản SMTP để tự động gửi thông báo qua Email khi có khách hàng đăng ký tư vấn hoặc dự toán.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>Kích hoạt thông báo Email
                <select value={values.smtpEnabled} onChange={(event) => setValues({ ...values, smtpEnabled: event.target.value })}>
                  <option value="false">Tắt thông báo</option>
                  <option value="true">Bật thông báo</option>
                </select>
              </label>
              <label>SMTP Host<input value={values.smtpHost} onChange={(event) => setValues({ ...values, smtpHost: event.target.value })} placeholder="Ví dụ: smtp.gmail.com" /></label>
              <label>SMTP Port<input value={values.smtpPort} onChange={(event) => setValues({ ...values, smtpPort: event.target.value })} placeholder="Ví dụ: 465 (SSL) hoặc 587 (TLS)" /></label>
              <label>Phương thức bảo mật
                <select value={values.smtpSecure} onChange={(event) => setValues({ ...values, smtpSecure: event.target.value })}>
                  <option value="false">STARTTLS (Thường dùng cổng 587)</option>
                  <option value="true">SSL/TLS (Thường dùng cổng 465)</option>
                </select>
              </label>
              <label>Tài khoản SMTP (Email gửi)<input value={values.smtpUser} onChange={(event) => setValues({ ...values, smtpUser: event.target.value })} placeholder="Ví dụ: user@gmail.com" /></label>
              <label>Mật khẩu SMTP (Mật khẩu ứng dụng)<input type="password" value={values.smtpPass} onChange={(event) => setValues({ ...values, smtpPass: event.target.value })} placeholder="••••••••••••••••" /></label>
              <label>Tên người gửi hiển thị<input value={values.smtpFromName} onChange={(event) => setValues({ ...values, smtpFromName: event.target.value })} placeholder="Ví dụ: Hà Thành Home" /></label>
              <label>Email người gửi (Thường trùng SMTP)<input value={values.smtpFromEmail} onChange={(event) => setValues({ ...values, smtpFromEmail: event.target.value })} placeholder="Ví dụ: noreply@hathanhhome.vn" /></label>
              <label className="wide">Email nhận thông báo (Nhận lead mới)<input value={values.smtpToEmail} onChange={(event) => setValues({ ...values, smtpToEmail: event.target.value })} placeholder="Nhập địa chỉ email sẽ nhận thông tin khách hàng đăng ký" /></label>
              
              <div className="smtp-guide-box wide" style={{ backgroundColor: "#f9f6f0", borderLeft: "4px solid #c99a4a", padding: "16px", borderRadius: "8px", marginTop: "12px", fontSize: "13px", lineHeight: "1.6", color: "#555" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#183b2d", fontWeight: "bold", fontSize: "14px" }}>💡 Hướng dẫn cấu hình Email SMTP nhanh:</h4>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li><strong>Nếu sử dụng Gmail:</strong>
                    <ul style={{ margin: "4px 0", paddingLeft: "15px" }}>
                      <li><strong>SMTP Host:</strong> <code>smtp.gmail.com</code> | <strong>Port:</strong> <code>465</code> (chọn SSL/TLS) hoặc <code>587</code> (chọn STARTTLS).</li>
                      <li><strong>Tài khoản:</strong> Nhập địa chỉ Gmail của bạn.</li>
                      <li><strong>Mật khẩu:</strong> Bạn <u>không dùng</u> mật khẩu Gmail chính. Bạn phải kích hoạt <b>Bảo mật 2 lớp</b> cho tài khoản Google, sau đó truy cập vào trang quản lý tài khoản để tạo <b>Mật khẩu ứng dụng (App Password)</b> gồm 16 ký tự và dán vào đây.</li>
                    </ul>
                  </li>
                  <li style={{ marginTop: "6px" }}><strong>Nếu sử dụng Email theo tên miền (Webmail cPanel/DirectAdmin):</strong>
                    <ul style={{ margin: "4px 0", paddingLeft: "15px" }}>
                      <li><strong>SMTP Host:</strong> Thường là <code>mail.domain.com</code>.</li>
                      <li><strong>Port:</strong> <code>465</code> (SSL) hoặc <code>587</code> (TLS/STARTTLS).</li>
                      <li><strong>Mật khẩu:</strong> Sử dụng mật khẩu của hòm thư email theo tên miền đó.</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="form-section wide theme-settings-section">
            <div className="form-section-title">
              <span>Homepage</span>
              <div><h3>Hero, banner slide và CTA</h3><p>Điều chỉnh nội dung phần đầu trang chủ. Ảnh nên chọn từ Media Library để tránh link hỏng.</p></div>
            </div>
            <div className="form-grid">
              <label>Eyebrow hero<input value={values.heroEyebrow} onChange={(event) => setValues({ ...values, heroEyebrow: event.target.value })} /></label>
              <label className="wide">Tiêu đề hero<textarea value={values.heroTitle} onChange={(event) => setValues({ ...values, heroTitle: event.target.value })} rows={3} /></label>
              <label className="wide">Mô tả hero<textarea value={values.heroDescription} onChange={(event) => setValues({ ...values, heroDescription: event.target.value })} rows={3} /></label>
              <ImageUrlPicker label="Ảnh banner hero" value={values.heroImageUrl} onChange={(value) => setValues({ ...values, heroImageUrl: value })} />
              <label>Nút chính<input value={values.heroPrimaryLabel} onChange={(event) => setValues({ ...values, heroPrimaryLabel: event.target.value })} /></label>
              <label>Link nút chính<input value={values.heroPrimaryUrl} onChange={(event) => setValues({ ...values, heroPrimaryUrl: event.target.value })} /></label>
              <label>Nút phụ<input value={values.heroSecondaryLabel} onChange={(event) => setValues({ ...values, heroSecondaryLabel: event.target.value })} /></label>
              <label>Link nút phụ<input value={values.heroSecondaryUrl} onChange={(event) => setValues({ ...values, heroSecondaryUrl: event.target.value })} /></label>
            </div>
          </div>

          <div className="form-section wide theme-settings-section">
            <div className="form-section-title">
              <span>Sections</span>
              <div><h3>Nội dung các section trang chủ</h3><p>Các tiêu đề này sẽ render trực tiếp ngoài client và được căn giữa theo layout mới.</p></div>
            </div>
            <div className="form-grid">
              <label>Eyebrow giới thiệu<input value={values.aboutEyebrow} onChange={(event) => setValues({ ...values, aboutEyebrow: event.target.value })} /></label>
              <label className="wide">Tiêu đề giới thiệu<textarea value={values.aboutTitle} onChange={(event) => setValues({ ...values, aboutTitle: event.target.value })} rows={2} /></label>
              <label className="wide">Mô tả giới thiệu<textarea value={values.aboutDescription} onChange={(event) => setValues({ ...values, aboutDescription: event.target.value })} rows={3} /></label>
              <ImageUrlPicker label="Ảnh section giới thiệu" value={values.aboutImageUrl} onChange={(value) => setValues({ ...values, aboutImageUrl: value })} />
              <label>Eyebrow khối chuyên môn<input value={values.expertiseEyebrow} onChange={(event) => setValues({ ...values, expertiseEyebrow: event.target.value })} /></label>
              <label>Tiêu đề khối chuyên môn<input value={values.expertiseTitle} onChange={(event) => setValues({ ...values, expertiseTitle: event.target.value })} /></label>
              <label>Tiêu đề mẫu kiến trúc<input value={values.architectureTemplatesTitle} onChange={(event) => setValues({ ...values, architectureTemplatesTitle: event.target.value })} /></label>
              <label>Tiêu đề mẫu nội thất<input value={values.interiorTemplatesTitle} onChange={(event) => setValues({ ...values, interiorTemplatesTitle: event.target.value })} /></label>
              <label>Tiêu đề dịch vụ<input value={values.servicesTitle} onChange={(event) => setValues({ ...values, servicesTitle: event.target.value })} /></label>
              <label>Tiêu đề quy trình<input value={values.processTitle} onChange={(event) => setValues({ ...values, processTitle: event.target.value })} /></label>
              <label>Tiêu đề đánh giá<input value={values.testimonialsTitle} onChange={(event) => setValues({ ...values, testimonialsTitle: event.target.value })} /></label>
              <label>Tiêu đề tin tức<input value={values.newsTitle} onChange={(event) => setValues({ ...values, newsTitle: event.target.value })} /></label>
            </div>
          </div>

          <div className="form-section wide theme-settings-section">
            <div className="form-section-title">
              <span>UI</span>
              <div><h3>Giao diện frontend client</h3><p>Thay đổi màu sắc, font chữ và độ rộng container của toàn bộ website public.</p></div>
            </div>
            <div className="form-grid">
              <label>Forest green<input type="color" value={values.forestGreen} onChange={(event) => setValues({ ...values, forestGreen: event.target.value })} /></label>
              <label>Gold / bronze<input type="color" value={values.gold} onChange={(event) => setValues({ ...values, gold: event.target.value })} /></label>
              <label>Cream<input type="color" value={values.cream} onChange={(event) => setValues({ ...values, cream: event.target.value })} /></label>
              <label>Charcoal<input type="color" value={values.charcoal} onChange={(event) => setValues({ ...values, charcoal: event.target.value })} /></label>
              <label>Màu heading<input type="color" value={values.headingColor} onChange={(event) => setValues({ ...values, headingColor: event.target.value })} /></label>
              <label>Màu text phụ<input type="color" value={values.mutedColor} onChange={(event) => setValues({ ...values, mutedColor: event.target.value })} /></label>
              <label>Màu border<input type="color" value={values.lineColor} onChange={(event) => setValues({ ...values, lineColor: event.target.value })} /></label>
              <label>Độ rộng layout<input type="number" min={1180} max={1680} step={20} value={values.containerMax} onChange={(event) => setValues({ ...values, containerMax: event.target.value })} /></label>
              <label>Font heading<select value={values.headingFont} onChange={(event) => setValues({ ...values, headingFont: event.target.value })}><option value="cormorant">Cormorant Garamond</option><option value="playfair">Playfair Display</option><option value="roboto">Roboto</option><option value="serif">System Serif</option></select></label>
              <label>Font body<select value={values.bodyFont} onChange={(event) => setValues({ ...values, bodyFont: event.target.value })}><option value="inter">Inter</option><option value="beVietnam">Be Vietnam Pro</option><option value="roboto">Roboto</option><option value="system">System Sans</option></select></label>
            </div>
          </div>

          <div className="form-section wide theme-settings-section">
            <div className="form-section-title">
              <span>Cấu hình AI</span>
              <div><h3>AI viết bài & sinh ảnh</h3><p>Tách riêng provider viết bài và OpenAI chính hãng cho ảnh. Giá trị trong Admin sẽ ưu tiên hơn cấu hình môi trường.</p></div>
            </div>
            <div className="form-grid">
              <div className="form-section-title wide compact-section-title">
                <span>AI Provider</span>
                <div><h3>Viết bài SEO</h3><p>Dùng API tương thích OpenAI như modelapi.vn. Không dùng key này cho sinh ảnh.</p></div>
              </div>
              <label className="wide">AI Provider API Key<input type="password" value={values.openaiApiKey || ""} onChange={(event) => setValues({ ...values, openaiApiKey: event.target.value })} placeholder="Key của provider viết bài" /></label>
              <label className="wide">AI Provider Base URL<input value={values.openaiBaseUrl || ""} onChange={(event) => setValues({ ...values, openaiBaseUrl: event.target.value })} placeholder="https://modelapi.vn/v1" /></label>
              <label>Wire API
                <select value={values.openaiWireApi || "chat_completions"} onChange={(event) => setValues({ ...values, openaiWireApi: event.target.value })}>
                  <option value="chat_completions">Chat Completions</option>
                  <option value="responses">Responses API</option>
                </select>
              </label>
              <label>Model sinh nội dung<input value={values.openaiModel || ""} onChange={(event) => setValues({ ...values, openaiModel: event.target.value })} placeholder="gpt-5.5" /></label>
              <label>Reasoning Effort
                <select value={values.openaiReasoningEffort || "high"} onChange={(event) => setValues({ ...values, openaiReasoningEffort: event.target.value })}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
              <label>Max Output Tokens<input type="number" min={1} max={128000} step={256} value={values.openaiMaxTokens || "4096"} onChange={(event) => setValues({ ...values, openaiMaxTokens: event.target.value })} /></label>
              <div className="form-section-title wide compact-section-title">
                <span>OpenAI Images</span>
                <div><h3>Sinh ảnh bài viết</h3><p>Dùng API key OpenAI chính hãng riêng. Nếu thiếu key ảnh, phần viết bài vẫn dùng provider nội dung bình thường.</p></div>
              </div>
              <label className="wide">OpenAI Image API Key<input type="password" value={values.openaiImageApiKey || ""} onChange={(event) => setValues({ ...values, openaiImageApiKey: event.target.value })} placeholder="sk-proj-..." /></label>
              <label className="wide">OpenAI Image Base URL<input value={values.openaiImageBaseUrl || ""} onChange={(event) => setValues({ ...values, openaiImageBaseUrl: event.target.value })} placeholder="https://api.openai.com/v1" /></label>
              <label>Nhà cung cấp ảnh
                <select
                  value={values.imageProvider || "openai"}
                  onChange={(event) => {
                    const provider = event.target.value;
                    const defaultModel = provider === "gemini" ? "gemini-3-pro-image-preview" : "gpt-image-2";
                    setValues({ ...values, imageProvider: provider, openaiImageModel: defaultModel });
                  }}
                >
                  <option value="openai">OpenAI (ChatGPT Image)</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </label>
              <label>Model sinh ảnh
                <select
                  value={values.openaiImageModel || (values.imageProvider === "gemini" ? "gemini-3-pro-image-preview" : "gpt-image-2")}
                  onChange={(event) => setValues({ ...values, openaiImageModel: event.target.value })}
                >
                  {values.imageProvider === "gemini" ? (
                    <>
                      <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image (Premium)</option>
                      <option value="imagen-3.0-generate-002">Imagen 3 (Standard)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-image-2">ChatGPT Image 2 (Premium)</option>
                      <option value="dall-e-3">DALL-E 3 (Standard)</option>
                      <option value="dall-e-2">DALL-E 2 (Legacy)</option>
                    </>
                  )}
                </select>
              </label>
              <label>Chất lượng ảnh
                <select value={values.openaiImageQuality || "medium"} onChange={(event) => setValues({ ...values, openaiImageQuality: event.target.value })}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="auto">auto</option>
                </select>
              </label>
              <label className="wide">Gemini API Key (tùy chọn, legacy)<input type="password" value={values.geminiApiKey || ""} onChange={(event) => setValues({ ...values, geminiApiKey: event.target.value })} placeholder="AIzaSy..." /></label>
            </div>
          </div>

          <div className="form-actions wide">
            <button className="primary-button" disabled={!canSave || saving} type="submit">{saving ? "Đang lưu..." : "Lưu cấu hình"}</button>
          </div>
        </form>
      </article>
      <aside className="panel settings-preview">
        {values.logoUrl ? (
          <img src={values.logoUrl} alt="Logo Preview" style={{ maxHeight: "60px", maxWidth: "160px", objectFit: "contain", marginBottom: "16px", background: "white", padding: "4px", borderRadius: "4px", border: "1px solid var(--admin-line, #e5e5e5)" }} />
        ) : (
          <span className="admin-brand-mark"><Building2 size={28} strokeWidth={1.6} /></span>
        )}
        <h2>{values.name || "Hà Thành Home"}</h2>
        <p>{values.tagline || "Thiết kế - Thi công - Nội thất"}</p>
        <div className="theme-preview-strip">
          {[values.forestGreen, values.gold, values.cream, values.charcoal, values.headingColor].map((color) => <span key={color} style={{ background: color }} />)}
        </div>
        <dl>
          <div><dt>Hotline</dt><dd>{values.hotline || "Chưa cấu hình"}</dd></div>
          <div><dt>Email</dt><dd>{values.email || "Chưa cấu hình"}</dd></div>
          <div><dt>Địa chỉ</dt><dd>{values.address || "Chưa cấu hình"}</dd></div>
          <div><dt>Layout</dt><dd>{values.containerMax}px, heading {values.headingFont}, body {values.bodyFont}</dd></div>
        </dl>
      </aside>
    </section>
  );
}

function LogoPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function selectMedia(media: CmsItem) {
    const url = String(media.largeUrl || media.webpUrl || media.mediumUrl || media.thumbUrl || "");
    onChange(url);
    setPickerOpen(false);
  }

  return (
    <div className="form-field logo-picker-field" style={{ gridColumn: "1 / -1", marginBottom: "8px" }}>
      <span style={{ fontWeight: 500, fontSize: "14px", display: "block", marginBottom: "6px" }}>{label}</span>
      <div className="thumbnail-picker" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {value ? (
          <img src={value} alt={label} style={{ maxHeight: "80px", maxWidth: "200px", objectFit: "contain", border: "1px solid var(--admin-line, #e5e5e5)", padding: "4px", borderRadius: "4px", background: "white" }} />
        ) : (
          <div className="thumbnail-empty" style={{ border: "1px dashed var(--admin-gold, #c5a880)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", width: "120px", height: "80px", background: "#f9f6f0" }}>
            <ImagePlus size={20} style={{ color: "var(--admin-gold)" }} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button className="secondary-button" onClick={() => setPickerOpen(true)} type="button">
            <ImagePlus size={14} /> Chọn ảnh từ thư viện
          </button>
          {value ? (
            <button className="secondary-button danger" onClick={() => onChange("")} type="button">
              Xóa ảnh
            </button>
          ) : null}
        </div>
      </div>
      {pickerOpen ? <MediaPickerModal onClose={() => setPickerOpen(false)} onSelect={selectMedia} /> : null}
    </div>
  );
}

function SettingsPanel({ roles }: { roles: string[] }) {
  const { notify } = useAdminFeedback();
  const [values, setValues] = useState<Record<string, string>>({
    name: "Hà Thành Home",
    tagline: "Thiết kế - Thi công - Nội thất",
    hotline: "",
    email: "",
    address: "",
    facebook: "",
    zalo: "",
    workingHours: "",
    logoUrl: "",
    faviconUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const canSave = roles.includes("Super Admin") || roles.includes("Admin");

  useEffect(() => {
    apiFetch("/api/cms/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error(await readApiError(res, "Không tải được cấu hình website."));
        return res.json();
      })
      .then((payload) => {
        const identity = typeof payload["site.identity"] === "object" && payload["site.identity"] ? payload["site.identity"] as Record<string, unknown> : {};
        setValues((current) => ({
          ...current,
          name: String(identity.name || current.name),
          tagline: String(identity.tagline || current.tagline),
          hotline: String(identity.hotline || ""),
          email: String(identity.email || ""),
          address: String(identity.address || ""),
          facebook: String(identity.facebook || ""),
          zalo: String(identity.zalo || ""),
          workingHours: String(identity.workingHours || ""),
          logoUrl: String(identity.logoUrl || ""),
          faviconUrl: String(identity.faviconUrl || ""),
        }));
      })
      .catch((error) => notify({ tone: "error", title: "Không tải được cấu hình", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") }));
  }, [notify]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    let response: Response;
    try {
      response = await apiFetch("/api/cms/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "site.identity", value: values }),
      });
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: describeClientError(error, "Không kết nối được API.") });
      setSaving(false);
      return;
    }
    if (!response.ok) {
      notify({ tone: "error", title: "Không lưu được cấu hình", description: await readApiError(response, "Kiểm tra quyền tài khoản hoặc kết nối API.") });
      setSaving(false);
      return;
    }
    setSaving(false);
    notify({ tone: "success", title: "Đã lưu cấu hình website" });
  }

  return (
    <section className="settings-layout">
      <article className="panel settings-card">
        <div className="panel-heading">
          <div>
            <h2>Thông tin liên hệ</h2>
            <p>Dữ liệu này dùng cho footer, form tư vấn và các trang public.</p>
          </div>
        </div>
        <form className="cms-form two-columns" onSubmit={submit}>
          <label>Tên thương hiệu<input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} placeholder="Hà Thành Home" /></label>
          <label>Tagline<input value={values.tagline} onChange={(event) => setValues({ ...values, tagline: event.target.value })} placeholder="Thiết kế - Thi công - Nội thất" /></label>
          <LogoPickerField label="Logo thương hiệu chính" value={values.logoUrl || ""} onChange={(url) => setValues({ ...values, logoUrl: url })} />
          <LogoPickerField label="Favicon website (Biểu tượng thanh địa chỉ)" value={values.faviconUrl || ""} onChange={(url) => setValues({ ...values, faviconUrl: url })} />
          <label>Hotline<input value={values.hotline} onChange={(event) => setValues({ ...values, hotline: event.target.value })} placeholder="0966 123 456" /></label>
          <label>Email<input value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} placeholder="info@hathanhhome.vn" /></label>
          <label className="wide">Địa chỉ<textarea value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} rows={3} placeholder="Số 123 Nguyễn Trãi, Hà Nội" /></label>
          <label>Facebook<input value={values.facebook} onChange={(event) => setValues({ ...values, facebook: event.target.value })} placeholder="https://facebook.com/..." /></label>
          <label>Zalo<input value={values.zalo} onChange={(event) => setValues({ ...values, zalo: event.target.value })} placeholder="https://zalo.me/..." /></label>
          <label className="wide">Giờ làm việc<input value={values.workingHours} onChange={(event) => setValues({ ...values, workingHours: event.target.value })} placeholder="08:00 - 18:00, Thứ 2 - Thứ 7" /></label>
          <div className="form-actions wide">
            <button className="primary-button" disabled={!canSave || saving} type="submit">{saving ? "Đang lưu..." : "Lưu cấu hình"}</button>
          </div>
        </form>
      </article>
      <aside className="panel settings-preview">
        {values.logoUrl ? (
          <img src={values.logoUrl} alt="Logo Preview" style={{ maxHeight: "60px", maxWidth: "160px", objectFit: "contain", marginBottom: "16px", background: "white", padding: "4px", borderRadius: "4px", border: "1px solid var(--admin-line, #e5e5e5)" }} />
        ) : (
          <span className="admin-brand-mark"><Building2 size={28} strokeWidth={1.6} /></span>
        )}
        <h2>{values.name || "Hà Thành Home"}</h2>
        <p>{values.tagline || "Thiết kế - Thi công - Nội thất"}</p>
        <dl>
          <div><dt>Hotline</dt><dd>{values.hotline || "Chưa cấu hình"}</dd></div>
          <div><dt>Email</dt><dd>{values.email || "Chưa cấu hình"}</dd></div>
          <div><dt>Địa chỉ</dt><dd>{values.address || "Chưa cấu hình"}</dd></div>
        </dl>
      </aside>
    </section>
  );
}

function EntityPanel({ entity, roles }: { entity: Entity; roles: string[] }) {
  const { notify, confirm } = useAdminFeedback();
  const [rows, setRows] = useState<CmsItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [status, setStatus] = useState("");
  const [filterOne, setFilterOne] = useState("");
  const [filterTwo, setFilterTwo] = useState("");
  const [editing, setEditing] = useState<CmsItem | null>(null);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [view, setView] = useState<"table" | "calendar">("table");
  const [scheduledRows, setScheduledRows] = useState<CmsItem[]>([]);
  const [projectCategories, setProjectCategories] = useState<CmsItem[]>([]);
  const [postCategories, setPostCategories] = useState<CmsItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<CmsItem[]>([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const canWrite = canWriteEntity(entity, roles);
  const form = useForm<Record<string, unknown>>({ defaultValues: defaultValues(entity) });
  const metaInfo = moduleMeta[entity];

  async function load(page = 1) {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      if (group && ["projects", "services", "project-categories", "project-filter-options"].includes(entity)) params.set("group", group);
      if (filterOne && entity === "posts") params.set("categoryId", filterOne);
      if (filterOne && entity === "project-filter-options") params.set("type", filterOne);
      if (filterTwo && entity === "project-filter-options") params.set("module", filterTwo);
      if (filterOne && entity === "architecture-designs") params.set("houseType", filterOne);
      if (filterTwo && entity === "architecture-designs") params.set("style", filterTwo);
      if (filterOne && entity === "interior-designs") params.set("interiorStyle", filterOne);
      if (filterTwo && entity === "interior-designs") params.set("roomType", filterTwo);
      if (status) params.set("status", status);
      const response = await apiFetch(`/api/cms/${entity}?${params}`);
      if (response.status === 401) {
        window.location.href = adminUrl("/login");
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response, `Không tải được ${entitySingular[entity]}.`));
      const payload: ListResponse<CmsItem> = await response.json();
      setRows(payload.data || []);
      setMeta(payload.meta || meta);
    } catch (error) {
      notify({ tone: "error", title: "Không tải được danh sách", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    }
  }

  async function loadScheduled(month = calendarDate) {
    if (entity !== "posts") return;
    const { from, to } = calendarRange(month);
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    try {
      const response = await apiFetch(`/api/cms/scheduled-posts?${params}`);
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được lịch đăng bài."));
      setScheduledRows(await response.json());
    } catch (error) {
      notify({ tone: "error", title: "Không tải được lịch đăng", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    }
  }

  async function loadProjectCategories() {
    try {
      const response = await apiFetch("/api/cms/project-categories?limit=200");
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được danh mục dự án."));
      const payload: ListResponse<CmsItem> = await response.json();
      setProjectCategories(payload.data || []);
    } catch (error) {
      notify({ tone: "error", title: "Không tải được danh mục dự án", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    }
  }

  async function loadPostCategories() {
    try {
      const response = await apiFetch("/api/cms/post-categories?limit=200");
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được danh mục bài viết."));
      const payload: ListResponse<CmsItem> = await response.json();
      setPostCategories(payload.data || []);
    } catch (error) {
      notify({ tone: "error", title: "Không tải được danh mục bài viết", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    }
  }

  async function loadFilterOptions() {
    try {
      const response = await apiFetch("/api/cms/project-filter-options?limit=1000");
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được bộ lọc catalog."));
      const payload: ListResponse<CmsItem> = await response.json();
      setFilterOptions(payload.data || []);
    } catch (error) {
      notify({ tone: "error", title: "Không tải được bộ lọc catalog", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    }
  }

  useEffect(() => {
    setMode("list");
    setView("table");
    setFilterOne("");
    setFilterTwo("");
    setEditing(null);
    form.reset(defaultValues(entity));
    load(1);
    if (["projects", "project-categories"].includes(entity)) loadProjectCategories();
    if (["posts", "post-categories"].includes(entity)) loadPostCategories();
    if (["projects", "project-filter-options", "architecture-designs", "interior-designs"].includes(entity)) loadFilterOptions();
  }, [entity]);

  useEffect(() => {
    if (entity === "posts" && mode === "list") loadScheduled(calendarDate);
  }, [entity, mode, calendarDate]);

  function startCreate() {
    setEditing(null);
    form.reset(defaultValues(entity));
    setMode("form");
  }

  function startEdit(row: CmsItem) {
    setEditing(row);
    form.reset({
      ...defaultValues(entity),
      ...row,
      scheduledAt: toDateTimeLocal(row.scheduledAt),
      publishedAt: toDateTimeLocal(row.publishedAt),
      isFeatured: Boolean(row.isFeatured),
    });
    setMode("form");
  }

  function backToList() {
    setMode("list");
    setEditing(null);
    form.reset(defaultValues(entity));
  }

  async function submit(values: Record<string, unknown>) {
    const parsed = contentSchema.safeParse(values);
    if (!parsed.success) {
      notify({ tone: "error", title: "Dữ liệu không hợp lệ", description: parsed.error.issues[0]?.message || "Kiểm tra lại các trường bắt buộc." });
      return;
    }
    let response: Response;
    try {
      response = await apiFetch(editing ? `/api/cms/${entity}/${editing.id}` : `/api/cms/${entity}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizePayload(entity, values)),
      });
    } catch (error) {
      notify({ tone: "error", title: "Không lưu được dữ liệu", description: describeClientError(error, "Không kết nối được API.") });
      return;
    }
    if (!response.ok) {
      notify({ tone: "error", title: "Không lưu được dữ liệu", description: await readApiError(response, "Kiểm tra quyền tài khoản hoặc dữ liệu nhập.") });
      return;
    }
    const saved = await response.json();
    if (entity === "posts" && values.status === "scheduled" && values.scheduledAt && saved?.id) {
      let scheduleResponse: Response;
      try {
        scheduleResponse = await apiFetch(`/api/cms/posts/${saved.id}/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledAt: values.scheduledAt }),
        });
      } catch (error) {
        notify({ tone: "error", title: "Không đặt được lịch đăng", description: describeClientError(error, "Bài đã lưu nhưng API lịch đăng không phản hồi.") });
        return;
      }
      if (!scheduleResponse.ok) {
        notify({ tone: "error", title: "Không đặt được lịch đăng", description: await readApiError(scheduleResponse, "Bài đã lưu nhưng lịch đăng chưa được cập nhật.") });
        return;
      }
    }
    await load(meta.page);
    await loadScheduled();
    if (["posts", "post-categories"].includes(entity)) await loadPostCategories();
    backToList();
    notify({ tone: "success", title: editing ? "Đã cập nhật dữ liệu" : "Đã tạo dữ liệu mới" });
  }

  async function remove(row: CmsItem) {
    const accepted = await confirm({
      tone: "danger",
      title: `Xóa ${entitySingular[entity]}?`,
      description: `Bản ghi "${row.title || row.fullName || `#${row.id}`}" sẽ bị xóa khỏi hệ thống.`,
      confirmLabel: "Xóa",
    });
    if (!accepted) return;
    let response: Response;
    try {
      response = await apiFetch(`/api/cms/${entity}/${row.id}`, { method: "DELETE" });
    } catch (error) {
      notify({ tone: "error", title: "Không xóa được dữ liệu", description: describeClientError(error, "Không kết nối được API.") });
      return;
    }
    if (!response.ok) {
      notify({ tone: "error", title: "Không xóa được dữ liệu", description: await readApiError(response, "Bản ghi có thể đang được sử dụng hoặc tài khoản không đủ quyền.") });
      return;
    }
    await load(meta.page);
    notify({ tone: "success", title: "Đã xóa dữ liệu" });
  }

  async function publishPost(row: CmsItem) {
    const accepted = await confirm({
      title: "Xuất bản bài viết?",
      description: `Bài "${row.title || `#${row.id}`}" sẽ chuyển sang trạng thái đã xuất bản ngay.`,
      confirmLabel: "Xuất bản",
    });
    if (!accepted) return;
    let response: Response;
    try {
      response = await apiFetch(`/api/cms/posts/${row.id}/publish`, { method: "POST" });
    } catch (error) {
      notify({ tone: "error", title: "Không xuất bản được bài viết", description: describeClientError(error, "Không kết nối được API.") });
      return;
    }
    if (!response.ok) {
      notify({ tone: "error", title: "Không xuất bản được bài viết", description: await readApiError(response, "Kiểm tra trạng thái bài viết hoặc quyền tài khoản.") });
      return;
    }
    await load(meta.page);
    await loadScheduled();
    notify({ tone: "success", title: "Đã xuất bản bài viết" });
  }

  async function cancelSchedule(row: CmsItem) {
    const accepted = await confirm({
      tone: "danger",
      title: "Hủy lịch đăng?",
      description: `Bài "${row.title || `#${row.id}`}" sẽ trở về trạng thái nháp.`,
      confirmLabel: "Hủy lịch",
    });
    if (!accepted) return;
    let response: Response;
    try {
      response = await apiFetch(`/api/cms/posts/${row.id}/cancel-schedule`, { method: "POST" });
    } catch (error) {
      notify({ tone: "error", title: "Không hủy được lịch đăng", description: describeClientError(error, "Không kết nối được API.") });
      return;
    }
    if (!response.ok) {
      notify({ tone: "error", title: "Không hủy được lịch đăng", description: await readApiError(response, "Kiểm tra trạng thái bài viết hoặc quyền tài khoản.") });
      return;
    }
    await load(meta.page);
    await loadScheduled();
    notify({ tone: "success", title: "Đã hủy lịch đăng" });
  }

  if (mode === "form") {
    if (entity === "leads" && editing) {
      return <LeadDetailPanel lead={editing} onBack={backToList} onUpdated={async () => load(meta.page)} />;
    }

    return (
      <section className="entity-form-screen">
        <article className="panel entity-form-page">
          <div className="form-page-header">
            <button className="secondary-button back-button" onClick={backToList} type="button"><ArrowLeft size={16} /> Quay lại danh sách</button>
            <div>
              <span>{editing ? "Chỉnh sửa" : "Tạo mới"}</span>
              <h2>{editing ? `Cập nhật ${entitySingular[entity]}` : metaInfo.createLabel || `Thêm ${entitySingular[entity]}`}</h2>
              <p>{editing ? `Đang sửa: ${editing.title || editing.fullName || `#${editing.id}`}` : "Nhập nội dung trên một màn hình rộng để thao tác dễ hơn."}</p>
            </div>
          </div>
          {canWrite ? (
            <form className="cms-form editor-form" onSubmit={form.handleSubmit(submit)}>
              <EntityFields entity={entity} filterOptions={filterOptions} form={form} postCategories={postCategories} projectCategories={projectCategories} onTaxonomyCreated={loadFilterOptions} />
              <div className="form-actions sticky-actions">
                <button className="secondary-button" type="button" onClick={editing ? () => startEdit(editing) : startCreate}>Làm mới</button>
                <button className="primary-button" type="submit">Lưu thay đổi</button>
              </div>
            </form>
          ) : <p className="muted">Tài khoản hiện tại chỉ có quyền xem dữ liệu này.</p>}
        </article>
      </section>
    );
  }

  return (
    <section className="entity-layout list-only">
      <article className="panel entity-list">
        <div className="panel-heading">
          <div><h2>Danh sách</h2><p>{meta.total} bản ghi trong hệ thống.</p></div>
          <div className="heading-actions">
            {entity === "posts" ? (
              <div className="view-switch" aria-label="Chế độ xem bài viết">
                <button className={view === "table" ? "active" : ""} onClick={() => setView("table")} type="button">Danh sách</button>
                <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")} type="button"><CalendarClock size={15} /> Lịch đăng</button>
              </div>
            ) : null}
            {canWrite && entity !== "leads" ? <button className="primary-button" onClick={startCreate} type="button"><Plus size={16} /> {metaInfo.createLabel}</button> : null}
          </div>
        </div>
        <div className="entity-toolbar">
          <div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm..." /></div>
          {["projects", "services", "project-categories", "project-filter-options"].includes(entity) ? (
            <select value={group} onChange={(event) => setGroup(event.target.value)}>
              <option value="">Tất cả nhóm</option>
              <option value="construction">Công trình</option>
              <option value="interior">Nội thất</option>
              <option value="xay_nha_tron_goi">Xây nhà trọn gói</option>
            </select>
          ) : null}
          {entity === "project-filter-options" ? (
            <select value={filterOne} onChange={(event) => setFilterOne(event.target.value)}>
              <option value="">Tất cả loại filter</option>
              <option value="project_type">Loại dự án</option>
              <option value="house_type">Loại nhà</option>
              <option value="interior_style">Phong cách nội thất</option>
              <option value="style">Phong cách</option>
              <option value="scale">Quy mô</option>
              <option value="location">Địa điểm</option>
              <option value="space">Không gian</option>
              <option value="room_type">Loại phòng</option>
              <option value="roof_type">Kiểu mái</option>
              <option value="floors">Số tầng</option>
              <option value="layout_type">Layout</option>
              <option value="material_tone">Tone vật liệu</option>
              <option value="budget_range">Ngân sách</option>
            </select>
          ) : null}
          {entity === "project-filter-options" ? (
            <select value={filterTwo} onChange={(event) => setFilterTwo(event.target.value)}>
              <option value="">Tất cả module</option>
              <option value="project">Dự án</option>
              <option value="architecture_design">Mẫu kiến trúc</option>
              <option value="interior_design">Mẫu nội thất</option>
            </select>
          ) : null}
          {entity === "architecture-designs" ? (
            <>
              <select value={filterOne} onChange={(event) => setFilterOne(event.target.value)}><option value="">Tất cả loại nhà</option><option>Biệt thự</option><option>Nhà phố</option><option>Nhà cấp 4</option><option>Showroom</option></select>
              <select value={filterTwo} onChange={(event) => setFilterTwo(event.target.value)}><option value="">Tất cả phong cách</option><option>Hiện đại</option><option>Tân cổ điển</option><option>Tối giản</option><option>Indochine</option></select>
            </>
          ) : null}
          {entity === "interior-designs" ? (
            <>
              <select value={filterOne} onChange={(event) => setFilterOne(event.target.value)}><option value="">Tất cả phong cách</option><option>Hiện đại</option><option>Tân cổ điển</option><option>Tối giản</option><option>Indochine</option></select>
              <select value={filterTwo} onChange={(event) => setFilterTwo(event.target.value)}><option value="">Tất cả loại phòng</option><option>Phòng khách</option><option>Phòng ngủ</option><option>Bếp</option><option>Trọn gói</option></select>
            </>
          ) : null}
          {entity === "posts" ? (
            <select value={filterOne} onChange={(event) => setFilterOne(event.target.value)}>
              <option value="">Tất cả danh mục</option>
              {postCategories.map((category) => <option key={category.id} value={category.id}>{String(category.name)}</option>)}
            </select>
          ) : null}
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {(entity === "leads" ? ["new", "contacted", "consulting", "won", "lost", "spam"] : entity === "post-categories" ? ["active", "inactive"] : ["draft", "pending_review", "scheduled", "published", "archived"]).map((item) => (
              <option value={item} key={item}>{statusLabels[item] || item}</option>
            ))}
          </select>
          <button className="secondary-button" onClick={() => load(1)} type="button">Lọc</button>
        </div>
        {entity === "posts" && view === "calendar" ? <PostCalendarView canWrite={canWrite} monthDate={calendarDate} onCancelSchedule={cancelSchedule} onEdit={startEdit} onMonthChange={setCalendarDate} onPublish={publishPost} posts={scheduledRows} /> : <DataTable rows={rows} entity={entity} onEdit={startEdit} onDelete={remove} canWrite={canWrite} />}
        <div className="pagination" hidden={entity === "posts" && view === "calendar"}>
          <span>Trang {meta.page}/{meta.totalPages}</span>
          <div><button disabled={meta.page <= 1} onClick={() => load(meta.page - 1)} type="button">Trước</button><button disabled={meta.page >= meta.totalPages} onClick={() => load(meta.page + 1)} type="button">Sau</button></div>
        </div>
      </article>
    </section>
  );
}

function PostAiGenerator({ form }: { form: ReturnType<typeof useForm<Record<string, unknown>>> }) {
  const { notify } = useAdminFeedback();
  const [loading, setLoading] = useState("");
  const title = String(form.watch("title") || "").trim();

  async function handleGenerate(withImage: boolean) {
    if (!title) {
      notify({ tone: "error", title: "Thiếu tiêu đề bài viết", description: "Vui lòng nhập tiêu đề bài viết trước khi sinh nội dung bằng AI." });
      return;
    }

    setLoading(withImage ? "generating-all" : "generating-text");
    try {
      // 1. Sinh bài viết
      notify({ tone: "info", title: "AI đang viết bài", description: "Vui lòng chờ khoảng 15-30 giây để AI tạo cấu trúc và nội dung bài viết..." });
      
      const response = await apiFetch("/api/cms/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: title,
          focusKeyword: title,
          group: "interior",
          tone: "Chuyên gia, sang trọng, tư vấn bán hàng",
          articleType: "Cẩm nang",
          length: "1200 từ",
          createDraft: false,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Không sinh được nội dung bài viết."));
      }

      const payload = await response.json();
      
      form.setValue("contentHtml", payload.contentHtml || "");
      form.setValue("metaTitle", payload.metaTitle || title);
      form.setValue("metaDescription", payload.metaDescription || "");
      form.setValue("focusKeyword", payload.focusKeyword || title);
      form.setValue("excerpt", payload.excerpt || "");
      if (payload.slug) {
        form.setValue("slug", payload.slug);
      }

      let imageGenerated = false;

      // 2. Sinh ảnh đại diện nếu có yêu cầu
      if (withImage) {
        notify({ tone: "info", title: "AI đang sinh ảnh", description: "Đang tạo ảnh minh họa phong cách chuyên nghiệp và lưu vào Media Library..." });
        
        const imagePrompt = getDynamicImagePrompt(title);

        try {
          const imageResponse = await apiFetch("/api/cms/ai/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: imagePrompt,
              topic: title,
              type: "blog",
              size: "1536x1024",
              quality: "medium",
              altText: title,
            }),
          });

          if (!imageResponse.ok) {
            notify({ tone: "warning", title: "Bài viết đã tạo, ảnh chưa tạo được", description: await readApiError(imageResponse, "Kiểm tra OpenAI Image API Key và billing trong trang Cấu hình.") });
          } else {
            const imagePayload = await imageResponse.json();
            const media = imagePayload.media;
            if (media) {
              form.setValue("thumbnailMediaId", media.id);
              form.setValue("thumbnailMedia", media);

              // Chèn ảnh vào đầu bài viết
              const mediaUrl = media.largeUrl || media.webpUrl || media.mediumUrl;
              const imageHtml = `<p><img src="${mediaUrl}" alt="${title}" style="width:100%; max-width:800px; height:auto; border-radius:8px; display:block; margin: 0 auto 20px;" /></p>`;
              form.setValue("contentHtml", imageHtml + (payload.contentHtml || ""));
              imageGenerated = true;
            }
          }
        } catch (imageError) {
          notify({ tone: "warning", title: "Bài viết đã tạo, ảnh chưa tạo được", description: describeClientError(imageError, "Không kết nối được API tạo ảnh.") });
        }
      }

      const successDescription = !withImage
        ? "Đã điền nội dung chi tiết thành công!"
        : imageGenerated
          ? "Đã điền nội dung chi tiết và ảnh đại diện thành công!"
          : "Đã điền nội dung chi tiết thành công. Ảnh đại diện chưa tạo được, bạn có thể thử lại sau.";
      notify({ tone: "success", title: "Hoàn tất sinh bài viết", description: successDescription });
    } catch (error) {
      notify({ tone: "error", title: "AI chưa chạy được", description: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định." });
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="wide ai-post-generator-card" style={{
      gridColumn: "1 / -1",
      background: "var(--admin-cream, #f9f6f0)",
      border: "1px dashed var(--admin-gold, #c5a880)",
      padding: "16px",
      borderRadius: "8px",
      marginTop: "8px",
      marginBottom: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Sparkles style={{ color: "var(--admin-forest-green, #1b4332)" }} size={18} />
        <div>
          <strong style={{ fontSize: "14px", color: "var(--admin-charcoal, #222)" }}>Trợ lý viết bài thông minh (AI Writer)</strong>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--admin-muted, #666)" }}>
            Tự động soạn nội dung chi tiết, tóm tắt, từ khóa và bộ thẻ SEO Meta dựa trên Tiêu đề bài viết.
          </p>
        </div>
      </div>
      
      {!title ? (
        <span style={{ fontSize: "12px", color: "red" }}>⚠️ Vui lòng nhập Tiêu đề bài viết phía trên để mở khóa Trợ lý AI.</span>
      ) : (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
          <button
            type="button"
            className="secondary-button"
            disabled={Boolean(loading)}
            onClick={() => handleGenerate(false)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Sparkles size={14} />
            {loading === "generating-text" ? "Đang viết bài..." : "Sinh bài viết"}
          </button>
          
          <button
            type="button"
            className="primary-button"
            disabled={Boolean(loading)}
            onClick={() => handleGenerate(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ImagePlus size={14} />
            {loading === "generating-all" ? "Đang viết bài & sinh ảnh..." : "Sinh bài viết kèm ảnh"}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ fontSize: "12px", color: "var(--admin-forest-green, #1b4332)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
          <div className="spinner" style={{
            width: "12px",
            height: "12px",
            border: "2px solid var(--admin-forest-green, #1b4332)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          {loading === "generating-all" ? "Hệ thống đang sinh bài viết bằng GPT-5.4-mini & sinh ảnh bằng AI (khoảng 30 giây)..." : "Hệ thống đang sinh bài viết bằng GPT-5.4-mini..."}
        </div>
      )}
    </div>
  );
}

function EntityFields({ entity, filterOptions, form, postCategories, projectCategories, onTaxonomyCreated }: { entity: Entity; filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>>; postCategories: CmsItem[]; projectCategories: CmsItem[]; onTaxonomyCreated?: () => void | Promise<void> }) {
  if (entity === "leads") {
    return (
      <>
        <label>Trạng thái<select {...form.register("status")}><option value="new">Mới</option><option value="contacted">Đã liên hệ</option><option value="consulting">Đang tư vấn</option><option value="won">Đã chốt</option><option value="lost">Không tiềm năng</option><option value="spam">Spam</option></select></label>
        <label>Ghi chú nội bộ<textarea {...form.register("note")} rows={6} /></label>
      </>
    );
  }
  if (entity === "project-categories") {
    return (
      <>
        <section className="form-section">
          <div className="form-section-title"><span>01</span><div><h3>Danh mục dự án</h3><p>Dùng làm tab nhanh trên trang Dự án đã thực hiện.</p></div></div>
          <div className="form-grid">
            <label>Tên danh mục<input {...form.register("name")} placeholder="Biệt thự, nhà phố, căn hộ..." /></label>
            <label>Slug<input {...form.register("slug")} placeholder="Tự tạo nếu bỏ trống" /></label>
            <label>Nhóm<select {...form.register("group")}><option value="construction">Công trình</option><option value="interior">Nội thất</option><option value="xay_nha_tron_goi">Xây nhà trọn gói</option></select></label>
            <label>Thứ tự<input type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} /></label>
            <label className="check-row wide"><input type="checkbox" {...form.register("isActive")} /> Đang hiển thị ngoài website</label>
          </div>
        </section>
      </>
    );
  }
  if (entity === "project-filter-options") {
    return (
      <>
        <section className="form-section">
          <div className="form-section-title"><span>01</span><div><h3>Option bộ lọc</h3><p>Dùng cho dropdown lọc dự án ngoài website.</p></div></div>
          <div className="form-grid">
            <label>Tên option<input {...form.register("name")} placeholder="Hiện đại, quy mô vừa, Hà Nội..." /></label>
            <label>Module<select {...form.register("module")}><option value="project">Dự án đã thực hiện</option><option value="architecture_design">Mẫu thiết kế kiến trúc</option><option value="interior_design">Mẫu thiết kế nội thất</option></select></label>
            <label>Slug<input {...form.register("slug")} placeholder="Tự tạo nếu bỏ trống" /></label>
            <label>Nhóm<select {...form.register("group")}><option value="construction">Công trình</option><option value="interior">Nội thất</option><option value="xay_nha_tron_goi">Xây nhà trọn gói</option></select></label>
            <label>Loại filter<select {...form.register("type")}><option value="project_type">Loại dự án</option><option value="house_type">Loại nhà</option><option value="interior_style">Phong cách nội thất</option><option value="style">Phong cách</option><option value="scale">Quy mô</option><option value="location">Địa điểm</option><option value="space">Không gian</option><option value="room_type">Loại phòng</option><option value="roof_type">Kiểu mái</option><option value="floors">Số tầng</option><option value="layout_type">Layout</option><option value="material_tone">Tone vật liệu</option><option value="budget_range">Ngân sách</option></select></label>
            <label>Thứ tự<input type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} /></label>
            <label className="check-row wide"><input type="checkbox" {...form.register("isActive")} /> Đang hiển thị ngoài website</label>
          </div>
        </section>
      </>
    );
  }
  if (entity === "post-categories") {
    return (
      <section className="form-section">
        <div className="form-section-title"><span>01</span><div><h3>Danh mục bài viết</h3><p>Dùng để phân loại bài SEO, lọc ngoài frontend và chọn khi soạn bài.</p></div></div>
        <div className="form-grid">
          <label>Tên danh mục<input {...form.register("name")} placeholder="Cẩm nang xây dựng, Cảm hứng nội thất..." /></label>
          <label>Slug<input {...form.register("slug")} placeholder="Tự tạo nếu bỏ trống" /></label>
          <label>Thứ tự<input type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} /></label>
          <label className="wide">Mô tả<textarea {...form.register("description")} rows={4} /></label>
          <label className="check-row wide"><input type="checkbox" {...form.register("isActive")} /> Đang hiển thị ngoài website</label>
        </div>
      </section>
    );
  }
  return (
    <>
      <section className="form-section">
        <div className="form-section-title"><span>01</span><div><h3>Thông tin chung</h3><p>Tiêu đề, slug, phân nhóm và mô tả hiển thị trên website.</p></div></div>
        <div className="form-grid">
          <label>Tiêu đề<input {...form.register("title")} placeholder="Nhập tiêu đề hiển thị" /></label>
          <label>Slug<input {...form.register("slug")} placeholder="Tự tạo nếu bỏ trống" /></label>
          {entity === "posts" ? <PostAiGenerator form={form} /> : null}
          {["architecture-designs", "interior-designs"].includes(entity) ? <label>Mã mẫu<input {...form.register("code")} placeholder="BTHDAMB03010, NT-PK-HD-001..." /></label> : null}
          {entity === "architecture-designs" ? <ArchitectureDesignFields filterOptions={filterOptions} form={form} onTaxonomyCreated={onTaxonomyCreated} /> : null}
          {entity === "interior-designs" ? <InteriorDesignFields filterOptions={filterOptions} form={form} onTaxonomyCreated={onTaxonomyCreated} /> : null}
          {["projects", "services"].includes(entity) ? (
            <label>
              Nhóm nội dung
              <select {...form.register("group")}>
                <option value="construction">Công trình</option>
                <option value="interior">Nội thất</option>
                <option value="xay_nha_tron_goi">Xây nhà trọn gói</option>
              </select>
            </label>
          ) : null}
          {entity === "projects" ? <ProjectFields filterOptions={filterOptions} form={form} projectCategories={projectCategories} onTaxonomyCreated={onTaxonomyCreated} /> : null}
          {entity === "posts" ? <label>Danh mục bài viết<select {...form.register("categoryId", { valueAsNumber: true })}><option value="">Chọn danh mục</option>{postCategories.map((category) => <option key={category.id} value={category.id}>{String(category.name)}</option>)}</select></label> : null}
          {entity === "posts" ? <label className="wide">Tóm tắt bài viết<textarea {...form.register("excerpt")} rows={3} /></label> : null}
          {entity !== "posts" ? <label className="wide">Mô tả ngắn<textarea {...form.register("description")} rows={4} /></label> : null}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-title"><span>02</span><div><h3>Ảnh & SEO</h3><p>Ảnh đại diện, metadata và dữ liệu Open Graph cho Google/social.</p></div></div>
        <div className="form-grid">
          <ThumbnailPickerField form={form} />
          {["projects", "services", "architecture-designs", "interior-designs"].includes(entity) ? <GalleryPickerField form={form} /> : null}
          <label>Meta title<input {...form.register("metaTitle")} placeholder="Tối đa khoảng 60 ký tự" /></label>
          <label>Canonical URL<input {...form.register("canonicalUrl")} placeholder="https://domain.com/duong-dan-chuan" /></label>
          <label className="wide">Meta description<textarea {...form.register("metaDescription")} rows={3} placeholder="Tối đa khoảng 155 ký tự" /></label>
          <label>OG title<input {...form.register("ogTitle")} placeholder="Tiêu đề khi chia sẻ mạng xã hội" /></label>
          {entity === "posts" ? <label>Từ khóa chính<input {...form.register("focusKeyword")} placeholder="Từ khóa SEO chính" /></label> : null}
          <label className="wide">OG description<textarea {...form.register("ogDescription")} rows={3} /></label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-title"><span>03</span><div><h3>Nội dung chi tiết</h3><p>Soạn nội dung bằng editor, chèn ảnh trực tiếp từ Media Library.</p></div></div>
        <div className="form-field"><RichTextField value={String(form.watch("contentHtml") || "")} onChange={(value) => form.setValue("contentHtml", value)} /></div>
      </section>

      <section className="form-section publish-section">
        <div className="form-section-title"><span>04</span><div><h3>Xuất bản</h3><p>Trạng thái, lịch đăng, thứ tự hiển thị và lựa chọn nổi bật.</p></div></div>
        <div className="form-grid">
          <label>Trạng thái<select {...form.register("status")}><option value="draft">Nháp</option><option value="pending_review">Chờ duyệt</option><option value="scheduled">Đặt lịch</option><option value="published">Đã xuất bản</option><option value="archived">Lưu trữ</option></select></label>
          {entity === "posts" ? <label>Lịch đăng<input type="datetime-local" {...form.register("scheduledAt")} /></label> : null}
          {entity === "posts" ? <label>Ngày xuất bản<input type="datetime-local" {...form.register("publishedAt")} /></label> : null}
          {["projects", "services", "pages"].includes(entity) ? <label>Thứ tự hiển thị<input type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} /></label> : null}
          {["projects", "services", "posts"].includes(entity) ? (
            <div className="check-row-container wide">
              <label className="check-row" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" {...form.register("isFeatured")} />
                <span>Hiển thị nổi bật trên website</span>
              </label>
              <p className="editor-hint" style={{ marginTop: "6px", padding: 0, color: "var(--admin-muted)", fontSize: "12px", lineHeight: "1.4" }}>
                💡 <strong>Lưu ý:</strong> Trang chủ hiển thị tối đa <strong>6 bài nổi bật</strong>. Nếu tích chọn nhiều hơn, hệ thống sẽ ưu tiên hiển thị các bài có <strong>Thứ tự hiển thị</strong> nhỏ nhất (ưu tiên hàng đầu) và ngày xuất bản mới nhất.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

function ProjectFields({ filterOptions, form, projectCategories, onTaxonomyCreated }: { filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>>; projectCategories: CmsItem[]; onTaxonomyCreated?: () => void | Promise<void> }) {
  const group = String(form.watch("group") || "construction");
  const categoryId = form.watch("categoryId");

  // Reset category if it doesn't belong to the selected group
  useEffect(() => {
    if (categoryId) {
      const selectedCat = projectCategories.find((c) => c.id === Number(categoryId));
      if (selectedCat && selectedCat.group !== group) {
        form.setValue("categoryId", null);
      }
    }
  }, [group, categoryId, projectCategories, form]);

  const categories = projectCategories.filter((c) => c.group === group);

  return (
    <>
      <label>
        Danh mục dự án
        <select {...form.register("categoryId", { valueAsNumber: true })}>
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {String(category.name)}
            </option>
          ))}
        </select>
      </label>
      <label>Danh mục fallback<input {...form.register("category")} placeholder="Biệt thự, căn hộ, showroom..." /></label>
      <TaxonomySelect form={form} name="projectType" label="Loại dự án" module="project" group={group} type="project_type" options={filterOptions} onCreated={onTaxonomyCreated} />
      <TaxonomySelect form={form} name="style" label="Phong cách" module="project" group={group} type="style" options={filterOptions} onCreated={onTaxonomyCreated} />
      <TaxonomySelect form={form} name="location" label="Địa điểm" module="project" group={group} type="location" options={filterOptions} onCreated={onTaxonomyCreated} />
      <label>Diện tích hiển thị<input {...form.register("area")} placeholder="225m2, 1.200m2..." /></label>
      <label>Diện tích số m2<input type="number" min={0} {...form.register("areaValue", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="scale" label="Quy mô" module="project" group={group} type="scale" options={filterOptions} onCreated={onTaxonomyCreated} />
      <label>Chủ đầu tư / khách hàng<input {...form.register("clientName")} placeholder="Gia đình tư nhân, doanh nghiệp..." /></label>
      <TaxonomySelect form={form} name="budgetRange" label="Khoảng ngân sách" module="project" group={group} type="budget_range" options={filterOptions} onCreated={onTaxonomyCreated} />
    </>
  );
}

function ArchitectureDesignFields({ filterOptions, form, onTaxonomyCreated }: { filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>>; onTaxonomyCreated?: () => void | Promise<void> }) {
  return (
    <>
      <TaxonomySelect form={form} name="houseType" label="Loại nhà" module="architecture_design" group="construction" type="house_type" options={filterOptions} onCreated={onTaxonomyCreated} />
      <TaxonomySelect form={form} name="style" label="Phong cách" module="architecture_design" group="construction" type="style" options={filterOptions} onCreated={onTaxonomyCreated} />
      <label>Diện tích m2<input type="number" min={0} {...form.register("area", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="floors" label="Số tầng" module="architecture_design" group="construction" type="floors" options={filterOptions} numeric onCreated={onTaxonomyCreated} />
      <label>Mặt tiền m<input type="number" min={0} step="0.1" {...form.register("facadeWidth", { valueAsNumber: true })} /></label>
      <label>Chiều sâu m<input type="number" min={0} step="0.1" {...form.register("depth", { valueAsNumber: true })} /></label>
      <label>Phòng ngủ<input type="number" min={0} {...form.register("bedrooms", { valueAsNumber: true })} /></label>
      <label>WC<input type="number" min={0} {...form.register("bathrooms", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="roofType" label="Kiểu mái" module="architecture_design" group="construction" type="roof_type" options={filterOptions} onCreated={onTaxonomyCreated} />
      <label>Ngân sách dự kiến triệu VND<input type="number" min={0} {...form.register("estimatedBudget", { valueAsNumber: true })} /></label>
      <label>Thời gian<input {...form.register("constructionTime")} placeholder="4 - 6 tháng" /></label>
      <TaxonomySelect form={form} name="location" label="Vị trí" module="architecture_design" group="construction" type="location" options={filterOptions} onCreated={onTaxonomyCreated} />
    </>
  );
}

function InteriorDesignFields({ filterOptions, form, onTaxonomyCreated }: { filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>>; onTaxonomyCreated?: () => void | Promise<void> }) {
  return (
    <>
      <TaxonomySelect form={form} name="interiorStyle" label="Phong cách nội thất" module="interior_design" group="interior" type="interior_style" options={filterOptions} onCreated={onTaxonomyCreated} />
      <TaxonomySelect form={form} name="houseType" label="Loại nhà" module="interior_design" group="interior" type="house_type" options={filterOptions} onCreated={onTaxonomyCreated} />
      <TaxonomySelect form={form} name="roomType" label="Loại phòng" module="interior_design" group="interior" type="room_type" options={filterOptions} onCreated={onTaxonomyCreated} />
      <label>Diện tích m2<input type="number" min={0} {...form.register("area", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="layoutType" label="Layout" module="interior_design" group="interior" type="layout_type" options={filterOptions} onCreated={onTaxonomyCreated} />
      <TaxonomySelect form={form} name="materialTone" label="Tone vật liệu" module="interior_design" group="interior" type="material_tone" options={filterOptions} onCreated={onTaxonomyCreated} />
      <TaxonomySelect form={form} name="budgetRange" label="Khoảng ngân sách" module="interior_design" group="interior" type="budget_range" options={filterOptions} onCreated={onTaxonomyCreated} />
      <label>Ngân sách từ triệu VND<input type="number" min={0} {...form.register("budgetMin", { valueAsNumber: true })} /></label>
      <label>Ngân sách đến triệu VND<input type="number" min={0} {...form.register("budgetMax", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="location" label="Vị trí" module="interior_design" group="interior" type="location" options={filterOptions} onCreated={onTaxonomyCreated} />
    </>
  );
}

function TaxonomySelect({
  form,
  group,
  label,
  module,
  name,
  numeric,
  options,
  type,
  onCreated,
}: {
  form: ReturnType<typeof useForm<Record<string, unknown>>>;
  group: string;
  label: string;
  module: string;
  name: string;
  numeric?: boolean;
  options: CmsItem[];
  type: string;
  onCreated?: () => void | Promise<void>;
}) {
  const { notify } = useAdminFeedback();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const items = options.filter((item) => String(item.module || "project") === module && String(item.group) === group && String(item.type) === type && item.isActive !== false);

  async function createOption() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const existing = items.find((item) => String(item.name).trim().toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      form.setValue(name, numeric ? Number(existing.name) : existing.name);
      setNewName("");
      setCreating(false);
      notify({ tone: "success", title: `Đã tự động chọn ${label.toLowerCase()} có sẵn: ${existing.name}` });
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch("/api/cms/project-filter-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, group, type, name: trimmed, isActive: true }),
      });
      if (!response.ok) {
        notify({ tone: "error", title: `Không tạo được ${label.toLowerCase()}`, description: await readApiError(response, "Kiểm tra quyền hoặc trùng tên.") });
        return;
      }
      await onCreated?.();
      form.setValue(name, numeric ? Number(trimmed) : trimmed);
      setNewName("");
      setCreating(false);
      notify({ tone: "success", title: `Đã tạo ${label.toLowerCase()}: ${trimmed}` });
    } catch (error) {
      notify({ tone: "error", title: `Không tạo được ${label.toLowerCase()}`, description: describeClientError(error, "Không kết nối được API.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <label>
      {label}
      {creating ? (
        <div className="taxonomy-create-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createOption(); } if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
            placeholder={`Nhập ${label.toLowerCase()} mới`}
            autoFocus
          />
          <button type="button" className="secondary-button" onClick={createOption} disabled={saving || !newName.trim()}>{saving ? "..." : "Lưu"}</button>
          <button type="button" className="secondary-button ghost" onClick={() => { setCreating(false); setNewName(""); }}>Hủy</button>
        </div>
      ) : (
        <div className="taxonomy-select-row">
          <select {...form.register(name, numeric ? { valueAsNumber: true } : undefined)}>
            <option value="">Chọn {label.toLowerCase()}</option>
            {items.map((item) => <option key={item.id} value={String(item.name)}>{String(item.name)}</option>)}
          </select>
          <button type="button" className="secondary-button" onClick={() => setCreating(true)} title={`Tạo ${label.toLowerCase()} mới`}>+ Tạo mới</button>
        </div>
      )}
    </label>
  );
}

function LeadDetailPanel({ lead, onBack, onUpdated }: { lead: CmsItem; onBack: () => void; onUpdated: () => Promise<void> }) {
  const { notify } = useAdminFeedback();
  const [status, setStatus] = useState(String(lead.status || "new"));
  const [note, setNote] = useState(String(lead.note || ""));
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  async function loadNotes() {
    try {
      const response = await apiFetch(`/api/cms/leads/${lead.id}/notes`);
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được ghi chú lead."));
      const payload: LeadNote[] = await response.json();
      setNotes(payload);
    } catch (error) {
      notify({ tone: "error", title: "Không tải được ghi chú lead", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    }
  }

  useEffect(() => {
    setStatus(String(lead.status || "new"));
    setNote(String(lead.note || ""));
    loadNotes();
  }, [lead.id]);

  async function saveLead() {
    setSaving(true);
    let response: Response;
    try {
      response = await apiFetch(`/api/cms/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
    } catch (error) {
      setSaving(false);
      notify({ tone: "error", title: "Không cập nhật được lead", description: describeClientError(error, "Không kết nối được API.") });
      return;
    }
    setSaving(false);
    if (!response.ok) {
      notify({ tone: "error", title: "Không cập nhật được lead", description: await readApiError(response, "Kiểm tra quyền tài khoản hoặc dữ liệu nhập.") });
      return;
    }
    await onUpdated();
    notify({ tone: "success", title: "Đã cập nhật lead" });
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = newNote.trim();
    if (!content) {
      notify({ tone: "error", title: "Ghi chú đang trống", description: "Nhập nội dung tư vấn trước khi lưu." });
      return;
    }
    setAddingNote(true);
    let response: Response;
    try {
      response = await apiFetch(`/api/cms/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: content }),
      });
    } catch (error) {
      setAddingNote(false);
      notify({ tone: "error", title: "Không lưu được ghi chú", description: describeClientError(error, "Không kết nối được API.") });
      return;
    }
    setAddingNote(false);
    if (!response.ok) {
      notify({ tone: "error", title: "Không lưu được ghi chú", description: await readApiError(response, "Kiểm tra quyền tài khoản hoặc nội dung ghi chú.") });
      return;
    }
    setNewNote("");
    await loadNotes();
    notify({ tone: "success", title: "Đã thêm ghi chú tư vấn" });
  }

  return (
    <section className="entity-form-screen">
      <article className="panel entity-form-page">
        <div className="form-page-header lead-header">
          <button className="secondary-button back-button" onClick={onBack} type="button"><ArrowLeft size={16} /> Quay lại danh sách</button>
          <div>
            <span>Lead tư vấn</span>
            <h2>{lead.fullName || `Lead #${lead.id}`}</h2>
            <p>{lead.phone || "Chưa có số điện thoại"}{lead.email ? ` - ${lead.email}` : ""}</p>
          </div>
          <div className="lead-header-actions">
            <a className="secondary-button" href={lead.phone ? `tel:${lead.phone}` : undefined}><PhoneCall size={16} /> Gọi ngay</a>
            {lead.email ? <a className="secondary-button" href={`mailto:${lead.email}`}><ExternalLink size={16} /> Email</a> : null}
          </div>
        </div>

        <div className="lead-detail-layout">
          <section className="lead-main">
            <div className="form-section">
              <div className="form-section-title"><span>01</span><div><h3>Thông tin khách hàng</h3><p>Nhu cầu và nguồn lead để sales nắm bối cảnh trước khi tư vấn.</p></div></div>
              <div className="lead-info-grid">
                <InfoItem label="Họ tên" value={lead.fullName} />
                <InfoItem label="Điện thoại" value={lead.phone} />
                <InfoItem label="Email" value={lead.email} />
                <InfoItem label="Nhu cầu" value={lead.demandType} />
                <InfoItem label="Loại dự án" value={lead.projectType} />
                <InfoItem label="Diện tích" value={lead.area} />
                <InfoItem label="Ngân sách" value={lead.budget} />
                <InfoItem label="Khu vực" value={lead.location} />
                <InfoItem label="Nguồn" value={lead.sourceUrl || lead.sourceType} wide />
                <InfoItem label="Ngày tạo" value={formatDateTime(lead.createdAt)} />
              </div>
              <div className="lead-message">
                <span>Nội dung khách để lại</span>
                <p>{lead.message || "Khách chưa để lại nội dung chi tiết."}</p>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title"><span>02</span><div><h3>Timeline tư vấn</h3><p>Ghi lại lịch sử trao đổi để các sale theo dõi liên tục.</p></div></div>
              <form className="lead-note-form" onSubmit={addNote}>
                <textarea value={newNote} onChange={(event) => setNewNote(event.target.value)} rows={4} placeholder="Nhập ghi chú cuộc gọi, nhu cầu, báo giá, lịch hẹn..." />
                <div className="form-actions"><button className="primary-button" disabled={addingNote} type="submit">{addingNote ? "Đang lưu..." : "Thêm ghi chú"}</button></div>
              </form>
              <div className="lead-timeline">
                {notes.map((item) => (
                  <article className="lead-note" key={item.id}>
                    <span />
                    <div>
                      <strong>{item.user?.fullName || item.user?.email || "Nhân sự"}</strong>
                      <time>{formatDateTime(item.createdAt)}</time>
                      <p>{item.note}</p>
                    </div>
                  </article>
                ))}
                {notes.length === 0 ? <div className="empty-state">Chưa có ghi chú tư vấn nào cho lead này.</div> : null}
              </div>
            </div>
          </section>

          <aside className="lead-side">
            <div className="panel lead-status-card">
              <h3>Cập nhật xử lý</h3>
              <label>Trạng thái<select value={status} onChange={(event) => setStatus(event.target.value)}>{["new", "contacted", "consulting", "won", "lost", "spam"].map((item) => <option value={item} key={item}>{statusLabels[item]}</option>)}</select></label>
              <label>Ghi chú tổng<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={7} placeholder="Ghi chú ngắn hiển thị ở danh sách lead" /></label>
              <button className="primary-button" disabled={saving} onClick={saveLead} type="button">{saving ? "Đang lưu..." : "Lưu trạng thái"}</button>
            </div>
          </aside>
        </div>
      </article>
    </section>
  );
}

function InfoItem({ label, value, wide }: { label: string; value: unknown; wide?: boolean }) {
  return <div className={`lead-info-item ${wide ? "wide" : ""}`}><span>{label}</span><strong>{String(value || "Chưa cập nhật")}</strong></div>;
}

function formatDateTime(value: unknown) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function ThumbnailPickerField({ form }: { form: ReturnType<typeof useForm<Record<string, unknown>>> }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selected = form.watch("thumbnailMedia") as CmsItem | null | undefined;
  const selectedUrl = selected ? String(selected.mediumUrl || selected.largeUrl || selected.webpUrl || selected.thumbUrl || "") : "";

  function selectMedia(media: CmsItem) {
    form.setValue("thumbnailMediaId", media.id);
    form.setValue("thumbnailMedia", media);
    setPickerOpen(false);
  }

  function clearMedia() {
    form.setValue("thumbnailMediaId", null);
    form.setValue("thumbnailMedia", null);
  }

  return (
    <div className="form-field thumbnail-field">
      <span>Ảnh đại diện</span>
      <div className="thumbnail-picker">
        {selectedUrl ? (
          <img alt={String(selected?.altText || selected?.originalName || "Ảnh đại diện")} src={selectedUrl} />
        ) : (
          <div className="thumbnail-empty"><ImagePlus size={22} /><strong>Chưa chọn ảnh</strong><small>Chọn ảnh từ Media Library để dùng làm thumbnail ngoài website.</small></div>
        )}
        <div>
          <button className="secondary-button" onClick={() => setPickerOpen(true)} type="button"><ImagePlus size={16} /> Chọn ảnh từ thư viện</button>
          {selectedUrl ? <button className="secondary-button danger" onClick={clearMedia} type="button">Bỏ chọn</button> : null}
          {selected ? <p>{String(selected.originalName || selected.fileName || "")}</p> : null}
        </div>
      </div>
      {pickerOpen ? <MediaPickerModal onClose={() => setPickerOpen(false)} onSelect={selectMedia} /> : null}
    </div>
  );
}

function GalleryPickerField({ form }: { form: ReturnType<typeof useForm<Record<string, unknown>>> }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mediaMap, setMediaMap] = useState<Record<number, CmsItem>>({});
  const [loading, setLoading] = useState(false);
  const gallery = (form.watch("galleryMediaIds") as number[] | undefined) || [];
  const galleryKey = gallery.join(",");

  useEffect(() => {
    const missing = gallery.filter((id) => !mediaMap[id]);
    if (!missing.length) return;
    setLoading(true);
    apiFetch(`/api/cms/media?ids=${missing.join(",")}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const next: Record<number, CmsItem> = { ...mediaMap };
        for (const item of (payload?.data || []) as CmsItem[]) {
          next[Number(item.id)] = item;
        }
        setMediaMap(next);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryKey]);

  function addMedia(media: CmsItem) {
    const next = Array.from(new Set([...gallery, media.id]));
    form.setValue("galleryMediaIds", next);
    setMediaMap((prev) => ({ ...prev, [media.id]: media }));
    setPickerOpen(false);
  }

  function removeMedia(id: number) {
    form.setValue("galleryMediaIds", gallery.filter((item) => item !== id));
  }

  function move(id: number, direction: -1 | 1) {
    const idx = gallery.indexOf(id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= gallery.length) return;
    const next = [...gallery];
    [next[idx], next[target]] = [next[target], next[idx]];
    form.setValue("galleryMediaIds", next);
  }

  return (
    <div className="form-field thumbnail-field">
      <span>Gallery ảnh {gallery.length ? `(${gallery.length})` : ""}</span>
      <div className="gallery-picker">
        {gallery.length ? (
          <div className="gallery-thumb-grid">
            {gallery.map((id, idx) => {
              const media = mediaMap[id];
              const url = media ? String(media.thumbUrl || media.mediumUrl || media.webpUrl || "") : "";
              const name = media ? String(media.altText || media.originalName || `Ảnh #${id}`) : `Ảnh #${id}`;
              return (
                <div className="gallery-thumb-item" key={id}>
                  {url ? <img alt={name} src={url} /> : <div className="gallery-thumb-placeholder">{loading ? "..." : `#${id}`}</div>}
                  <div className="gallery-thumb-meta">
                    <span title={name}>{idx + 1}. {name.slice(0, 28)}{name.length > 28 ? "…" : ""}</span>
                    <div className="gallery-thumb-actions">
                      <button onClick={() => move(id, -1)} disabled={idx === 0} type="button" title="Lên">↑</button>
                      <button onClick={() => move(id, 1)} disabled={idx === gallery.length - 1} type="button" title="Xuống">↓</button>
                      <button onClick={() => removeMedia(id)} type="button" title="Xoá khỏi gallery">×</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="thumbnail-empty"><ImagePlus size={22} /><strong>Chưa chọn gallery</strong><small>Chọn nhiều ảnh từ Media Library để hiển thị trong trang chi tiết.</small></div>
        )}
        <div><button className="secondary-button" onClick={() => setPickerOpen(true)} type="button"><ImagePlus size={16} /> Thêm ảnh gallery</button></div>
      </div>
      {pickerOpen ? <MediaPickerModal onClose={() => setPickerOpen(false)} onSelect={addMedia} /> : null}
    </div>
  );
}

export function RichTextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [source, setSource] = useState(value || "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      ImageFigure,
      TableKit.configure({ table: { resizable: true } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Soạn nội dung chi tiết..." }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setSource(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (mode === "html") return;
    setSource(value || "");
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor, mode]);

  if (!editor) return <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={9} />;

  function addLink() {
    const url = window.prompt("Nhập URL liên kết");
    if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertPreset(type: "callout" | "cta" | "faq" | "twoColumns") {
    const snippets = {
      callout: `<blockquote><p><strong>Ghi chú chuyên gia:</strong> Nhập nội dung nhấn mạnh, lưu ý kỹ thuật hoặc thông tin quan trọng tại đây.</p></blockquote>`,
      cta: `<h3>Nhận tư vấn từ Hà Thành Home</h3><p>Đội ngũ chuyên gia sẽ hỗ trợ phương án phù hợp với nhu cầu và ngân sách.</p><p><a href="/lien-he">Liên hệ tư vấn</a></p>`,
      faq: `<h3>Câu hỏi thường gặp</h3><p><strong>Câu hỏi:</strong> Nhập câu hỏi tại đây.</p><p><strong>Trả lời:</strong> Nhập câu trả lời chi tiết tại đây.</p>`,
      twoColumns: `<h3>Bố cục so sánh</h3><ul><li><strong>Ý chính 1:</strong> Nhập nội dung...</li><li><strong>Ý chính 2:</strong> Nhập nội dung...</li></ul>`,
    };
    editor?.chain().focus().insertContent(snippets[type]).run();
  }

  function insertImage(media: CmsItem) {
    const src = String(media.webpUrl || media.largeUrl || media.mediumUrl || media.thumbUrl || "");
    if (!src) return;
    const suggestedAlt = String(media.altText || "").trim();
    const alt = suggestedAlt || window.prompt("Nhập mô tả ảnh (alt) - bắt buộc", String(media.originalName || ""))?.trim();
    if (!alt) {
      window.alert("Cần nhập mô tả ảnh (alt) trước khi chèn.");
      return;
    }
    const savedCaption = String(media.caption || "").trim();
    const caption = savedCaption || window.prompt("Chú thích dưới ảnh (không bắt buộc)", "")?.trim() || "";
    editor?.chain().focus().insertContent({ type: "imageFigure", attrs: { src, alt, caption } }).run();
    setPickerOpen(false);
  }

  function switchMode(nextMode: "visual" | "html") {
    if (nextMode === "visual" && editor) editor.commands.setContent(source || "", { emitUpdate: false });
    if (nextMode === "html" && editor) setSource(editor.getHTML());
    setMode(nextMode);
  }

  const previewHtml = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:24px;color:#29352f;font:16px/1.75 system-ui,sans-serif}img{max-width:100%;height:auto;border-radius:12px}figure{margin:24px 0;text-align:center}figcaption{margin-top:8px;color:#66756e;font-size:14px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #d8ddd9;padding:9px;text-align:left}blockquote{border-left:4px solid #c99a4a;margin:18px 0;padding:10px 16px;background:#faf7ef}pre{overflow:auto;padding:14px;color:white;background:#183b2d}</style></head><body>${source}</body></html>`;

  return (
    <div className="editor-shell">
      <div className="editor-modebar">
        <div>
          <button className={mode === "visual" ? "active" : ""} onClick={() => switchMode("visual")} type="button">Soạn thảo</button>
          <button className={mode === "html" ? "active" : ""} onClick={() => switchMode("html")} type="button"><Code2 size={15} /> HTML</button>
        </div>
        <button className={previewOpen ? "active" : ""} onClick={() => setPreviewOpen((current) => !current)} type="button">Xem trước</button>
      </div>
      {mode === "visual" ? <>
      <div className="editor-toolbar">
        <button className={editor.isActive("paragraph") ? "active" : ""} onClick={() => editor.chain().focus().setParagraph().run()} type="button"><Pilcrow size={15} /> P</button>
        <button className={editor.isActive("heading", { level: 1 }) ? "active" : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} type="button"><Heading1 size={15} /> H1</button>
        <button className={editor.isActive("bold") ? "active" : ""} onClick={() => editor.chain().focus().toggleBold().run()} type="button"><Bold size={15} /> B</button>
        <button className={editor.isActive("italic") ? "active" : ""} onClick={() => editor.chain().focus().toggleItalic().run()} type="button"><Italic size={15} /> I</button>
        <button className={editor.isActive("underline") ? "active" : ""} onClick={() => editor.chain().focus().toggleUnderline().run()} type="button">U</button>
        <button className={editor.isActive("strike") ? "active" : ""} onClick={() => editor.chain().focus().toggleStrike().run()} type="button"><Strikethrough size={15} /> S</button>
        <button className={editor.isActive("heading", { level: 2 }) ? "active" : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} type="button"><Heading2 size={15} /> H2</button>
        <button className={editor.isActive("heading", { level: 3 }) ? "active" : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} type="button"><Heading3 size={15} /> H3</button>
        <button className={editor.isActive("heading", { level: 4 }) ? "active" : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} type="button"><Heading4 size={15} /> H4</button>
        <button className={editor.isActive("bulletList") ? "active" : ""} onClick={() => editor.chain().focus().toggleBulletList().run()} type="button"><List size={15} /> List</button>
        <button className={editor.isActive("orderedList") ? "active" : ""} onClick={() => editor.chain().focus().toggleOrderedList().run()} type="button"><ListOrdered size={15} /> 1.2</button>
        <button className={editor.isActive("blockquote") ? "active" : ""} onClick={() => editor.chain().focus().toggleBlockquote().run()} type="button"><Quote size={15} /> Quote</button>
        <button className={editor.isActive("codeBlock") ? "active" : ""} onClick={() => editor.chain().focus().toggleCodeBlock().run()} type="button"><Code2 size={15} /> Code</button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} type="button"><Minus size={15} /> HR</button>
        <button onClick={addLink} type="button"><LinkIcon size={15} /> Link</button>
        <button onClick={() => setPickerOpen(true)} type="button"><ImagePlus size={15} /> Ảnh</button>
        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} type="button"><Table2 size={15} /> Bảng</button>
        <button disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().addRowAfter().run()} type="button">+ hàng</button>
        <button disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().deleteRow().run()} type="button">− hàng</button>
        <button disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().addColumnAfter().run()} type="button">+ cột</button>
        <button disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().deleteColumn().run()} type="button">− cột</button>
        <button disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().mergeCells().run()} type="button">Gộp ô</button>
        <button disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().splitCell().run()} type="button">Tách ô</button>
        <button disabled={!editor.isActive("table")} onClick={() => editor.chain().focus().deleteTable().run()} type="button">Xóa bảng</button>
        {(["left", "center", "right", "justify"] as const).map((alignment) => <button className={editor.isActive({ textAlign: alignment }) ? "active" : ""} key={alignment} onClick={() => editor.chain().focus().setTextAlign(alignment).run()} type="button">{alignment === "left" ? "Trái" : alignment === "center" ? "Giữa" : alignment === "right" ? "Phải" : "Đều"}</button>)}
        <button onClick={() => insertPreset("callout")} type="button"><BadgeCheck size={15} /> Callout</button>
        <button onClick={() => insertPreset("cta")} type="button"><Sparkles size={15} /> CTA</button>
        <button onClick={() => insertPreset("faq")} type="button"><Table2 size={15} /> FAQ</button>
        <button onClick={() => insertPreset("twoColumns")} type="button">2 cột</button>
        <button disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} type="button"><Undo2 size={15} /> Undo</button>
        <button disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} type="button"><Redo2 size={15} /> Redo</button>
      </div>
      <EditorContent editor={editor} />
      </> : <textarea className="editor-html-source" spellCheck={false} value={source} onChange={(event) => { setSource(event.target.value); onChange(event.target.value); }} rows={18} />}
      {previewOpen ? (
        <div className="editor-preview-shell">
          <div className="editor-preview-toolbar">
            <strong>Xem trước an toàn</strong>
            <div><button className={previewDevice === "desktop" ? "active" : ""} onClick={() => setPreviewDevice("desktop")} type="button">Desktop</button><button className={previewDevice === "mobile" ? "active" : ""} onClick={() => setPreviewDevice("mobile")} type="button">Mobile</button></div>
          </div>
          <iframe className={`editor-preview-frame ${previewDevice}`} sandbox="" srcDoc={previewHtml} title="Xem trước nội dung" />
        </div>
      ) : null}
      <p className="editor-hint">Chèn ảnh trực tiếp từ Media Library, có thể upload nhanh ngay trong popup chọn ảnh.</p>
      {pickerOpen ? <MediaPickerModal onClose={() => setPickerOpen(false)} onSelect={insertImage} /> : null}
    </div>
  );
}

function MediaPickerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (media: CmsItem) => void }) {
  const { notify } = useAdminFeedback();
  const [rows, setRows] = useState<CmsItem[]>([]);
  const [selected, setSelected] = useState<CmsItem | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 48;

  async function load(pageNum = 1, append = false, preferredId?: number, requestedSort = sort) {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: String(pageSize), sort: requestedSort });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      const response = await apiFetch(`/api/cms/media?${params}`);
      if (response.status === 401) {
        window.location.href = adminUrl("/login");
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được thư viện ảnh."));
      const payload: ListResponse<CmsItem> = await response.json();
      const incoming = payload.data || [];
      setRows((prev) => append ? [...prev, ...incoming] : incoming);
      setPage(pageNum);
      const totalPages = payload?.meta?.totalPages ?? 1;
      setHasMore(pageNum < totalPages);
      if (!append) {
        setSelected((current) => preferredId ? incoming.find((item) => item.id === preferredId) || incoming[0] || null : current && incoming.some((item) => item.id === current.id) ? incoming.find((item) => item.id === current.id) || null : incoming[0] || null);
      }
    } catch (error) {
      notify({ tone: "error", title: "Không tải được thư viện ảnh", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  }

  useEffect(() => {
    load(1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    function onScroll() {
      if (!el || loading || loadingMore || !hasMore) return;
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (remaining < 200) load(page + 1, true);
    }
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [page, hasMore, loading, loadingMore]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let failed = 0;
    let newestUploadId: number | undefined;
    for (const file of Array.from(files)) {
      try {
        const metadata = askUploadMetadata(file);
        if (!metadata) {
          failed += 1;
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type || "general");
        formData.append("altText", metadata.altText);
        if (metadata.caption) formData.append("caption", metadata.caption);
        const response = await apiFetch("/api/cms/media/upload", { method: "POST", body: formData });
        if (!response.ok) {
          failed += 1;
          notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${await readApiError(response, "File không hợp lệ hoặc vượt quá dung lượng.")}` });
        } else {
          const payload = await response.json();
          newestUploadId = Number(payload.media?.id) || newestUploadId;
        }
      } catch (error) {
        failed += 1;
        notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${describeClientError(error, "Không kết nối được API upload.")}` });
      }
    }
    setUploading(false);
    setSort("newest");
    await load(1, false, newestUploadId, "newest");
    if (failed < files.length) notify({ tone: "success", title: "Upload hoàn tất", description: failed ? `Đã upload ${files.length - failed}/${files.length} ảnh.` : "Bạn có thể chọn ảnh vừa upload trong thư viện." });
  }

  const selectedUrl = selected ? String(selected.webpUrl || selected.largeUrl || selected.mediumUrl || selected.thumbUrl || "") : "";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="media-picker-modal" aria-modal="true" role="dialog" aria-labelledby="media-picker-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="media-picker-header">
          <div>
            <span>Media Library</span>
            <h2 id="media-picker-title">Chọn ảnh để chèn vào nội dung</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Đóng thư viện ảnh"><X size={18} /></button>
        </header>

        <div className="media-picker-toolbar">
          <div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") load(1, false); }} placeholder="Tìm tên file, alt, caption..." /></div>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Tất cả loại ảnh</option>
            {["project", "construction", "interior", "blog", "banner", "service", "general"].map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option></select>
          <button className="secondary-button" onClick={() => load(1, false)} type="button">Lọc</button>
          <label className="primary-button upload-control">{uploading ? "Đang upload..." : "Upload ảnh"}<input accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => upload(event.target.files)} type="file" /></label>
        </div>

        <div className="media-picker-body">
          <div className="media-picker-grid" ref={gridRef}>
            {loading ? <div className="empty-state">Đang tải thư viện ảnh...</div> : null}
            {!loading && rows.map((media) => (
              <button className={`media-tile ${selected?.id === media.id ? "active" : ""}`} key={media.id} onClick={() => setSelected(media)} onDoubleClick={() => onSelect(media)} type="button">
                <img alt={String(media.altText || media.originalName || "Media")} loading="lazy" src={String(media.thumbUrl || media.mediumUrl || media.webpUrl)} />
                <span>{String(media.originalName || media.fileName)}</span>
              </button>
            ))}
            {!loading && rows.length === 0 ? <div className="empty-state">Chưa có ảnh phù hợp. Upload ảnh mới hoặc đổi bộ lọc.</div> : null}
            {loadingMore ? <div className="media-loading-more">Đang tải thêm...</div> : null}
            {!hasMore && !loading && rows.length > 0 ? <div className="media-loading-more muted">Đã hiển thị toàn bộ {rows.length} ảnh</div> : null}
          </div>

          <aside className="media-picker-preview">
            <h3>Ảnh đang chọn</h3>
            {selected ? (
              <>
                <img alt={String(selected.altText || selected.originalName || "Media")} src={selectedUrl} />
                <dl>
                  <div><dt>Tên file</dt><dd>{String(selected.originalName || selected.fileName)}</dd></div>
                  <div><dt>Loại</dt><dd>{String(selected.type || "general")}</dd></div>
                  <div><dt>URL</dt><dd>{selectedUrl}</dd></div>
                </dl>
              </>
            ) : <p className="muted">Chọn một ảnh trong thư viện để xem trước.</p>}
          </aside>
        </div>

        <footer className="media-picker-footer">
          <button className="secondary-button" onClick={onClose} type="button">Hủy</button>
          <button className="primary-button" disabled={!selected || !selectedUrl} onClick={() => selected ? onSelect(selected) : undefined} type="button"><Check size={16} /> Sử dụng ảnh này</button>
        </footer>
      </section>
    </div>
  );
}

function DataTable({ rows, entity, onEdit, onDelete, canWrite }: { rows: CmsItem[]; entity: Entity; onEdit: (row: CmsItem) => void; onDelete: (row: CmsItem) => void; canWrite: boolean }) {
  const helper = createColumnHelper<CmsItem>();
  const columns = useMemo(
    () => [
      helper.accessor((row) => row.title || row.name || row.fullName || `#${row.id}`, { id: "title", header: entity === "leads" ? "Khách hàng" : ["project-categories", "project-filter-options", "post-categories"].includes(entity) ? "Tên" : "Tiêu đề" }),
      helper.accessor((row) => entity === "leads" ? row.phone || "-" : entity === "posts" ? row.categoryRef?.name || "Chưa chọn" : entity === "pages" ? row.slug || "-" : entity === "post-categories" ? row.slug || "-" : entity === "project-filter-options" ? `${row.module || "project"} / ${row.type || "-"}` : entity === "architecture-designs" ? row.houseType || row.style || "-" : entity === "interior-designs" ? row.interiorStyle || row.roomType || "-" : row.group === "construction" ? "Công trình" : row.group === "interior" ? "Nội thất" : row.group === "xay_nha_tron_goi" ? "Xây nhà trọn gói" : "-", { id: "group", header: entity === "leads" ? "Điện thoại" : entity === "posts" ? "Danh mục" : entity === "pages" ? "Đường dẫn (Slug)" : entity === "post-categories" ? "Slug" : entity === "project-filter-options" ? "Module / Loại filter" : "Nhóm" }),
      helper.accessor((row) => entity === "post-categories" ? row.isActive === false ? "inactive" : "active" : row.status || "-", { id: "status", header: "Trạng thái", cell: (info) => <span className={`status-badge status-${info.getValue()}`}>{statusLabels[String(info.getValue())] || String(info.getValue())}</span> }),
      helper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const publicUrl = getPublicEntityUrl(entity, row.original);
          return (
            <div className="row-actions">
              {publicUrl ? <a className="row-view-link" href={publicUrl} target="_blank" rel="noreferrer" title={row.original.status === "published" ? "Xem ngoài website" : "Mở frontend theo slug. Nội dung chưa xuất bản có thể chưa hiển thị public."}><ExternalLink size={13} /> Xem</a> : null}
              <button onClick={() => onEdit(row.original)} type="button">{canWrite ? "Sửa" : "Chi tiết"}</button>
              {canWrite && entity !== "leads" ? <button className="danger-action" onClick={() => onDelete(row.original)} type="button">Xóa</button> : null}
            </div>
          );
        },
      }),
    ],
    [entity, canWrite],
  );
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  return <table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}{rows.length === 0 ? <tr><td colSpan={4}><div className="empty-state">Không có dữ liệu phù hợp.</div></td></tr> : null}</tbody></table>;
}

function PostCalendarView({
  canWrite,
  monthDate,
  onCancelSchedule,
  onEdit,
  onMonthChange,
  onPublish,
  posts,
}: {
  canWrite: boolean;
  monthDate: Date;
  onCancelSchedule: (row: CmsItem) => void;
  onEdit: (row: CmsItem) => void;
  onMonthChange: (date: Date) => void;
  onPublish: (row: CmsItem) => void;
  posts: CmsItem[];
}) {
  const days = calendarDays(monthDate);
  const currentMonth = monthDate.getMonth();
  const byDay = new Map<string, CmsItem[]>();
  for (const post of posts) {
    if (!post.scheduledAt) continue;
    const key = dateKey(new Date(String(post.scheduledAt)));
    byDay.set(key, [...(byDay.get(key) || []), post]);
  }
  const monthLabel = monthDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <section className="post-calendar">
      <header className="calendar-header">
        <div>
          <span>Lịch đăng bài SEO</span>
          <h3>{monthLabel}</h3>
          <p>{posts.length} bài đang đặt lịch trong tháng này.</p>
        </div>
        <div className="calendar-nav">
          <button className="secondary-button" onClick={() => onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))} type="button">Tháng trước</button>
          <button className="secondary-button" onClick={() => onMonthChange(new Date())} type="button">Hôm nay</button>
          <button className="secondary-button" onClick={() => onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))} type="button">Tháng sau</button>
        </div>
      </header>
      <div className="calendar-weekdays">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const items = byDay.get(dateKey(day)) || [];
          return (
            <article className={`calendar-cell ${day.getMonth() !== currentMonth ? "outside" : ""}`} key={day.toISOString()}>
              <strong>{day.getDate()}</strong>
              <div className="calendar-items">
                {items.map((post) => (
                  <div className="calendar-post" key={post.id}>
                    <button onClick={() => onEdit(post)} type="button">{String(post.title || `#${post.id}`)}</button>
                    <span>{formatCalendarTime(post.scheduledAt)}</span>
                    <div>
                      {getPublicEntityUrl("posts", post) ? <a href={getPublicEntityUrl("posts", post) || "#"} target="_blank" rel="noreferrer"><ExternalLink size={12} /> Xem</a> : null}
                      {canWrite ? (
                        <>
                        <button onClick={() => onPublish(post)} type="button">Đăng</button>
                        <button onClick={() => onCancelSchedule(post)} type="button">Hủy</button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SimpleTable({ rows, columns, emptyText }: { rows: CmsItem[]; columns: string[]; emptyText: string }) {
  if (rows.length === 0) return <div className="empty-state">{emptyText}</div>;
  return <table className="data-table compact"><tbody>{rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column}>{column === "status" ? statusLabels[String(row[column])] || String(row[column] || "-") : String(row[column] || "-")}</td>)}</tr>)}</tbody></table>;
}

function defaultValues(entity: Entity) {
  if (entity === "leads") return { status: "new", note: "" };
  return {
    title: "",
    name: "",
    slug: "",
    module: "project",
    group: "construction",
    type: "project_type",
    status: "draft",
    location: "",
    category: "",
    categoryId: null,
    projectType: "",
    excerpt: "",
    focusKeyword: "",
    description: "",
    contentHtml: "",
    thumbnailMediaId: null,
    thumbnailMedia: null,
    galleryMediaIds: [],
    areaValue: null,
    scale: "",
    clientName: "",
    code: "",
    houseType: "",
    interiorStyle: "",
    roomType: "",
    layoutType: "",
    materialTone: "",
    roofType: "",
    floors: null,
    facadeWidth: null,
    depth: null,
    bedrooms: null,
    bathrooms: null,
    estimatedBudget: null,
    constructionTime: "",
    budgetRange: "",
    budgetMin: null,
    budgetMax: null,
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    scheduledAt: "",
    publishedAt: "",
    sortOrder: 0,
    isFeatured: false,
    isActive: true,
  };
}

function normalizePayload(entity: Entity, values: Record<string, unknown>) {
  const payload = { ...values };
  delete payload.thumbnailMedia;
  if (payload.thumbnailMediaId === "") payload.thumbnailMediaId = null;
  ["categoryId", "area", "areaValue", "floors", "facadeWidth", "depth", "bedrooms", "bathrooms", "estimatedBudget", "budgetMin", "budgetMax", "sortOrder"].forEach((key) => {
    if (Number.isNaN(payload[key]) || payload[key] === "") payload[key] = null;
  });
  if (entity === "leads") return { status: payload.status, note: payload.note };
  if (entity === "pages") {
    delete payload.group;
    delete payload.location;
    delete payload.category;
    delete payload.excerpt;
    delete payload.focusKeyword;
    delete payload.scheduledAt;
    delete payload.publishedAt;
    delete payload.isFeatured;
  }
  if (entity === "posts") {
    delete payload.group;
    delete payload.location;
    delete payload.category;
    delete payload.description;
    delete payload.sortOrder;
  }
  if (entity === "architecture-designs") {
    delete payload.group;
    delete payload.category;
    delete payload.excerpt;
    delete payload.focusKeyword;
    delete payload.scheduledAt;
    delete payload.publishedAt;
    delete payload.interiorStyle;
    delete payload.roomType;
    delete payload.layoutType;
    delete payload.materialTone;
    delete payload.budgetRange;
    delete payload.budgetMin;
    delete payload.budgetMax;
  }
  if (entity === "interior-designs") {
    delete payload.group;
    delete payload.category;
    delete payload.excerpt;
    delete payload.focusKeyword;
    delete payload.scheduledAt;
    delete payload.publishedAt;
    delete payload.style;
    delete payload.floors;
    delete payload.facadeWidth;
    delete payload.depth;
    delete payload.bedrooms;
    delete payload.bathrooms;
    delete payload.roofType;
    delete payload.estimatedBudget;
    delete payload.constructionTime;
  }
  if (entity === "projects") {
    delete payload.excerpt;
    delete payload.focusKeyword;
    delete payload.scheduledAt;
    delete payload.publishedAt;
  }
  if (entity === "services") {
    delete payload.category;
    delete payload.categoryId;
    delete payload.projectType;
    delete payload.area;
    delete payload.areaValue;
    delete payload.scale;
    delete payload.clientName;
    delete payload.excerpt;
    delete payload.focusKeyword;
    delete payload.scheduledAt;
    delete payload.publishedAt;
    delete payload.code;
    delete payload.houseType;
    delete payload.style;
    delete payload.interiorStyle;
    delete payload.roomType;
    delete payload.layoutType;
    delete payload.materialTone;
    delete payload.roofType;
    delete payload.floors;
    delete payload.facadeWidth;
    delete payload.depth;
    delete payload.bedrooms;
    delete payload.bathrooms;
    delete payload.estimatedBudget;
    delete payload.constructionTime;
    delete payload.budgetRange;
    delete payload.budgetMin;
    delete payload.budgetMax;
  }
  return payload;
}

function toDateTimeLocal(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function calendarRange(month: Date) {
  const from = new Date(month.getFullYear(), month.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - firstWeekday);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCalendarTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function can(userRoles: string[], allowedRoles: string[]) {
  return userRoles.includes("Super Admin") || allowedRoles.some((role) => userRoles.includes(role));
}

function canWriteEntity(entity: Entity, roles: string[]) {
  if (roles.includes("Super Admin")) return true;
  if (["projects", "services", "project-categories", "project-filter-options", "architecture-designs", "interior-designs", "menus"].includes(entity)) return roles.includes("Admin");
  if (entity === "estimator") return roles.includes("Admin");
  if (["posts", "post-categories", "pages"].includes(entity)) return roles.includes("Admin") || roles.includes("SEO Editor");
  if (entity === "leads") return roles.includes("Admin") || roles.includes("Sales");
  return false;
}

function getDynamicImagePrompt(title: string, group?: string): string {
  const lowercaseTitle = title.toLowerCase();
  
  let subject = "";
  if (lowercaseTitle.includes("nhà xưởng") || lowercaseTitle.includes("nha xuong") || lowercaseTitle.includes("nhà kho") || lowercaseTitle.includes("nha kho")) {
    subject = "Ảnh chụp thực tế công trình nhà xưởng công nghiệp hiện đại, nhà thép tiền chế, kết cấu vững chắc, phối cảnh ngoại thất góc rộng, ánh sáng ban ngày rõ nét";
  } else if (lowercaseTitle.includes("văn phòng") || lowercaseTitle.includes("van phong") || lowercaseTitle.includes("office") || lowercaseTitle.includes("phong lam viec") || lowercaseTitle.includes("phòng làm việc")) {
    subject = "Ảnh chụp phối cảnh thực tế thiết kế nội thất văn phòng làm việc hiện đại, không gian làm việc chuyên nghiệp, co-working space cao cấp, ánh sáng tự nhiên";
  } else if (
    lowercaseTitle.includes("nội thất") || lowercaseTitle.includes("noi that") || 
    lowercaseTitle.includes("phòng khách") || lowercaseTitle.includes("phong khach") || 
    lowercaseTitle.includes("phòng ngủ") || lowercaseTitle.includes("phong ngu") || 
    lowercaseTitle.includes("phòng bếp") || lowercaseTitle.includes("phong bep") || 
    lowercaseTitle.includes("nhà bếp") || lowercaseTitle.includes("nha bep") || 
    lowercaseTitle.includes("chung cư") || lowercaseTitle.includes("chung cu") || 
    lowercaseTitle.includes("căn hộ") || lowercaseTitle.includes("can ho") ||
    group === "interior"
  ) {
    subject = "Ảnh chụp phối cảnh nội thất căn hộ biệt thự hiện đại, phòng khách hoặc phòng ngủ sang trọng, tinh tế, sử dụng vật liệu gỗ đá tự nhiên cao cấp, ánh sáng dịu nhẹ ấm cúng";
  } else {
    // construction, xay_nha_tron_goi, or default exterior
    subject = "Ảnh chụp thực tế phối cảnh ngoại thất mặt tiền (facade architecture) của biệt thự hiện đại hoặc nhà lô phố sang trọng, thiết kế cao cấp, ánh sáng ban ngày tự nhiên đẹp";
  }

  return `${subject}, phong cách premium brand Hà Thành Home, ảnh chụp sắc nét, chân thực, góc nhìn chuyên nghiệp, không chữ, không hình vẽ watermark cho chủ đề: ${title}`;
}


