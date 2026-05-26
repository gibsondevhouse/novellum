---
title: Agents Map
slug: part-002-agents-map
part_number: 2
status: draft
owner: ai
assigned_to: ai
phase: phase-002-ai-system-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `agents-map.md` to match the runtime agent roster in `AGENTS.md`.

## Scope

**In scope:**

- `dev-docs/agents-map.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Copy the runtime roster table shape from `AGENTS.md` section 2.
2. For each agent, verify implementation exists under `src/lib/ai/<agent>.ts`.
3. Document I/O types referenced in `src/lib/ai/types.ts`.
4. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/agents-map.md`

## Acceptance Criteria

- [ ] `agents-map.md` matches `AGENTS.md` runtime roster.
- [ ] Every listed agent has a corresponding source file.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
