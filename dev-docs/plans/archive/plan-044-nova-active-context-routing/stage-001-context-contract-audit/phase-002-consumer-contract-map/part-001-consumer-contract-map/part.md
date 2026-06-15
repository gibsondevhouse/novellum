---
title: Consumer Contract Map
slug: part-001-consumer-contract-map
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-consumer-contract-map
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Define which fields each Nova mode and subcomponent requires, tolerates, or must reject.

## Scope

**In scope:**

- Map consumers including composer, chat service, Agent loop, Draft Engine, outline generation panel, and context disclosure.
- Classify context as required, optional, or deep-link override.
- Define user-facing disabled/error behavior for missing context.

**Out of scope:**

- Changing prompts beyond context correctness.
- Adding new Nova modes.

## Implementation Steps

1. Read all Nova components/services that accept `projectId`, `activeSceneId`, or `activeChapterId`.
2. Record required fields by mode and workflow.
3. Define error/empty states for missing context.
4. Save the consumer contract map.

## Files

**Create:**

- `evidence/consumer-contract-map-evidence-2026-06-09.md`

**Update:**

- None

**Reference:**

- `src/routes/+layout.svelte`
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaAuthorDraftEngine.svelte`
- `src/modules/nova/services/chat-service.ts`
- `dev-docs/02-architecture/routing.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] Every consumer has an explicit context requirement.
- [ ] Draft Engine chapter requirement is documented.
- [ ] Ask/Write/Agent behavior for missing context is defined.

## Edge Cases

- Ask mode can work without a scene but generation prompts usually cannot.
- Agent tools may accept explicit IDs from the model; UI context still needs guarding.

## Notes

Keep this part scoped to Nova Active Context Routing. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
