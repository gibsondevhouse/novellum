---
title: Prompt Builder Tests
slug: part-003-prompt-builder-tests
part_number: 3
status: complete
owner: Backend Agent
phase: phase-002-service-and-pipeline-tests
estimated_duration: 1d
---

## Objective

Write unit tests for `src/lib/ai/prompt-builder.ts` (and `src/lib/ai/task-resolver.ts` opportunistically). These are pure TypeScript functions — no Dexie required, no `fake-indexeddb` needed.

## Test Files

- `src/lib/ai/prompt-builder.test.ts`
- `src/lib/ai/task-resolver.test.ts`

## Test Scenarios — `task-resolver.test.ts`

- `resolveTask('brainstorm', ...)` returns task with `taskType: 'brainstorm'` and `contextPolicy: 'scene_plus_adjacent'`
- `resolveTask('draft', ...)` returns task with `taskType: 'draft'` and `contextPolicy: 'scene_only'`
- `resolveTask('continuity_check', ...)` returns `contextPolicy: 'continuity_scope'`
- `resolveTask('unknown_action', ...)` falls back to `'draft'` defaults

## Test Scenarios — `prompt-builder.test.ts`

Construct a minimal `AiTask` and `AiContext` fixture and assert:

- Output string contains `## ROLE` section
- Output string contains `## TASK` section
- Output string contains `## CONTEXT` section
- Output string contains `## CONSTRAINTS` section
- Output string contains `## OUTPUT FORMAT` section
- When context causes string to exceed `MAX_PROMPT_CHARS`, output is still ≤ `MAX_PROMPT_CHARS`
- Sections appear in the correct order: ROLE before TASK before CONTEXT before CONSTRAINTS before OUTPUT FORMAT

## Acceptance Criteria

- [ ] Both test files created
- [ ] All task-resolver scenarios pass
- [ ] All prompt-builder scenarios pass (including truncation test)
- [ ] `pnpm run test` passes with zero failures
- [ ] Coverage ≥80% for `prompt-builder.ts` and `task-resolver.ts` — attach `evidence/coverage-prompt-builder-YYYY-MM-DD.txt`
