---
title: Typecheck, Lint & Test — Repository Factory
slug: part-001-typecheck-lint-test
part_number: 1
status: review
owner: Reviewer
assigned_to: Reviewer
phase: phase-002-verify-repositories
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 0.5d
---

## Objective

> Run the full quality gate suite against the repository factory migration and confirm zero regressions.

## Scope

**In scope:**

- `pnpm check` (svelte-check)
- `pnpm run lint` (ESLint with boundaries plugin)
- `pnpm run test` (Vitest)
- Browser smoke test on 4 key pages

**Out of scope:**

- Fixing pre-existing lint/test failures unrelated to this migration

## Implementation Steps

1. Run `pnpm check` — record output
2. Run `pnpm run lint` — record output, confirm no NEW errors in migrated files
3. Run `pnpm run test` — record output
4. Browser test: workspace page (create beat, create stage)
5. Browser test: bible page (create character, create location)
6. Browser test: editor page (create scene)
7. Browser test: settings page (create writing style)

## Files

**Create:**

- None

**Update:**

- None

## Acceptance Criteria

- [ ] `pnpm check` — 0 errors
- [ ] `pnpm run lint` — 0 new errors in any `*-repository.ts` or `repository-factory.ts`
- [ ] `pnpm run test` — all tests pass
- [ ] Browser smoke: workspace CRUD works
- [ ] Browser smoke: bible CRUD works
- [ ] Browser smoke: editor CRUD works
- [ ] Browser smoke: settings CRUD works

## Notes

> Capture terminal output as evidence artifacts. Screenshot browser tests if possible.
