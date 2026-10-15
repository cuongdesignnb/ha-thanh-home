/**
 * Contextual in-body links from blog posts about turnkey house building to the money page.
 * The audit found 0 body links from these posts to /dich-vu/xay-nha-tron-goi, so the link is added at
 * render time (no CMS edit): one sentence placed before the post's second <h2>, skipped when the post
 * already links to the service page.
 */
export const TURNKEY_SERVICE_PATH = "/dich-vu/xay-nha-tron-goi";

type ContextSentence = "process" | "scope" | "region" | "pricing";

function link(anchor: string) {
  return `<a href="${TURNKEY_SERVICE_PATH}">${anchor}</a>`;
}

const sentences: Readonly<Record<ContextSentence, string>> = {
  process: `Nếu muốn giao trọn từ thiết kế, xin phép đến thi công và bàn giao cho một đơn vị, bạn có thể tham khảo ${link("dịch vụ xây nhà trọn gói")} của Hà Thành Home.`,
  scope: `Phạm vi công việc, các mức vật tư và chính sách bảo hành của gói ${link("xây nhà trọn gói")} được trình bày chi tiết tại trang dịch vụ của Hà Thành Home.`,
  region: `Hà Thành Home nhận ${link("xây nhà trọn gói tại Hà Nội")} và các tỉnh lân cận, khảo sát hiện trạng và lập dự toán theo hồ sơ của từng công trình.`,
  pricing: `Đơn giá tham khảo theo từng gói và các hạng mục đã bao gồm được cập nhật tại trang ${link("báo giá xây nhà trọn gói")}.`,
};

/** Post slug -> sentence variant. Variants are spread so anchors stay natural and varied. */
export const turnkeyContextPosts: Readonly<Record<string, ContextSentence>> = {
  "xay-nha-tron-goi-tu-mong-den-noi-that-quy-trinh-chi-phi-va-cach-han-che-phat-sinh": "process",
  "xay-nha-tron-goi-tu-mong-den-noi-that": "scope",
  "thay-doi-luat-xay-dung-tu-1-7-2026-vi-sao-nen-chon-don-vi-thiet-ke-thi-cong-tron-goi": "process",
  "xay-nha-cho-nguoi-ban-ron-vi-sao-nen-chon-dich-vu-thiet-ke-thi-cong-tron-goi": "process",
  "xay-nha-tron-goi-cho-viet-kieu-quy-trinh-lam-viec-tu-xa-va-kiem-soat-chat-luong": "region",
  "xay-nha-tron-goi-cho-chu-dau-tu-o-xa-cach-lam-viec-minh-bach-tu-thiet-ke-den-ban-giao": "region",
  "tong-thau-thiet-ke-thi-cong-nha-o-khi-nao-gia-chu-nen-chon-mot-don-vi-tron-goi": "process",
  "xay-nha-ong-5-tang-tron-goi-giai-phap-cho-nha-mat-tien-hep": "region",
  "giam-sat-thi-cong-nha-tron-goi-gia-chu-can-theo-doi-nhung-gi": "scope",
  "xay-nha-tron-goi-co-bao-gom-noi-that-khong-nhung-hang-muc-can-lam-ro": "scope",
  "du-toan-xay-nha-tron-goi-cach-doc-bang-du-toan-de-tranh-thieu-hang-muc": "pricing",
  "hop-dong-xay-nha-tron-goi-khong-phat-sinh-12-dieu-khoan-gia-chu-phai-kiem-tra": "scope",
  "bang-vat-tu-xay-nha-tron-goi-cach-kiem-tra-truoc-khi-ky-hop-dong": "scope",
  "ban-giao-nha-xay-tron-goi-can-kiem-tra-nhung-hang-muc-nao": "scope",
  "cac-khoan-phat-sinh-khi-xay-nha-tron-goi-va-cach-kiem-soat-ngay-tu-hop-dong": "pricing",
  "nghiem-thu-nha-xay-tron-goi-gom-nhung-gi-checklist-truoc-khi-thanh-toan": "scope",
  "cong-ty-xay-nha-tron-goi-uy-tin": "region",
  "co-nen-thue-xay-nha-tron-goi": "process",
  "nhung-uu-diem-khi-chon-thue-xay-nha-tron-goi": "process",
  "bao-gia-xay-nha-tron-goi-bao-gom-nhung-gi": "pricing",
  "nen-xay-nha-tron-goi-hay-tu-thue-tho": "process",
  "don-gia-xay-dung-nha-tron-goi-moi-nhat": "pricing",
  "chi-phi-xay-nha-cap-4-tron-goi-bao-nhieu-tien": "pricing",
  "vi-sao-nhieu-gia-chu-chon-xay-nha-tron-goi-thay-vi-tu-thue-tung-doi-tho": "process",
  "kinh-nghiem-xay-nha-tron-goi-khong-phat-sinh-bi-quyet-tu-nguoi-trong-nghe": "scope",
  "xay-nha-chia-khoa-trao-tay-ha-noi": "region",
  "bao-gia-xay-nha-tron-goi-tai-ha-noi-2026-cach-tinh-chi-tiet-theo-m2": "region",
  "xay-nha-phan-tho-va-tron-goi-khac-nhau-the-nao-nen-chon-goi-nao": "scope",
  "so-sanh-chi-phi-xay-nha-tron-goi-va-xay-tho": "pricing",
  "cach-tinh-chi-phi-xay-nha-tranh-phat-sinh": "pricing",
  "cach-len-du-toan-chi-phi-xay-nha-tiet-kiem": "pricing",
  "chi-phi-xay-nha-2-tang-100m2-moi-nhat-nam-2026": "pricing",
};

const EXISTING_SERVICE_LINK = /<a\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/(?:www\.)?hathanhhome\.vn)?\/dich-vu\/xay-nha-tron-goi\/?(?:["'?#])/i;

/** Insert the turnkey-service sentence into a mapped post's HTML; any other post is returned unchanged. */
export function withTurnkeyContextLink(slug: string, html: string): string {
  const variant = turnkeyContextPosts[slug];
  if (!variant || !html || EXISTING_SERVICE_LINK.test(html)) return html;

  const paragraph = `<p class="service-context-link">${sentences[variant]}</p>`;
  const headings = [...html.matchAll(/<h2\b/gi)];
  if (headings.length >= 2) {
    const index = headings[1].index!;
    return `${html.slice(0, index)}${paragraph}${html.slice(index)}`;
  }
  const firstParagraphEnd = html.search(/<\/p\s*>/i);
  if (firstParagraphEnd >= 0) {
    const index = html.indexOf(">", firstParagraphEnd) + 1;
    return `${html.slice(0, index)}${paragraph}${html.slice(index)}`;
  }
  return `${html}${paragraph}`;
}
