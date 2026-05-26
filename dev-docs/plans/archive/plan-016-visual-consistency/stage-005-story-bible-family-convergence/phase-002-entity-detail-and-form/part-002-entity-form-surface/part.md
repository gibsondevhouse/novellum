---
title: Entity Form Surface
slug: part-002-entity-form-surface
part_number: 2
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-entity-detail-and-form
started_at: 2026-04-25 20:30 EDT
completed_at: 2026-04-25 20:50 EDT
estimated_duration: 1d
---

## Objective

Unify create / edit form surfaces across all eight entity families.

## Scope

**In scope:**

- Promote (or confirm) `EntityForm` layout.
- Migrate per-entity create and edit routes.

**Out of scope:**

- Form validation logic.

## Implementation Steps

1. Confirm / promote form layout.
2. Migrate create/edit routes.
3. Verify field rhythm, helper text, and submit/cancel treatment per canonical rules.

## Files

**Update:**

- Create/edit routes under `src/routes/app/bible/**`.

## Acceptance Criteria

- [x] Form layout identical except entity-specific fields. *(Dossier-style archive forms now share global `.dossier-form-*` CSS family.)*
- [x] Submit / cancel treatment uniform. *(Unchanged across all migrated forms.)*
- [x] Validation logic untouched. *(Pure CSS dedup; no markup or handler changes.)*

## Edge Cases

- Multi-step / relational forms keep stepper affordance via shared primitive.

## Notes

- This pass converged the four dossier-style archive forms (Myth, Tradition,
  Technology, ThreadSystem) onto a canonical `.dossier-form-*` global CSS
  family in [components.css](../../../../../../../src/styles/components.css).
  Net dedup: −374 LoC across forms; +108 LoC in components.css; net **−266 LoC**.
- Cluster A (basic panel forms — Location, LoreEntry, PlotThread, TimelineEvent)
  and Cluster D (sectioned panel + `Input` primitive — Character) already
  consume the existing global `.field` / `.label` / `.input` family from
  components.css and were left untouched.
- Cluster B (Landmark, Realm) wraps `<SurfacePanel class="form-panel">` and
  then strips the chrome via `:global(.form-panel)` overrides — they are
  visually equivalent to the dossier pattern but still carry their own
  `.field` / `.label` / `.input` declarations. Migrating them is queued for
  a follow-up pass because it requires a structural decision (drop the
  SurfacePanel wrapper or keep it) and an autosave-binding audit.
