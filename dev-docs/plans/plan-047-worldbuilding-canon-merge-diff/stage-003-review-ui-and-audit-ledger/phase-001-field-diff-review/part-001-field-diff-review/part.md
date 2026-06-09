---
title: Field Diff Review
slug: part-001-field-diff-review
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-field-diff-review
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Let authors inspect proposed creates, updates, merges, and links before accepting.

## Scope

**In scope:**

- Field-level before/after display.
- Duplicate candidate display.
- Create versus update/merge decision labels.

**Out of scope:**

- Large visual redesign of worldbuilding shell.
- Auto-selecting merge targets without author visibility.

## Implementation Steps

1. Update proposal card to render diff decisions.
2. Add compact field diff rows for changed fields.
3. Display duplicate/target evidence.
4. Add component tests.

## Files

**Create:**

- `src/modules/world-building/components/WorldbuildingProposalDiffView.svelte`
- `tests/world-building/worldbuilding-proposal-diff-view.test.ts`

**Update:**

- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [ ] Authors can see what will be created or changed.
- [ ] Duplicate candidates are visible before acceptance.
- [ ] UI tests cover create and update/merge displays.

## Edge Cases

- Long fields need truncation/details expansion.
- Arrays and JSON fields need readable diffs.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
