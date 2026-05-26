---
title: Loading States
slug: phase-002-loading-states
phase_number: 2
status: complete
owner: frontend
stage: stage-003-ux-consistency
parts:
  - part-001-async-loading-ui
estimated_duration: 1d
---

## Goal

Ensure no async data surface renders a blank content area. Every route and async operation must communicate loading state to the user via consistent skeleton or spinner UI.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Async Loading UI Patterns](./part-001-async-loading-ui.md) | `draft` | frontend | 1d |

## Acceptance Criteria

- [ ] Chat streaming in `ChatInterface` shows a typing indicator while streaming.
- [ ] Import/restore dialog in `ImportBackupDialog` shows a visual progress indicator beyond button text.
- [ ] All SvelteKit `+page.ts` loader routes show a skeleton during load.
- [ ] All parts reach `complete` status.

## Notes

Use CSS-only skeleton pulses (`@keyframes pulse`) keyed to `--color-surface-elevated`. No new animation deps.
