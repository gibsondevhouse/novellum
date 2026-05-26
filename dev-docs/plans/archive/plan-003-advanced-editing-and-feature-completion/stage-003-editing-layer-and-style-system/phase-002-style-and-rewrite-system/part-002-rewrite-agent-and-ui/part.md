---
title: Rewrite Agent & UI
slug: part-002-rewrite-agent-and-ui
part_number: 2
status: complete
owner: AI Agent
phase: phase-002-style-and-rewrite-system
estimated_duration: 1.5d
---

## Objective

Implement RewriteAgent: add `rewrite` to `TaskType`, build the prompt template that returns exactly 3 rewrite options, and build the `RewriteOptionsModal` component for multi-option selection.

## Context

- `dev-docs/agents-map.md` §RewriteAgent
- `src/lib/ai/types.ts`, `task-resolver.ts`, `prompt-builder.ts`
- User selects a text range in the editor, then opens the rewrite panel

## Target Files

| File                                                                  | Action                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/lib/ai/types.ts`                                                 | Update — add `rewrite` to `TaskType`; add `RewriteOption` interface |
| `src/lib/ai/task-resolver.ts`                                         | Update — handle `rewrite` action                                    |
| `src/lib/ai/prompt-builder.ts`                                        | Update — add `rewrite` prompt template                              |
| `src/lib/components/rewrite-options-modal/RewriteOptionsModal.svelte` | Create                                                              |
| `src/lib/components/rewrite-options-modal/index.ts`                   | Create                                                              |

## Type Definition

```ts
export interface RewriteOption {
	index: number; // 1 | 2 | 3
	text: string; // the rewritten text
}
```

## Action → Task Mapping Addition

| Action string | taskType  | contextPolicy | outputFormat           |
| ------------- | --------- | ------------- | ---------------------- |
| `"rewrite"`   | `rewrite` | `scene_only`  | `json_rewrite_options` |

## Prompt Template (REWRITE)

```text
## ROLE
You are a creative writing assistant helping refine prose.

## TASK
Provide exactly 3 distinct rewrites of the provided text excerpt. Each rewrite must:
- Preserve the core meaning and all named entities
- Stay within the scope of the provided scene context
- Offer a meaningfully different angle (pacing / tone / sentence structure)

## CONTEXT
[selected text]
[scene context (scene_only)]

## CONSTRAINTS
- Do not add new plot facts or characters
- Preserve POV
- Each option must be distinct from the others

## OUTPUT FORMAT
Return a JSON array of exactly 3 objects:
[{"index":1,"text":"..."},{"index":2,"text":"..."},{"index":3,"text":"..."}]
```

## RewriteOptionsModal Behaviour

1. Opens when user triggers "Rewrite" on a selected text range
2. Shows loading state while pipeline runs
3. Displays 3 options as cards with diff highlighting vs. original (highlight additions/deletions)
4. "Select" button on a card: replaces selected range in `scene.text`; triggers autosave; closes modal
5. "Cancel" button: closes modal without changes
6. If AI returns fewer than 3 options: show error state "Could not generate 3 options — try again"

## Acceptance Criteria

- [ ] `rewrite` in `TaskType`; `RewriteOption` interface exported
- [ ] `resolveTask('rewrite', ctx)` returns correct `AiTask`
- [ ] Prompt requests exactly 3 options; output parser validates count (returns error if not 3)
- [ ] `RewriteOptionsModal` renders 3 options with diff highlighting
- [ ] Selecting an option replaces the text in `scene.text` and closes the modal
- [ ] Cancelling closes without changes
- [ ] Vitest: prompt construction; output parsing for valid 3-option array, 2-option array (error), malformed JSON
