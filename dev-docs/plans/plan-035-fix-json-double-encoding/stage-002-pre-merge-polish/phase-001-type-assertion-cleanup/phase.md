---
title: Type Assertion Cleanup
slug: phase-001-type-assertion-cleanup
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-002-pre-merge-polish
parts:
  - part-001-fix-double-casts
estimated_duration: 0.25d
---

## Goal

Replace seven `as unknown as <Type>` double-casts in `GeneratedEntityModal.svelte` with narrower, safer casts. These are in the same file changed by Stage 001, so the cost is near-zero.

## Parts

| #   | Part                                                                          | Status  |
| --- | ----------------------------------------------------------------------------- | ------- |
| 001 | [Fix Double-Cast Type Assertions](part-001-fix-double-casts/part.md)          | `draft` |

## Entry Criteria

- [ ] Stage 001 Phase 001 complete (file already modified)

## Exit Criteria

- [ ] No `as unknown as` patterns remain in `GeneratedEntityModal.svelte`
- [ ] `pnpm check` still zero errors
