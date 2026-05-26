---
title: Functional after build
slug: stage-001-functional-after-build
status: complete
phases:
  - phase-001-execution
---

## Goal

Execute the full plan-025 fix list in one pass, then prove it with the
extended smoke harness and the V1 manual checklist.

## Phases

| #   | Phase                                                    | Status     |
| --- | -------------------------------------------------------- | ---------- |
| 001 | [Execution](phase-001-execution/phase.md)                | `complete` |

## Acceptance

- All six categories (A appData paths, B agent cut, C stub hiding,
  D log hygiene, E verification surface, F gates) land in a single
  cohesive change set.
- `pnpm smoke:built` passes 7/7 against the staged build output.
- Manual checklist file exists under `dev-docs/qa-docs/` so the next
  release verifier has a single page to walk.
