---
title: Client Adapter
slug: stage-003-client-adapter
stage_number: 3
status: draft
owner: Frontend Agent
plan: plan-008-local-sqlite
phases:
  - phase-001-generic-api-client
  - phase-002-repository-rewrites
estimated_duration: 2d
risk_level: high
---

## Goal

> Replace the Dexie implementation in every module repository with a fetch-based API client that calls the `/api/db/*` routes — maintaining identical function signatures so all consumers (stores, components, routes) continue to work without modification.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Generic API Client](phase-001-generic-api-client/phase.md) | `draft` | 0.5d |
| 002 | [Repository Rewrites](phase-002-repository-rewrites/phase.md) | `draft` | 1.5d |

## Entry Criteria

- Stage 002 is `complete`
- All `/api/db/*` routes are operational and manually tested
- No existing tests are failing

## Exit Criteria

- All phases in this stage are `complete`
- No module repository imports `$lib/db` (Dexie) for data operations
- All existing repository consumer callers (stores, components) are unmodified
- The Dexie `AppDB` class and `$lib/db` index remain intact (for portability service)

## Notes

> **Critical constraint:** The Dexie instance (`src/lib/db/index.ts`) must NOT be modified or removed. The `portability` service in `src/modules/export/services/portability/` reads directly from Dexie and must continue to function.
>
> Only the repository files (functions like `getAllProjects`, `createChapter`, etc.) change their internal implementation. The exported function signatures stay identical.
>
> Risk: Some stores may call multiple repository functions in sequence — ensure the async/await behavior is identical since API calls are network requests rather than in-memory DB calls.
