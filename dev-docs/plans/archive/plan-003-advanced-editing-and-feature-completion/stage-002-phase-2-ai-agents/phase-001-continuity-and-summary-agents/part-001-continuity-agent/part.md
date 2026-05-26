---
title: ContinuityAgent
slug: part-001-continuity-agent
part_number: 1
status: complete
owner: AI Agent
phase: phase-001-continuity-and-summary-agents
estimated_duration: 2d
---

## Objective

Implement ContinuityAgent: add `continuity_check` to `TaskType`, extend the Task Resolver and Prompt Builder to handle it, define the structured output schema, and wire a "Check Continuity" trigger button into the scene/chapter toolbar.

## Context

- `dev-docs/agents-map.md` §ContinuityAgent — inputs, outputs, constraints
- `dev-docs/context-engine.md` — `chapter_scope` and `continuity_scope` policies
- `dev-docs/ai-pipeline.md` — pipeline stage responsibilities
- `src/lib/ai/types.ts` — extend with new types
- `src/lib/ai/task-resolver.ts` — add `continuity_check` action mapping

## Target Files

| File                                                         | Action                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/lib/ai/types.ts`                                        | Update — add `continuity_check` to `TaskType`; add `ConsistencyIssue` interface |
| `src/lib/ai/task-resolver.ts`                                | Update — handle `continuity_check` action                                       |
| `src/lib/ai/prompt-builder.ts`                               | Update — add `continuity_check` prompt template                                 |
| `src/lib/db/schema.ts`                                       | Update — add `ConsistencyIssue` interface                                       |
| `src/lib/db/db.ts`                                           | Update — add `consistency_issues` table, bump Dexie version                     |
| `src/modules/consistency/services/consistency-repository.ts` | Create                                                                          |
| `src/modules/consistency/index.ts`                           | Create                                                                          |

## Output Schema

```ts
export interface ConsistencyIssue {
	id: string;
	projectId: string;
	type: 'timeline' | 'character' | 'lore' | 'plot_thread';
	severity: 'warning' | 'error';
	description: string;
	entityIds: string[];
	sceneId: string | null;
	status: 'open' | 'resolved' | 'dismissed';
	createdAt: string;
	updatedAt: string;
}
```

## Action → Task Mapping Addition

| Action string                | taskType           | contextPolicy      | outputFormat      |
| ---------------------------- | ------------------ | ------------------ | ----------------- |
| `"continuity_check_scene"`   | `continuity_check` | `continuity_scope` | `json_issue_list` |
| `"continuity_check_chapter"` | `continuity_check` | `chapter_scope`    | `json_issue_list` |

## Prompt Template (CONTINUITY_CHECK)

````
## ROLE
You are a story continuity analyst reviewing a manuscript for logical inconsistencies.

## TASK
Identify all continuity issues in the provided text. Focus on:
- Timeline conflicts (events occurring out of possible sequence)
- Character inconsistencies (traits, knowledge, location contradictions)
- Lore violations (rules established in the lore entries being broken)
- Unresolved plot threads that should have been addressed by this point

## CONTEXT
[scene/chapter text]
[relevant characters]
[relevant lore entries]
[relevant timeline events]
[plot threads]

## CONSTRAINTS
- Do not rewrite any text
- Only flag verifiable issues, not stylistic preferences
- Do not speculate beyond the provided context

## OUTPUT FORMAT
Return a JSON array of issue objects:
[{"type":"timeline|character|lore|plot_thread","severity":"warning|error","description":"...","entityIds":["..."]}]
Return an empty array [] if no issues found.
```text

## Acceptance Criteria

- [ ] `continuity_check` added to `TaskType` union in `types.ts`
- [ ] `resolveTask('continuity_check_scene', ctx)` returns correct `AiTask` with `continuity_scope` policy
- [ ] Prompt Builder produces valid 5-section prompt for `continuity_check`
- [ ] AI response parsed into `ConsistencyIssue[]`; malformed/empty JSON handled gracefully (returns `[]` with a warning log)
- [ ] `ConsistencyIssue[]` persisted to Dexie `consistency_issues` table via repository
- [ ] "Check Continuity" button visible in scene toolbar and chapter toolbar; triggers the correct action
- [ ] Vitest: prompt construction test; output parsing test for valid + malformed JSON
````
