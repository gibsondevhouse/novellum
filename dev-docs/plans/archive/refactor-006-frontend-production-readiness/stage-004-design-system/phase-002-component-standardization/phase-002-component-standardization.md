---
title: Component Standardization
slug: phase-002-component-standardization
phase_number: 2
status: complete
owner: frontend
stage: stage-004-design-system
parts:
  - part-001-button-migration
estimated_duration: 0.5d
---

## Goal

Ensure every action button in the application uses the standardised `PrimaryButton`, `GhostButton`, or `DestructiveButton` primitives, eliminating ad-hoc `<button class="btn-*">` patterns and bare `<button>` elements.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Button Primitive Migration](./part-001-button-migration.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

- [ ] `grep -rn "class=\"btn-\|class='btn-" src/` returns zero matches in module components.
- [ ] All parts reach `complete` status.

## Notes

`PrimaryButton`, `GhostButton` are already defined in `src/lib/components/ui/`. Confirm what `DestructiveButton` looks like (or if it needs to be created as a thin wrapper with `--color-error` accent) before migrating delete actions.
