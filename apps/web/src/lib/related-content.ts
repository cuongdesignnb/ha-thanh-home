import {
  getList,
  thumbnailUrl,
  type ArchitectureDesign,
  type InteriorDesign,
  type Post,
  type Project,
  type Service,
} from "@/lib/api";
import type { RelatedContentItem } from "@/components/related-content";
import { isUsableSlug } from "@/lib/content-validation";

function query(path: string, params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== null && value !== undefined && value !== "") search.set(key, String(value));
  return `${path}?${search}`;
}

function uniqueRelated<T extends { id: number }>(currentId: number, ...groups: T[][]) {
  const seen = new Set<number>([currentId]);
  return groups.flat().filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 4);
}

export async function getRelatedProjects(item: Project): Promise<RelatedContentItem[]> {
  const category = item.categoryRef?.slug;
  const [sameCategory, sameGroup, latest] = await Promise.all([
    category ? getList<Project>(query("/projects", { category, limit: 8 })) : Promise.resolve([]),
    getList<Project>(query("/projects", { group: item.group, limit: 8 })),
    getList<Project>(query("/projects", { limit: 8 })),
  ]);
  return uniqueRelated(item.id, sameCategory, sameGroup, latest).filter((project) => isUsableSlug(project.slug)).map((project) => ({
    id: project.id, title: project.title, href: `/du-an/${project.slug}`, imageUrl: thumbnailUrl(project, ""),
    label: project.categoryRef?.name || project.category || (project.group === "interior" ? "Nội thất" : "Công trình"), description: project.description,
  }));
}

export async function getRelatedServices(item: Service): Promise<RelatedContentItem[]> {
  const [sameGroup, latest] = await Promise.all([
    getList<Service>(query("/services", { group: item.group, limit: 8 })),
    getList<Service>(query("/services", { limit: 8 })),
  ]);
  return uniqueRelated(item.id, sameGroup, latest).filter((service) => isUsableSlug(service.slug)).map((service) => ({
    id: service.id, title: service.title, href: `/dich-vu/${service.slug}`, imageUrl: thumbnailUrl(service, ""), label: "Dịch vụ", description: service.description,
  }));
}

export async function getRelatedPosts(item: Post): Promise<RelatedContentItem[]> {
  const category = item.categoryRef?.slug;
  const [sameCategory, latest] = await Promise.all([
    category ? getList<Post>(query("/posts", { category, limit: 8 })) : Promise.resolve([]),
    getList<Post>(query("/posts", { limit: 8 })),
  ]);
  return uniqueRelated(item.id, sameCategory, latest).filter((post) => isUsableSlug(post.slug)).map((post) => ({
    id: post.id, title: post.title, href: `/tin-tuc/${post.slug}`, imageUrl: thumbnailUrl(post, ""), label: post.categoryRef?.name || "Tin tức", description: post.excerpt,
  }));
}

export async function getRelatedArchitecture(item: ArchitectureDesign): Promise<RelatedContentItem[]> {
  const [samePair, sameHouseType, sameStyle, latest] = await Promise.all([
    getList<ArchitectureDesign>(query("/architecture-designs", { houseType: item.houseType, style: item.style, limit: 8 })),
    getList<ArchitectureDesign>(query("/architecture-designs", { houseType: item.houseType, limit: 8 })),
    getList<ArchitectureDesign>(query("/architecture-designs", { style: item.style, limit: 8 })),
    getList<ArchitectureDesign>(query("/architecture-designs", { limit: 8 })),
  ]);
  return uniqueRelated(item.id, samePair, sameHouseType, sameStyle, latest).filter((design) => isUsableSlug(design.slug)).map((design) => ({
    id: design.id, title: design.title, href: `/mau-thiet-ke-kien-truc/${design.slug}`, imageUrl: thumbnailUrl(design, ""), label: design.houseType || design.style || "Mẫu kiến trúc", description: design.description,
  }));
}

export async function getRelatedInterior(item: InteriorDesign): Promise<RelatedContentItem[]> {
  const [samePair, sameStyle, sameRoom, latest] = await Promise.all([
    getList<InteriorDesign>(query("/interior-designs", { interiorStyle: item.interiorStyle, roomType: item.roomType, limit: 8 })),
    getList<InteriorDesign>(query("/interior-designs", { interiorStyle: item.interiorStyle, limit: 8 })),
    getList<InteriorDesign>(query("/interior-designs", { roomType: item.roomType, limit: 8 })),
    getList<InteriorDesign>(query("/interior-designs", { limit: 8 })),
  ]);
  return uniqueRelated(item.id, samePair, sameStyle, sameRoom, latest).filter((design) => isUsableSlug(design.slug)).map((design) => ({
    id: design.id, title: design.title, href: `/mau-thiet-ke-noi-that/${design.slug}`, imageUrl: thumbnailUrl(design, ""), label: design.interiorStyle || design.roomType || "Mẫu nội thất", description: design.description,
  }));
}

export async function getConstructionGuidePosts(): Promise<RelatedContentItem[]> {
  const [guides, latest] = await Promise.all([
    getList<Post>(query("/posts", { category: "cam-nang-xay-dung", limit: 4 })),
    getList<Post>(query("/posts", { limit: 8 })),
  ]);
  return uniqueRelated(0, guides, latest).filter((post) => isUsableSlug(post.slug)).map((post) => ({
    id: post.id, title: post.title, href: `/tin-tuc/${post.slug}`, imageUrl: thumbnailUrl(post, ""), label: post.categoryRef?.name || "Cẩm nang xây dựng", description: post.excerpt,
  }));
}
