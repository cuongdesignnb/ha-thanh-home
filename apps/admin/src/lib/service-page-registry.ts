export type ServicePageStatus = "existing" | "next" | "planned";

export type ServicePageRegistryItem = {
  slug: string;
  label: string;
  route: string;
  settingKey: string;
  status: ServicePageStatus;
  description: string;
};

export const SERVICE_PAGE_REGISTRY: ServicePageRegistryItem[] = [
  {
    slug: "xay-nha-tron-goi",
    label: "Xây nhà trọn gói",
    route: "/dich-vu/xay-nha-tron-goi",
    settingKey: "site.servicePages.xayNhaTronGoi",
    status: "existing",
    description: "Landing page xây nhà trọn gói hiện đã có route public.",
  },
  {
    slug: "san-xuat-thi-cong-noi-that",
    label: "Sản Xuất Thi Công Nội Thất",
    route: "/dich-vu/san-xuat-thi-cong-noi-that",
    settingKey: "site.servicePages.sanXuatThiCongNoiThat",
    status: "existing",
    description: "Landing page sản xuất và thi công nội thất trọn gói.",
  },
  {
    slug: "thi-cong-nha-xuong",
    label: "Thi Công Nhà Xưởng",
    route: "/dich-vu/thi-cong-nha-xuong",
    settingKey: "site.servicePages.thiCongNhaXuong",
    status: "existing",
    description: "Landing page thi công nhà xưởng trọn gói.",
  },
  {
    slug: "thi-cong-noi-that-van-phong",
    label: "Thi Công Nội Thất Văn Phòng",
    route: "/dich-vu/thi-cong-noi-that-van-phong",
    settingKey: "site.servicePages.thiCongNoiThatVanPhong",
    status: "existing",
    description: "Landing page thi công nội thất văn phòng trọn gói.",
  },
];

export function getWebBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:31873").replace(/\/$/, "");
}
