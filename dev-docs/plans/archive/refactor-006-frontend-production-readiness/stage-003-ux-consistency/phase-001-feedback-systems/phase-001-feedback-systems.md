---
title: Feedback Systems
slug: phase-001-feedback-systems
phase_number: 1
status: complete
owner: frontend
stage: stage-003-ux-consistency
parts:
  - part-001-toast-service
  - part-002-empty-state-component
estimated_duration: 1d
---

## Goal

Replace all ad-hoc inline error/success messages with a centralised toast notification service, and consolidate all empty-state UI into a single reusable `<EmptyState>` component.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Global Toast Service](./part-001-toast-service.md) | `draft` | frontend | 0.5d |
| 002 | [EmptyState Component](./part-002-empty-state-component.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

- [ ] A `toast()` function is importable from `$lib/stores/toast.svelte.ts` and renders notifications in the root layout.
- [ ] All save/delete/error operations in `PromptEditor`, `ProjectCreateCard`, and `ExportModal` use `toast()` instead of inline status text.
- [ ] A single `<EmptyState>` component exists and is used in all routes that previously had divergent empty-state markup.
- [ ] All parts reach `complete` status.

## Notes

Toast store must be a `.svelte.ts` Svelte 5 rune store. No legacy `writable()` stores.
