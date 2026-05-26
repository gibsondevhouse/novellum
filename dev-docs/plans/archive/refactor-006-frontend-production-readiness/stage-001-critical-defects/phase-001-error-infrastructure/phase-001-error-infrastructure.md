---
title: Error Handling Infrastructure
slug: phase-001-error-infrastructure
phase_number: 1
status: complete
owner: frontend
stage: stage-001-critical-defects
parts:
  - part-001-error-boundaries
  - part-002-type-safety
estimated_duration: 1d
---

## Goal

Give users graceful, recoverable error experiences on every route and eliminate silent runtime failures from unsafe type casts.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Global Error Boundaries](./part-001-error-boundaries.md) | `draft` | frontend | 0.5d |
| 002 | [Type Safety Hardening](./part-002-type-safety.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

- [ ] `src/routes/+error.svelte` exists and renders a user-friendly error page with a "Go home" CTA.
- [ ] `src/routes/projects/[id]/+error.svelte` exists and renders project-scoped error with a "Back to Library" CTA.
- [ ] No `as unknown as` casts remain in `src/` (verified by grep).
- [ ] All parts reach `complete` status.

## Notes

Error pages must use existing design-system tokens and layout primitives. They should not introduce new CSS.
