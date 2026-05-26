# UI Button Audit Remediation

Date: 2026-05-06

## Scope

Follow-up fixes for the issues identified in [button-audit-report.md](button-audit-report.md).

## Fixes Implemented

1. Project settings dead-end fixed.

- Changed LAST PROJECT -> Settings link to `/settings`.
- Updated in [src/lib/components/ActiveProjectSection.svelte](../../../../src/lib/components/ActiveProjectSection.svelte).

1. Export entry points repaired.

- Added URL-flag based export open flow (`?export=1`) so sidebar export works from outside project layout context.
- Added project-layout watcher to open export modal when query flag is present.
- Added query cleanup on modal close.
- Ensured export modal metadata input bindings are always string-backed to avoid runtime prop errors.
- Updated in:
  - [src/lib/components/ActiveProjectSection.svelte](../../../../src/lib/components/ActiveProjectSection.svelte)
  - [src/routes/projects/[id]/+layout.svelte](../../../../src/routes/projects/[id]/+layout.svelte)
  - [src/modules/export/components/ExportModal.svelte](../../../../src/modules/export/components/ExportModal.svelte)

1. Help/docs labeling mismatch fixed.

- Sidebar footer item now routes to `/settings/about` and is labeled `About`.
- Updated in [src/lib/components/AppSidebar.svelte](../../../../src/lib/components/AppSidebar.svelte).

1. AI nav behavior clarified.

- LAST PROJECT AI item renamed to `AI Assistant`.
- Route updated to `/projects/{id}/editor?panel=ai`.
- Editor now auto-opens Nova panel when `panel=ai` is present.
- Updated in:
  - [src/lib/components/ActiveProjectSection.svelte](../../../../src/lib/components/ActiveProjectSection.svelte)
  - [src/modules/editor/components/EditorShell.svelte](../../../../src/modules/editor/components/EditorShell.svelte)
  - [src/lib/components/SidebarItem.svelte](../../../../src/lib/components/SidebarItem.svelte) (query-aware active-state matching)

## Verification

- `pnpm run check`: pass (0 errors, 0 warnings)
- `pnpm run lint`: pass (0 errors; 1 pre-existing warning in tests)
- Browser validation:
  - Project settings no longer routes to `/projects/{id}/settings` (404 route removed from nav).
  - Hub export opens `Export Manuscript` dialog.
  - Sidebar export sets `?export=1` and opens `Export Manuscript` dialog.
  - Closing export dialog removes the `export` query flag.
  - AI Assistant route lands on editor with `panel=ai` and opens Nova.
  - About footer link lands on `/settings/about`.

## Evidence

- [Post-fix validation screenshot](../screenshots/19-post-fix-validation.png)
- [Sidebar export with query flag + modal](../screenshots/16-export-button-result.png)
- [Project settings 404 from pre-fix audit](../screenshots/18-project-settings-link-404.png)
