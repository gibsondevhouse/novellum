---
title: Add Author Task Types
slug: part-001-add-author-task-types
part_number: 1
status: draft
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-author-task-surface
started_at: ~
completed_at: ~
estimated_duration: 3d
---

## Objective

Add task definitions and parser logic for author-stage artifacts, including scene draft sidecars and revision-pack diagnostics.

## Scope

**In scope:**

- Task family for premise, outline, scene draft, and revision pack.
- Structured schema parsing for non-prose artifacts.
- Prose-plus-metadata contract for scene drafting.

**Out of scope:**

- Final UI acceptance controls.
- Continuity-agent rewrite.

## Implementation Steps

1. Add author stage schemas and task routing keys.
2. Integrate author stage prompt construction and context policy use.
3. Add tests for valid/invalid schema payloads and sidecar requirements.

## Files

**Create:**

- `src/lib/ai/pipeline/author-agent.ts`
- `src/lib/ai/pipeline/author-schemas.ts`
- `tests/ai/pipeline/author-agent.test.ts`

**Update:**

- `src/lib/ai/types.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/prompt-builder.ts`
- `src/lib/ai/context-engine.ts`
- `src/lib/ai/orchestrator.ts`
- `src/lib/ai/index.ts`

## Acceptance Criteria

- [ ] Author task catalog covers premise, outline, scene draft, and revision pack.
- [ ] Scene draft contract requires prose payload plus metadata sidecar.
- [ ] Non-prose author stages reject malformed JSON with clear parse errors.
- [ ] Tests cover schema validation and parser fallback behavior.

## Edge Cases

- Scene draft sidecar missing required IDs must block acceptance.
- Revision-pack issue lists must preserve severity ordering.

## Notes

Keep scene-draft generation bounded to assigned scene turn and POV.
