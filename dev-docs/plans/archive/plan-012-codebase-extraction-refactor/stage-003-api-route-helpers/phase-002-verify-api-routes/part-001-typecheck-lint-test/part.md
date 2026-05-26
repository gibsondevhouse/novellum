---
title: Typecheck, Lint & Test — API Route Helpers
slug: part-001-typecheck-lint-test
part_number: 1
status: review
owner: Reviewer
assigned_to: Reviewer
phase: phase-002-verify-api-routes
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 0.5d
---

## Objective

> Full quality gate pass after POST handler migration. Browser-based smoke testing of all entity CRUD operations.

## Implementation Steps

1. Run `pnpm check` — 0 type errors
2. Run `pnpm run lint` — 0 new errors in `api/db/` routes
3. Run `pnpm run test` — all tests pass
4. Browser smoke test: create a project
5. Browser smoke test: create a character within the project
6. Browser smoke test: create a scene with metadata defaults
7. Browser smoke test: verify timeline events persist
8. Browser smoke test: verify arc/beat/stage creation in outliner

## Files

**Create:** None
**Update:** None

## Acceptance Criteria

- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 new API route errors
- [ ] `pnpm run test` — all tests pass
- [ ] Browser smoke: entity creation works for all 14 entity types
- [ ] Response shapes unchanged (no API contract breaks)
