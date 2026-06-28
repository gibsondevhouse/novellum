---
title: Beat Schema Prompts Definition
slug: part-001-beat-schema-prompts-definition
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-beat-schema-prompts
started_at: 2026-06-28
completed_at: 2026-06-28
estimated_duration: 1d
---

## Objective

Define Zod array structures and prompt templates mapping scene summaries into pacing beats.

## Scope

**In scope:**

- Create beat schemas.
- Register beat prompt seeds.

**Out of scope:**

- Database writing logic.

## Implementation Steps

1. Update worldbuild-schemas.ts.
2. Add prompt seeds in prompt-library-seeds.ts.

## Files

**Create:**

- _(none)_

**Update:**

- `src/lib/ai/pipeline/worldbuild-schemas.ts`
- `src/lib/ai/pipeline/prompt-library-seeds.ts`

## Acceptance Criteria

- [x] Zod correctly parses array structures of narrative beats.

## Edge Cases

- _(none)_

## Notes

> Part-level context for Beat Schema Prompts Definition.
