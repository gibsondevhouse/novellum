# Evidence: Notification Badge Implementation

**Date:** 2026-05-31  
**Part:** part-001-wire-top-nav-and-domain-badges  
**Phase:** phase-002-add-category-notification-badges

## Files Created

### `src/modules/world-building/components/WorldbuildingNotificationBadge.svelte`
- Svelte 5 Runes component with `count: number` prop
- Renders only when `count > 0` — no empty state rendered
- Brass-tinted pill badge with `role="status"` and `aria-label="{n} proposal(s) pending review"`
- Uses only design tokens: `var(--color-brass)`, `var(--radius-full)`, `var(--space-1)`, `var(--font-weight-semibold)`
- Exported from `index.ts` as `WorldbuildingNotificationBadge`

## Files Updated

### `src/lib/components/ui/PillNav.svelte`
- Added `dot?: boolean` to `PillNavItem` type (backward-compatible — no existing callers affected)
- Added `display: inline-flex; align-items: center; gap: 4px` to `.pill-nav__btn` for clean dot alignment
- Renders `<span class="pill-nav__indicator" aria-hidden="true">` when `item.dot` is true
- Indicator is a 5px brass-colored circle, `opacity: 0.85`

### `src/lib/components/AppHeader.svelte`
- Added imports: `WorldBuildingTopSectionId` (type), `WorldbuildingDomainId` (type), `hasPendingForCategory` (function)
- Added `TOP_SECTION_TO_DOMAIN` mapping: `characters→personae`, `locations→atlas`, `lore→archive`, `plot-threads→threads`, `timeline→chronicles`; `help` maps to `undefined` (no dot)
- `worldBuildingTopItems` $derived now maps each item to include `dot: hasPendingForCategory(domainId)` — reactive to `$state` changes in suggestion store
- `hasPendingForCategory` reads module-level `$state`; Svelte 5 tracks this correctly inside `$derived.by()`

### `src/routes/projects/[id]/world-building/+page.svelte`
- Fixed pre-existing TypeScript error: changed `import type { DomainCounts } from './+page.js'` to `import type { DomainCounts } from './help/+page.js'` (the correct source)
- Added `WorldbuildingNotificationBadge` and `getPendingCountForCategory` imports via barrel
- Added `<WorldbuildingNotificationBadge count={getPendingCountForCategory(domainId)} />` to each `.domain-tile__title-row`

### `src/routes/projects/[id]/world-building/help/+page.svelte`
- Same badge addition: `WorldbuildingNotificationBadge` and `getPendingCountForCategory` imported via barrel
- Badge added to each `.domain-tile__title-row` — users on the `/help` route (the actual landing page) see pending counts per domain

### `src/modules/world-building/index.ts`
- Added `WorldbuildingNotificationBadge` component export
- Added `getPendingCountForCategory`, `hasPendingForCategory`, `getTotalPendingCount` selector exports from `worldbuild-suggestion-state.svelte.js`

## Quality Gates

```
pnpm check     — 1746 files, 0 errors (11 pre-existing CSS warnings; 1 pre-existing Svelte +page.svelte type error now FIXED)
pnpm lint      — 9 pre-existing errors in untouched components; 0 new errors
pnpm lint:css  — 1 pre-existing error in IndividualsWorkspaceShell.svelte (untouched); 0 new errors
pnpm test      — 203 files / 1472 tests PASS
pnpm check:tokens — 336 files, 0 violations
```

## Reactivity Design

`hasPendingForCategory(domainId)` inside `$derived.by()` in AppHeader correctly tracks the module-level `$state([])` in `worldbuild-suggestion-state.svelte.ts`. When `refreshSuggestions()` updates the store (on project load), all derived consumers — including AppHeader's PillNav dots and domain tile badges — recompute automatically.

## Canon Safety

Badge count reflects `pending_review` status only. Accepted proposals are excluded from the count, so the badge never implies canon. Visual treatment (brass-amber, non-green) is distinct from accepted/success states.
