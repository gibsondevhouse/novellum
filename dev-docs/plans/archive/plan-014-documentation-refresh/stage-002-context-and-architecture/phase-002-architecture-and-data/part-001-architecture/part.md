---
title: Architecture
slug: part-001-architecture
part_number: 1
status: draft
owner: architect
assigned_to: architect
phase: phase-002-architecture-and-data
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `architecture.md` and `tech-stack-docs.md`.

## Scope

**In scope:**

- `dev-docs/architecture.md`
- `dev-docs/tech-stack-docs.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Validate architectural claims against source.
2. Ensure diagrams/prose reflect the runtime pipeline (ContextEngine → PromptBuilder → ModelRouter → OpenRouter).
3. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/architecture.md`
- `dev-docs/tech-stack-docs.md`

## Acceptance Criteria

- [ ] `architecture.md` matches shipped system.
- [ ] `tech-stack-docs.md` versions match `package.json`.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
