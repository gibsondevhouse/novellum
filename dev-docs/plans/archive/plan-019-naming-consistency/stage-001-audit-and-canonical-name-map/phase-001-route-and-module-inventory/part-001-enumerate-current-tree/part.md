---
title: Enumerate Current Tree
slug: part-001-enumerate-current-tree
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-route-and-module-inventory
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Produce `evidence/inventory.md` — a complete read-only catalogue
of every route folder, module folder, and prominent component
file with a one-sentence "renders / does what" description.

## Scope

**In scope:**

- `src/routes/**` — every folder containing a `+page.svelte` or
  `+layout.svelte`.
- `src/modules/**` — every domain module's top-level folder and
  its public `index.ts` re-exports.
- Components inside `src/modules/**/components/` whose names do
  not obviously map to the section they render. This is a
  judgement call: include any component referenced by more than
  one route or whose name does not appear in user-facing UI
  copy.

**Out of scope:**

- `src/lib/components/` (shared primitives — naming there is
  governed by the design-system, not this plan).
- `src/lib/db/`, `src/lib/server/**` (server-side; not part of
  the user-facing rename).
- API routes (`src/routes/api/**`).

## Implementation Steps

1. Run `find src/routes -name '+page.svelte' -o -name '+layout.svelte'`
   and list every result with its directory.
2. Run `ls src/modules` and list each module folder.
3. For each module, read `index.ts` and list the public exports.
4. Cross-reference: for each route, grep for
   `from '\$modules/<x>'` to record which modules it consumes.
5. Identify duplicates / near-duplicates by inspection
   (`bible/` ↔ `world-building/`, `consistency/` ↔
   `continuity/`, `outline/` ↔ `outliner/`, plus any others
   surfaced).
6. Write the result to
   `evidence/inventory.md` using a fixed table format:
   `| Path | Type (route/module/component) | Renders | Imports | Conflict-with |`.

## Files

**Create:**

- `dev-docs/plans/plan-019-naming-consistency/stage-001-audit-and-canonical-name-map/phase-001-route-and-module-inventory/part-001-enumerate-current-tree/checklist.md`
- `dev-docs/plans/plan-019-naming-consistency/stage-001-audit-and-canonical-name-map/phase-001-route-and-module-inventory/part-001-enumerate-current-tree/impl.log.md`
- `dev-docs/plans/plan-019-naming-consistency/stage-001-audit-and-canonical-name-map/phase-001-route-and-module-inventory/part-001-enumerate-current-tree/evidence/inventory.md`

**Update:**

- *(none — read-only part)*

## Acceptance Criteria

- [ ] `evidence/inventory.md` covers 100% of the in-scope tree
      (compare line count of the inventory tables against
      `find` / `ls` output to confirm).
- [ ] Every entry has a populated "Renders" column. No `TBD`s.
- [ ] At least the four known conflicts
      (`bible/`/`world-building/`, `consistency/`/`continuity/`,
      `outline/`/`outliner/`, `editor/` route split) appear in
      a "Conflicts" subsection.

## Edge Cases

- A module with **no** route consumer (e.g. `assets/`,
  `reader/`) is not a conflict but should still be listed.
- The `+layout.svelte.bak` file is noted with the comment
  "stale, removed in stage-006".

## Notes

- This part is pure research. If you find yourself wanting to
  rename anything, stop — that decision lives in
  phase-002 part-001.
