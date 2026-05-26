# Part Checklist

## Pre-Implementation

- [x] Stage 001 complete (tokens available)
- [x] Existing primitive barrel reviewed
      (`src/lib/components/ui/index.ts`)

## Implementation

- [x] `EditorialEyebrow.svelte` — 9px / 0.18em / semibold uppercase, muted
- [x] `Logline.svelte` — italic Crimson Pro, 56ch max
- [x] `Ornament.svelte` — brass `❦` between gradient rules,
      `role="separator"`
- [x] `DropCap.svelte` — brass DM Serif Display 3.5em float-left initial
- [x] Barrel exports updated in `src/lib/components/ui/index.ts`

## Post-Implementation

- [x] `pnpm check:tokens` clean
- [x] `pnpm check` clean
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean
- [x] Evidence captured
- [x] Final entry appended to `impl.log.md`
