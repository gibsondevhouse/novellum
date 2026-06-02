---
title: Composer UX Copy — Agent Mode Labels
slug: phase-002-composer-copy
phase_number: 2
status: complete
owner: Stylist Agent
stage: stage-001-agentic-surface
parts:
  - part-001-nova-composer-agent-copy
estimated_duration: 1h
---

## Goal

Update `NovaComposer.svelte` so Agent mode no longer presents as "coming soon" in either
the mode option description or the composer placeholder text.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Nova Composer Agent Copy](part-001-nova-composer-agent-copy/part.md) | `draft` | Stylist Agent | 1h |

## Acceptance Criteria

- [ ] `MODE_OPTIONS` entry for `agent` has a description that does not include "coming soon".
- [ ] `composerPlaceholder` for `agent` mode does not say "coming soon" or "routed to Ask".
- [ ] A unit test (string assertion) confirms neither phrase appears in the component source.

## Notes

Two lines in `NovaComposer.svelte` (line ~33 description, line ~63 placeholder) still carry
the stale copy from before Agent mode was wired (plan-031). These are the only changes
required in this phase.
