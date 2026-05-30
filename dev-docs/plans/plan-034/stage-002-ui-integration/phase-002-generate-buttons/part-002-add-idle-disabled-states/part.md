---
title: Add Idle Disabled States
slug: part-002-add-idle-disabled-states
part_number: 2
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-generate-buttons
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add a `canGenerateDomain(domainId, context)` guard to `worldbuilding-generate-actions.ts` and bind `disabled` and `title` attributes on each Generate button in `+page.svelte` so buttons reflect whether generation is currently possible.

## Scope

**In scope:**

- `canGenerateDomain(domainId, context)` returns `{ allowed: boolean; reason: string | null }`
- At this part, checks are lightweight: project has a title, `data.domainCounts` is loaded
- Generate button `disabled` bound to `!canGenerateDomain(...).allowed`
- Generate button `title` attr bound to the `reason` string when disabled

**Out of scope:**

- Full upstream dependency count checks (part-003)
- The `missing-context` state machine state (stage-003)

## Implementation Steps

1. Add `canGenerateDomain(domainId, context: { projectId: string; domainCounts: Record<string, number> })` to `worldbuilding-generate-actions.ts`.
2. Initial checks: project id present, not empty string; domain counts available.
3. In `+page.svelte`, pass domain counts as context and bind `disabled` / `title` to each Generate button.
4. Run `pnpm check` and `pnpm lint`.
5. Screenshot showing a disabled button with tooltip in `evidence/`.

## Files

**Create:**

- None

**Update:**

- `src/modules/world-building/worldbuilding-generate-actions.ts` (add `canGenerateDomain`)
- `src/routes/projects/[id]/world-building/+page.svelte` (bind disabled/title)

## Acceptance Criteria

- [ ] `canGenerateDomain` exported and returns `{ allowed, reason }`
- [ ] Generate buttons are `disabled` when guard returns `allowed: false`
- [ ] Disabled buttons show a `title` tooltip with the reason
- [ ] `pnpm check` and `pnpm lint` pass
- [ ] Screenshot of a disabled state in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
