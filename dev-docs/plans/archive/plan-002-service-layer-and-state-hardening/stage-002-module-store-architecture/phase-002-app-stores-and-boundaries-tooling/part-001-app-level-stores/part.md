---
title: App-Level Stores
slug: part-001-app-level-stores
part_number: 1
status: complete
owner: Frontend Agent
phase: phase-002-app-stores-and-boundaries-tooling
estimated_duration: 0.5d
---

## Objective

Harden the two app-level stores from Path 1 to use Svelte 5 runes. These are the only stores allowed to be consumed across module boundaries.

## Target Files

- `src/lib/stores/active-project.svelte.ts`
- `src/lib/stores/ai-panel.svelte.ts`

## Required State Shapes

### `active-project.svelte.ts`

```ts
let activeProjectId = $state<string | null>(null);
let activeProjectName = $state<string | null>(null);

export function setActiveProject(id: string, name: string): void;
export function clearActiveProject(): void;
export { activeProjectId, activeProjectName };
```

### `ai-panel.svelte.ts`

```ts
let isPanelOpen = $state(false);
let currentTaskType = $state<string | null>(null);
let lastResponse = $state<string | null>(null);
let isStreaming = $state(false);

export function openPanel(taskType?: string): void;
export function closePanel(): void;
export function setResponse(response: string): void;
export function setStreaming(v: boolean): void;
export { isPanelOpen, currentTaskType, lastResponse, isStreaming };
```

## Rules

- Files must be at `src/lib/stores/` (the shared layer)
- Only `$state` and `$derived` — no Svelte 3/4 stores
- If the files already exist from Path 1, refactor in-place; do NOT delete and re-create

## Acceptance Criteria

- [ ] Both files at `src/lib/stores/` use only Svelte 5 runes
- [ ] All consumers (route files, layout) updated to use the new API if it changed
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
