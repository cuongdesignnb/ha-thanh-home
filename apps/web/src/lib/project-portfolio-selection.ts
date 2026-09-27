import { isUsableSlug } from "./content-validation";

export type PortfolioCandidate = {
  id: number;
  slug: string;
  status?: string | null;
  isPortfolioVerified?: boolean | null;
};

export function isPortfolioCandidateEligible(project: PortfolioCandidate) {
  return project.status === "published" && project.isPortfolioVerified === true;
}

export function selectVerifiedRelatedProjects<T extends PortfolioCandidate>(currentId: number, ...groups: T[][]) {
  const seen = new Set<number>([currentId]);
  return groups.flat()
    .filter(isPortfolioCandidateEligible)
    .filter((project) => isUsableSlug(project.slug))
    .filter((project) => {
      if (seen.has(project.id)) return false;
      seen.add(project.id);
      return true;
    })
    .slice(0, 4);
}
