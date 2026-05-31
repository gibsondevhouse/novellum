---
title: Map Expanded Character Fields on Save
slug: part-002-map-expanded-character-fields-on-save
part_number: 2
status: review
owner: Planner Agent
assigned_to: Backend Agent
phase: phase-002-ui-and-save-parity
started_at: 2026-05-30
completed_at: 2026-05-30
estimated_duration: 0.5d
---

## Objective

Ensure generated Character drafts persist advanced psychological and voice fields to `/api/db/characters` instead of dropping them to defaults.

## Scope

**In scope:**

- Update `GeneratedEntityModal.saveDraft` character branch to map expanded fields.
- Preserve existing required fields and array defaults.
- Keep non-character save branches behaviorally unchanged.

**Out of scope:**

- Character dossier UI edits for these fields (already supported by existing panels).
- DB schema changes.

## Implementation Steps

1. Extend `WorldbuildCharacterDraft` usage in modal save branch.
2. Map advanced fields (`coreDesire`, `fear`, `contradiction`, `strength`, `flaw`, `storyRole`, `externalGoal`, `internalNeed`, `stakes`, `voiceSummary`, `speechPattern`) into POST body.
3. Confirm defaults remain safe for missing values.
4. Run targeted manual save smoke check through generation modal.

## Files

**Create:**

- None

**Update:**

- `src/modules/world-building/components/GeneratedEntityModal.svelte`

## Acceptance Criteria

- [x] Character save payload includes all expanded generated fields
- [x] No regression in existing character creation flow
- [x] Non-character save branches remain unaffected

## Edge Cases

- Drafts missing one or more advanced fields should still save with empty-string defaults.

## Notes

This part is required for true end-to-end parity; schema expansion alone does not populate persisted records.
