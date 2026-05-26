---
title: Data & Repo Structure
slug: part-002-data-and-repo
part_number: 2
status: draft
owner: backend
assigned_to: backend
phase: phase-002-architecture-and-data
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `data-model.md` and `repo-structure.md`.

## Scope

**In scope:**

- `dev-docs/data-model.md`
- `dev-docs/repo-structure.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Enumerate SQLite tables from `/api/db/*` and repositories in `src/lib/**/repositories`.
2. Document Dexie-for-portability layer and `.novellum.zip` structure.
3. Rebuild the `repo-structure.md` tree from current `src/`.
4. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/data-model.md`
- `dev-docs/repo-structure.md`

## Acceptance Criteria

- [ ] `data-model.md` lists every current table/entity.
- [ ] `repo-structure.md` tree matches live `src/`.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
