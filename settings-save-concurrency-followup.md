# Settings Save Concurrency — follow-up after PR #25

## Scope and diagnosis

Baseline: `be355ff817a137cdba37f3845f8f32d601a35ef7` (PR #25; confirmed as current GitHub `main`).

PR #25 added version checks for content-record saves, but Settings remained on a separate path. The old Admin Settings read returned bare values without per-key `updatedAt`; its PATCH sent `{ key, value }`, and the API used an unconditional Prisma `upsert`. Thus a stale Settings form could still overwrite newer Settings even though Post/Project saves had concurrency protection.

The Settings path now reads a version for each key and conditions each write on that exact version inside a serializable transaction. Stale/missing-row races return 409; missing or malformed version preconditions are rejected before writing. Multi-key writes are atomic. Object patches recursively preserve omitted keys; arrays, including `[]`, and explicit `null` replace the submitted field intentionally.

## Request and data flow

| Landing / editor | Admin read request | Admin save request | Settings key | Version source |
|---|---|---|---|---|
| `/dich-vu/xay-nha-tron-goi` — `XayNhaTronGoiEditor` | `/api/cms/settings/snapshot?keys=site.landing.xayNhaTronGoi` | `PATCH /api/cms/settings` | `site.landing.xayNhaTronGoi` | That row's `Setting.updatedAt` |
| `/dich-vu/thi-cong-nha-xuong` — `ThiCongNhaXuongEditor` | `/api/cms/settings/snapshot?keys=site.servicePages.thiCongNhaXuong` | `PATCH /api/cms/settings` | `site.servicePages.thiCongNhaXuong` | That row's `Setting.updatedAt` |

The Admin proxy paths map to API `GET /api/admin/settings/snapshot?keys=...` and `PATCH /api/admin/settings`. The public service pages load Settings through the web API (`/api/site-settings`); the server-side data helper requests the configured API `/settings` route. Admin writes remain guarded by the existing JWT and Admin role.

All existing callers of this generic Settings save path were moved to the versioned contract so an older caller cannot keep writing unconditionally: the two priority landing editors, office-interior and furniture-manufacturing service editors, About settings, general site identity settings, and the multi-key theme/settings panel. Additional keys used by those panels are `site.servicePages.thiCongNoiThatVanPhong`, `site.servicePages.sanXuatThiCongNoiThat`, `site.pages.about`, `site.identity`, `site.theme`, `site.homepage`, `site.ai`, and `site.smtp`.

## Conflict and preservation behavior

- A Settings snapshot returns `{ exists, value, updatedAt }` per requested key. A missing key has `exists=false` and `updatedAt=null`; it is created only if it is still absent.
- Successful PATCH returns the new per-key values and versions. The next save uses those returned versions.
- A 409 keeps the editor draft, fetches a separate latest snapshot for comparison, disables another Save, and does not auto-merge or retry. The operator can explicitly discard the draft and reload.
- Multi-key Settings forms submit one batch; a stale key rolls back the entire transaction.
- Recursive JSON merge retains omitted/hidden settings fields. The tests cover nested hidden values and preserve both a non-null canonical and a null canonical when those fields are omitted. Explicit `null` and empty arrays remain representable.
- Empty `testimonials` and `stats` survive write/read as `[]`. The four service landing renderers now omit those sections for empty lists; no synthetic testimonial/rating is created by the empty-list path.

## Verification evidence

HTTP/database integration ran against a disposable MySQL 8 container bound only to `127.0.0.1`, using the `hathanh_settings_test` database. The test initializes that throwaway schema with `prisma db push --skip-generate` (not a migration), writes synthetic test rows, reads them through the real Nest HTTP app, deletes the rows, then the container is stopped and removed. No production database or settings were used.

Observed integration results:

- Unauthenticated snapshot: 401; Viewer snapshot: 200; Viewer write: 403.
- Missing expected version: 428; malformed version: 400; neither writes a row.
- Valid create/update: 200 and read-back contains the submitted value plus version.
- Stale second session: 409; first session's value remains unchanged.
- Two simultaneous writes with one version: exactly one 200 and one 409.
- Multi-key save with one stale key: 409 and no partial write.
- Stale create-if-absent: 409; original row remains unchanged.
- Public settings response: 200; both landing keys expose `stats=[]` / `testimonials=[]`, retain omitted fields and canonical values, and empty lists select no testimonial/rating render path.

Executed checks:

| Check | Result |
|---|---|
| `npm run test:settings:unit` | PASS |
| `npm run test:settings:http` | PASS — real HTTP + disposable MySQL |
| `npm run test:cms-data-integrity` | PASS |
| `npm run test:published-at` | PASS — existing Post/Project publishedAt regression suite |
| `npm run test:seo` | PASS |
| `npm run check:encoding` | PASS |
| Admin/API/Web TypeScript and workspace builds (`npm run build`) | PASS |
| Lint | NOT_CONFIGURED — no lint script exists in the root/workspace package manifests |
| `git diff --check` | PASS |

The build needed network permission to fetch existing Google Fonts. No source changes were made to bypass that environment dependency.

## Dots production handoff — after deploy only

For the two priority landings, verify the per-key snapshot version corresponds to the value read; perform one valid, pre-approved safe test save and read it back; verify a stale request returns 409 with data unchanged; check omitted canonical/other fields remain intact; confirm empty `stats`/`testimonials` do not render demo content; confirm display prices remain separate from the estimator; then verify public output after the normal cache refresh. Do not use a locked Phase 1 URL or an important live landing as a destructive stale-save test. If no safe production fixture/key is authorized, record production conflict QA as `NOT_VERIFIED` rather than testing by overwriting live content. Warranty/testimonial editing remains paused until this QA passes.

## Handoff

```ini
BASE_SHA=be355ff817a137cdba37f3845f8f32d601a35ef7
ROOT_CAUSE=Settings GET omitted updatedAt and Settings PATCH unconditionally upserted; PR #25 concurrency guard covered content records, not Settings
AFFECTED_ADMIN_COMPONENTS=XayNhaTronGoiEditor; ThiCongNhaXuongEditor; ThiCongNoiThatVanPhongEditor; SanXuatNoiThatEditor; AboutPageSettingsPanel; ThemeSettingsPanel; SettingsPanel
ACTUAL_SETTINGS_READ_ENDPOINT=GET /api/admin/settings/snapshot?keys=... (Admin-facing proxy: /api/cms/settings/snapshot?keys=...)
ACTUAL_SETTINGS_SAVE_ENDPOINT=PATCH /api/admin/settings (Admin-facing proxy: /api/cms/settings)
AFFECTED_SETTING_KEYS=site.landing.xayNhaTronGoi; site.servicePages.thiCongNhaXuong; site.servicePages.thiCongNoiThatVanPhong; site.servicePages.sanXuatThiCongNoiThat; site.pages.about; site.identity; site.theme; site.homepage; site.ai; site.smtp

SETTINGS_VERSION_EXPOSED=YES_PER_KEY_UPDATED_AT
SETTINGS_EXPECTED_VERSION_SENT=YES
ATOMIC_VERSION_GUARD=PASS_SERIALIZABLE_TRANSACTION_AND_CONDITIONAL_UPDATE
STALE_SETTINGS_HTTP_STATUS=409
STALE_SETTINGS_DATA_UNCHANGED=PASS
MULTI_KEY_ALL_OR_NOTHING=PASS
MISSING_VERSION_REJECTED=428; MALFORMED=400
CREATE_CONFLICT_HANDLED=409
CONFLICT_UI_PRESERVES_UNSAVED_DRAFT=PASS_NO_AUTORETRY

EMPTY_TESTIMONIAL_PERSISTENCE=PASS_DISPOSABLE_DB
EMPTY_STATS_PERSISTENCE=PASS_DISPOSABLE_DB
EMPTY_PUBLIC_RENDER=PASS_LOCAL_RENDER_GUARD; PRODUCTION_NOT_VERIFIED
NO_SYNTHETIC_RATING=PASS_LOCAL_EMPTY_DATA_PATH
UNTOUCHED_JSON_FIELDS_PRESERVED=PASS
CANONICAL_REGRESSION=PASS_NULL_AND_VALUE_OMITTED_FIELDS_PRESERVED
PUBLISHED_AT_REGRESSION=PASS_EXISTING_UNIT_SUITE
PRICING_ESTIMATOR_REGRESSION=PASS_EXISTING_DATA_INTEGRITY_SUITE

UNIT_TESTS=PASS
HTTP_DATABASE_INTEGRATION_TESTS=PASS_DISPOSABLE_LOCAL_MYSQL
TYPECHECK=PASS
LINT=NOT_CONFIGURED
BUILD=PASS

BRANCH=fix/settings-save-concurrency
COMMIT_SHA=9835418b4cc951ae4c215e9462a664fbc79eaa77
PUSH=YES
PR_URL=https://github.com/cuongdesignnb/ha-thanh-home/pull/26

PRODUCTION_CONTENT_CHANGED=NO
MIGRATION_RUN=NO
SEED_RUN=NO
DEPLOYED=NO
PRODUCTION_QA=NOT_RUN

SETTINGS_CODE_STATUS=READY_FOR_REVIEW
SETTINGS_PRODUCTION_BLOCKER=OPEN_UNTIL_DEPLOY_AND_QA
DOTS_SERVICE_SAVE=PAUSED_UNTIL_SETTINGS_QA_PASS
```
