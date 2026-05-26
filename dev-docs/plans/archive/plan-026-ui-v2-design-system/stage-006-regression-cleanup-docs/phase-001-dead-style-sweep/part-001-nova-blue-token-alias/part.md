---
title: Nova-blue token alias to candle
slug: part-001-nova-blue-token-alias
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-dead-style-sweep
started_at: 2026-05-13
completed_at: 2026-05-13
estimated_duration: 0.1d
---

## Objective

Close out the residual `--color-nova-blue` surface across the
real workspace (≈60 files, excluding `.claude/worktrees/`
scratch) by redefining the legacy token to alias the v2 candle
accent. A single edit at the token layer cascades the warm
palette to every consumer — focus rings, AI accents, scene
rows, hub progress, settings selectors, world-building panels,
chat surfaces — without per-file sweeps.

## Scope

**In scope:**

- `src/styles/tokens.css` — redefine `--color-nova-blue`,
  `--color-nova-blue-hsl`, `--color-border-focus`, and
  `--color-ai-tint` in both dark and light scopes.
- Expose `--color-candle-hsl` so consumers that derive from
  the legacy HSL alias still resolve.
- Fix one undefined token reference in the showcase route
  (`--color-nova-blue-10` → candle 24% color-mix).

**Out of scope:**

- Renaming `--color-nova-blue` → `--color-candle` at every call
  site (deferred to a future cleanup; the alias is stable).
- Removing the `--color-ai-tint` token (still has consumers).
- Changing `--color-info` (genuine semantic info, kept blue).

## Implementation Steps

1. Add `--color-candle-hsl: 34 80% 69%` to dark scope.
2. Rewrite `--color-nova-blue: #3b82f6` → `var(--color-candle)`.
3. Rewrite `--color-nova-blue-hsl: 217 91% 60%` →
   `var(--color-candle-hsl)`.
4. Rewrite `--color-border-focus: rgba(59, 130, 246, 0.6)` →
   `rgba(240, 187, 112, 0.6)` (candle @ 60%) in both scopes.
5. Rewrite `--color-ai-tint: rgba(99, 102, 241, 0.08)` →
   `color-mix(in srgb, var(--color-candle) 8-10%, transparent)`
   in both scopes.
6. Fix `src/routes/styles/+page.svelte` undefined
   `--color-nova-blue-10` → `color-mix(in srgb, var(--color-candle) 24%, transparent)`.
7. Run full gate suite.

## Files

**Update:**

- `src/styles/tokens.css`
- `src/routes/styles/+page.svelte`

## Acceptance Criteria

- [x] `pnpm check:tokens` clean (322 files / 0 violations).
- [x] `pnpm check` zero errors.
- [x] `pnpm lint` clean.
- [x] `pnpm lint:css` clean.
- [x] `pnpm test` 1059/1059 passing.

## Notes

`--color-info` retains its blue value because it is the
canonical "info" semantic (data migrating, neutral notices).
Visual baseline regen is deferred to phase-002 of this stage.
