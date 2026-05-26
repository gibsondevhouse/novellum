# Part Checklist

## Pre-Implementation

- [x] Stage 002 in-progress (primitives stable enough to consume)
- [x] `--header-height: 52px` token confirmed defined

## Implementation

- [x] `AppHeader.svelte` height consumes `--header-height`
- [x] `displayEyebrow` derived value per-route added (Page / Room / Muse /
      Workshop / Library / Preferences / Assets)
- [x] Title rendered in `--font-display` (DM Serif Display) at `--text-lg`
- [x] Header icon recoloured to `--color-brass`
- [x] Candle-tinted gradient underline accent landed
- [x] Horizontal padding bumped to `--space-6` (v2 alignment)

## Post-Implementation

- [x] `pnpm check:tokens` clean
- [x] `pnpm check` clean
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean
- [ ] Visual regression baselines reviewed (deferred to Stage 006)
- [ ] Lucide icon extraction to `src/lib/assets/icons/` (deferred to a
      follow-up phase under this stage)
- [ ] Sidebar dual-band visual tune (deferred — current
      `SidebarPrimaryNav` + `ActiveProjectSection` + `SidebarSettingsNav`
      structure already maps to v2 Global / Project bands)
