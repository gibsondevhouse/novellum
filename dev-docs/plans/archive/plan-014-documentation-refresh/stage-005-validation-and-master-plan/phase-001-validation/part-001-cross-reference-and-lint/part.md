---
title: Cross-Reference & Lint
slug: part-001-cross-reference-and-lint
part_number: 1
status: draft
owner: reviewer
assigned_to: reviewer
phase: phase-001-validation
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Run a final cross-reference sweep and lint/typecheck gates across all edits from stages 001–004.

## Scope

**In scope:**

- `dev-docs/**/*.md`
- `novellum-docs/**/*.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Run `pnpm run lint` and capture output at `evidence/lint-<date>.txt`.
2. Walk every relative link in edited docs and verify it resolves.
3. Produce a final delta report at `evidence/final-delta.md`.

## Files

**Update:**

- `dev-docs/**/*.md`
- `novellum-docs/**/*.md`

## Acceptance Criteria

- [ ] `pnpm run lint` passes.
- [ ] All relative links resolve.
- [ ] Delta report committed.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
