---
title: SummaryAgent
slug: part-002-summary-agent
part_number: 2
status: complete
owner: AI Agent
phase: phase-001-continuity-and-summary-agents
estimated_duration: 1d
---

## Objective

Implement SummaryAgent: add `summarize` to `TaskType`, extend the Task Resolver and Prompt Builder, and wire "Generate Summary" triggers into the Outliner (per scene and per chapter). The generated summary is written back to `scene.summary` or `chapter.summary` after user approval.

## Context

- `dev-docs/agents-map.md` §SummaryAgent — inputs, outputs, constraints
- `src/lib/ai/types.ts`, `task-resolver.ts`, `prompt-builder.ts` (extend, do not rewrite)

## Target Files

| File                           | Action                                                            |
| ------------------------------ | ----------------------------------------------------------------- |
| `src/lib/ai/types.ts`          | Update — add `summarize` to `TaskType`                            |
| `src/lib/ai/task-resolver.ts`  | Update — handle `summarize_scene` and `summarize_chapter` actions |
| `src/lib/ai/prompt-builder.ts` | Update — add `summarize` prompt template                          |

## Action → Task Mapping Addition

| Action string         | taskType    | contextPolicy   | outputFormat |
| --------------------- | ----------- | --------------- | ------------ |
| `"summarize_scene"`   | `summarize` | `scene_only`    | `plain_text` |
| `"summarize_chapter"` | `summarize` | `chapter_scope` | `plain_text` |

## Prompt Template (SUMMARIZE)

```text
## ROLE
You are a narrative editor creating concise summaries of fiction.

## TASK
Summarize the provided scene/chapter text into 1–3 sentences that capture the key events, character actions, and narrative purpose.

## CONTEXT
[scene or chapter text]

## CONSTRAINTS
- Be faithful to the source text — no additions or interpretations
- Maximum 3 sentences
- Write in present tense

## OUTPUT FORMAT
Return only the summary text. No preamble, no explanation.
```

## Acceptance Criteria

- [ ] `summarize` added to `TaskType`
- [ ] `resolveTask('summarize_scene', ctx)` returns `{ taskType: 'summarize', contextPolicy: 'scene_only', outputFormat: 'plain_text', ... }`
- [ ] Prompt Builder produces valid 5-section summary prompt
- [ ] "Generate Summary" button in scene row (outliner) triggers `summarize_scene`; result shown in a review modal
- [ ] "Generate Chapter Summary" button in chapter row triggers `summarize_chapter`; result shown in review modal
- [ ] User approves: `scene.summary` or `chapter.summary` updated via repository; user dismisses: no change
- [ ] Vitest: prompt construction test; ensure output is trimmed string (not JSON)
