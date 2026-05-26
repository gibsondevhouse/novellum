---
title: Support Docs
slug: part-002-support-docs
part_number: 2
status: draft
owner: reviewer
assigned_to: reviewer
phase: phase-001-user-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `portability-recovery-runbook.md`, `checklists/ui-review.md`, `audits/component-inventory.md`, `context-docs/frontend.md`, `feature-spec-template.md`.

## Scope

**In scope:**

- `dev-docs/portability-recovery-runbook.md`
- `dev-docs/checklists/ui-review.md`
- `dev-docs/audits/component-inventory.md`
- `dev-docs/context-docs/frontend.md`
- `dev-docs/feature-spec-template.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Verify portability runbook against current `.novellum.zip` export/import code.
2. Refresh component inventory against `src/modules/**` and `src/lib/components/**`.
3. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/portability-recovery-runbook.md`
- `dev-docs/checklists/ui-review.md`
- `dev-docs/audits/component-inventory.md`
- `dev-docs/context-docs/frontend.md`
- `dev-docs/feature-spec-template.md`

## Acceptance Criteria

- [ ] All five docs match shipped implementation.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
