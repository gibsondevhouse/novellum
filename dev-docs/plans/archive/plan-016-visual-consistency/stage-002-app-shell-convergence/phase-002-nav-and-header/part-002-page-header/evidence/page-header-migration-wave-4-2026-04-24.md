# Page Header Migration Wave 4 (2026-04-24)

## Summary

Migrated the world-building character detail route to canonical `PageHeader` while preserving route-specific behavior.

## Route migrated

- `src/routes/projects/[id]/world-building/characters/[charId]/+page.svelte`

## Migration details

- Replaced route-local top-level heading row with `PageHeader`.
- Kept breadcrumb context in the existing panel and moved destructive action flow into `PageHeader` actions slot.
- Removed obsolete local heading CSS selectors (`.header-row`, `.header-subtitle`) and aligned responsive action behavior.

## Adoption snapshot

Command:

```sh
grep -RE "PageHeader" -n src/routes | head -n 260
```

(See captured terminal output in this run.)

## Validation

- `pnpm run check` -> 0 errors / 0 warnings
- `pnpm run lint` -> completed without reported errors
- `pnpm run check:tokens` -> 242 files scanned, 0 violations
