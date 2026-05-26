---
title: Project & Overview
slug: part-001-project-and-overview
part_number: 1
status: draft
owner: architect
assigned_to: architect
phase: phase-001-top-level-context
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `project-context.md` and `project-overview.md` so they describe the shipped Novellum system.

## Scope

**In scope:**

- `dev-docs/project-context.md`
- `dev-docs/project-overview.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Read current source + `AGENTS.md` + `GEMINI.md`.
2. Rewrite sections that are stale per the audit inventory.
3. Add a `Last updated: 2026-04-20` note.
4. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/project-context.md`
- `dev-docs/project-overview.md`

## Acceptance Criteria

- [ ] Both docs reflect current stack (SvelteKit 2, Svelte 5 Runes, SQLite + Dexie).
- [ ] All module names match glossary.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
