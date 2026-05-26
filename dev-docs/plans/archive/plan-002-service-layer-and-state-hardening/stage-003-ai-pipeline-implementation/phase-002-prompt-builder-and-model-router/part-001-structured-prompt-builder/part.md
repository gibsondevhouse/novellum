---
title: Structured Prompt Builder
slug: part-001-structured-prompt-builder
part_number: 1
status: complete
owner: AI Agent
phase: phase-002-prompt-builder-and-model-router
estimated_duration: 1d
---

## Objective

Implement `src/lib/ai/prompt-builder.ts` which assembles the `AiTask` + `AiContext` into a structured prompt string using the 5-section template defined in `dev-docs/prompt-system.md`.

## Reference Documents

- `dev-docs/prompt-system.md` — 5-section template (ROLE/TASK/CONTEXT/CONSTRAINTS/OUTPUT FORMAT)
- `dev-docs/ai-pipeline.md` §Prompt Builder

## Target File

`src/lib/ai/prompt-builder.ts`

## Template Structure

```text
## ROLE
{task.role}

## TASK
{derived from task.taskType and task.targetEntityId}

## CONTEXT
{serialized AiContext: scene summary, adjacent scenes, characters, locations, beats}

## CONSTRAINTS
- Write in the style of the existing text
- Do not introduce characters, locations, or plot elements not present in the context
- {task-type specific constraints}

## OUTPUT FORMAT
{task.outputFormat description}
```

## Required Export

```ts
export function buildPrompt(task: AiTask, ctx: AiContext): string;
```

## Implementation Rules

- Each section is separated by a blank line and a `## SECTION_NAME` header (all caps)
- CONTEXT section serializes each entity on its own line in a readable plain-text format — no JSON blobs
- CONSTRAINTS section always includes the two invariant rules above, plus task-type-specific additions from a `CONSTRAINTS_BY_TYPE` map
- Prompt must not exceed 8000 chars total (enforce with a hard truncation of the CONTEXT section body if needed)

## Acceptance Criteria

- [ ] `prompt-builder.ts` created with `buildPrompt` export
- [ ] All 5 sections present in output
- [ ] `MAX_PROMPT_CHARS = 8000` constant defined
- [ ] Hard truncation applied when context causes prompt to exceed limit
- [ ] `pnpm run check` exits clean
