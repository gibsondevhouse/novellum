---
title: Docs Update
slug: part-002-docs-update
part_number: 2
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-002-integration-and-docs
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

> Update developer documentation to accurately describe the new SQLite-backed architecture, the adapter change, and the relationship between Dexie (portability) and SQLite (live data layer).

## Scope

**In scope:**

- `dev-docs/backend-context.md` — replace IndexedDB-only description with dual-layer architecture description
- `GEMINI.md` — update "Building and Running" to mention `adapter-node`, `NOVELLUM_DB_PATH`, and `novellum.db`
- `dev-docs/architecture.md` — update data layer section if it describes Dexie as the sole store

**Out of scope:**

- User-facing documentation (deferred to a future novellum-docs update)
- API reference documentation

## Implementation Steps

1. Update `dev-docs/backend-context.md`:
   - Add section: "SQLite Layer (Live Data)" — describes `src/lib/server/db/`, `/api/db/*` routes, `NOVELLUM_DB_PATH`
   - Update "Local-First Architecture" section to describe dual-layer: SQLite as server-side shared store, Dexie retained for portability ZIP workflows
2. Update `GEMINI.md`:
   - Add `NOVELLUM_DB_PATH=./novellum.db` to environment variable documentation
   - Update adapter note to `adapter-node`
   - Add `novellum.db` to the file list under generated/runtime artifacts
3. Scan `dev-docs/architecture.md` for references to Dexie as sole data store — update to reflect SQLite as live layer

## Files

**Update:**

- `dev-docs/backend-context.md`
- `GEMINI.md`
- `dev-docs/architecture.md` (if applicable)

## Acceptance Criteria

- [ ] `backend-context.md` describes SQLite server layer and `/api/db/*` routes
- [ ] `backend-context.md` explains why Dexie is preserved (portability)
- [ ] `GEMINI.md` documents `NOVELLUM_DB_PATH` env var
- [ ] `GEMINI.md` references `adapter-node` instead of or alongside `adapter-auto`
- [ ] No documentation contradicts the implemented architecture
- [ ] `pnpm lint` passes (markdown linting)

## Edge Cases

- `dev-docs/architecture.md` may say "all data stored in IndexedDB" — this must be corrected to avoid misleading future contributors

## Notes

> Keep doc changes precise and minimal. Do not rewrite entire sections — update the specific claims that are now inaccurate.
