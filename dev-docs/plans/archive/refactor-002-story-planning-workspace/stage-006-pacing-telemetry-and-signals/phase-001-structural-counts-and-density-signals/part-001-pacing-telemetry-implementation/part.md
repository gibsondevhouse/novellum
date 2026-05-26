---
title: Pacing Telemetry Implementation
slug: part-001-pacing-telemetry-implementation
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-structural-counts-and-density-signals
started_at: ~
completed_at: ~
estimated_duration: 3d
---

## Objective

Provide immediate, actionable structural telemetry in the planning workspace to improve pacing decisions.

## Scope

**In scope:**

- Count metrics for acts, chapters, scenes, and beats
- Density state computation and presentation
- Missing-content warnings in navigator and detail cards

**Out of scope:**

- Historical pacing analytics dashboards
- AI-generated pacing recommendations

## Implementation Steps

1. Implement pacing telemetry service for structural metrics and density bands.
2. Wire metrics into planning header and hierarchy rows.
3. Add card-level signals for missing or sparse planning content.
4. Ensure telemetry updates correctly after reorder and edit actions.
5. Validate responsiveness on large project datasets.

## Files

**Create:**

- src/modules/outliner/services/pacing-telemetry.ts
- src/modules/outliner/components/PacingSignal.svelte

**Update:**

- src/modules/outliner/components/OutlinePlanningHeader.svelte
- src/modules/outliner/components/ChapterGroup.svelte
- src/modules/outliner/components/OutlineDetailCard.svelte
- src/routes/projects/[id]/outline/+page.ts

## Acceptance Criteria

- [ ] Metrics remain accurate after structure edits and navigation changes
- [ ] Density signals are understandable and visually restrained
- [ ] Telemetry does not add noticeable UI latency

## Edge Cases

- Very small projects should not show noisy warnings.
- Missing optional fields should not crash telemetry computations.

## Notes

Favor deterministic thresholds and document them in module docs.
