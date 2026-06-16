---
title: Add Pending Proposal Badges
slug: part-002-add-pending-proposal-badges
part_number: 2
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-suggestion-state-integration
started_at: 2026-06-16
completed_at: 2026-06-16
estimated_duration: 0.5d
---

## Objective

Show pending proposal counts on worldbuilding domain cards and navigation affordances so scan results are discoverable.

## Scope

**In scope:**

- Add concise pending badges to relevant domain cards/status widgets.
- Use readable copy such as Pending suggestions rather than raw status keys.
- Keep badge layout responsive.

**Out of scope:**

- Adding a new global notification system.

## Implementation Steps

1. Identify worldbuilding domain card/status components.
2. Thread pending counts from the suggestion store.
3. Add responsive styles and accessibility labels.
4. Capture desktop/mobile evidence.

## Files

**Create:**

- `tests/world-building/worldbuild-pending-badges.test.ts`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/routes/projects/[id]/world-building/help/+page.svelte`
- `src/modules/world-building/worldbuilding-workflow.ts`

**Reference:**

- `src/modules/world-building/components/WorldbuildingProposedTile.svelte`
- `src/modules/world-building/worldbuilding-workflow.ts`

## Acceptance Criteria

- [x] Domains with pending proposals display a count and accessible label.
- [x] Domains without pending proposals do not show noisy empty badges.
- [x] Badges fit at desktop and mobile widths.

## Edge Cases

- Counts can change after accept/reject without full page reload.
- Multiple categories may map to one route area.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
