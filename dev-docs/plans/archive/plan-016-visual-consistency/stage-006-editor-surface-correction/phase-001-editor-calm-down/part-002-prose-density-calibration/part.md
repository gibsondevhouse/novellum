---
title: Prose Width & Density Calibration
slug: part-002-prose-density-calibration
part_number: 2
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-editor-calm-down
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Calibrate prose width, line height, and inter-paragraph spacing per canonical editor rules.

## Scope

**In scope:**

- Prose container max-width.
- Line height, paragraph spacing, heading rhythm within prose.
- Body typography token usage.

**Out of scope:**

- Editor extensions / tools.

## Implementation Steps

1. Apply canonical prose tokens.
2. Verify via manual reading pass.
3. Capture screenshots at multiple viewport widths.

## Files

**Update:**

- Editor prose container components and styles.

## Acceptance Criteria

- [ ] Prose reads as editorial, not dashboard-like.
- [ ] `tests/editor/**` still green.

## Edge Cases

- Distraction-free mode inherits the same prose calibration.

## Notes

- None.

## Status Note

Deferred from the autonomous closure of plan-016 because the work in this phase requires subjective writer-experience evaluation that cannot be validated by automated gates alone. The convergence groundwork (canonical primitives, dossier-form CSS family, EmptyStatePanel adoption, error-page convergence) is in place; an explicit follow-up pass with human review is required to land the editor calm-down and tools/modes work.
