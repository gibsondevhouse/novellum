---
title: AI Pipeline Implementation
slug: stage-003-ai-pipeline-implementation
stage_number: 3
status: complete
owner: AI Agent
plan: plan-002-service-layer-and-state-hardening
phases:
  - phase-001-task-resolver-and-context-engine
  - phase-002-prompt-builder-and-model-router
estimated_duration: 6d
risk_level: medium
---

## Goal

Implement the full AI pipeline defined in `dev-docs/ai-pipeline.md`: Task Resolver → Context Engine (all four context policies) → Prompt Builder (structured 5-section template) → Model Router. Replace the naive raw-prompt flow from Path 1 with this pipeline end-to-end. The AI panel must invoke the full pipeline on each request.

## Phases

| #   | Phase                                                                                 | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Task Resolver & Context Engine](phase-001-task-resolver-and-context-engine/phase.md) | `draft` | 3d            |
| 002 | [Prompt Builder & Model Router](phase-002-prompt-builder-and-model-router/phase.md)   | `draft` | 3d            |

## Entry Criteria

- `stage-002-module-store-architecture` is `complete`
- Module stores expose `activeSceneId`, `activeBeatId`, `activeProjectId` etc.
- Repository layer returns all context entities (characters, locations, beats, etc.)
- `dev-docs/ai-pipeline.md`, `dev-docs/context-engine.md`, `dev-docs/prompt-system.md`, `dev-docs/agents-map.md` reviewed

## Exit Criteria

- All phases complete
- `src/lib/ai/task-resolver.ts` maps user action strings to `AiTask` objects
- `src/lib/ai/context-engine.ts` implements all four policies and returns typed `AiContext` per policy
- `src/lib/ai/prompt-builder.ts` produces structured prompts conforming to `prompt-system.md` template
- `src/lib/ai/model-router.ts` selects model by task type; selection is configurable, not hardcoded
- AI panel invokes the full pipeline chain — no raw string prompts
- `dev-docs/ai-pipeline.md` updated with implemented payload shapes
- `pnpm run check` and `pnpm run lint` pass

## Notes

Risk level is `medium` because this stage touches the live OpenRouter API. All integration tests must use a recorded stub response, not live API calls. The Model Router default model for development should be `openai/gpt-4o-mini` to minimize cost during implementation.
