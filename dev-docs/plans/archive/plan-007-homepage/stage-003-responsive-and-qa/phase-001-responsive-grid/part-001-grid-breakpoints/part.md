---
title: Grid Breakpoints
slug: part-001-grid-breakpoints
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-responsive-grid
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Audit and fine-tune the responsive grid at the four target viewports (1440px, 1024px, 768px, 375px), correcting any layout issues that arise from the Stage 001 grid implementation.

## Scope

**In scope:**

- Test `.project-grid` layout at all four viewports in browser DevTools
- Apply `@media` overrides if `auto-fill minmax(280px, 1fr)` does not produce clean breakpoints at 768px (2-col) and 375px (1-col)
- Ensure `.hub-header` flex-wrap behaviour is safe at 375px
- Verify `--panel-padding` horizontal gutters are consistent at mobile widths

**Out of scope:**

- Print styles
- Tablet landscape orientation special-casing

## Implementation Steps

1. Open `http://localhost:5173/` in Chrome DevTools responsive mode
2. Test at 1440px, 1024px, 768px, 375px — document any column count or overflow issues
3. If auto-fill produces 2 columns at ≥1024px (instead of 3), add explicit `@media (min-width: 1024px)` rule: `grid-template-columns: repeat(3, 1fr)`
4. If needed, add `@media (max-width: 680px)` rule: `grid-template-columns: 1fr`
5. Test `.hub-header` at 375px — if buttons overflow, add `flex-wrap: wrap` and `row-gap: var(--space-3)` to `.hub-actions`
6. Run `pnpm run lint` and `pnpm run check`

## Files

**Update:**

- `src/routes/+page.svelte` (as needed)

## Acceptance Criteria

- [ ] 1440px: 3 columns
- [ ] 1024px: 3 columns
- [ ] 768px: 2 columns
- [ ] 375px: 1 column, no horizontal scroll
- [ ] Header buttons do not overflow on mobile
- [ ] Zero lint and type errors

## Edge Cases

- If the user has 0 or 1 project, single/lone cards must not stretch abnormally — `minmax(280px, 1fr)` handles this with `auto-fill` (empty cells don't stretch)

## Notes

- DevTools shortcut to test: `Cmd+Shift+M` (Chrome) → set custom width values
- Also test empty state and loading skeleton at each breakpoint — skeleton grid should not show horizontal scroll
