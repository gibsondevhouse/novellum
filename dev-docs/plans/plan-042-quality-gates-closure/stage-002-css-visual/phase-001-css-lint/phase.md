---
title: CSS Lint Fix
slug: phase-001-css-lint
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-002-css-visual
parts:
  - part-001-fix-css
estimated_duration: 0.25d
---

## Goal

Locate and fix the lint:css error in `IndividualsWorkspaceShell.svelte:183`.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Fix CSS Error](part-001-fix-css/part.md) | `draft` | — | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] `pnpm lint:css` shows zero errors
- [ ] Specific `IndividualsWorkspaceShell.svelte` error is resolved
- [ ] No new lint:css errors introduced

## Notes

This is a straightforward linting fix. Check the error message from `pnpm lint:css` to
understand the specific violation, then apply the minimal fix (formatting, property order, etc.).
