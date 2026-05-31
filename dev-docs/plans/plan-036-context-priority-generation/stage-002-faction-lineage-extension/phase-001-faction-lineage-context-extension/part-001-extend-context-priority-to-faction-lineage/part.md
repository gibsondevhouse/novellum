---
title: Extend Context Priority to Faction and Lineage
slug: part-001-extend-context-priority-to-faction-lineage
part_number: 1
status: review
owner: Planner Agent
assigned_to: AI Agent
phase: phase-001-faction-lineage-context-extension
started_at: 2026-05-30
completed_at: 2026-05-30
estimated_duration: 0.75d
---

## Objective

Extend target/avoid context mechanics from character generation to faction and lineage generation while keeping outputs compatible with current save contracts.

## Scope

**In scope:**

- Add faction/lineage-specific prompt directives for target and avoid hints.
- Enable dialog intent routing for `entityKind = faction | lineage`.
- Keep generated field sets limited to currently persisted faction/lineage shapes.

**Out of scope:**

- Faction DB schema expansion.
- Lineage schema migration from metadata blobs to relational tables.

## Implementation Steps

1. Extend prompt builder branches for `faction` and `lineage` to consume target/avoid hints.
2. Ensure candidate extraction output can be reused across these kinds.
3. Update dialog-kind gating and labels for faction/lineage use.
4. Smoke test generation + save for faction and lineage flows.

## Files

**Create:**

- None

**Update:**

- `src/routes/api/worldbuilding/generate/+server.ts`
- `src/modules/world-building/components/PreGenerationDialog.svelte`
- `src/modules/world-building/components/GenerateButton.svelte`

## Acceptance Criteria

- [x] Faction and lineage prompts include context-priority guidance
- [x] Dialog can submit intent payloads for faction and lineage generation
- [x] Saved faction/lineage records remain valid under current contracts

## Edge Cases

- If no extracted candidates exist, flows must remain fully operational with neutral prompting.

## Notes

Do not introduce additional faction or lineage fields that have no persistence path yet.
