"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
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
  Copy,
  ExternalLink,
  FileText,
  FolderKanban,
  GripVertical,
  Heading2,
  Image,
  ImagePlus,
  Italic,
  LayoutDashboard,
  LinkIcon,
  List,
  LogOut,
  Menu as MenuIcon,
  Newspaper,
  PenTool,
  PhoneCall,
  Plus,
  Search,
  Settings,
  Sofa,
  Sparkles,
  UploadCloud,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

const _BP = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? "";
const apiFetch = (url: string, init?: RequestInit) => fetch(`${_BP}${url}`, init);

type User = { email: string; roles: string[] };
type Entity = "dashboard" | "projects" | "project-categories" | "project-filter-options" | "architecture-designs" | "interior-designs" | "services" | "posts" | "leads" | "media" | "ai" | "menus" | "estimator" | "settings";
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
  name: z.string().optional(),
  module: z.string().optional(),
  type: z.string().optional(),
  group: z.enum(["construction", "interior"]).optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.any().optional(),
  projectType: z.string().optional(),
  area: z.any().optional(),
  areaValue: z.any().optional(),
  scale: z.string().optional(),
  clientName: z.string().optional(),
  excerpt: z.string().optional(),
  focusKeyword: z.string().optional(),
  description: z.string().optional(),
  contentHtml: z.string().optional(),
  slug: z.string().optional(),
  scheduledAt: z.string().optional(),
  code: z.string().optional(),
  houseType: z.string().optional(),
  interiorStyle: z.string().optional(),
  roomType: z.string().optional(),
  layoutType: z.string().optional(),
  materialTone: z.string().optional(),
  roofType: z.string().optional(),
  floors: z.any().optional(),
  facadeWidth: z.any().optional(),
  depth: z.any().optional(),
  bedrooms: z.any().optional(),
  bathrooms: z.any().optional(),
  estimatedBudget: z.any().optional(),
  constructionTime: z.string().optional(),
  budgetRange: z.string().optional(),
  budgetMin: z.any().optional(),
  budgetMax: z.any().optional(),
  galleryMediaIds: z.array(z.number()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  thumbnailMediaId: z.number().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  note: z.string().optional(),
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
      { id: "services", label: "Dịch vụ", description: "Dịch vụ công trình và nội thất", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "Viewer"] },
      { id: "estimator", label: "Dự toán công trình", description: "Cấu hình công thức và lượt tính", icon: Calculator, roles: ["Super Admin", "Admin", "Sales", "Viewer"] },
    ],
  },
  {
    group: "Nội dung",
    items: [
      { id: "posts", label: "Bài viết SEO", description: "Draft, scheduled, published", icon: Newspaper, roles: ["Super Admin", "Admin", "SEO Editor", "Viewer"] },
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
      { id: "settings", label: "Cấu hình", description: "Thông tin website", icon: Settings, roles: ["Super Admin", "Admin"] },
    ],
  },
] satisfies Array<{ group: string; items: Array<{ id: string; label: string; description: string; icon: LucideIcon; roles: string[] }> }>;

