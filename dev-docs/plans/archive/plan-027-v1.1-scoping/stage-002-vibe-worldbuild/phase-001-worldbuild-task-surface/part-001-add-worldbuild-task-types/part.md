---
title: Add Worldbuild Task Types
slug: part-001-add-worldbuild-task-types
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-worldbuild-task-surface
started_at: 2026-05-26T18:10:00Z
completed_at: 2026-05-26T18:52:04Z
estimated_duration: 3d
---

## Objective

Add worldbuild stage task types and parsing logic for premise, worldspec, research briefs, and populated world bible artifacts.

## Scope

**In scope:**

- Task resolver entries and orchestrator routing for worldbuild stage keys.
- Structured output schemas + parsing guards.
- Context scoping updates for stage-appropriate retrieval.

**Out of scope:**

- Final UI choreography for accept/reject controls.
- Author-stage task handlers.

## Implementation Steps

1. Add worldbuild task family types and schema definitions.
2. Route worldbuild stage tasks through prompt builder and model invocation path.
3. Add parser tests covering valid and malformed model responses.

## Files

**Create:**

- `src/lib/ai/pipeline/worldbuild-agent.ts`
- `src/lib/ai/pipeline/worldbuild-schemas.ts`
- `tests/ai/pipeline/worldbuild-agent.test.ts`

**Update:**

- `src/lib/ai/types.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/prompt-builder.ts`
- `src/lib/ai/context-engine.ts`
- `src/lib/ai/orchestrator.ts`
- `src/lib/ai/index.ts`

## Acceptance Criteria

- [ ] Worldbuild task types cover premise, worldspec, research, and world-bible population.
- [ ] Each worldbuild response path validates schema before returning output.
- [ ] Context assembly remains scoped (no whole-manuscript blob prompts).
- [ ] Tests cover parse success, parse failure, and fallback messaging.

## Edge Cases

- Partial JSON responses must surface structured parse errors, not silent truncation.
- Missing required fields in model output must block auto-persistence.

## Notes

Keep model output machine-usable by default; prose-only output is not acceptable for these stages.
