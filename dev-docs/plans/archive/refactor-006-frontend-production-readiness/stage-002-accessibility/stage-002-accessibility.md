---
title: Accessibility Compliance
slug: stage-002-accessibility
stage_number: 2
status: complete
owner: engineering
plan: refactor-006-frontend-production-readiness
phases:
  - phase-001-aria-semantics
  - phase-002-form-accessibility
estimated_duration: 2d
risk_level: medium
---

## Goal

Bring every interactive surface in Novellum to WCAG 2.1 AA baseline compliance — correct ARIA roles, complete keyboard navigation, robust focus management, and fully labelled forms.

## Phases

| # | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [ARIA Semantics & Keyboard Nav](./phase-001-aria-semantics/phase-001-aria-semantics.md) | `draft` | 1d |
| 002 | [Form Accessibility](./phase-002-form-accessibility/phase-002-form-accessibility.md) | `draft` | 1d |

## Entry Criteria

- Stage 001 is `complete`.

## Exit Criteria

- All phases complete.
- Axe automated scan on primary routes returns 0 critical/serious violations.
- Keyboard-only navigation test passes on: Library, Project Hub, Editor, Continuity, Outline.

## Notes

All a11y fixes must use semantic HTML first. ARIA attributes are a last resort, not a replacement for correct markup.
