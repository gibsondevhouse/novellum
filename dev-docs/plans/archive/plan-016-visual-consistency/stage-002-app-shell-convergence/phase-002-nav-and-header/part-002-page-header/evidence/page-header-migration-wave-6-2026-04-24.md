# Page Header Migration Wave 6 (2026-04-24)

## Summary

Migrated the scene editor route header to canonical `PageHeader`, preserving editor-specific control density and context cues.

## Route migrated

- `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`

## Migration details

- Replaced route-local top-level header markup with `PageHeader`.
- Kept breadcrumb context above the canonical header.
- Moved existing editor controls (word count, save state, history toggle) into `PageHeader` `actions` slot.
- Applied route-scoped style overrides to maintain restrained editor typography while using the shared primitive.

## Adoption snapshot

Command:

```sh
grep -RE "PageHeader" -n src/routes | head -n 340
```

(See terminal output captured in this run.)

## Validation

- `pnpm run check` -> 0 errors / 0 warnings
- `pnpm run lint` -> completed without reported errors
- `pnpm run check:tokens` -> 242 files scanned, 0 violations
