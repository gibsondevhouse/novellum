---
title: API Route Helpers
slug: stage-003-api-route-helpers
stage_number: 3
status: complete
owner: Planner Agent
plan: plan-012-codebase-extraction-refactor
phases:
  - phase-001-create-api-helpers
  - phase-002-verify-api-routes
estimated_duration: 2d
risk_level: medium
---

## Goal

> Create server-side API helper factories in `src/lib/server/` that standardize the POST, GET, PUT, and DELETE handlers across 14+ `+server.ts` files under `src/routes/api/db/`. Each endpoint currently repeats entity creation boilerplate (UUID generation, timestamp injection, field defaults, validation, SQLite insert). The factory eliminates this repetition.

## Phases

| # | Phase | Status | Est. Duration |
|---|-------|--------|---------------|
| 001 | [Create API Helpers & Migrate](phase-001-create-api-helpers/phase.md) | `draft` | 1.5d |
| 002 | [Verify API Routes](phase-002-verify-api-routes/phase.md) | `draft` | 0.5d |

## Entry Criteria

- Stages 001 and 002 are `complete` (repositories and stores use same API endpoints)
- `pnpm check` passes

## Exit Criteria

- All POST handlers standardized via factory
- All quality gates pass
- Full API smoke test (create entities via browser, verify persistence)

## Notes

> This stage modifies server-side code (`+server.ts`) that uses `better-sqlite3` directly. The factory lives in `src/lib/server/` which is only importable in server context (SvelteKit enforces this).
>
> The factory must handle:
> - UUID generation (`crypto.randomUUID()`)
> - Timestamp injection (`createdAt`, `updatedAt`)
> - Default field values (entity-specific)
> - Required field validation (return 400 on missing)
> - SQLite insert via `db.prepare().run()`
> - JSON encoding for array fields (`encodeJson()`)
>
> Complex endpoints like `scenes` and `characters` have many fields with defaults — the factory config must support per-field defaults, nullables, and JSON array fields.
