---
title: Warning Audit & Resolution
slug: phase-001-warning-audit
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-001-typescript-warnings
parts:
  - part-001-identify-warnings
  - part-002-resolve-warnings
estimated_duration: 1d
---

## Goal

Identify all TypeScript warnings from `pnpm check` and systematically resolve each to zero.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Identify Warnings](part-001-identify-warnings/part.md) | `draft` | — | 0.25d |
| 002 | [Resolve Warnings](part-002-resolve-warnings/part.md) | `draft` | — | 0.75d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] `pnpm check` runs with zero errors and zero warnings
- [ ] Each warning documented with root cause analysis in evidence
- [ ] All test suites pass after changes

## Notes

Start with a clean audit of `pnpm check` output to establish the baseline. Then tackle each
warning individually, understanding the type-safety issue before applying a fix. Some warnings
may require broader refactoring; document those for future structural improvements.
