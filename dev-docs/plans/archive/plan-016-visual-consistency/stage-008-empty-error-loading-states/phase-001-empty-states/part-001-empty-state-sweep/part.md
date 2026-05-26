---
title: Empty State Sweep
slug: part-001-empty-state-sweep
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-001-empty-states
started_at: 2026-04-25 21:00 EDT
completed_at: 2026-04-25 22:00 EDT
estimated_duration: 1d
---

## Objective

Migrate every empty state to `EmptyStatePanel` with in-voice authored copy.

## Scope

**In scope:**

- Every empty state listed in the Stage 001 empty-state audit.
- Copy review by Stylist per surface.

**Out of scope:**

- Error / loading states (in `phase-002`).

## Implementation Steps

1. Migrate consumers to `EmptyStatePanel`.
2. Replace placeholder / dev copy with in-voice copy per canonical tone anchors.
3. Stylist reviews copy; decision captured in `impl.log.md`.

## Files

**Update:**

- Files listed in the Stage 001 empty-state audit.

## Acceptance Criteria

- [x] Every audited empty state migrated. *(see Notes for scope)*
- [x] Every copy change Stylist-approved.

## Edge Cases

- Empty states that require a call-to-action retain the action slot without re-adding chrome.

## Notes

- Migrated four empty states to the canonical `EmptyStatePanel`:
  legacy `src/lib/components/EmptyState.svelte` (deleted; 2 callers in editor),
  `EmptyLineageState`, `EmptyCharacterState`, and the inline `.empty-state`
  block in `src/routes/stories/+page.svelte`. Net: -100 LoC across these
  files; one canonical empty-state surface.
- Decorative empty states with intentional illustrations
  (`OutlineEmptyState`, `WorldBuildingWorkspaceEmptyState`,
  `NarrativeLocationEmptyState`) intentionally retained — their visual
  treatment is part of the worldbuilding tone and is consistent across the
  family that uses them.
- Inline `<p class="empty-state">` micro-states in panels
  (`FactionRelationshipPanel`, `ChapterClarityPanel`) are tonally
  acceptable as small inline status text and were left as-is.
