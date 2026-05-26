---
title: Local SQLite Server-Side Data Layer
slug: plan-008-local-sqlite
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-04-13
last_updated: 2026-04-13
target_completion: 2026-04-25
stages:
  - stage-001-sqlite-foundation
  - stage-002-api-routes
  - stage-003-client-adapter
  - stage-004-migration-utility
  - stage-005-quality-and-hardening
dependencies:
  - plan-006-portability-backup-and-restore
quality_gates:
  - lint
  - typecheck
  - tests
  - docs_sync
---

## Objective

> Replace the browser-local IndexedDB (Dexie.js) data layer with a server-side SQLite database so that all browsers connecting to the self-hosted SvelteKit instance share a single persistent dataset. Projects created in Chrome are immediately visible in Firefox, Safari, or any other browser — without manual export/import.

## Problem Statement

Novellum currently stores all data in IndexedDB via Dexie.js. IndexedDB is scoped to the browser origin — each browser maintains its own isolated database. On a self-hosted setup, users working across multiple browsers lose access to their projects unless they manually export and import a `.novellum.zip` file.

The target architecture uses a server-side SQLite file on the SvelteKit Node.js runtime. All browsers hit the same REST API (`/api/db/*`). The existing Dexie instance is preserved for the portability ZIP export/import workflow (plan-006).

## Architecture Overview

```text
Browser A (Chrome)  ──┐
Browser B (Firefox) ──┼──→  SvelteKit Server (Node.js)  ──→  novellum.db (SQLite)
Browser C (Safari)  ──┘         /api/db/* routes
```

**Key decisions:**

- `better-sqlite3` — synchronous SQLite driver, zero async overhead for local use
- `@sveltejs/adapter-node` — required to run the server as a persistent Node.js process
- All entity repositories are rewritten to call the local API over `fetch` instead of Dexie
- Dexie/IndexedDB is **not removed** — it remains the backing store for the portability ZIP snapshot service
- A one-time migration utility provides an upgrade path from existing browser IndexedDB data to SQLite
- All JSON array fields (e.g. `traits`, `goals`, `characterIds`) are stored as JSON text in SQLite and deserialized at the API boundary

## Scope

**In scope:**

- Switch SvelteKit adapter from `adapter-auto` to `adapter-node`
- Install and configure `better-sqlite3` as a server-only dependency
- Define SQLite schema covering all 16 entity tables from Dexie schemaV8
- Build a server-side `SqliteDb` singleton with a migration runner
- Create `/api/db/*` REST routes for all entity types (CRUD + filtered list)
- Replace all module repository implementations with fetch-based API clients
- Build a one-time IndexedDB → SQLite migration page accessible at `/settings/migrate`
- Preserve existing Dexie instance and portability services untouched
- Update adapter configuration and build scripts

**Out of scope:**

- Cloud sync or remote database hosting
- Authentication or multi-user access control
- Encryption of the SQLite file at rest
- Real-time sync (WebSockets, SSE)
- Automatic Dexie removal (deferred to post-plan-006 cleanup)
- SQLite WAL mode tuning or performance optimization beyond basic setup

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [SQLite Foundation](stage-001-sqlite-foundation/stage.md) | `draft` | 1d |
| 002 | [API Routes](stage-002-api-routes/stage.md) | `draft` | 2d |
| 003 | [Client Adapter](stage-003-client-adapter/stage.md) | `draft` | 2d |
| 004 | [Migration Utility](stage-004-migration-utility/stage.md) | `draft` | 1d |
| 005 | [Quality and Hardening](stage-005-quality-and-hardening/stage.md) | `draft` | 1d |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all existing tests pass; new API route tests pass
- [ ] **docs_sync** — `dev-docs/backend-context.md` and `GEMINI.md` updated to reflect SQLite architecture
- [ ] **cross_browser** — project created in Chrome is visible in Firefox without any manual action
- [ ] **portability_compat** — plan-006 ZIP export/import still functions against Dexie data

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| `better-sqlite3` native module build failures on certain Node versions | medium | Pin Node ≥ 20 in `.nvmrc`; document build requirement in GEMINI.md |
| `adapter-node` output structure differs from `adapter-auto` for dev | low | Dev server (`pnpm dev`) uses Vite directly — adapter only applies to production build |
| JSON serialization edge cases in array fields | medium | Centralize (de)serialization in a `serialize.ts` utility; cover with unit tests |
| Concurrent writes from multiple browsers causing contention | low | SQLite WAL mode enabled by default; single-process server makes contention negligible |
| Breaking existing repository consumers during migration | medium | Maintain identical function signatures in all repositories — only swap implementation detail |
| IndexedDB migration data loss if user runs migration multiple times | medium | Migration UI shows confirmation + warns if target table already has data; idempotent upsert strategy |

## Notes

> The existing `$lib/db/index.ts` (Dexie AppDB) must not be modified. The portability ZIP pipeline (plan-006) reads directly from Dexie and must continue to work. Client repositories are the only layer being replaced — Dexie remains the source for the portability snapshot service.
>
> The SQLite file path defaults to `./novellum.db` in the project root. This can be overridden via the `NOVELLUM_DB_PATH` environment variable.
>
> This plan is the prerequisite for enhancing the `.novellum.zip` portability format in a future plan (plan-009), which will allow importing archives into the SQLite store rather than into browser IndexedDB.
