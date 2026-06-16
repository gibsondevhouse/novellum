---
title: Render Domain Proposal Review Sections
slug: part-001-render-domain-proposal-review-sections
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-002-proposal-review-actions
started_at: 2026-06-16
completed_at: 2026-06-16
estimated_duration: 1d
---

## Objective

Add route-level proposal review sections that use the existing WorldbuildingProposedTile component for pending scan suggestions.

## Scope

**In scope:**

- Group proposals by domain/category.
- Render empty, loading, error, and populated states.
- Keep proposal detail concise and review-oriented.

**Out of scope:**

- Creating a separate full-screen review console unless route density requires it.

## Implementation Steps

1. Inspect WorldbuildingProposedTile props and proposal schema.
2. Build a domain proposal section/container if needed.
3. Render filtered pending proposals in worldbuilding routes.
4. Add component coverage for empty and populated states.

## Files

**Create:**

- `src/modules/world-building/components/WorldbuildingProposalReviewSection.svelte`
- `tests/world-building/worldbuilding-proposal-review-section.test.ts`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/modules/world-building/index.ts`

**Reference:**

- `src/modules/world-building/components/WorldbuildingProposedTile.svelte`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`

## Acceptance Criteria

- [x] WorldbuildingProposedTile is reachable from product UI.
- [x] Pending proposals are grouped with author-readable headings.
- [x] No proposal raw JSON is shown by default.

## Edge Cases

- Proposal entity kinds may not map cleanly to current domain labels.
- Long proposal text must not break card layout.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
