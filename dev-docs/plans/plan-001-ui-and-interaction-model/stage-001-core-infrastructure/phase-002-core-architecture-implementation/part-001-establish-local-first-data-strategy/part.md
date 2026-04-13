---
title: Establish Local-First Data Strategy
slug: part-001-establish-local-first-data-strategy
part_number: 1
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-core-architecture-implementation
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 1d
---

## Objective

Install Dexie.js and define the base database schema covering the four core data models (Project, Character, Chapter, Timeline Event). The schema must be versioned from day one so future migrations are handled gracefully.

## Scope

**In scope:**

- Installing `dexie` as a production dependency
- Defining TypeScript interfaces for all four base models
- Creating a singleton `AppDB` class extending `Dexie` with schema version 1
- Verifying the DB initializes on app load with a console log

**Out of scope:**

- CRUD store logic or Svelte stores backed by Dexie (deferred to module-specific parts)
- Sync or cloud persistence

## Implementation Steps

1. Install: `pnpm add dexie`
2. Create `src/lib/db/types.ts` — TypeScript interfaces for `Project`, `Character`, `Chapter`, `TimelineEvent`
3. Create `src/lib/db/schema.ts` — Dexie store definitions (indexed fields, compound keys)
4. Create `src/lib/db/index.ts` — `AppDB` class with `new Dexie('novellum')`, `.version(1).stores(...)`, and a singleton export `export const db = new AppDB()`
5. Import `db` in `src/app/+layout.svelte` and log `db.verno` to console on mount
6. Run `pnpm run dev`, open browser, verify console shows DB version

## Files

**Create:**

- `src/lib/db/types.ts`
- `src/lib/db/schema.ts`
- `src/lib/db/index.ts`

**Update:**

- `src/app/+layout.svelte` — import and initialize DB on mount

## Acceptance Criteria

- [ ] `pnpm add dexie` succeeds; `dexie` appears in `package.json` dependencies
- [ ] `src/lib/db/types.ts` exports `Project`, `Character`, `Chapter`, `TimelineEvent` interfaces
- [ ] `src/lib/db/index.ts` exports a singleton `db` instance of `AppDB`
- [ ] Schema version is `1`; `db.verno` logs `1` in the browser console on app load
- [ ] `pnpm run check` exits with no new type errors

## Edge Cases

- If IndexedDB is blocked (e.g., private browsing in some browsers), Dexie will throw — add a `.catch` on `db.open()` that logs a warning without crashing the app

## Notes

Schema field reference:

- `Project`: `++id, title, genre, status`
- `Character`: `++id, projectId, name`
- `Chapter`: `++id, projectId, title`
- `TimelineEvent`: `++id, projectId, timestamp`

`projectId` is indexed on all child models to enable fast per-project lookups. Use `++id` (auto-increment) for all primary keys in version 1.
