---
title: ARIA Semantics & Keyboard Navigation
slug: phase-001-aria-semantics
phase_number: 1
status: complete
owner: frontend
stage: stage-002-accessibility
parts:
  - part-001-aria-labels
  - part-002-focus-management
estimated_duration: 1d
---

## Goal

Correct all missing or misapplied ARIA attributes on interactive elements and ensure every modal, carousel, and overlay can be operated entirely by keyboard.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [ARIA Labels & Semantic Roles](./part-001-aria-labels.md) | `draft` | frontend | 0.5d |
| 002 | [Focus Trap & Keyboard Navigation](./part-002-focus-management.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

- [ ] No interactive `<span>` or `<div>` elements carry `aria-disabled` without a matching `role` attribute.
- [ ] `StructureCarousel` navigation buttons are in the tab order and operable by keyboard.
- [ ] `OnboardingModal` traps focus while open; Escape closes it; focus returns to the trigger element on close.
- [ ] All parts reach `complete` status.

## Notes

Read the `accessibility-a11y` skill before starting: `.github/skills/accessibility-a11y/SKILL.md`.
