---
title: Outliner Module Store
slug: part-003-outliner-module-store
part_number: 3
status: complete
owner: Frontend Agent
phase: phase-001-module-scoped-stores
estimated_duration: 0.5d
---

## Objective

Create `src/modules/outliner/stores/outliner.svelte.ts` as the single source of reactive state for the Outliner module.

## Target File

`src/modules/outliner/stores/outliner.svelte.ts`

## Required State Shape

```ts
// State
let activeProjectId = $state<string | null>(null);
let selectedBeatId = $state<string | null>(null);
let expandedChapterIds = $state<Set<string>>(new Set());
let isLoading = $state(false);

// Derived
const hasSelection = $derived(selectedBeatId !== null);

// Exported setters
export function setSelectedBeat(id: string | null): void;
export function toggleChapter(chapterId: string): void;
export function setActiveProject(projectId: string | null): void;
export { activeProjectId, selectedBeatId, expandedChapterIds, isLoading, hasSelection };
```

## Acceptance Criteria

- [ ] Store file created at specified path
- [ ] Outliner route file updated to import from store
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
