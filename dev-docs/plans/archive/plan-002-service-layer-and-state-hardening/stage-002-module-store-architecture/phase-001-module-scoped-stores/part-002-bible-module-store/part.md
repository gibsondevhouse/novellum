---
title: Story Bible Module Store
slug: part-002-bible-module-store
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-001-module-scoped-stores
estimated_duration: 0.5d
---

## Objective

Create `src/modules/story-bible/stores/story-bible.svelte.ts` as the single source of reactive state for the Story Bible module. Migrate any ad-hoc state from route files.

## Target File

`src/modules/story-bible/stores/story-bible.svelte.ts`

## Required State Shape

```ts
// State
let activeProjectId = $state<string | null>(null);
let selectedTab = $state<'characters' | 'locations' | 'lore' | 'plot-threads' | 'timeline'>(
	'characters',
);
let selectedEntityId = $state<string | null>(null);
let isLoading = $state(false);

// Derived
const hasSelection = $derived(selectedEntityId !== null);

// Exported setters
export function setSelectedTab(tab: typeof selectedTab): void;
export function setSelectedEntity(id: string | null): void;
export function setActiveProject(projectId: string | null): void;
export { activeProjectId, selectedTab, selectedEntityId, isLoading, hasSelection };
```

## Acceptance Criteria

- [ ] Store file created at specified path
- [ ] Story Bible route file updated to import from store
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
