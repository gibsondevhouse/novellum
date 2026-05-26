# Implementation Log

> Append-only.

## 2026-05-24 — Stylist Agent — editorial primitives added

- Added `src/lib/components/ui/EditorialEyebrow.svelte` (9px, 0.18em
  letter-spacing, semibold uppercase, `--color-text-muted`).
- Added `src/lib/components/ui/Logline.svelte` (italic Crimson Pro via
  `--font-prose`, `--leading-relaxed`, max-width 56ch).
- Added `src/lib/components/ui/Ornament.svelte` (`❦` glyph between gradient
  rules in `--color-brass`, `role="separator"`, accepts `glyph` and `label`
  props).
- Added `src/lib/components/ui/DropCap.svelte` (DM Serif Display 3.5em
  float-left initial in `--color-brass`; takes first character of `letter`
  prop).
- Updated `src/lib/components/ui/index.ts` barrel to export all four.
- Bumped `PageHeader.svelte` eyebrow micro-anatomy to v2 spec
  (9px / 0.18em / semibold) — captured here because it landed in the same
  pass.

### Gate results

- `pnpm check:tokens` clean.
- `pnpm check` clean.
- `pnpm lint` clean.
- `pnpm lint:css` clean.

Part status → `complete`. Phase status → `complete`.
