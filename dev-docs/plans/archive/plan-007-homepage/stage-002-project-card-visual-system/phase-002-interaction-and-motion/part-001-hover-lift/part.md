---
title: Hover Lift
slug: part-001-hover-lift
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-interaction-and-motion
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Apply a two-property hover lift to `ProjectCard` — border escalation from default to strong, and shadow step from `--shadow-xs` to `--shadow-md` — using `--ease-standard` at `--duration-fast`, so each card feels tangibly responsive to pointer intent.

## Scope

**In scope:**

- `.project-card` resting state: `border: 1px solid var(--color-border-default)`, `box-shadow: var(--shadow-xs)`, `transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)`
- `.project-card:hover`: `border-color: var(--color-border-strong)`, `box-shadow: var(--shadow-md)`
- Remove the existing `.project-card:hover { border-color: var(--color-teal); }` rule — replace with the rgba token approach above (teal hover is replaced by the more premium `--color-border-strong` escalation)
- Touch devices: `:hover` styles do not fire on touch-only devices — acceptable, no touch-specific handling needed

**Out of scope:**

- `transform: translateY(-2px)` on hover (kept out to avoid triggering compositor layers on every card; shadow elevation is sufficient)
- Focus-visible styles (handled by global `:focus-visible` in `app.css`)

## Implementation Steps

1. In `ProjectCard.svelte` `<style>`, update `.project-card`:
   - Set `border: 1px solid var(--color-border-default)`
   - Set `box-shadow: var(--shadow-xs)`
   - Add `transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)`
2. Replace `.project-card:hover { border-color: var(--color-teal); }` with:
   - `border-color: var(--color-border-strong)`
   - `box-shadow: var(--shadow-md)`
3. Run `pnpm run lint` and `pnpm run check`

## Files

**Update:**

- `src/modules/project/components/ProjectCard.svelte`

## Acceptance Criteria

- [ ] Hovering a card visibly elevates its border from subtle to strong (confirmed in DevTools)
- [ ] Shadow deepens perceptibly on hover
- [ ] Transition is smooth at `--duration-fast` (100ms) — no jank or flash
- [ ] Removing pointer returns card to resting state
- [ ] No teal border on hover (replaced by rgba border escalation)
- [ ] Zero lint and type errors

## Edge Cases

- `--shadow-xs` and `--shadow-md` must be present in `tokens.css` — confirm before starting; if absent, refer to `design-system.md` and add them in the same commit
- `transition` shorthand on `box-shadow` and `border-color` must not conflict with any `transition: all` already applied to `.project-card` — remove any `transition: var(--transition-border)` shorthand that may have been set previously

## Notes

- `--color-border-strong` is `rgba(255,255,255,0.16)` — a step up from `--color-border-default` `rgba(255,255,255,0.08)`. This reads as a luminance lift rather than a colour change, which is more premium than the current teal flash.
- `--shadow-xs: 0 1px 2px rgba(0,0,0,0.5)` / `--shadow-md: 0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)` — both defined in `design-system.md`.
