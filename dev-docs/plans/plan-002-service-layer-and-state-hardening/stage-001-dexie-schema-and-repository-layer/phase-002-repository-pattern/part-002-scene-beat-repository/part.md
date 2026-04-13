---
title: Scene & Beat Repository
slug: part-002-scene-beat-repository
part_number: 2
status: complete
owner: Backend Agent
phase: phase-002-repository-pattern
estimated_duration: 1d
---

## Objective

Implement typed repository modules for `Scene` and `Beat` entities. Scenes belong to Chapters; Beats belong to Scenes. Both require `projectId` for efficient cross-scene queries.

## Target Files

- `src/modules/editor/services/scene-repository.ts`
- `src/modules/editor/services/beat-repository.ts`

## Required Exports

```ts
// scene-repository.ts
export function createScene(data: Omit<Scene, 'id' | 'createdAt' | 'updatedAt'>): Promise<Scene>;
export function getSceneById(id: string): Promise<Scene | undefined>;
export function getScenesByChapterId(chapterId: string): Promise<Scene[]>;
export function getScenesByProjectId(projectId: string): Promise<Scene[]>;
export function updateScene(
	id: string,
	data: Partial<Omit<Scene, 'id' | 'createdAt'>>,
): Promise<void>;
export function removeScene(id: string): Promise<void>;

// beat-repository.ts
export function createBeat(data: Omit<Beat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Beat>;
export function getBeatById(id: string): Promise<Beat | undefined>;
export function getBeatsBySceneId(sceneId: string): Promise<Beat[]>;
export function getBeatsByProjectId(projectId: string): Promise<Beat[]>;
export function updateBeat(
	id: string,
	data: Partial<Omit<Beat, 'id' | 'createdAt'>>,
): Promise<void>;
export function removeBeat(id: string): Promise<void>;
```

## Acceptance Criteria

- [ ] Both files created with all exports fully typed
- [ ] `getScenesByChapterId` uses Dexie index on `chapterId`; `getScenesByProjectId` uses index on `projectId`
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean
