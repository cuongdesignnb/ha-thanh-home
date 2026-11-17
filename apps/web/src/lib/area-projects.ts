/**
 * Real, portfolio-verified projects shown on the area landing ("xây nhà trọn gói tại …") of the place where
 * they were built, and the reverse link from each project to that landing (owner-approved 2026-11-17,
 * docs/seo/ra-soat-trang-khu-vuc-11-2026.md). Area landings had no proof of work in the area; the projects
 * had no link to the service page for their area.
 *
 * Keys are /du-an/ slugs listed as area or pricing pages in project-page-kind.ts; values are /du-an/ slugs
 * of real projects. Keep both sides free of redirect sources (checked by area-projects.spec.ts).
 */
export const areaProjects: Readonly<Record<string, readonly string[]>> = {
  "xay-nha-tron-goi-tai-soc-son-cong-ty-xay-dung-uy-tin": ["du-an-thiet-ke-thi-cong-xay-nha-tron-goi-soc-son-ha-noi"],
  "xay-nha-tron-goi-tai-phu-xuyen": ["du-an-thiet-ke-thi-cong-xay-nha-tron-goi-phu-xuyen-ha-noi"],
  "xay-nha-tron-goi-tai-nam-dinh": [
    "du-an-xay-nha-anh-tran-van-cuong-phuong-dong-a-nam-dinh",
    "cong-trinh-nha-o-phong-cach-dai-trung-hai-hien-dai-nha-anh-tran-tien-thanh-lien-ha-thien-truong-nam-dinh",
  ],
  "xay-nha-tron-goi-ba-vi-ho-tro-20-7-cong-ty-xay-dung-uy-tin": ["du-an-thiet-ke-thi-cong-nha-mai-nhat-2-tang-anh-trinh-xuan-long-ba-vi-ha-noi"],
  "xay-nha-tron-goi-dong-anh-don-vi-thi-cong-chuyen-nghiep": ["cong-trinh-nha-o-2-tang-1tum-gia-dinh-chu-bach-co-phuong-dong-anh-ha-noi"],
  "xay-nha-tron-goi-ba-dinh-ha-noi-cong-ty-xay-dung-uy-tin": ["du-an-xay-nha-o-5tang-1tum-nha-chu-pham-quang-ngoc-ba-dinh-ha-noi"],
  "xay-nha-tron-goi-o-hoang-mai-bao-gia-chi-tiet": [
    "du-an-thiet-ke-thi-cong-nha-pho-do-van-hai-thinh-liet-hoang-mai",
    "thiet-ke-thi-cong-xay-nha-tron-goi-phuong-dinh-cong-ha-noi",
  ],
  "xay-nha-tron-goi-tai-thanh-tri-bao-gia-truc-tiep": ["thiet-ke-thi-cong-xay-nha-tron-goi-nha-em-khoang-trieu-khuc-thanh-liet"],
  "xay-nha-tron-goi-bac-tu-liem-tu-van-mien-phi": ["du-an-thiet-ke-thi-cong-nha-pho-chi-hoang-thi-lan-co-nhue-ha-noi"],
  "xay-nha-tron-goi-phuc-tho-cap-nhat-bao-gia-nam-2026": ["thiet-ke-thi-cong-xay-nha-tron-goi-xa-phuc-thi-ha-noi"],
  "xay-nha-tron-goi-tai-bac-ninh-uy-tin-chat-luong": [
    "hoan-thien-biet-thu-song-lap-ban-giao-tho-vo-minh-duc-tu-son-bac-ninh",
    "xay-nha-tron-goi-yen-phong-bac-ninh-biet-thu-2-tang-mai-thai",
    "cong-trinh-nha-o-biet-thu",
  ],
  "xay-nha-tron-goi-tai-bac-giang-cong-ty-xay-nha-tron-goi-uy-tin": ["du-an-xay-dung-nha-mai-nhat-2tang-nha-anh-toai-tan-tien-bac-giang"],
  "xay-nha-tron-goi-tai-hung-yen-cong-ty-xay-dung-uy-tin": ["du-an-xay-nha-o-2tang-2mat-tien-tan-co-dien-hien-dai-em-dinh-duc-anh-kim-dong-hung-yen"],
  "xay-nha-tron-goi-tai-thai-binh-bao-gia-nam-2026-quy-trinh-tu-a-z": ["du-an-xay-nha-o-mai-thai-2tang-phong-cach-tan-co-dien-anh-tran-quoc-an-tien-hai-thai-binh"],
  "xay-nha-tron-goi-tai-ha-nam-ho-tro-tu-van-khao-sat-24-7": ["du-an-xay-biet-thu-nha-bac-nguyen-son-lam-tai-ha-nam"],
  "xay-nha-tron-goi-tai-hai-phong-cong-ty-xay-dung-uy-tin": ["thi-cong-biet-thu-tan-co-dien-mai-thai-duong-ngoc-anh-ninh-giang-hai-phong"],
  "bao-gia-xay-nha-tron-goi-tai-ninh-binh-nam-2026": [
    "cong-trinh-biet-thu-nha-vuon-nha-anh-tran-cao-cuong-ninh-binh",
    "thiet-ke-thi-cong-xay-nha-tron-goi-phuong-phu-ly-ninh-binh",
  ],
};

const areaOfProject = new Map<string, string>(
  Object.entries(areaProjects).flatMap(([area, projects]) => projects.map((project) => [project, area] as const)),
);

/** Real projects built in the area of this landing page. */
export function projectsForArea(areaSlug?: string | null): readonly string[] {
  return (areaSlug && areaProjects[areaSlug]) || [];
}

/** The area landing a real project links back to, if any. */
export function areaForProject(projectSlug?: string | null): string | undefined {
  return projectSlug ? areaOfProject.get(projectSlug) : undefined;
}
