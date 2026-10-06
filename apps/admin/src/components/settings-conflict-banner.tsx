"use client";

import type { VersionedSettings } from "@/lib/versioned-settings";

export function SettingsConflictBanner({
  conflict,
  onDiscardDraftAndReload,
}: {
  conflict: { latest: VersionedSettings | null; message?: string } | null;
  onDiscardDraftAndReload: () => void;
}) {
  if (!conflict) return null;
  return (
    <div className="form-conflict-banner" role="alert">
      <div>
        <strong>Cấu hình đã được cập nhật ở phiên khác.</strong>
        <p>Bản nháp hiện tại vẫn được giữ và chưa được lưu. Không có lần lưu tự động nào được thử lại.</p>
        {conflict.message ? <p>{conflict.message}</p> : null}
        {conflict.latest ? (
          <details>
            <summary>Đối chiếu snapshot mới nhất (thông tin bí mật đã ẩn)</summary>
            <pre style={{ maxHeight: 280, overflow: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(redact(conflict.latest), null, 2)}</pre>
          </details>
        ) : null}
      </div>
      <button className="secondary-button" type="button" onClick={onDiscardDraftAndReload}>
        Bỏ bản nháp và tải lại cấu hình mới nhất
      </button>
    </div>
  );
}

function redact(value: unknown, key = ""): unknown {
  if (/api.?key|password|secret|token|smtp.?pass/i.test(key)) return value ? "[đã ẩn]" : value;
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [childKey, redact(childValue, childKey)]));
  }
  return value;
}
