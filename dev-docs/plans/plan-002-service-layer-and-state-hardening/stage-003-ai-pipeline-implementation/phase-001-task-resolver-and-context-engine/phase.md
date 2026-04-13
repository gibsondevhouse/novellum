---
title: Task Resolver & Context Engine
slug: phase-001-task-resolver-and-context-engine
phase_number: 1
status: complete
owner: AI Agent
stage: stage-003-ai-pipeline-implementation
parts:
  - part-001-task-resolver
  - part-002-context-policies-scene
  - part-003-context-policies-chapter-continuity
estimated_duration: 3d
---

## Goal

Implement the first two stages of the AI pipeline: the Task Resolver (converts user intent → typed `AiTask` object) and the Context Engine (queries the repository layer and assembles a context bundle per policy).

Reference: `dev-docs/ai-pipeline.md` §Task Resolver, §Context Builder; `dev-docs/context-engine.md` §Policies.

## Parts

| #   | Part                                                                                            | Status  |
| --- | ----------------------------------------------------------------------------------------------- | ------- |
| 001 | [Task Resolver](part-001-task-resolver/part.md)                                                 | `draft` |
| 002 | [Context Policies — Scene](part-002-context-policies-scene/part.md)                             | `draft` |
| 003 | [Context Policies — Chapter & Continuity](part-003-context-policies-chapter-continuity/part.md) | `draft` |

## Entry Criteria

- `stage-002-module-store-architecture` is `complete`
- Module stores expose `activeSceneId`, `activeProjectId`, `activeBeatId`
- Repository layer is functional for all entities

## Exit Criteria

- `src/lib/ai/task-resolver.ts` exports `resolveTask(action: string, context: UiContext): AiTask`
- `src/lib/ai/context-engine.ts` exports `buildContext(task: AiTask, projectId: string): Promise<AiContext>` covering all four policies
- TypeScript types `AiTask` and `AiContext` defined in `src/lib/ai/types.ts`
- `pnpm run check` exits clean
