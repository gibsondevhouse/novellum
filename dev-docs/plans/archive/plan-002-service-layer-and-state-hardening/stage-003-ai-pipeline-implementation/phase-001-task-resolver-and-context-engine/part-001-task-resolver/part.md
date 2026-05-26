---
title: Task Resolver
slug: part-001-task-resolver
part_number: 1
status: complete
owner: AI Agent
phase: phase-001-task-resolver-and-context-engine
estimated_duration: 1d
---

## Objective

Implement `src/lib/ai/task-resolver.ts` which maps a user action string and UI context into a typed `AiTask` object. The Task Resolver is stage 1 of the AI pipeline defined in `dev-docs/ai-pipeline.md`.

## Reference Documents

- `dev-docs/ai-pipeline.md` §Task Resolver — action-to-task mapping rules
- `dev-docs/agents-map.md` — `BrainstormAgent`, `OutlineAgent`, `DraftAgent` task types

## Target Files

- `src/lib/ai/types.ts` — define shared AI types
- `src/lib/ai/task-resolver.ts` — implement resolver

## Type Definitions (`src/lib/ai/types.ts`)

```ts
export type ContextPolicy =
	| 'scene_only'
	| 'scene_plus_adjacent'
	| 'chapter_scope'
	| 'continuity_scope'
	| 'outline_scope';

export type TaskType =
	| 'brainstorm'
	| 'outline'
	| 'draft'
	| 'continue'
	| 'rewrite'
	| 'continuity_check';

export interface UiContext {
	activeProjectId: string | null;
	activeSceneId: string | null;
	activeBeatId: string | null;
	activeChapterId: string | null;
}

export interface AiTask {
	taskType: TaskType;
	role: string; // e.g. "You are a creative writing assistant"
	targetEntityId: string | null;
	contextPolicy: ContextPolicy;
	outputFormat: string; // e.g. "prose", "bullet_list", "structured_beats"
}

export interface AiContext {
	policy: ContextPolicy;
	scene: Scene | null;
	adjacentScenes: Scene[];
	chapter: Chapter | null;
	beats: Beat[];
	characters: Character[];
	locations: Location[];
	loreEntries: LoreEntry[];
}
```

## Required Export

```ts
export function resolveTask(action: string, uiCtx: UiContext): AiTask;
```

### Action → Task Mapping

| Action string        | taskType           | contextPolicy         | outputFormat       |
| -------------------- | ------------------ | --------------------- | ------------------ |
| `"brainstorm"`       | `brainstorm`       | `scene_plus_adjacent` | `bullet_list`      |
| `"outline"`          | `outline`          | `chapter_scope`       | `structured_beats` |
| `"draft"`            | `draft`            | `scene_only`          | `prose`            |
| `"continue"`         | `continue`         | `scene_plus_adjacent` | `prose`            |
| `"rewrite"`          | `rewrite`          | `scene_only`          | `prose`            |
| `"continuity_check"` | `continuity_check` | `continuity_scope`    | `bullet_list`      |
| _default_            | `draft`            | `scene_only`          | `prose`            |

## Acceptance Criteria

- [ ] `src/lib/ai/types.ts` created with all types above
- [ ] `src/lib/ai/task-resolver.ts` created with `resolveTask` export
- [ ] `resolveTask` handles all 6 named actions and a default fallback
- [ ] `pnpm run check` exits clean
