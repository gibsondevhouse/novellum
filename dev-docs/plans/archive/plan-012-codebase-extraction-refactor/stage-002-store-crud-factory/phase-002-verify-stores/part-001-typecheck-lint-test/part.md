---
title: Typecheck, Lint & Test — Store CRUD Factory
slug: part-001-typecheck-lint-test
part_number: 1
status: review
owner: Reviewer
assigned_to: Reviewer
phase: phase-002-verify-stores
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 0.25d
---

## Objective

> Verify bible CRUD store migration with full quality gate suite and browser smoke testing.

## Implementation Steps

1. Run `pnpm check` — 0 type errors
2. Run `pnpm run lint` — 0 new errors in bible module
3. Run `pnpm run test` — all tests pass
4. Browser test: Characters page (create, edit, delete)
5. Browser test: Locations page (create, edit, delete)
6. Browser test: Lore page (create, edit, delete)
7. Browser test: Plot threads page (create, edit, delete)
8. Browser test: Timeline page (create, edit, delete)

## Files

**Create:** None
**Update:** None

## Acceptance Criteria

- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 new bible module errors
- [ ] `pnpm run test` — all tests pass
- [ ] Browser smoke: all 5 bible sub-pages CRUD works
