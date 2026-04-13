---
title: Edit Agent Modes
slug: part-001-edit-agent-modes
part_number: 1
status: complete
owner: AI Agent
phase: phase-001-multi-pass-editing
estimated_duration: 1.5d
---

## Objective

Implement EditAgent with three prompt-level modes — developmental, line editing, proofreading — each producing a structured `EditSuggestion[]` output. Add `edit` to `TaskType` and wire the agent through the full pipeline.

## Context

- `dev-docs/agents-map.md` §EditAgent
- `src/lib/ai/types.ts`, `task-resolver.ts`, `prompt-builder.ts`

## Target Files

| File                           | Action                                                                      |
| ------------------------------ | --------------------------------------------------------------------------- |
| `src/lib/ai/types.ts`          | Update — add `edit` to `TaskType`; add `EditSuggestion` interface           |
| `src/lib/ai/task-resolver.ts`  | Update — handle `edit_developmental`, `edit_line`, `edit_proofread` actions |
| `src/lib/ai/prompt-builder.ts` | Update — add `edit` prompt templates (3 mode variants)                      |

## Type Definitions

```ts
export type EditMode = 'developmental' | 'line_edit' | 'proofread';

export interface EditSuggestion {
	spanStart: number; // character offset in scene text
	spanEnd: number; // character offset in scene text
	original: string;
	suggestion: string;
	reason: string;
	mode: EditMode;
}
```

## Action → Task Mapping Addition

| Action string          | taskType | contextPolicy   | outputFormat            |
| ---------------------- | -------- | --------------- | ----------------------- |
| `"edit_developmental"` | `edit`   | `chapter_scope` | `json_edit_suggestions` |
| `"edit_line"`          | `edit`   | `scene_only`    | `json_edit_suggestions` |
| `"edit_proofread"`     | `edit`   | `scene_only`    | `json_edit_suggestions` |

## Prompt Mode Differences

- **developmental**: TASK focuses on structure, pacing, scene goal clarity; references chapter context
- **line_edit**: TASK focuses on sentence clarity, word choice, rhythm, redundancy; scene text only
- **proofread**: TASK focuses on grammar, punctuation, spelling, factual consistency with character/lore data; scene text only

## Acceptance Criteria

- [ ] `edit` in `TaskType`; `EditSuggestion` interface exported from `types.ts`
- [ ] All 3 action strings resolve correctly via `resolveTask()`
- [ ] Prompt Builder produces mode-appropriate prompts with the correct context policy
- [ ] AI response parsed into `EditSuggestion[]`; malformed JSON handled (returns `[]` + warning)
- [ ] Vitest: one test per mode — prompt construction verified; output parsing tested for valid + malformed
