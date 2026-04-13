---
title: Bible Entities Repository
slug: part-003-bible-entities-repository
part_number: 3
status: complete
owner: Backend Agent
phase: phase-002-repository-pattern
estimated_duration: 1d
---

## Objective

Implement typed repository modules for Story Bible entities: `Character`, `Location`, `LoreEntry`, `PlotThread`, `TimelineEvent`, and `CharacterRelationship`. These are the context entities the AI Context Engine will query heavily.

## Target Files

- `src/modules/story-bible/services/character-repository.ts`
- `src/modules/story-bible/services/location-repository.ts`
- `src/modules/story-bible/services/lore-entry-repository.ts`
- `src/modules/story-bible/services/plot-thread-repository.ts`
- `src/modules/story-bible/services/timeline-event-repository.ts`

> `CharacterRelationship` is queried via the character repository: `getRelationshipsByCharacterId(characterId: string)` and `getRelationshipsByProjectId(projectId: string)` — no separate file needed.

## Required Exports (pattern per entity)

```ts
// Pattern repeated for character, location, lore-entry, plot-thread, timeline-event
export function create<Entity>(
	data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Entity>;
export function getById(id: string): Promise<Entity | undefined>;
export function getByProjectId(projectId: string): Promise<Entity[]>;
export function update(id: string, data: Partial<Omit<Entity, 'id' | 'createdAt'>>): Promise<void>;
export function remove(id: string): Promise<void>;
```

Additional for `character-repository.ts`:

```ts
export function createRelationship(
	data: Omit<CharacterRelationship, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<CharacterRelationship>;
export function getRelationshipsByProjectId(projectId: string): Promise<CharacterRelationship[]>;
export function removeRelationship(id: string): Promise<void>;
```

## Acceptance Criteria

- [ ] All 5 entity repository files created with correct exports
- [ ] `CharacterRelationship` CRUD methods added to `character-repository.ts`
- [ ] All `getByProjectId` queries use Dexie `.where('projectId').equals(projectId)`
- [ ] `pnpm run check` exits clean
- [ ] `pnpm run lint` exits clean (no boundary violations — these files must not import from `editor/` or `outliner/`)
