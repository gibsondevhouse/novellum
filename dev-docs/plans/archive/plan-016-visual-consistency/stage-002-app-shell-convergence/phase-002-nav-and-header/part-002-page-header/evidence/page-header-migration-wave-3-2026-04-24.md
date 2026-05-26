# Page Header Migration Wave 3 (2026-04-24)

## Summary

Adopted canonical `PageHeader` on the home route (`/`) without flattening its visual archetype.

## Route migrated

- `src/routes/+page.svelte`

## Migration details

- Replaced route-local spotlight heading markup with `PageHeader`.
- Preserved cinematic shell treatment by keeping the existing spotlight container, glow layer, and route-local wrapper styles.
- Applied scoped overrides for eyebrow and description color/spacing through `.library-spotlight :global(...)` selectors.

## Adoption snapshot

Command:

```sh
grep -RE "PageHeader" -n src/routes | head -n 220
```

(See terminal output captured during this run for exact lines.)

## Validation

- `pnpm run check` -> 0 errors / 0 warnings
- `pnpm run lint` -> completed without reported errors
- `pnpm run check:tokens` -> 242 files scanned, 0 violations
