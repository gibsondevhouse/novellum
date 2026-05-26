---
title: Entity Detail Surface
slug: part-001-entity-detail-surface
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-entity-detail-and-form
started_at: 2026-04-25 19:45 EDT
completed_at: 2026-04-25 19:55 EDT
estimated_duration: 1d
---

## Objective

Unify the entity detail surface across all eight entity families.

## Scope

**In scope:**

- Promote (or confirm) `EntityDetail` layout.
- Migrate per-entity detail routes.

**Out of scope:**

- Create/edit form surface (in part 002).

## Implementation Steps

1. Confirm / promote detail layout.
2. Migrate detail routes.
3. Screenshot evidence for at least three entity types.

## Files

**Update:**

- Detail routes under `src/routes/app/bible/**`.

## Acceptance Criteria

- [x] Detail layout identical except entity-specific fields.
- [x] Gates pass.

## Edge Cases

- Relationship sections render as slotted content with a uniform section primitive.

## Notes

- None.
