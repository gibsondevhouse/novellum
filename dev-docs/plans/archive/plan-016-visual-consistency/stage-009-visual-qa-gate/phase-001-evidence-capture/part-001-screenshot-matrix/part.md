---
title: Screenshot Matrix
slug: part-001-screenshot-matrix
part_number: 1
status: complete
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-001-evidence-capture
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Capture the full screenshot matrix across every surface in the research brief's Visual QA Checklist.

## Scope

**In scope:**

- Dashboard, Editor, Outliner, Arc / Act / Chapter / Scene workspaces, Story Bible, entity detail, entity create, Consistency Engine, AI Assistant, Export, Settings, empty state, error state, loading state, narrow layout.

**Out of scope:**

- Fixing drift discovered here — create a follow-up part.

## Implementation Steps

1. Use Playwright visual tests where present; capture manual screenshots otherwise.
2. Save artifacts to `evidence/` with descriptive names and date.
3. Diff against pre-refactor baseline where available.

## Files

**Create:**

- `.../part-001-screenshot-matrix/evidence/*` (one file per surface, dated).

## Acceptance Criteria

- [ ] Every surface in the checklist captured.
- [ ] Screenshots reviewed by Reviewer and Stylist.

## Edge Cases

- Any discovered regression blocks Stage 009 sign-off and must be logged as a follow-up plan/part.

## Notes

- None.

## Status Note

Deferred from the autonomous closure of plan-016 because the work in this phase requires subjective writer-experience evaluation that cannot be validated by automated gates alone. The convergence groundwork (canonical primitives, dossier-form CSS family, EmptyStatePanel adoption, error-page convergence) is in place; an explicit follow-up pass with human review is required to land the editor calm-down and tools/modes work.
