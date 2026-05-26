---
title: SQLite Source of Truth
slug: stage-002-sqlite-source-of-truth
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases:
  - phase-001-canonical-schema-and-domain-types
  - phase-002-localstorage-audit-and-migration
  - phase-003-dexie-freeze-and-import-sweep
  - phase-004-indexeddb-to-sqlite-migration-ui
estimated_duration: 6d
risk_level: high
---

## Goal

Make SQLite the single source of truth for all project-owned data. Freeze Dexie under `src/lib/legacy/dexie/*` as a one-shot migration target and remove its imports from V1 runtime paths.

## Phases

| #   | Phase                                                                                                          | Status  | Est. Duration |
| --- | -------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Canonical Schema and Domain Types](phase-001-canonical-schema-and-domain-types/phase.md)                      | `complete` | 1.5d          |
| 002 | [localStorage Audit and Migration](phase-002-localstorage-audit-and-migration/phase.md)                        | `draft` | 1.5d          |
| 003 | [Dexie Freeze and Import Sweep](phase-003-dexie-freeze-and-import-sweep/phase.md)                              | `draft` | 1.5d          |
| 004 | [IndexedDB to SQLite Migration UI](phase-004-indexeddb-to-sqlite-migration-ui/phase.md)                        | `draft` | 1.5d          |

## Entry Criteria

- Stage 001 complete (CI in place, redaction tests green).
- Comprehensive Dexie usage audit produced (read/write call sites enumerated).

## Exit Criteria

- `src/lib/server/db/schema.ts` is declared canonical and contains every project-owned entity (projects, chapters, scenes, beats, stages, characters, relationships, locations, lore, plot threads, timeline events, consistency issues, export settings, snapshots, story frames, acts, arcs, milestones, writing styles, templates, system prompts, chat instructions).
- `src/lib/db/domain-types.ts` exists and is the canonical entity-type module; references to "Dexie types" in `src/lib/db/types.ts` are corrected.
- All Dexie code is moved under `src/lib/legacy/dexie/*`. A repo-wide search for `from '$lib/db/index'` returns only legacy migration files or shared types in transition.
- An IndexedDB → SQLite migration page (`src/routes/settings/migrate/+page.svelte`) reads Dexie data and writes to SQLite via `/api/db/*`, with idempotency and a "migration complete" marker.
- All project-owned `localStorage` reads/writes (scene metadata, model selection, scene compass, etc.) move to SQLite tables or app-preferences storage.
- Acceptance scenario passes (research §4): create project → add arc/act/chapter/scene → write 1k words → add character/location/lore/style/prompt → close → reopen → all data remains.

## Notes

- Source: [market-readiness-pt1.md §4, §5](../../research/market-readiness-pt1.md).
- Do not delete Dexie packages (`dexie`, `fake-indexeddb`) until Stage 004's restore tests prove parity. Removal is deferred to a cleanup part inside Stage 004.
- The migration UI must produce evidence (logs, manifest) showing every IndexedDB row that was migrated, refused, or merged.
