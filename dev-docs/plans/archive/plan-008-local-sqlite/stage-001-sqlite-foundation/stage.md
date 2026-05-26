---
title: SQLite Foundation
slug: stage-001-sqlite-foundation
stage_number: 1
status: draft
owner: Backend Agent
plan: plan-008-local-sqlite
phases:
  - phase-001-dependencies-and-setup
  - phase-002-server-db-module
estimated_duration: 1d
risk_level: medium
---

## Goal

> Install `better-sqlite3`, switch to `adapter-node`, and build the server-side SQLite singleton with schema definition and migration runner — establishing the foundational database layer that all subsequent API routes will use.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Dependencies and Setup](phase-001-dependencies-and-setup/phase.md) | `draft` | 0.5d |
| 002 | [Server DB Module](phase-002-server-db-module/phase.md) | `draft` | 0.5d |

## Entry Criteria

> - `plan-008-local-sqlite/plan.md` is `draft` and reviewed
> - Dev environment is running (`pnpm dev` works)
> - No active breaking changes in other in-progress plans

## Exit Criteria

- All phases in this stage are `complete`
- `pnpm dev` still starts without errors after adapter and dependency changes
- `better-sqlite3` is importable from a SvelteKit `+server.ts` file
- `novellum.db` is created on first server start with all 16 entity tables

## Notes

> `better-sqlite3` is a native Node.js addon. It must be installed as a production dependency (not devDependency). The `@types/better-sqlite3` package is a devDependency.
>
> The adapter switch from `adapter-auto` to `adapter-node` only affects the production build output — `pnpm dev` uses Vite's dev server directly and is not affected.
