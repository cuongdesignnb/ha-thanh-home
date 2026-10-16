/**
 * Records stored as Projects that are not completed projects (SEO content-architecture audit, 2026-10-13).
 * They keep their /du-an/<slug> URL (no URL change), but render as what they are: service/area landings,
 * pricing pages or guides. That means no "Chủ đầu tư"/budget block taken from placeholder CMS fields, a
 * Service (not CreativeWork) schema and a breadcrumb under the parent service page.
 *
 * Real projects are not listed here and render unchanged.
 */
export type ProjectPageKind = "area" | "pricing" | "service" | "guide";

export type ParentServiceKey = "xay-nha-tron-goi" | "thi-cong-nha-xuong" | "thi-cong-noi-that-van-phong" | "san-xuat-thi-cong-noi-that";

export const parentServices: Readonly<Record<ParentServiceKey, { name: string; path: string }>> = {
  "xay-nha-tron-goi": { name: "Xây nhà trọn gói", path: "/dich-vu/xay-nha-tron-goi" },
  "thi-cong-nha-xuong": { name: "Thi công nhà xưởng", path: "/dich-vu/thi-cong-nha-xuong" },
  "thi-cong-noi-that-van-phong": { name: "Thi công nội thất văn phòng", path: "/dich-vu/thi-cong-noi-that-van-phong" },
  "san-xuat-thi-cong-noi-that": { name: "Sản xuất & thi công nội thất", path: "/dich-vu/san-xuat-thi-cong-noi-that" },
};

export type ProjectPageInfo = { kind: ProjectPageKind; parent: ParentServiceKey; region?: string };

const area = (region: string): ProjectPageInfo => ({ kind: "area", parent: "xay-nha-tron-goi", region });
const pricing = (parent: ParentServiceKey = "xay-nha-tron-goi", region?: string): ProjectPageInfo => ({ kind: "pricing", parent, region });
const service = (parent: ParentServiceKey = "xay-nha-tron-goi"): ProjectPageInfo => ({ kind: "service", parent });
const guide = (parent: ParentServiceKey = "xay-nha-tron-goi", region?: string): ProjectPageInfo => ({ kind: "guide", parent, region });

