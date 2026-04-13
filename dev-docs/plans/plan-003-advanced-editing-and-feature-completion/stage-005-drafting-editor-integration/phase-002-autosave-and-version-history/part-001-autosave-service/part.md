---
title: Autosave Service
slug: part-001-autosave-service
part_number: 1
status: complete
owner: Backend Agent
phase: phase-002-autosave-and-version-history
estimated_duration: 1d
---

## Objective

Implement the autosave service that debounces writes to Dexie and takes a versioned snapshot on every successful save. The service flush-saves immediately when Tauri fires `onCloseRequested`. Snapshots are pruned to a maximum of 20 per scene.

## Context

- `editorStore.pendingText` — reactive source of truth (set by part-002-chapter-editor-binding)
- `src/modules/outliner/services/scene-repository.ts` — `update(id, patch)` for persisting scene text
- `src/lib/db/schema.ts` and `db.ts` — add `SceneSnapshot` entity and `scene_snapshots` table

## Target Files

| File                                                           | Action                                                                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/db/schema.ts`                                         | Update — add `SceneSnapshot` interface                                                                                       |
| `src/lib/db/db.ts`                                             | Update — add `scene_snapshots` table; bump Dexie version (same bump as `export_settings` if not yet done, or one bump after) |
| `src/modules/editor/services/autosave-service.ts`              | Create                                                                                                                       |
| `src/routes/(app)/projects/[id]/editor/[sceneId]/+page.svelte` | Update — call `autosaveService.mount()` and `autosaveService.unmount()` in `$effect` lifecycle                               |

## SceneSnapshot Schema

```ts
export interface SceneSnapshot {
	id: string; // uuid
	sceneId: string;
	projectId: string;
	text: string;
	createdAt: string; // ISO timestamp
}
```

Dexie index: `"id, sceneId, projectId"`. Sorted by `createdAt` DESC when querying.

## Autosave Logic

```ts
// Debounce: 2 seconds after last content change
let debounceTimer: ReturnType<typeof setTimeout>;

function onTextChange(text: string) {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => save(text), 2000);
}

async function save(text: string) {
	await SceneRepository.update(sceneId, { text, updatedAt: now() });
	await snapshotScene(sceneId, projectId, text);
}

async function snapshotScene(sceneId, projectId, text) {
	await db.scene_snapshots.add({ id: uuid(), sceneId, projectId, text, createdAt: now() });
	// prune: keep only 20 most recent
	const all = await db.scene_snapshots.where('sceneId').equals(sceneId).sortBy('createdAt');
	if (all.length > 20) {
		const toDelete = all.slice(0, all.length - 20).map((s) => s.id);
		await db.scene_snapshots.bulkDelete(toDelete);
	}
}
```

## Tauri Close Hook

Import `onCloseRequested` from `@tauri-apps/api/window`. On close request, call flush save synchronously (or await it before allowing close).

## Acceptance Criteria

- [ ] Text changes trigger a save ≈2 seconds after last keystroke
- [ ] Each save creates a snapshot in `scene_snapshots`
- [ ] Old snapshots beyond 20 are automatically deleted
- [ ] Service flushes immediately on Tauri window close (no unsaved data on close)
- [ ] `pnpm run check` exits clean
