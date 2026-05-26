---
title: Export Surface Refit
slug: part-001-export-surface-refit
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-003-export
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Refit Export surface to production-archetype rules so it reads as a finishing room.

## Scope

**In scope:**

- Export options panel, preview rhythm, action footer.
- Empty / loading / in-progress states.

**Out of scope:**

- Export pipeline logic.

## Implementation Steps

1. Migrate containers to canonical panel primitives.
2. Align option groups and action footer.
3. Verify export pipeline behavior via `tests/export/**`.

## Files

**Update:**

- Export components under `src/modules/export/**` (presentation only).

## Acceptance Criteria

- [ ] Production archetype rules satisfied.
- [ ] Pipeline logic untouched.
- [ ] `tests/export/**` still green.

## Edge Cases

- Long-running export in-progress state must announce correctly for a11y.

## Notes

- None.

## Status Note

Deferred from the autonomous closure of plan-016 because the work in this phase requires subjective writer-experience evaluation that cannot be validated by automated gates alone. The convergence groundwork (canonical primitives, dossier-form CSS family, EmptyStatePanel adoption, error-page convergence) is in place; an explicit follow-up pass with human review is required to land the editor calm-down and tools/modes work.
