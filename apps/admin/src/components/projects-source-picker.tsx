"use client";

import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/client-path";

const apiFetch = adminApiFetch;

export type ProjectsSourceValue = {
  entity?: "project" | "architecture-design" | "interior-design";
  group?: "construction" | "interior" | "xay_nha_tron_goi";
  categorySlug?: string;
  mode?: "latest" | "featured";
  limit?: number;
};

type CategoryRow = { id: number; name: string; slug: string; group?: string };

export function ProjectsSourcePicker({
  value,
  onChange,
}: {
  value: ProjectsSourceValue | undefined;
  onChange: (next: ProjectsSourceValue) => void;
}) {
  const v: ProjectsSourceValue = value || {};
  const entity = v.entity || "project";
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCats(true);
    const endpoint = entity === "project" ? "/api/cms/project-categories?limit=200" : null;
    if (!endpoint) {
      setCategories([]);
      setLoadingCats(false);
      return () => { cancelled = true; };
    }
    apiFetch(endpoint)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((payload) => { if (!cancelled) setCategories(payload?.data || []); })
      .catch(() => { if (!cancelled) setCategories([]); })
      .finally(() => { if (!cancelled) setLoadingCats(false); });
    return () => { cancelled = true; };
  }, [entity]);

  function patch(field: keyof ProjectsSourceValue, val: ProjectsSourceValue[keyof ProjectsSourceValue]) {
    onChange({ ...v, [field]: val === "" || val === undefined ? undefined : val });
  }

  const filteredCategories = entity === "project" && v.group
    ? categories.filter((c) => !c.group || c.group === v.group)
    : categories;

  return (
    <div className="projects-source-picker">
      <header className="projects-source-head">
        <strong>Nguồn dự án hiển thị</strong>
        <p>Chọn loại catalog, nhóm, danh mục và chế độ lấy dữ liệu cho section "Dự án tiêu biểu".</p>
      </header>
      <div className="projects-source-grid">
        <label>
          Loại catalog
          <select value={entity} onChange={(e) => patch("entity", e.target.value as ProjectsSourceValue["entity"])}>
            <option value="project">Dự án (Project)</option>
            <option value="architecture-design">Mẫu thiết kế kiến trúc</option>
            <option value="interior-design">Mẫu thiết kế nội thất</option>
          </select>
        </label>

        {entity === "project" ? (
          <label>
            Nhóm dự án
            <select value={v.group || ""} onChange={(e) => patch("group", (e.target.value || undefined) as ProjectsSourceValue["group"])}>
              <option value="">Tất cả nhóm</option>
              <option value="construction">Công trình</option>
              <option value="interior">Nội thất</option>
              <option value="xay_nha_tron_goi">Xây nhà trọn gói</option>
            </select>
          </label>
        ) : null}

        {entity === "project" ? (
          <label>
            Danh mục dự án
            <select value={v.categorySlug || ""} onChange={(e) => patch("categorySlug", e.target.value || undefined)} disabled={loadingCats}>
              <option value="">{loadingCats ? "Đang tải..." : "Tất cả danh mục"}</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Lọc theo slug (tùy chọn)
            <input value={v.categorySlug || ""} onChange={(e) => patch("categorySlug", e.target.value || undefined)} placeholder="Để trống để hiển thị tất cả" />
          </label>
        )}

        <label>
          Chế độ
          <select value={v.mode || "latest"} onChange={(e) => patch("mode", e.target.value as ProjectsSourceValue["mode"])}>
            <option value="latest">Mới nhất</option>
            <option value="featured">Nổi bật (isFeatured)</option>
          </select>
        </label>

        <label>
          Số lượng hiển thị
          <input
            type="number"
            min={1}
            max={24}
            value={v.limit ?? 6}
            onChange={(e) => patch("limit", Number(e.target.value) || undefined)}
          />
        </label>
      </div>
      <footer className="projects-source-foot">
        <small>
          Endpoint sẽ gọi: <code>{previewEndpoint(v, entity)}</code>
        </small>
      </footer>
    </div>
  );
}

function previewEndpoint(v: ProjectsSourceValue, entity: string): string {
  const base = entity === "architecture-design" ? "/architecture-designs" : entity === "interior-design" ? "/interior-designs" : "/projects";
  const params: string[] = [`limit=${v.limit ?? 6}`];
  if (v.mode === "featured") params.push("featured=true");
  else params.push("sort=newest");
  if (v.categorySlug) params.push(`category=${encodeURIComponent(v.categorySlug)}`);
  if (entity === "project" && v.group) params.push(`group=${v.group}`);
  return `${base}?${params.join("&")}`;
}
