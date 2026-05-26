---
title: Audit Inventory
slug: part-001-audit
part_number: 1
status: draft
owner: reviewer
assigned_to: reviewer
phase: phase-001-inventory
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Inventory every in-scope documentation file with a staleness verdict and produce the shared terminology glossary.

## Scope

**In scope:**

- `dev-docs/**/*.md`
- `novellum-docs/docs/*.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. List every in-scope `.md` file and record the last commit date.
2. For each file, record a one-line verdict: `current`, `stale`, or `partially-stale`.
3. Cross-check module naming against `AGENTS.md` and live routes; produce `evidence/terminology-glossary.md`.
4. Commit inventory at `evidence/doc-inventory.md`.

## Files

**Update:**

- `dev-docs/**/*.md`
- `novellum-docs/docs/*.md`

## Acceptance Criteria

- [ ] `evidence/doc-inventory.md` covers every in-scope doc with a verdict.
- [ ] `evidence/terminology-glossary.md` lists current canonical terms (Personae, Atlas, Archive, Threads, Chronicles).
- [ ] No source code edits in this part.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
