---
title: Setup & Manual
slug: part-001-setup-and-manual
part_number: 1
status: draft
owner: architect
assigned_to: architect
phase: phase-001-user-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `novellum-docs/docs/setup-guide.md` and `novellum-docs/docs/user-manual.md`.

## Scope

**In scope:**

- `novellum-docs/docs/setup-guide.md`
- `novellum-docs/docs/user-manual.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Verify setup steps against `package.json` scripts and `README.md`.
2. Walk the live app and confirm every user-manual flow matches shipped routes and module names.
3. Run `pnpm run lint`.

## Files

**Update:**

- `novellum-docs/docs/setup-guide.md`
- `novellum-docs/docs/user-manual.md`

## Acceptance Criteria

- [ ] Setup guide executes cleanly on a fresh clone.
- [ ] User manual uses current module naming.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