export const nonPortfolioProjectPages: Readonly<Record<string, ProjectPageInfo>> = {
  // "Xây nhà trọn gói <khu vực>" landings.
  "xay-nha-tron-goi-ba-dinh-ha-noi-cong-ty-xay-dung-uy-tin": area("Ba Đình, Hà Nội"),
  "xay-nha-tron-goi-ba-vi-ho-tro-20-7-cong-ty-xay-dung-uy-tin": area("Ba Vì, Hà Nội"),
  "xay-nha-tron-goi-bac-tu-liem-tu-van-mien-phi": area("Bắc Từ Liêm, Hà Nội"),
  "xay-nha-tron-goi-cau-giay": area("Cầu Giấy, Hà Nội"),
  "xay-nha-tron-goi-chuong-my-cap-nhat-bao-gia-moi-nhat": area("Chương Mỹ, Hà Nội"),
  "xay-nha-tron-goi-dong-anh-don-vi-thi-cong-chuyen-nghiep": area("Đông Anh, Hà Nội"),
  "xay-nha-tron-goi-dong-da-bao-hanh-dai-han": area("Đống Đa, Hà Nội"),
  "xay-nha-tron-goi-hai-ba-trung-hathanhhome": area("Hai Bà Trưng, Hà Nội"),
  "xay-nha-tron-goi-hoai-duc-cong-ty-xay-dung-uy-tin": area("Hoài Đức, Hà Nội"),
  "xay-nha-tron-goi-tai-xa-an-khanh-ha-noi": area("An Khánh, Hoài Đức, Hà Nội"),
  "xay-nha-tron-goi-long-bien-ha-noi-hathanhhome": area("Long Biên, Hà Nội"),
  "xay-nha-tron-goi-nam-tu-liem-tu-van-khao-sat-mien-phi": area("Nam Từ Liêm, Hà Nội"),
  "xay-nha-tron-goi-xuan-phuong-cap-nhat-bao-gia-nam-2026": area("Xuân Phương, Nam Từ Liêm, Hà Nội"),
  "xay-nha-tron-goi-o-hoa-lac-khao-sat-mien-phi": area("Hòa Lạc, Thạch Thất, Hà Nội"),
  "xay-nha-tron-goi-tai-thach-that-bao-gia-moi-nhat-2026": area("Thạch Thất, Hà Nội"),
  "xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet": area("Hoàng Mai, Hà Nội"),
  "xay-nha-tron-goi-phuc-tho-cap-nhat-bao-gia-nam-2026": area("Phúc Thọ, Hà Nội"),
  "xay-nha-tron-goi-phuong-hoan-kiem-hathanhhome": area("Hoàn Kiếm, Hà Nội"),
  "xay-nha-tron-goi-son-tay-cam-ket-chuan-tien-do": area("Sơn Tây, Hà Nội"),
  "xay-nha-tron-goi-tai-dan-phuong-ho-tro-tu-van-24-7": area("Đan Phượng, Hà Nội"),
  "xay-nha-tron-goi-tai-ha-dong": area("Hà Đông, Hà Nội"),
  "xay-nha-tron-goi-tai-phu-xuyen": area("Phú Xuyên, Hà Nội"),
  "xay-nha-tron-goi-tai-soc-son-cong-ty-xay-dung-uy-tin": area("Sóc Sơn, Hà Nội"),
  "xay-nha-tron-goi-xa-noi-bai-ha-noi": area("Nội Bài, Sóc Sơn, Hà Nội"),
  "xay-nha-tron-goi-tai-thanh-tri-bao-gia-truc-tiep": area("Thanh Trì, Hà Nội"),
  "xay-nha-tron-goi-tay-ho-bao-gia-chi-tiet-minh-bach": area("Tây Hồ, Hà Nội"),
  "xay-nha-tron-goi-thanh-xuan-tu-van-khao-sat-mien-phi": area("Thanh Xuân, Hà Nội"),
  "xay-nha-tron-goi-tai-bac-giang-cong-ty-xay-nha-tron-goi-uy-tin": area("Bắc Giang"),
  "xay-nha-tron-goi-tai-bac-ninh-uy-tin-chat-luong": area("Bắc Ninh"),
  "xay-nha-tron-goi-tai-dong-van-ha-nam": area("Đồng Văn, Hà Nam"),
  "xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24-7": area("Hà Nam"),
  "xay-nha-tron-goi-tai-hai-duong-cap-nhat-bao-gia-moi-nhat2026": area("Hải Dương"),
  "xay-nha-tron-goi-tai-hai-phong-cong-ty-xay-dung-uy-tin": area("Hải Phòng"),
  "xay-nha-tron-goi-tai-hoa-binh-bao-gia-canh-tranh": area("Hòa Bình"),
  "xay-nha-tron-goi-tai-luong-son-phu-tho": area("Lương Sơn, Hòa Bình"),
  "xay-nha-tron-goi-tai-hung-yen-cong-ty-xay-dung-uy-tin": area("Hưng Yên"),
  "xay-nha-tron-goi-tai-lang-son-uy-tin-chuyen-nghiep": area("Lạng Sơn"),
  "xay-nha-tron-goi-tai-nam-dinh": area("Nam Định"),
  "xay-nha-tron-goi-tai-nghe-an-chat-luong-dam-bao-tien-do": area("Nghệ An"),
  "xay-nha-tron-goi-tai-ninh-binh-cong-ty-xay-dung-uy-tin": area("Ninh Bình"),
  "xay-nha-tron-goi-tai-quang-ninh-bao-hanh-dai-han": area("Quảng Ninh"),
  "xay-nha-tron-goi-tai-thai-binh-bao-gia-nam-2026-quy-trinh-tu-a-z": area("Thái Bình"),
  "xay-nha-tron-goi-o-thanh-hoa-cong-ty-xay-dung-uy-tin-hathanhhome": area("Thanh Hóa"),
  "xay-nha-tron-goi-vinh-phuc-bao-gia-chi-tiet-2026": area("Vĩnh Phúc"),

  // Pricing pages.
  "bao-gia-xay-nha-tron-goi-nam-2026-cach-tinh-chi-phi-chon-nha-thau-uy-tin": pricing(),
  "bao-gia-xay-nha-tron-goi-hathanhhome-uy-tin-chat-luong": pricing(),
  "bao-gia-xay-nha-tron-goi-tai-ha-noi-2026": pricing("xay-nha-tron-goi", "Hà Nội"),
  "bao-gia-xay-nha-tron-goi-lien-ke-nam-2026": pricing(),
  "xay-nha-tron-goi-bao-nhieu-tien-1m2": pricing(),
  "cach-tinh-chi-phi-xay-nha-tron-goi-khong-phat-sinh": pricing(),
  "cach-tinh-don-gia-xay-dung-theo-m2-chinh-xac-nhat": pricing(),
  "bao-gia-hoan-thien-nha-xay-tho-2026": pricing(),
  "bao-gia-thiet-ke-nha-2026": pricing(),
  "bao-gia-xay-nha-tron-goi-son-tay-ha-noi": pricing("xay-nha-tron-goi", "Sơn Tây, Hà Nội"),
  "bao-gia-xay-nha-tron-goi-2026-phuong-ngo-quyen-hai-phong": pricing("xay-nha-tron-goi", "Ngô Quyền, Hải Phòng"),
  "bao-gia-xay-nha-tron-goi-tai-ninh-binh-nam-2026": pricing("xay-nha-tron-goi", "Ninh Bình"),
  "bao-gia-xay-nha-tron-goi-tai-phuong-hoanh-bo-quang-ninh": pricing("xay-nha-tron-goi", "Hoành Bồ, Quảng Ninh"),
  "bao-gia-xay-nha-tron-goi-tai-tien-du-bac-ninh-uy-tin-chat-luong": pricing("xay-nha-tron-goi", "Tiên Du, Bắc Ninh"),
  "bao-gia-xay-nha-tron-goi-tai-tuyen-quang-chi-tiet-tung-hang-muc": pricing("xay-nha-tron-goi", "Tuyên Quang"),
  "cap-nhat-bao-gia-xay-nha-tron-goi-tai-nam-dinh-2026-chi-tiet-tung-hang-muc": pricing("xay-nha-tron-goi", "Nam Định"),
  "bao-gia-thi-cong-nha-xuong-2026": pricing("thi-cong-nha-xuong"),
  "chi-phi-xay-dung-nha-xuong": pricing("thi-cong-nha-xuong"),
  "don-gia-xay-dung-nha-xuong": pricing("thi-cong-nha-xuong"),
  "bao-gia-noi-that-van-phong": pricing("thi-cong-noi-that-van-phong"),
  "bao-gia-thiet-ke-noi-that-moi-nhat-2026": pricing("san-xuat-thi-cong-noi-that"),

  // Service landings without a region.
  "cong-ty-xay-dung-nha-uy-tin-ha-thanh-hathanhhome": service(),
  "cong-ty-xay-dung-nha-o-uy-tin-ha-noi": service(),
  "hoan-thien-nha-phan-tho-ha-noi-tu-van-khao-sat-mien-phi": service(),
  "xay-nha-tron-goi-phan-tho-uy-tin-chuyen-nghiep": service(),
  "thi-cong-mong-nha-xuong": service("thi-cong-nha-xuong"),
  "xay-nha-xuong-khung-thep": service("thi-cong-nha-xuong"),
  "van-phong-hien-dai": service("thi-cong-noi-that-van-phong"),

  // Guides filed under projects.
  "chia-se-kinh-nghiem-xay-nha-tai-quang-ninh-can-luu-y-nhung-gi": guide("xay-nha-tron-goi", "Quảng Ninh"),
  "nhung-luu-y-khi-xay-nha-tron-goi-tai-quang-ninh-kinh-nghiem-thi-cong": guide("xay-nha-tron-goi", "Quảng Ninh"),
  "nhung-dieu-can-biet-khi-xay-nha-tai-nam-dinh-khi-hau-tho-nhuong-dia-chat-khu-vuc": guide("xay-nha-tron-goi", "Nam Định"),
  "kinh-nghiem-xay-nha-pho-o-ha-noi-can-luu-y-nhung-gi": guide("xay-nha-tron-goi", "Hà Nội"),
  "mau-hop-dong-xay-nha-tron-goi-chi-tiet-chuan-phap-ly": guide(),
  "top-sai-lam-khien-chi-phi-xay-nha-vuot-du-toan": guide(),
  "vat-lieu-thi-cong-xay-nha-tron-goi": guide(),
  "xay-nha-tron-goi-ha-noi-gom-nhung-gi": guide("xay-nha-tron-goi", "Hà Nội"),
  "xay-nha-tron-goi-la-gi-co-nen-chon-dich-vu-chia-khoa-trao-tay-khong": guide(),
  "mau-nha-xuong-dep": guide("thi-cong-nha-xuong"),
};

export function getProjectPageInfo(slug?: string | null): ProjectPageInfo | undefined {
  return slug ? nonPortfolioProjectPages[slug] : undefined;
}

/** Area landings for one parent service, for the "Khu vực phục vụ" block on the service page. */
export function areaLandingsFor(parent: ParentServiceKey): Array<{ slug: string; region: string }> {
  return Object.entries(nonPortfolioProjectPages)
    .filter(([, info]) => info.kind === "area" && info.parent === parent && info.region)
    .map(([slug, info]) => ({ slug, region: info.region! }));
}
