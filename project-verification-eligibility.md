# Track B Hotfix 02 — Project Verification Eligibility

## Scope and baseline

- Repository: `cuongdesignnb/ha-thanh-home`
- Branch: `track-b-hotfix-portfolio-verification`
- Base: `0960f0ece0a926b2933c47314c214a63dcf54dc3`
- Production project inventory checked read-only through the public projects API on 2026-09-27 15:23:48 +07:00: 135 published records (33 construction, 12 interior, 90 turnkey-construction); 134 were featured. Project #65 was published and featured.
- No production record, content, or database was changed. The migration was not run. No deployment was performed.

## Design and migration safety

Added `Project.isPortfolioVerified`, a required Boolean with schema default `false`. Newly created projects therefore remain ineligible until an Editor explicitly approves them. Admin exposes the checkbox “Portfolio verified / Công trình đã xác minh” and the requested help text. The Admin create payload and API create DTO both default an omitted value to `false`; updates preserve the current value when the field is omitted.

The migration is deliberately staged in one transactional-purpose SQL file:

1. Add the non-null Boolean column with default `false`.
2. Backfill currently published projects to `true` to preserve the existing portfolio presentation.
3. Set Project #65 to `false` as the specifically identified non-HTH project page.

This avoids making the existing portfolio disappear at migration time and makes projects created after migration opt-in. Important limitation: the carry-forward of the other 134 published projects preserves legacy behavior; it is not an individual provenance audit proving each one is an HTH project. Editorial verification can be completed separately without blocking this compatibility migration. No URL, slug, canonical, status, or publishedAt field is modified by the migration.

## Eligibility enforcement

- Public `/api/projects` supports `isPortfolioVerified=true`; that predicate is applied in the database query before ordering, pagination, and total count. The existing published-only predicate remains in force. Normal project detail reads and sitemap slug discovery are not filtered, so a false record remains publicly accessible and indexable.
- Related-project fetching requests only verified projects and then applies a generic published + verified check before deduplication and the four-card limit.
- Homepage project proof sections are filtered in their database queries.
- Project catalog and the construction/interior catalog requests pass the verified filter. Service landing-page project proof modules also request only verified projects.
- The public Prisma query returns the new Boolean field as part of the project record; the web type includes it.
- The eligibility helper contains no project-ID exception. The only ID-specific data operation is the migration instruction setting Project #65 false, as explicitly requested.

## Test and build results

- `npm run prisma:generate -w @hathanh/api` — PASS (local generated client only; no database access).
- `npx prisma validate --schema apps/api/prisma/schema.prisma` — PASS using a temporary local placeholder `DATABASE_URL` for schema config; no DB connection.
- Migration validation — PASS via regression assertions for column/default, published backfill, and #65 override order. Migration was not applied to a database.
- `npm run test:portfolio` — PASS (API, Web, Admin).
- `npm run test:seo` — PASS.
- `npm run check:encoding` — PASS.
- `npm run build -w @hathanh/api` — PASS.
- `npm run build -w @hathanh/web` — PASS.
- `npm run build -w @hathanh/admin` — PASS.
- `git diff --check` — PASS.

The Web/Admin builds needed access to their already-declared Google Fonts; successful builds were run after that access was allowed. An initial parallel Web build hit a transient Turbopack font resolver error; the isolated rerun passed.

## Files changed

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260927160000_project_portfolio_verification/migration.sql`
- `apps/api/src/modules/admin.controller.ts`
- `apps/api/src/modules/app.service.ts`
- `apps/api/src/modules/public.controller.ts`
- `apps/api/src/modules/project-portfolio-eligibility.ts`
- `apps/api/src/modules/project-portfolio-eligibility.spec.ts`
- `apps/admin/src/components/admin-app.tsx`
- `apps/admin/src/lib/portfolio-verification.ts`
- `apps/admin/src/lib/portfolio-verification.spec.ts`
- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/project-catalog-pagination.ts`
- `apps/web/src/lib/project-portfolio-selection.ts`
- `apps/web/src/lib/project-portfolio-selection.spec.ts`
- `apps/web/src/lib/related-content.ts`
- `package.json`
- `project-verification-eligibility.md`

## Handoff

FIELD_ADDED=YES
MIGRATION_REQUIRED=YES
BACKFILL_STRATEGY=Default false for new projects; preserve currently published records as verified for legacy continuity, then explicitly set Project 65 false. The carry-forward is not an individual proof audit of the remaining 134 records.

ADMIN_CONTROL_ADDED=YES
PUBLIC_API_FIELD_ADDED=YES
RELATED_PROJECT_FILTER_ADDED=YES
PROJECT65_HARDCODED=NO (no ID-based eligibility rule; ID 65 is named only in the requested migration backfill and test fixture)

TEST_PASS=YES
BUILD_PASS=YES

PR_URL=PENDING
READY_FOR_DEPLOY=AFTER_PR_REVIEW_AND_MIGRATION_APPROVAL

DEPLOYED=NO
MIGRATION_RUN=NO
PRODUCTION_DATA_CHANGED=NO
