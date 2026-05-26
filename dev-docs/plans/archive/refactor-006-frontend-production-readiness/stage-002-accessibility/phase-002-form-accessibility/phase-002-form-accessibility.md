---
title: Form Accessibility
slug: phase-002-form-accessibility
phase_number: 2
status: complete
owner: frontend
stage: stage-002-accessibility
parts:
  - part-001-form-aria
estimated_duration: 1d
---

## Goal

Every form input across the application must have a visible or programmatically associated label, communicate required state and validation errors to assistive technology, and associate the confirmation checkbox in the migration flow with its label.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Form ARIA & Label Associations](./part-001-form-aria.md) | `draft` | frontend | 1d |

## Acceptance Criteria

- [ ] `grep -rn '<input' src/` — every `<input>` has either a `<label for=...>` or `aria-label`.
- [ ] `aria-required="true"` is present on all required form fields.
- [ ] `aria-invalid` is dynamically set based on validation state.
- [ ] Migration page checkbox has an associated `<label>`.
- [ ] All parts reach `complete` status.

## Notes

Audit scope is `src/modules/` form components and `src/routes/settings/migrate/+page.svelte`.
