---
title: Prose Diff Calculator Utility
slug: part-001-prose-diff-calculator
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-001-prose-diff-helper
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: undefined
---

## Objective

Create simple text comparison helper to compute character-level insertions and deletions.

## Scope

**In scope:**

- Process current text and generated prose.
- Output operational tags.

**Out of scope:**

- Processing rich-text layout tags.

## Implementation Steps

1. Write prose-diff-helper.ts.
2. Run validation tests.

## Files

**Create:**

- `src/lib/ai/pipeline/prose-diff-helper.ts`
- `tests/ai/pipeline/prose-diff-helper.test.ts`

**Update:**

- _(none)_

## Acceptance Criteria

- [x] Helper correctly highlights additions and deletions.
- [x] Unit tests verify string outputs.

## Edge Cases

- Empty current text values: identify all input as insertions.

## Notes

> Part-level context for Prose Diff Calculator Utility.
