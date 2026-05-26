---
title: Route & Shell Inventory
slug: part-001-route-shell-inventory
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-001-surface-inventory
started_at: 2026-04-24
completed_at: 2026-04-25 22:00 EDT
estimated_duration: 1d
---

## Objective

Produce the Surface Inventory Table required by the research brief: every reachable SvelteKit route and major UI surface, with shell pattern, main components, visual fit, drift severity, and notes.

## Scope

**In scope:**

- Enumerate every route under `src/routes/**`.
- Inspect every module surface under `src/modules/**` (project, editor, outliner, bible, consistency, export, settings).
- Record shell pattern (canonical shell / route-local shell / broken), module owner, and reachability.
- Flag unreachable, broken, or visually incomplete routes.

**Out of scope:**

- Any code changes except temporary rendering fixes strictly required to capture a screenshot. Any such change is documented in `impl.log.md`.

## Implementation Steps

1. Walk `src/routes/**` and record every `+page.svelte` / `+layout.svelte`.
2. Cross-reference the research brief's "Surfaces to Audit" list (26 surfaces) and mark coverage.
3. For each surface record: route path, page component, layout component, module owner, primary purpose, major child components, reachable-from-navigation flag, uses-shared-shell flag, visual-fit rating, drift severity (`Critical` / `High` / `Medium` / `Low` / `None`).
4. Record unreachable or broken routes explicitly with the reason.
5. Save the table to `evidence/surface-inventory-YYYY-MM-DD.md`.

## Files

**Create:**

- `dev-docs/plans/plan-016-visual-consistency/stage-001-inventory-evidence/phase-001-surface-inventory/part-001-route-shell-inventory/evidence/surface-inventory-YYYY-MM-DD.md`

**Update:**

- None

## Acceptance Criteria

- [x] Every route under `src/routes/**` appears in the table.
- [x] Every surface in the research brief's list appears in the table.
- [x] Broken / unreachable routes are listed with reason.
- [x] Architect and Stylist review the table in `impl.log.md`.

## Edge Cases

- Dynamic routes (`[id]`, `[slug]`) are recorded once with a representative example.
- Routes that render but throw in development are flagged as `broken`.

## Notes

- This table is the single source of truth for Stages 002–008 work.
