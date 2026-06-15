---
title: Generation Entrypoint
slug: part-001-generation-entrypoint
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-001-generation-entrypoint
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Ensure all supported outline generation UX uses `/api/ai/outline/generate` and the outline generation state store.

## Scope

**In scope:**

- Redirect Write mode outline intent away from legacy `runAuthorPipelineTask(AUTHOR_OUTLINE)` if still active.
- Keep context sufficiency, provider errors, pending checkpoint loading, abort, retry, and review-ready states intact.
- Add or update tests for the canonical entrypoint.

**Out of scope:**

- Changing generated outline schema.
- Changing worldbuilding readiness rules unless required by entrypoint wiring.

## Implementation Steps

1. Trace current Write mode outline request handling from composer to chat service.
2. Replace legacy author-outline artifact creation with checkpoint generation state or a deliberate unsupported message.
3. Verify `NovaOutlineGenerationPanel` remains the visible generation entrypoint.
4. Update unit/component tests around the chosen entrypoint.

## Files

**Create:**

- `evidence/generation-entrypoint-evidence-2026-06-12.md`

**Update:**

- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/nova/chat-service.test.ts`
- `tests/nova/mode-routing.test.ts`
- `tests/nova/outline-generation-state.test.ts`

**Reference:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/modules/nova/services/author-pipeline-runner.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Supported outline generation requests produce checkpoint-backed review artifacts.
- [x] No supported path creates a legacy `author-outline` artifact for application.
- [x] Existing outline generation review e2e remains meaningful.

## Edge Cases

- Write mode prompts that are conversational should still fall through correctly.
- No-key and context-insufficient states must remain user-safe.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
