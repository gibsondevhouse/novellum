---
title: Repository Tests
slug: part-001-repository-tests
part_number: 1
status: complete
owner: Backend Agent
phase: phase-002-service-and-pipeline-tests
estimated_duration: 1d
---

## Objective

Write unit tests for the repository layer to achieve ≥80% line coverage on all repository files. Tests must use `fake-indexeddb` (configured in `test-setup.ts`) — no mocking of repository functions.

## Test Files to Create

- `src/modules/project-hub/services/project-repository.test.ts`
- `src/modules/project-hub/services/chapter-repository.test.ts`
- `src/modules/editor/services/scene-repository.test.ts`
- `src/modules/editor/services/beat-repository.test.ts`
- `src/modules/story-bible/services/character-repository.test.ts`

## Required Test Coverage Per Repository

Each test file must cover:

1. `create*` — creates entity and returns it with `id`, `createdAt`, `updatedAt`
2. `getById` — returns entity; returns `undefined` for unknown id
3. `getByProjectId` — returns only entities for the specified project
4. `update*` — updates specified fields; sets `updatedAt` to a later timestamp
5. `remove*` — entity no longer retrievable after removal

## Setup Pattern

```ts
import { beforeEach } from 'vitest';
import { db } from '$lib/db/db';

beforeEach(async () => {
	await db.delete();
	await db.open();
});
```

## Acceptance Criteria

- [ ] All 5 test files created
- [ ] Tests use `beforeEach` to reset Dexie database between tests
- [ ] All 5 behaviors listed above covered per repository
- [ ] `pnpm run test:coverage` output shows ≥80% line coverage for all repository service files
- [ ] Coverage report (text) attached in `evidence/coverage-repositories-YYYY-MM-DD.txt`
