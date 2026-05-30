# Agent Prompt — Stage 001 Context Grounding

You are implementing Stage 001 of plan-030.

## Objective

Guarantee compact project summary context for Nova whenever `projectId` exists, even when no active scene exists.

## Files

Inspect and modify only as needed:

- `src/modules/nova/services/context-hooks.ts`
- `src/modules/nova/services/chat-service.ts`
- `src/lib/ai/context-engine.ts`
- `src/lib/ai/types.ts`
- `src/lib/ai/prompt-builder.ts`
- `src/lib/server/nova/context-renderers.ts`
- `src/lib/ai/nova-context-types.ts`
- tests under `tests/nova/*` and `tests/ai/*`

## Required Behavior

- If `projectId` exists, include project baseline.
- If `activeSceneId` is missing, do not return empty context.
- If active scene exists, include project baseline plus scene context.
- If outline request, include project baseline plus outline scope.
- Do not send full manuscript by default.
- Surface missing logline/synopsis as explicit missing fields.

## Tests

Add tests for:

- project with zero scenes still includes title/logline/synopsis
- no active scene does not drop project context
- context disclosure includes project baseline
- outline request includes project baseline + outline scope

## Out of Scope

- visual redesign
- autonomous tool-calling
- manuscript auto-apply
- full RAG rewrite