const moduleMeta: Record<Entity, { title: string; subtitle: string; createLabel?: string }> = {
  dashboard: { title: "Tổng quan vận hành", subtitle: "Theo dõi dữ liệu thật từ CMS, lead và lịch đăng bài." },
  projects: { title: "Quản lý dự án", subtitle: "Tách rõ khối Công Trình và khối Nội Thất.", createLabel: "Thêm dự án" },
  "project-categories": { title: "Danh mục dự án", subtitle: "Quản lý tab danh mục trên trang Dự án đã thực hiện.", createLabel: "Thêm danh mục" },
  "project-filter-options": { title: "Bộ lọc dự án", subtitle: "Quản lý option dropdown lọc dự án ngoài website.", createLabel: "Thêm option lọc" },
  "architecture-designs": { title: "Mẫu thiết kế kiến trúc", subtitle: "Catalog mẫu biệt thự, nhà phố, nhà cấp 4 với bộ lọc chi tiết.", createLabel: "Thêm mẫu kiến trúc" },
  "interior-designs": { title: "Mẫu thiết kế nội thất", subtitle: "Catalog phong cách nội thất, loại phòng, diện tích và ngân sách.", createLabel: "Thêm mẫu nội thất" },
  services: { title: "Quản lý dịch vụ", subtitle: "Dịch vụ công trình, nội thất và nội dung SEO.", createLabel: "Thêm dịch vụ" },
  posts: { title: "Bài viết SEO", subtitle: "Soạn bài, lưu nháp, đặt lịch và xuất bản.", createLabel: "Thêm bài viết" },
  leads: { title: "Lead tư vấn", subtitle: "Theo dõi nguồn lead, trạng thái xử lý và ghi chú nội bộ." },
  media: { title: "Media Library", subtitle: "Upload, chuyển WebP, tạo thumbnail và tái sử dụng ảnh." },
  ai: { title: "AI Content Studio", subtitle: "Tạo outline, meta SEO và bài viết draft bằng AI theo cấu hình hệ thống." },
  menus: { title: "Quản lý Menu", subtitle: "Kéo thả menu header/footer tối đa 3 cấp, chọn link gợi ý hoặc tự nhập URL." },
  estimator: { title: "Dự toán công trình", subtitle: "Cấu hình input, công thức tính chi phí và xem lượt dự toán từ website." },
  settings: { title: "Cấu hình website", subtitle: "Quản lý hotline, email, địa chỉ, social và thông tin thương hiệu." },
};

const entitySingular: Record<Entity, string> = {
  dashboard: "dashboard",
  projects: "dự án",
  "project-categories": "danh mục dự án",
  "project-filter-options": "option lọc dự án",
  "architecture-designs": "mẫu kiến trúc",
  "interior-designs": "mẫu nội thất",
  services: "dịch vụ",
  posts: "bài viết",
  leads: "lead",
  media: "media",
  ai: "AI content",
  menus: "menu",
  estimator: "dự toán công trình",
  settings: "cấu hình",
};

