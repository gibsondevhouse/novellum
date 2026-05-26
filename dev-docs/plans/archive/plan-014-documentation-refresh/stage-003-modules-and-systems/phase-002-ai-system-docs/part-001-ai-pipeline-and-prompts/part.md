---
title: AI Pipeline & Prompts
slug: part-001-ai-pipeline-and-prompts
part_number: 1
status: draft
owner: ai
assigned_to: ai
phase: phase-002-ai-system-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Refresh `ai-pipeline.md`, `context-engine.md`, `prompt-system.md`.

## Scope

**In scope:**

- `dev-docs/ai-pipeline.md`
- `dev-docs/context-engine.md`
- `dev-docs/prompt-system.md`

**Out of scope:**

- Source code changes beyond documentation fixes.
- Adding new features not yet shipped.

## Implementation Steps

1. Verify claims against `src/lib/ai/**` (task-resolver, prompt-builder, context-engine, model-router).
2. Document the five-section prompt contract (ROLE / TASK / CONTEXT / CONSTRAINTS / OUTPUT FORMAT).
3. Document context policies (e.g., `scene_plus_adjacent`).
4. Run `pnpm run lint`.

## Files

**Update:**

- `dev-docs/ai-pipeline.md`
- `dev-docs/context-engine.md`
- `dev-docs/prompt-system.md`

## Acceptance Criteria

- [ ] All three docs match `src/lib/ai/**`.
- [ ] Prompt contract documented exactly per `AGENTS.md`.
- [ ] `pnpm run lint` passes.

## Edge Cases

- Terminology drift between doc and source — glossary wins.
- Markdown lint regressions (MD034 bare URLs, MD060 table alignment).

## Notes

Record evidence under `evidence/` (lint log, diff summary, or cross-reference check).
