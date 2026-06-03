# Reviewer Handoff — 2026-06-02

Status: `review`, pending Reviewer Agent sign-off.

Primary changes:

- Added `ManuscriptExportRequest` and delivery preference types.
- Updated `exportProject()` to accept UI-selected profile, metadata, front/back matter, and selected chapter IDs.
- Added deterministic filename and metadata normalization.
- Added `export-delivery.ts` for browser downloads and desktop fallback handling.
- Added `export-chapter-options.ts` and `chapter-selection.ts`.
- Added `ManuscriptExportDialog.svelte` plus format/profile/metadata/formatting/chapter selector components.
- Project hub now opens manuscript export separately from JSON portability export.
- JSON `ExportModal.svelte` now uses the shared browser download helper.
- Added service, helper, component, and E2E tests.
- Updated export module docs.

Notable related fix:

- Removed invalid runtime exports from `src/routes/api/worldbuilding/scan/+server.ts` so SvelteKit production build and Playwright preview can complete.

Known limitations:

- Native desktop file writing remains unimplemented; desktop save falls back to browser download unless an existing safe writer is supplied.
- Metadata is per-export only and is not persisted.
- PDF, custom profiles, and export history remain out of scope.

Validation:

- `pnpm run lint`: pass.
- `pnpm run check`: pass, 0 errors with 11 pre-existing warnings.
- `pnpm run test`: pass, 219 files / 1615 tests.
- `pnpm run check:tokens`: pass, 345 files / 0 violations.
- `pnpm run build`: pass.
- Targeted Playwright manuscript export and project lifecycle specs: pass.
