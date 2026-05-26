---
title: Frontend / Backend / Routing
slug: part-002-frontend-backend-routing
part_number: 2
status: draft
owner: architect
assigned_to: architect
phase: phase-001-top-level-context
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `frontend-context.md`, `backend-context.md`, `routing-context.md`, `design-system.md`, `modular-boundaries.md`, `dev-workflow.md`, `roadmap.md`.

## Scope

**In scope:**

- `dev-docs/frontend-context.md`
- `dev-docs/backend-context.md`
- `dev-docs/routing-context.md`
- `dev-docs/design-system.md`
- `dev-docs/modular-boundaries.md`
- `dev-docs/dev-workflow.md`
- `dev-docs/roadmap.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. For each file: verify against audit, edit surgically.
2. `modular-boundaries.md` must reflect `eslint.config.js` rules exactly.
3. `routing-context.md` must match shipped route tree under `src/routes/`.
4. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/frontend-context.md`
- `dev-docs/backend-context.md`
- `dev-docs/routing-context.md`
- `dev-docs/design-system.md`
- `dev-docs/modular-boundaries.md`
- `dev-docs/dev-workflow.md`
- `dev-docs/roadmap.md`

## Acceptance Criteria

- [ ] Every listed doc either edited or explicitly verified.
- [ ] `modular-boundaries.md` matches `eslint-plugin-boundaries` config.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
