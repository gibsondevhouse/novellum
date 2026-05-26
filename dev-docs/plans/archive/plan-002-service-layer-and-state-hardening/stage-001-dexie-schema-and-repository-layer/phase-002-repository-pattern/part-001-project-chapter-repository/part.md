---
title: Project & Chapter Repository
slug: part-001-project-chapter-repository
part_number: 1
status: complete
owner: Backend Agent
phase: phase-002-repository-pattern
estimated_duration: 1d
---

## Objective

Implement typed repository modules for `Project` and `Chapter` entities. These are the root entities — everything else is `projectId`-scoped beneath them. They must be implemented first so other repositories can reference them in tests.

## Target Files

- `src/modules/project-hub/services/project-repository.ts`
- `src/modules/project-hub/services/chapter-repository.ts`

## Required Exports (each repository)

```ts
// project-repository.ts
export function createProject(
	data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Project>;
export function getProjectById(id: string): Promise<Project | undefined>;
export function getAllProjects(): Promise<Project[]>;
export function updateProject(
	id: string,
	data: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<void>;
export function removeProject(id: string): Promise<void>;

// chapter-repository.ts
export function createChapter(
	data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Chapter>;
export function getChapterById(id: string): Promise<Chapter | undefined>;
export function getChaptersByProjectId(projectId: string): Promise<Chapter[]>;
export function updateChapter(
	id: string,
	data: Partial<Omit<Chapter, 'id' | 'createdAt'>>,
): Promise<void>;
export function removeChapter(id: string): Promise<void>;
```

## Implementation Rules

- `id` is always `crypto.randomUUID()`
- `createdAt` and `updatedAt` are `new Date().toISOString()`
- `updatedAt` is set on every `update*` call
- No `db.*` access in any file other than the repository file itself and `src/lib/db/`
- These are plain async functions — no classes, no DI patterns

## Acceptance Criteria

- [ ] Both files created with all exports listed above fully typed
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean (import boundary compliance verified)
- [ ] Manual test: create a project, retrieve it by id, update it, delete it (capture terminal output in evidence)
