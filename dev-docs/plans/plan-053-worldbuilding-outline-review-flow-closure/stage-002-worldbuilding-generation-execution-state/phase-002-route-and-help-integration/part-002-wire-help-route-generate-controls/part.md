---
title: Wire Help Route Generate Controls
slug: part-002-wire-help-route-generate-controls
part_number: 2
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-002-route-and-help-integration
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Keep the worldbuilding help route behavior consistent with the main route generation service and state model.

## Scope

**In scope:**

- Use the shared service in the help route.
- Display missing-context and failure states consistently.
- Avoid duplicated prompt seed logic.

**Out of scope:**

- Changing help content hierarchy beyond required action copy.

## Implementation Steps

1. Replace help route Generate callbacks with shared service calls.
2. Reuse status display components or helpers.
3. Add route coverage for at least one allowed and one blocked domain.

## Files

**Create:**

- `tests/world-building/worldbuilding-help-generate-controls.test.ts`

**Update:**

- `src/routes/projects/[id]/world-building/help/+page.svelte`

**Reference:**

- `src/routes/projects/[id]/world-building/help/+page.svelte`

## Acceptance Criteria

- [ ] Help route Generate behavior matches main route behavior.
- [ ] Help route no longer opens Nova as the only execution effect.
- [ ] Blocked generation gives clear missing dependency copy.

## Edge Cases

- Help route can be visited directly before domain data has hydrated.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
