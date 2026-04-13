---
title: Prompt Builder & Model Router
slug: phase-002-prompt-builder-and-model-router
phase_number: 2
status: complete
owner: AI Agent
stage: stage-003-ai-pipeline-implementation
parts:
  - part-001-structured-prompt-builder
  - part-002-model-router
  - part-003-pipeline-integration
estimated_duration: 3d
---

## Goal

Implement the final stages of the AI pipeline: the Prompt Builder (assembles a structured 5-section prompt string from `AiTask` + `AiContext`) and the Model Router (selects the OpenRouter model string by task type). Then wire the complete pipeline into the AI panel server route, replacing the raw-prompt implementation from Path 1.

Reference: `dev-docs/ai-pipeline.md` §Prompt Builder, §Model Router; `dev-docs/prompt-system.md` §Template.

## Parts

| #   | Part                                                                    | Status  |
| --- | ----------------------------------------------------------------------- | ------- |
| 001 | [Structured Prompt Builder](part-001-structured-prompt-builder/part.md) | `draft` |
| 002 | [Model Router](part-002-model-router/part.md)                           | `draft` |
| 003 | [Pipeline Integration](part-003-pipeline-integration/part.md)           | `draft` |

## Entry Criteria

- `phase-001-task-resolver-and-context-engine` is `complete`
- `AiTask` and `AiContext` types are stable

## Exit Criteria

- `src/lib/ai/prompt-builder.ts` exports `buildPrompt(task: AiTask, ctx: AiContext): string` producing ROLE/TASK/CONTEXT/CONSTRAINTS/OUTPUT FORMAT sections
- `src/lib/ai/model-router.ts` exports `routeModel(task: AiTask): string` returning a valid OpenRouter model identifier
- `src/routes/api/ai/+server.ts` uses the full pipeline: task-resolve → build-context → build-prompt → route-model → call OpenRouter
- AI panel still functions end-to-end (manual smoke test passes)
- `dev-docs/ai-pipeline.md` updated with implemented payload shapes
