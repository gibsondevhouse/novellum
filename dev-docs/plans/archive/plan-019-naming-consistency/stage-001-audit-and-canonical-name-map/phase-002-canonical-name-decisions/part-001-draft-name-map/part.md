---
title: Draft Name Map
slug: part-001-draft-name-map
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-002-canonical-name-decisions
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Decide canonical names for every route, module, and conflicted
component identified in phase-001's inventory, and capture each
decision with rationale in `evidence/name-map.md`.

## Scope

**In scope:**

- One canonical-name decision per row in the phase-001
  inventory.
- Redirect-required flag for any retired route segment that has
  ever been linked to from in-app navigation, breadcrumbs, or
  external doc URLs.

**Out of scope:**

- Implementation of the renames themselves (Stages 003–005).

## Implementation Steps

1. Open `phase-001/.../evidence/inventory.md`.
2. For each conflict row, propose a canonical name following
   these tie-breakers in order:
   1. The name used in the most-recently-updated authoritative
      doc ([dev-docs/routing-context.md](../../../../../routing-context.md)
      or
      [dev-docs/architecture.md](../../../../../architecture.md)).
   2. The name used by the route segment (URL is what users
      bookmark; keep it stable when possible).
   3. The clearer, less-jargon English noun.
3. For each non-conflict row, the canonical name equals the
   current name unless the current name is misleading (e.g. a
   component whose file name describes the *implementation*
   rather than the *screen*).
4. Write `evidence/name-map.md` with columns:
   `| Path | Current name | Canonical name | Rationale | Redirect required? |`.
5. Add an "Open questions for user" subsection for any decision
   you cannot resolve from the docs alone.

## Files

**Create:**

- `evidence/name-map.md`
- `checklist.md`
- `impl.log.md`

**Update:**

- *(none until user sign-off in part-002)*

## Acceptance Criteria

- [ ] `evidence/name-map.md` covers every row from phase-001's
      inventory.
- [ ] Every conflict row has a populated rationale.
- [ ] "Open questions for user" subsection exists (may be empty
      if the docs settled everything).
- [ ] `Redirect required?` column is `yes` for every retired
      URL segment.

## Edge Cases

- Editor `/editor` and `/editor/[sceneId]` share a folder name
  but render different surfaces. Decide whether to:
  (a) keep the URL shape and only rename the inner component
  files;
  (b) split into two separate URL roots
  (e.g. `editor/` and `scene/`).
  Both are valid; (a) is the lower-risk default and what the
  plan-level Risks table assumes.
- `bible/` is "Formerly Bible" per `repo-structure.md` but the
  module folder is still `modules/bible/` AND
  `modules/world-building/`. Decide which is canonical and which
  is the duplicate to delete.

## Notes

- This part produces a *proposal*. Approval comes in part-002.
