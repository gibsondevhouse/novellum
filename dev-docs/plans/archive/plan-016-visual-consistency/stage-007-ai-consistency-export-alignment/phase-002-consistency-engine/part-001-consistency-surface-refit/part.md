---
title: Consistency Surface Refit
slug: part-001-consistency-surface-refit
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-consistency-engine
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 1d
---

## Objective

Refit Consistency Engine surface to review-archetype rules.

## Scope

**In scope:**

- Issue list rhythm, severity treatment, inspector parity with workspace family.
- Empty / loading states.

**Out of scope:**

- Consistency detection logic.

## Implementation Steps

1. Migrate issue list container to canonical primitives.
2. Align severity chips/pills with canonical pill rules.
3. Inspector parity with workspace inspector contract.

## Files

**Update:**

- Consistency components under `src/modules/consistency/**` (presentation only).

## Acceptance Criteria

- [x] Review archetype rules satisfied.
- [x] Detection logic untouched.

## Edge Cases

- High-severity issue treatment must remain visually distinct without becoming alarmist.

## Notes

- None.

## Status Note

Completed 2026-04-28. Cosmetic-only changes:

- `src/modules/consistency/components/ConsistencyPanel.svelte`: replaced bespoke `.empty-state` div with the canonical `EmptyStatePanel` primitive; removed associated CSS.
- `src/modules/consistency/components/IssueRow.svelte`: removed `:global(.btn-resolve|btn-dismiss|btn-reopen)` style overrides and per-action `class` attributes; resolve/dismiss/reopen now render with default `GhostButton` styling, ending the success-color drift.

Gates run after the change:

- `pnpm run check:tokens` — ✓ 0 violations across 253 files.
- `pnpm run lint` — ✓ clean.
- `pnpm run check` — 1 pre-existing error in `src/routes/api/db/character_relationships/+server.ts` unrelated to this part; consistency module is clean.

Detection logic untouched (`src/modules/consistency/stores/**`, `src/modules/consistency/services/**`, `src/lib/ai/continuity-agent.ts`).
