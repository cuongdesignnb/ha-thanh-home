import type { Metadata } from "next";
import Link from "next/link";
import { Home, BriefcaseBusiness, FolderKanban, PhoneCall, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | Hà Thành Home",
  description:
    "Trang bạn đang truy cập không tồn tại hoặc đã được thay đổi đường dẫn.",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/", label: "Về trang chủ", icon: Home },
  { href: "/dich-vu", label: "Xem dịch vụ", icon: BriefcaseBusiness },
  { href: "/du-an", label: "Xem dự án", icon: FolderKanban },
  { href: "/tin-tuc", label: "Đọc tin tức", icon: Newspaper },
  { href: "/lien-he", label: "Liên hệ tư vấn", icon: PhoneCall },
];

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <span className="not-found-code">404</span>
        <h1>Không tìm thấy trang</h1>
        <p>
          Trang bạn đang truy cập có thể đã bị xoá, đổi đường dẫn hoặc không
          còn tồn tại.
        </p>

        <div className="not-found-actions">
          {links.map(({ href, label, icon: Icon }) => (
            <Link href={href} key={href} className="not-found-link">
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>

        <div className="not-found-suggest">
          <strong>Bạn có thể cần:</strong>
          <ul>
            <li>
              <Link href="/dich-vu/xay-nha-tron-goi">Xây nhà trọn gói</Link>
            </li>
            <li>
              <Link href="/dich-vu/san-xuat-thi-cong-noi-that">
                Sản xuất thi công nội thất
              </Link>
            </li>
            <li>
              <Link href="/mau-thiet-ke-kien-truc">Mẫu thiết kế kiến trúc</Link>
            </li>
            <li>
              <Link href="/mau-thiet-ke-noi-that">Mẫu thiết kế nội thất</Link>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
