---
title: Accessibility and Keyboard Hardening
slug: stage-003-accessibility-and-keyboard-hardening
stage_number: 3
status: complete
owner: Reviewer Agent
plan: refactor-001-ui_ux-polish
phases:
  - phase-001-aria-focus-and-input-modality-compliance
estimated_duration: 4d
risk_level: low
---

## Goal

Bring interactive UI behavior to a reliable WCAG 2.2 AA baseline with APG-compliant semantics and keyboard contracts for all composite widgets.

## Phases

| #   | Phase                                                                                                     | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [ARIA, Focus, and Input Modality Compliance](phase-001-aria-focus-and-input-modality-compliance/phase.md) | `draft` | 4d            |

## Entry Criteria

- Stage 002 visual/motion updates are stable enough for accessibility verification
- Component inventory includes dialogs, tabs, trees, toolbars, and command surfaces

## Exit Criteria

- Focus order, focus visibility, and escape routes verified for all major interactive flows
- Composite widgets follow APG role/state/keybinding patterns
- Pointer target size and keyboard equivalence requirements validated
- Accessibility evidence captured (keyboard walkthroughs, screen reader notes, checklist)

## Notes

Use APG and WCAG quickref as normative references. Avoid ARIA where native semantics suffice.
