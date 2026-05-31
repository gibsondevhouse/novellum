---
title: Expand Character Schema and Prompt
slug: part-002-expand-character-schema-and-prompt
part_number: 2
status: in-progress
owner: Planner Agent
assigned_to: AI Agent
phase: phase-001-context-contract-and-prompt
started_at: 2026-05-31
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Upgrade character generation output requirements so draft payloads include advanced dossier fields that are already persisted by the character API contract.

## Scope

**In scope:**

- Expand character schema string used by `/api/worldbuilding/generate` prompt builder.
- Update prompt rules to force non-empty advanced string fields when generating characters.
- Incorporate structured target/avoid hints into prompt assembly.
- Expand mock character drafts so local mock mode mirrors new schema.
- Update shared draft typing to include advanced fields.

**Out of scope:**

- Persisting these fields to DB save path (handled in Phase 002).
- Faction/lineage context-priority behavior (handled in Stage 002).

## Implementation Steps

1. Update `ENTITY_SCHEMA.character` with advanced field keys.
2. Add prompt sections that explicitly apply target/avoid name behavior.
3. Expand `mockDrafts('character')` to include advanced fields.
4. Extend `WorldbuildCharacterDraft` typing to include new fields.
5. Verify parse fallback remains resilient when model output is partially malformed.

## Files

**Create:**

- None

**Update:**

- `src/routes/api/worldbuilding/generate/+server.ts`
- `src/lib/ai/pipeline/worldbuild-agent.ts`
- `src/lib/ai/pipeline/worldbuild-schemas.ts`

## Acceptance Criteria

- [x] Character generation schema includes all advanced dossier fields
- [x] Prompt includes explicit target-name prioritization and avoid-name exclusion rules
- [x] Mock character drafts include advanced fields
- [x] Type definitions compile with new fields across generation consumers

## Edge Cases

- If a target name is already present in existing DB names, the prompt must instruct elaboration rather than exact duplicate creation.

## Notes

This part changes generation quality and contract strictness; keep JSON-only response constraints explicit to minimize parse failures.
