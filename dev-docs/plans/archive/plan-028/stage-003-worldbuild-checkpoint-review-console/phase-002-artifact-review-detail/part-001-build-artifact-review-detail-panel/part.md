---
title: Build Artifact Review Detail Panel
slug: part-001-build-artifact-review-detail-panel
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-002-artifact-review-detail
started_at: 2026-05-26T19:20:00Z
completed_at: 2026-05-26T19:30:00Z
estimated_duration: 2d
---

## Objective

Render a review detail panel for checkpoint artifacts that includes payload content, path provenance, and validation summaries.

## Scope

**In scope:**

- Artifact content viewer for worldbuild stage outputs.
- Metadata/provenance panel (artifact id, task key, stage, hierarchy path, produced/review timestamps, parser version).
- Validation/health section highlighting schema parse outcomes and warnings.

**Out of scope:**

- Accept/reject action submission.
- Artifact-to-artifact diffing.

## Implementation Steps

1. Build detail panel layout and data bindings for selected checkpoint.
2. Add metadata/provenance sections with explicit scope context.
3. Add validation summary rendering and invalid-artifact highlighting.

## Files

**Create:**

- `tests/outline/worldbuild-artifact-review-detail.test.ts`

**Update:**

- `src/routes/projects/[id]/outline/+page.svelte`
- `src/modules/world-building/stores/world-building-store.svelte.ts`
- `src/modules/outline/components/OutlineDetailCard.svelte`

## Acceptance Criteria

- [x] Content and metadata are both visible for selected artifact.
- [x] Full hierarchy path and stage key are always displayed.
- [x] Invalid or warning states are visually distinct and test-covered.
- [x] Panel handles empty/missing artifact selection without crashes.

## Edge Cases

- Malformed metadata rows must degrade gracefully with safe fallback labels.
- Selecting deleted checkpoints should return to safe empty state.

## Notes

Do not mutate lifecycle state from this panel in phase-002.
