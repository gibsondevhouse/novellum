---
title: ARIA, Focus, and Input Modality Compliance
slug: phase-001-aria-focus-and-input-modality-compliance
phase_number: 1
status: complete
owner: Reviewer Agent
stage: stage-003-accessibility-and-keyboard-hardening
parts:
  - part-001-apg-wcag-conformance-pass
estimated_duration: 4d
---

## Goal

Align interactive behavior with WCAG 2.2 AA and APG contracts so keyboard, screen reader, and pointer users receive equally reliable controls.

## Parts

| #   | Part                                                                        | Status  | Assigned To    | Est. Duration |
| --- | --------------------------------------------------------------------------- | ------- | -------------- | ------------- |
| 001 | [APG and WCAG Conformance Pass](part-001-apg-wcag-conformance-pass/part.md) | `draft` | Reviewer Agent | 4d            |

## Acceptance Criteria

- [ ] Dialog, tabs, tree, and toolbar interactions satisfy APG role/state/keybinding expectations
- [ ] Focus order and focus visibility are validated on all high-frequency flows
- [ ] Pointer target size and keyboard parity checks pass
- [ ] Accessibility findings and sign-off evidence archived

## Notes

When native HTML semantics provide the correct behavior, use them instead of adding ARIA.
