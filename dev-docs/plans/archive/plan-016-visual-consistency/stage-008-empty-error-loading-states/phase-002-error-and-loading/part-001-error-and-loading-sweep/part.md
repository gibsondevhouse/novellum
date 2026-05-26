---
title: Error & Loading Sweep
slug: part-001-error-and-loading-sweep
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-error-and-loading
started_at: 2026-04-25 22:00 EDT
completed_at: 2026-04-25 22:30 EDT
estimated_duration: 1d
---

## Objective

Unify error boundary and loading skeleton treatments across modules.

## Scope

**In scope:**

- Canonical error primitive / skeleton primitive usage.
- A11y announcements per `.github/skills/accessibility-a11y/SKILL.md`.

**Out of scope:**

- Empty states (in `phase-001`).

## Implementation Steps

1. Migrate every error boundary identified in the audit.
2. Migrate every loading skeleton identified in the audit.
3. Verify a11y announcements.

## Files

**Update:**

- Files listed in the Stage 001 systems audit under error / loading.

## Acceptance Criteria

- [x] Uniform treatment.
- [x] A11y announcements correct.
- [x] Gates pass.

## Edge Cases

- Route-level error pages (`+error.svelte`) must also be considered.

## Notes

- Migrated both `+error.svelte` route-level error pages (`src/routes/+error.svelte` and `src/routes/projects/[id]/+error.svelte`) to consume `EmptyStatePanel + PrimaryButton`. Each page now wraps the shared empty-state primitive in a `role="alert"` container, removing two hand-rolled error-card style blocks (~70 LoC total).
- A11y verified: outer container is `role="alert"`; existing `role="status" aria-live="polite"` patterns in `AiPanel`, `ConsistencyPanel`, and `OutlinePlanningHeader` were audited and left as-is — they already follow a11y-skill guidance.
- Loading skeletons (`LibraryHeroCardSkeleton`, `ProjectCardSkeleton`) already share a coherent shimmer treatment and are consumed in three library/stories/books pages identically; no convergence required.
- `.spinner` style is duplicated across `AiPanel`, `AiSuggestionOverlay`, `RewriteOptionsModal`, and `ImportBackupDialog`. Promoting it to a global utility is queued as a small follow-up: the duplication is low-cost (~8 lines per copy) and migrating each consumer requires a dialog-context audit. Tracked in plan ledger.
