---
title: Model Router
slug: part-002-model-router
part_number: 2
status: complete
owner: AI Agent
phase: phase-002-prompt-builder-and-model-router
estimated_duration: 0.5d
---

## Objective

Implement `src/lib/ai/model-router.ts` which selects the OpenRouter model identifier based on the `AiTask.taskType`. The default development model is `openai/gpt-4o-mini` for cost management.

## Target File

`src/lib/ai/model-router.ts`

## Model Routing Table

| taskType           | Default Model        |
| ------------------ | -------------------- |
| `brainstorm`       | `openai/gpt-4o-mini` |
| `outline`          | `openai/gpt-4o-mini` |
| `draft`            | `openai/gpt-4o-mini` |
| `continue`         | `openai/gpt-4o-mini` |
| `rewrite`          | `openai/gpt-4o-mini` |
| `continuity_check` | `openai/gpt-4o-mini` |
| _default_          | `openai/gpt-4o-mini` |

> All defaults are the same; this is intentional for Path 2. In Path 4 (settings/configuration), users will be able to override per task type.

## Required Exports

```ts
// Routing table type — allows future override injection
export type ModelRoutingTable = Record<TaskType | 'default', string>

export const DEFAULT_MODEL_ROUTING_TABLE: ModelRoutingTable = { ... }

export function routeModel(task: AiTask, table?: ModelRoutingTable): string
```

## Implementation Rules

- `routeModel` uses `table ?? DEFAULT_MODEL_ROUTING_TABLE`
- Falls back to `table.default` if `task.taskType` not found
- The model identifier is returned as-is; no transformation; callers pass it directly to the OpenRouter `model` field
- No hardcoded model strings outside of `DEFAULT_MODEL_ROUTING_TABLE`

## Acceptance Criteria

- [ ] `model-router.ts` created with both exports
- [ ] `DEFAULT_MODEL_ROUTING_TABLE` covers all task types
- [ ] `routeModel` accepts optional override table
- [ ] `pnpm run check` exits clean
