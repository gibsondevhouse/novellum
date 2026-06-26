---
title: Brainstorm Interface
slug: part-001-brainstorm-interface
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-session-ui
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: 0.75d
---

## Objective

Build Svelte 5 components for the brainstorm session UI: input form and proposal review surface.

## Scope

**In scope:**

- `BrainstormSession.svelte` — main container component
- `BrainstormInput.svelte` — text area for seed idea
- `ProposalCard.svelte` — individual proposal display
- `ProposalList.svelte` — grid/list of proposals
- Accessibility attributes (ARIA labels, focus management)
- Design token usage for all colors, spacing, typography

**Out of scope:**

- Accept/reject logic (that's part of stage-003)
- Nova task routing (that's part-002)

## Implementation Steps

1. Create component directory `src/modules/nova/components/brainstorm/`
2. Build `BrainstormInput.svelte` with text area and seed idea capture
3. Build `ProposalCard.svelte` to display a single seed
4. Build `ProposalList.svelte` to arrange proposals by category
5. Build `BrainstormSession.svelte` to compose the flow
6. Add accessibility attributes (labels, ARIA roles)
7. Use design tokens for all styling
8. Test with different proposal types and data
9. Run `pnpm lint:css` to ensure token compliance
10. Verify visual appearance and responsive behavior

## Files

**Create:**

- `src/modules/nova/components/brainstorm/BrainstormSession.svelte`
- `src/modules/nova/components/brainstorm/BrainstormInput.svelte`
- `src/modules/nova/components/brainstorm/ProposalCard.svelte`
- `src/modules/nova/components/brainstorm/ProposalList.svelte`

## Acceptance Criteria

- [ ] All components created and rendering
- [ ] Seed input captures text correctly
- [ ] Proposals display with proper categorization
- [ ] Accessibility attributes present (ARIA, labels, focus)
- [ ] Design tokens used throughout (no hardcoded colors/spacing)
- [ ] `pnpm lint:css` passes
- [ ] `pnpm check` passes with zero errors

## Edge Cases

- Empty proposals list
- Very long proposal descriptions (truncate or wrap)
- Multiple proposals in same category
- Responsive layout on mobile

## Notes

Use Svelte 5 Runes for all reactivity. Follow the Nova component patterns from plan-031.
Reference the design token guide in `src/styles/tokens.css`.
