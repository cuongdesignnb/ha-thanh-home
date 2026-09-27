export type PortfolioProjectState = {
  status?: string | null;
  isPortfolioVerified?: boolean | null;
};

export function isPortfolioProjectEligible(project: PortfolioProjectState) {
  return project.status === "published" && project.isPortfolioVerified === true;
}

export function verifiedPortfolioFilter(query: Record<string, string>) {
  return query.isPortfolioVerified === "true" ? { isPortfolioVerified: true as const } : {};
}

export function verifiedPortfolioWhere() {
  return { isPortfolioVerified: true as const };
}
