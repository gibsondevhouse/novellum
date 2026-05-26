# Scroll & Padding Sweep Evidence (2026-04-24)

## Summary

Completed Phase 003 Part 001 normalization pass for shell-level scroll ownership and duplicate horizontal padding drift.

## Files Updated

- `src/routes/projects/[id]/+layout.svelte`
- `src/routes/projects/[id]/hub/+page.svelte`
- `src/routes/books/[id]/+page.svelte`
- `src/routes/styles/+page.svelte`
- `src/routes/settings/migrate/+page.svelte`

## Changes

1. Removed nested layout-level scrolling in project shell:
   - `mode-content` no longer sets `overflow: auto`; root AppShell main content remains primary scroll owner.
2. Removed duplicate horizontal route padding from top-level shells that already render inside AppShell horizontal padding:
   - Hub page shell (`.hub`) now uses vertical-only padding.
   - Reader page shell (`.reader-shell`) now uses vertical-only padding.
   - Styles page shell (`.styles-page`) now uses vertical-only padding.
   - Migrate page shell (`.migrate-page`) now uses vertical-only padding.
3. Preserved archetype-specific internals:
   - Editor/inspector/local panel scrolling was not modified.
   - Settings surfaces remain utility/full-width in behavior (no prose max-width conversion).

## Representative Visual Regression Routes Reviewed

- `/projects/[id]/hub`
- `/books/[id]`
- `/styles`
- `/settings/migrate`
- `/projects/[id]/outline` (control route for split-pane behavior)

## Validation

- `pnpm run check` -> `svelte-check found 0 errors and 0 warnings`
- `pnpm run check:tokens` -> `0 violations`

## Acceptance Mapping

- Padding/max-width consistency: satisfied for normalized shell wrappers.
- Scroll ownership contract: satisfied for shell-level ownership in project layout.
- Visual regression evidence: captured in this artifact with representative route set.
