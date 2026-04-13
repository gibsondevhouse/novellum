---
title: Editor Module Store
slug: part-001-editor-module-store
part_number: 1
status: complete
owner: Frontend Agent
phase: phase-001-module-scoped-stores
estimated_duration: 0.5d
---

## Objective

Create `src/modules/editor/stores/editor.svelte.ts` as the single source of truth for all reactive state in the Editor module. Migrate any state currently in `src/routes/(app)/editor/+page.svelte` or related components into this store.

## Target File

`src/modules/editor/stores/editor.svelte.ts`

## Required State Shape

```ts
// State
let activeProjectId = $state<string | null>(null);
let activeChapterId = $state<string | null>(null);
let activeSceneId = $state<string | null>(null);
let activeBeatId = $state<string | null>(null);
let isLoading = $state(false);

// Derived
const hasActiveScene = $derived(activeSceneId !== null);

// Exported setters / actions
export function setActiveScene(sceneId: string | null): void;
export function setActiveBeat(beatId: string | null): void;
export function setActiveProject(projectId: string | null): void;
export { activeProjectId, activeChapterId, activeSceneId, activeBeatId, isLoading, hasActiveScene };
```

## Rules

- File must be named `*.svelte.ts` (Svelte 5 rune module)
- Only `$state` and `$derived` — no `writable`, no `readable`
- Setters must be plain functions, not methods on a class
- Route file `+page.svelte` must import from this store; all local `let` reactive state must be removed

## Acceptance Criteria

- [ ] Store file created at the specified path
- [ ] All reactive state listed above present with correct types
- [ ] Route file updated to import from store (no orphan `$state` in route for editor-domain state)
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