const statusLabels: Record<string, string> = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  scheduled: "Đặt lịch",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
  new: "Mới",
  contacted: "Đã liên hệ",
  consulting: "Đang tư vấn",
  won: "Đã chốt",
  lost: "Không tiềm năng",
  spam: "Spam",
};

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; tone: ToastTone; title: string; description?: string };
type ConfirmOptions = { title: string; description?: string; confirmLabel?: string; cancelLabel?: string; tone?: "danger" | "default" };
type FeedbackContextValue = {
  notify: (toast: Omit<ToastItem, "id">) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function AdminApp({ user }: { user: User }) {
  const [active, setActive] = useState<Entity>("dashboard");
  const visibleGroups = (repairVietnamese(modules) as typeof modules)
    .map((group) => ({ ...group, items: group.items.filter((item) => can(user.roles, item.roles)) }))
    .filter((group) => group.items.length > 0);
  const meta = repairVietnamese(moduleMeta[active]) as typeof moduleMeta[Entity];

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
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
              {group.items.map((item) => (
                <button className={`admin-nav-item ${active === item.id ? "active" : ""}`} key={item.id} onClick={() => setActive(item.id as Entity)} type="button">
                  <span className="nav-icon"><item.icon size={18} /></span>
                  <span><strong>{T(item.label)}</strong><small>{T(item.description)}</small></span>
                  <ChevronRight className="nav-chevron" size={15} />
                </button>
              ))}
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
            <span className="breadcrumb">Admin / {meta.title}</span>
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
            <span>{toast.tone === "success" ? <CheckCircle2 size={18} /> : toast.tone === "error" ? <AlertTriangle size={18} /> : <BadgeCheck size={18} />}</span>
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

function useAdminFeedback() {
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
  const [uploading, setUploading] = useState(false);
  const canUpload = roles.includes("Super Admin") || roles.includes("Admin") || roles.includes("SEO Editor");

  async function load() {
    try {
      const params = new URLSearchParams({ page: "1", limit: "60" });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      const response = await apiFetch(`/api/cms/media?${params}`);
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được Media Library."));
      const payload: ListResponse<CmsItem> = await response.json();
      setRows(payload.data || []);
      setSelected((current) => current || payload.data?.[0] || null);
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
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type || "general");
        formData.append("altText", file.name.replace(/\.[^.]+$/, ""));
        const response = await apiFetch("/api/cms/media/upload", { method: "POST", body: formData });
        if (!response.ok) {
          failed += 1;
          notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${await readApiError(response, "File không hợp lệ hoặc vượt quá dung lượng.")}` });
        }
      } catch (error) {
        failed += 1;
        notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${describeClientError(error, "Không kết nối được API upload.")}` });
      }
    }
    setUploading(false);
    await load();
    if (failed < files.length) notify({ tone: "success", title: "Upload hoàn tất", description: failed ? `Đã upload ${files.length - failed}/${files.length} ảnh.` : "Thư viện ảnh đã được cập nhật." });
  }

  async function copyUrl(url?: string) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    notify({ tone: "success", title: "Đã copy URL ảnh" });
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
          <button className="secondary-button" onClick={load} type="button">Lọc</button>
          {canUpload ? <label className="primary-button upload-control">{uploading ? "Đang upload..." : "Upload ảnh"}<input accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => upload(event.target.files)} type="file" /></label> : null}
        </div>
        <div className="media-grid">
          {rows.map((media) => (
            <button className={`media-tile ${selected?.id === media.id ? "active" : ""}`} key={media.id} onClick={() => setSelected(media)} type="button">
              <img alt={String(media.altText || media.originalName || "Media")} src={String(media.thumbUrl || media.webpUrl)} />
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
              <div><dt>Loại</dt><dd>{String(selected.type || "general")}</dd></div>
              <div><dt>URL WebP</dt><dd>{String(selected.webpUrl)}</dd></div>
            </dl>
            <button className="primary-button" onClick={() => copyUrl(selected.webpUrl)} type="button">Copy URL WebP</button>
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
        notify({ tone: "error", title: "AI chưa chạy được", description: await readApiError(response, "Kiểm tra OPENAI_API_KEY và model trong .env.") });
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
        notify({ tone: "error", title: "Chưa tạo được ảnh", description: await readApiError(response, "Kiểm tra OPENAI_API_KEY và OPENAI_IMAGE_MODEL trong .env.") });
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

  return (
    <section className="ai-layout">
      <article className="panel ai-studio-card">
        <div className="panel-heading">
          <div><h2>Tạo nội dung SEO</h2><p>AI chỉ tạo draft, không tự xuất bản. Model và API key lấy từ cấu hình môi trường.</p></div>
        </div>
        <div className="cms-form two-columns">
          <label className="wide">Chủ đề<input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} /></label>
          <label>Từ khóa chính<input value={form.focusKeyword} onChange={(event) => setForm({ ...form, focusKeyword: event.target.value })} /></label>
          <label>Từ khóa phụ<input value={form.secondaryKeywords} onChange={(event) => setForm({ ...form, secondaryKeywords: event.target.value })} /></label>
          <label>Nhóm nội dung<select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })}><option value="construction">Công trình</option><option value="interior">Nội thất</option></select></label>
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

function ImageUrlPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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
      hotline: values.hotline,
      email: values.email,
      address: values.address,
      facebook: values.facebook,
      zalo: values.zalo,
      workingHours: values.workingHours,
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
          <label>Hotline<input value={values.hotline} onChange={(event) => setValues({ ...values, hotline: event.target.value })} placeholder="0966 123 456" /></label>
          <label>Email<input value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} placeholder="info@hathanhhome.vn" /></label>
          <label className="wide">Địa chỉ<textarea value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} rows={3} placeholder="Số 123 Nguyễn Trãi, Hà Nội" /></label>
          <label>Facebook<input value={values.facebook} onChange={(event) => setValues({ ...values, facebook: event.target.value })} placeholder="https://facebook.com/..." /></label>
          <label>Zalo<input value={values.zalo} onChange={(event) => setValues({ ...values, zalo: event.target.value })} placeholder="https://zalo.me/..." /></label>
          <label className="wide">Giờ làm việc<input value={values.workingHours} onChange={(event) => setValues({ ...values, workingHours: event.target.value })} placeholder="08:00 - 18:00, Thứ 2 - Thứ 7" /></label>

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

          <div className="form-actions wide">
            <button className="primary-button" disabled={!canSave || saving} type="submit">{saving ? "Đang lưu..." : "Lưu cấu hình"}</button>
          </div>
        </form>
      </article>
      <aside className="panel settings-preview">
        <span className="admin-brand-mark"><Building2 size={28} strokeWidth={1.6} /></span>
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
        <span className="admin-brand-mark"><Building2 size={28} strokeWidth={1.6} /></span>
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
      if (filterOne && entity === "project-filter-options") params.set("type", filterOne);
      if (filterTwo && entity === "project-filter-options") params.set("module", filterTwo);
      if (filterOne && entity === "architecture-designs") params.set("houseType", filterOne);
      if (filterTwo && entity === "architecture-designs") params.set("style", filterTwo);
      if (filterOne && entity === "interior-designs") params.set("interiorStyle", filterOne);
      if (filterTwo && entity === "interior-designs") params.set("roomType", filterTwo);
      if (status) params.set("status", status);
      const response = await apiFetch(`/api/cms/${entity}?${params}`);
      if (response.status === 401) {
        window.location.href = "/login";
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

  async function loadFilterOptions() {
    try {
      const response = await apiFetch("/api/cms/project-filter-options?limit=500");
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
    form.reset({ ...defaultValues(entity), ...row, scheduledAt: toDateTimeLocal(row.scheduledAt), isFeatured: Boolean(row.isFeatured) });
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
      response = await fetch(editing ? `/api/cms/${entity}/${editing.id}` : `/api/cms/${entity}`, {
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
              <EntityFields entity={entity} filterOptions={filterOptions} form={form} projectCategories={projectCategories} />
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
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {(entity === "leads" ? ["new", "contacted", "consulting", "won", "lost", "spam"] : ["draft", "pending_review", "scheduled", "published", "archived"]).map((item) => (
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

function EntityFields({ entity, filterOptions, form, projectCategories }: { entity: Entity; filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>>; projectCategories: CmsItem[] }) {
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
            <label>Nhóm<select {...form.register("group")}><option value="construction">Công trình</option><option value="interior">Nội thất</option></select></label>
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
            <label>Nhóm<select {...form.register("group")}><option value="construction">Công trình</option><option value="interior">Nội thất</option></select></label>
            <label>Loại filter<select {...form.register("type")}><option value="project_type">Loại dự án</option><option value="house_type">Loại nhà</option><option value="interior_style">Phong cách nội thất</option><option value="style">Phong cách</option><option value="scale">Quy mô</option><option value="location">Địa điểm</option><option value="space">Không gian</option><option value="room_type">Loại phòng</option><option value="roof_type">Kiểu mái</option><option value="floors">Số tầng</option><option value="layout_type">Layout</option><option value="material_tone">Tone vật liệu</option><option value="budget_range">Ngân sách</option></select></label>
            <label>Thứ tự<input type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} /></label>
            <label className="check-row wide"><input type="checkbox" {...form.register("isActive")} /> Đang hiển thị ngoài website</label>
          </div>
        </section>
      </>
    );
  }
  return (
    <>
      <section className="form-section">
        <div className="form-section-title"><span>01</span><div><h3>Thông tin chung</h3><p>Tiêu đề, slug, phân nhóm và mô tả hiển thị trên website.</p></div></div>
        <div className="form-grid">
          <label>Tiêu đề<input {...form.register("title")} placeholder="Nhập tiêu đề hiển thị" /></label>
          <label>Slug<input {...form.register("slug")} placeholder="Tự tạo nếu bỏ trống" /></label>
          {["architecture-designs", "interior-designs"].includes(entity) ? <label>Mã mẫu<input {...form.register("code")} placeholder="BTHDAMB03010, NT-PK-HD-001..." /></label> : null}
          {entity === "architecture-designs" ? <ArchitectureDesignFields filterOptions={filterOptions} form={form} /> : null}
          {entity === "interior-designs" ? <InteriorDesignFields filterOptions={filterOptions} form={form} /> : null}
          {["projects", "services"].includes(entity) ? <label>Nhóm nội dung<select {...form.register("group")}><option value="construction">Công trình</option><option value="interior">Nội thất</option></select></label> : null}
          {entity === "projects" ? <ProjectFields filterOptions={filterOptions} form={form} projectCategories={projectCategories} /> : null}
          {entity === "posts" ? <label className="wide">Tóm tắt bài viết<textarea {...form.register("excerpt")} rows={3} /></label> : null}
          {entity !== "posts" ? <label className="wide">Mô tả ngắn<textarea {...form.register("description")} rows={4} /></label> : null}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-title"><span>02</span><div><h3>Ảnh & SEO</h3><p>Ảnh đại diện, metadata và dữ liệu Open Graph cho Google/social.</p></div></div>
        <div className="form-grid">
          <ThumbnailPickerField form={form} />
          {["projects", "architecture-designs", "interior-designs"].includes(entity) ? <GalleryPickerField form={form} /> : null}
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
          {["projects", "services"].includes(entity) ? <label>Thứ tự hiển thị<input type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} /></label> : null}
          <label className="check-row wide"><input type="checkbox" {...form.register("isFeatured")} /> Hiển thị nổi bật trên website</label>
        </div>
      </section>
    </>
  );
}

function ProjectFields({ filterOptions, form, projectCategories }: { filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>>; projectCategories: CmsItem[] }) {
  const group = String(form.watch("group") || "construction");
  const categories = projectCategories.filter((category) => String(category.group) === group);
  return (
    <>
      <label>Danh mục dự án<select {...form.register("categoryId", { valueAsNumber: true })}><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{String(category.name)}</option>)}</select></label>
      <label>Danh mục fallback<input {...form.register("category")} placeholder="Biệt thự, căn hộ, showroom..." /></label>
      <TaxonomySelect form={form} name="projectType" label="Loại dự án" module="project" group={group} type="project_type" options={filterOptions} />
      <TaxonomySelect form={form} name="style" label="Phong cách" module="project" group={group} type="style" options={filterOptions} />
      <TaxonomySelect form={form} name="location" label="Địa điểm" module="project" group={group} type="location" options={filterOptions} />
      <label>Diện tích hiển thị<input {...form.register("area")} placeholder="225m2, 1.200m2..." /></label>
      <label>Diện tích số m2<input type="number" min={0} {...form.register("areaValue", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="scale" label="Quy mô" module="project" group={group} type="scale" options={filterOptions} />
      <label>Chủ đầu tư / khách hàng<input {...form.register("clientName")} placeholder="Gia đình tư nhân, doanh nghiệp..." /></label>
      <TaxonomySelect form={form} name="budgetRange" label="Khoảng ngân sách" module="project" group={group} type="budget_range" options={filterOptions} />
    </>
  );
}

function ArchitectureDesignFields({ filterOptions, form }: { filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>> }) {
  return (
    <>
      <TaxonomySelect form={form} name="houseType" label="Loại nhà" module="architecture_design" group="construction" type="house_type" options={filterOptions} />
      <TaxonomySelect form={form} name="style" label="Phong cách" module="architecture_design" group="construction" type="style" options={filterOptions} />
      <label>Diện tích m2<input type="number" min={0} {...form.register("area", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="floors" label="Số tầng" module="architecture_design" group="construction" type="floors" options={filterOptions} numeric />
      <label>Mặt tiền m<input type="number" min={0} step="0.1" {...form.register("facadeWidth", { valueAsNumber: true })} /></label>
      <label>Chiều sâu m<input type="number" min={0} step="0.1" {...form.register("depth", { valueAsNumber: true })} /></label>
      <label>Phòng ngủ<input type="number" min={0} {...form.register("bedrooms", { valueAsNumber: true })} /></label>
      <label>WC<input type="number" min={0} {...form.register("bathrooms", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="roofType" label="Kiểu mái" module="architecture_design" group="construction" type="roof_type" options={filterOptions} />
      <label>Ngân sách dự kiến triệu VND<input type="number" min={0} {...form.register("estimatedBudget", { valueAsNumber: true })} /></label>
      <label>Thời gian<input {...form.register("constructionTime")} placeholder="4 - 6 tháng" /></label>
      <TaxonomySelect form={form} name="location" label="Vị trí" module="architecture_design" group="construction" type="location" options={filterOptions} />
    </>
  );
}

function InteriorDesignFields({ filterOptions, form }: { filterOptions: CmsItem[]; form: ReturnType<typeof useForm<Record<string, unknown>>> }) {
  return (
    <>
      <TaxonomySelect form={form} name="interiorStyle" label="Phong cách nội thất" module="interior_design" group="interior" type="interior_style" options={filterOptions} />
      <TaxonomySelect form={form} name="houseType" label="Loại nhà" module="interior_design" group="interior" type="house_type" options={filterOptions} />
      <TaxonomySelect form={form} name="roomType" label="Loại phòng" module="interior_design" group="interior" type="room_type" options={filterOptions} />
      <label>Diện tích m2<input type="number" min={0} {...form.register("area", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="layoutType" label="Layout" module="interior_design" group="interior" type="layout_type" options={filterOptions} />
      <TaxonomySelect form={form} name="materialTone" label="Tone vật liệu" module="interior_design" group="interior" type="material_tone" options={filterOptions} />
      <TaxonomySelect form={form} name="budgetRange" label="Khoảng ngân sách" module="interior_design" group="interior" type="budget_range" options={filterOptions} />
      <label>Ngân sách từ triệu VND<input type="number" min={0} {...form.register("budgetMin", { valueAsNumber: true })} /></label>
      <label>Ngân sách đến triệu VND<input type="number" min={0} {...form.register("budgetMax", { valueAsNumber: true })} /></label>
      <TaxonomySelect form={form} name="location" label="Vị trí" module="interior_design" group="interior" type="location" options={filterOptions} />
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
}: {
  form: ReturnType<typeof useForm<Record<string, unknown>>>;
  group: string;
  label: string;
  module: string;
  name: string;
  numeric?: boolean;
  options: CmsItem[];
  type: string;
}) {
  const items = options.filter((item) => String(item.module || "project") === module && String(item.group) === group && String(item.type) === type && item.isActive !== false);
  return (
    <label>{label}<select {...form.register(name, numeric ? { valueAsNumber: true } : undefined)}><option value="">Chọn {label.toLowerCase()}</option>{items.map((item) => <option key={item.id} value={String(item.name)}>{String(item.name)}</option>)}</select></label>
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
  const gallery = (form.watch("galleryMediaIds") as number[] | undefined) || [];

  function addMedia(media: CmsItem) {
    const next = Array.from(new Set([...gallery, media.id]));
    form.setValue("galleryMediaIds", next);
    setPickerOpen(false);
  }

  function removeMedia(id: number) {
    form.setValue("galleryMediaIds", gallery.filter((item) => item !== id));
  }

  return (
    <div className="form-field thumbnail-field">
      <span>Gallery ảnh</span>
      <div className="thumbnail-picker">
        <div className="gallery-id-list">
          {gallery.length ? gallery.map((id) => <button className="secondary-button" key={id} onClick={() => removeMedia(id)} type="button">Ảnh #{id} ×</button>) : <div className="thumbnail-empty"><ImagePlus size={22} /><strong>Chưa chọn gallery</strong><small>Chọn nhiều ảnh từ Media Library để hiển thị trong trang chi tiết.</small></div>}
        </div>
        <div><button className="secondary-button" onClick={() => setPickerOpen(true)} type="button"><ImagePlus size={16} /> Thêm ảnh gallery</button></div>
      </div>
      {pickerOpen ? <MediaPickerModal onClose={() => setPickerOpen(false)} onSelect={addMedia} /> : null}
    </div>
  );
}

function RichTextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), ImageExtension.configure({ inline: false, allowBase64: false }), Placeholder.configure({ placeholder: "Soạn nội dung chi tiết..." })],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={9} />;

  function addLink() {
    const url = window.prompt("Nhập URL liên kết");
    if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImage(media: CmsItem) {
    const src = String(media.webpUrl || media.largeUrl || media.mediumUrl || media.thumbUrl || "");
    if (!src) return;
    editor?.chain().focus().setImage({ src, alt: String(media.altText || media.originalName || "") }).run();
    setPickerOpen(false);
  }

  return (
    <div className="editor-shell">
      <div className="editor-toolbar">
        <button className={editor.isActive("bold") ? "active" : ""} onClick={() => editor.chain().focus().toggleBold().run()} type="button"><Bold size={15} /> B</button>
        <button className={editor.isActive("italic") ? "active" : ""} onClick={() => editor.chain().focus().toggleItalic().run()} type="button"><Italic size={15} /> I</button>
        <button className={editor.isActive("heading", { level: 2 }) ? "active" : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} type="button"><Heading2 size={15} /> H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} type="button"><List size={15} /> List</button>
        <button onClick={addLink} type="button"><LinkIcon size={15} /> Link</button>
        <button onClick={() => setPickerOpen(true)} type="button"><ImagePlus size={15} /> Ảnh</button>
      </div>
      <EditorContent editor={editor} />
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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "80" });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      const response = await apiFetch(`/api/cms/media?${params}`);
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error(await readApiError(response, "Không tải được thư viện ảnh."));
      const payload: ListResponse<CmsItem> = await response.json();
      setRows(payload.data || []);
      setSelected((current) => current && payload.data?.some((item) => item.id === current.id) ? current : payload.data?.[0] || null);
    } catch (error) {
      notify({ tone: "error", title: "Không tải được thư viện ảnh", description: describeClientError(error, "Kiểm tra API hoặc quyền tài khoản.") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type || "general");
        formData.append("altText", file.name.replace(/\.[^.]+$/, ""));
        const response = await apiFetch("/api/cms/media/upload", { method: "POST", body: formData });
        if (!response.ok) {
          failed += 1;
          notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${await readApiError(response, "File không hợp lệ hoặc vượt quá dung lượng.")}` });
        }
      } catch (error) {
        failed += 1;
        notify({ tone: "error", title: "Upload thất bại", description: `${file.name}: ${describeClientError(error, "Không kết nối được API upload.")}` });
      }
    }
    setUploading(false);
    await load();
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
          <div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") load(); }} placeholder="Tìm tên file, alt, caption..." /></div>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">Tất cả loại ảnh</option>
            {["project", "construction", "interior", "blog", "banner", "service", "general"].map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <button className="secondary-button" onClick={load} type="button">Lọc</button>
          <label className="primary-button upload-control">{uploading ? "Đang upload..." : "Upload ảnh"}<input accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => upload(event.target.files)} type="file" /></label>
        </div>

        <div className="media-picker-body">
          <div className="media-picker-grid">
            {loading ? <div className="empty-state">Đang tải thư viện ảnh...</div> : null}
            {!loading && rows.map((media) => (
              <button className={`media-tile ${selected?.id === media.id ? "active" : ""}`} key={media.id} onClick={() => setSelected(media)} onDoubleClick={() => onSelect(media)} type="button">
                <img alt={String(media.altText || media.originalName || "Media")} src={String(media.thumbUrl || media.webpUrl)} />
                <span>{String(media.originalName || media.fileName)}</span>
              </button>
            ))}
            {!loading && rows.length === 0 ? <div className="empty-state">Chưa có ảnh phù hợp. Upload ảnh mới hoặc đổi bộ lọc.</div> : null}
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
      helper.accessor((row) => row.title || row.name || row.fullName || `#${row.id}`, { id: "title", header: entity === "leads" ? "Khách hàng" : entity === "project-categories" || entity === "project-filter-options" ? "Tên" : "Tiêu đề" }),
      helper.accessor((row) => entity === "leads" ? row.phone || "-" : entity === "project-filter-options" ? `${row.module || "project"} / ${row.type || "-"}` : entity === "architecture-designs" ? row.houseType || row.style || "-" : entity === "interior-designs" ? row.interiorStyle || row.roomType || "-" : row.group === "construction" ? "Công trình" : row.group === "interior" ? "Nội thất" : "-", { id: "group", header: entity === "leads" ? "Điện thoại" : entity === "project-filter-options" ? "Module / Loại filter" : "Nhóm" }),
      helper.accessor((row) => row.status || "-", { id: "status", header: "Trạng thái", cell: (info) => <span className={`status-badge status-${info.getValue()}`}>{statusLabels[String(info.getValue())] || String(info.getValue())}</span> }),
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
  if (entity === "services") {
    delete payload.location;
    delete payload.category;
    delete payload.excerpt;
    delete payload.focusKeyword;
    delete payload.scheduledAt;
  }
  if (entity === "projects") {
    delete payload.excerpt;
    delete payload.focusKeyword;
    delete payload.scheduledAt;
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
  if (["projects", "project-categories", "project-filter-options", "services", "architecture-designs", "interior-designs", "menus"].includes(entity)) return roles.includes("Admin");
  if (entity === "estimator") return roles.includes("Admin");
  if (entity === "posts") return roles.includes("Admin") || roles.includes("SEO Editor");
  if (entity === "leads") return roles.includes("Admin") || roles.includes("Sales");
  return false;
}


