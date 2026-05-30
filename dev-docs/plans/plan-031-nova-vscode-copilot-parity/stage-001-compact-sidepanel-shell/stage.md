---
title: Compact Sidepanel Shell
slug: stage-001-compact-sidepanel-shell
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-031-nova-vscode-copilot-parity
phases:
  - phase-001-density-audit-and-token-baseline
  - phase-002-header-body-footer-compression
  - phase-003-composer-action-row
  - phase-004-message-log-and-empty-state-density
  - phase-005-visual-baseline-rebaseline
estimated_duration: 4d
risk_level: medium
---

# Stage 001 — Compact Sidepanel Shell

## Goal

Compress Nova into a dense, modern assistant sidepanel at 280–520px widths without changing the product color system or drifting from design tokens.

## Phases

| # | Phase | Status | Est. Duration | Goal |
| --- | --- | --- | --- | --- |
| 001 | [Density Audit and Token Baseline](phase-001-density-audit-and-token-baseline/phase.md) | `draft` | 0.5d | Turn the visual target into measurable token and layout requirements before editing components. |
| 002 | [Header, Body, and Footer Compression](phase-002-header-body-footer-compression/phase.md) | `draft` | 1d | Reduce shell chrome while preserving context disclosure and project-state clarity. |
| 003 | [Composer Auto-Grow and Action Row](phase-003-composer-action-row/phase.md) | `draft` | 1d | Replace the prototype composer with a compact, single-line auto-grow input and a single action row. |
| 004 | [Message Log and Empty State Density](phase-004-message-log-and-empty-state-density/phase.md) | `draft` | 1d | Make messages, tool chips, and the initial prompt area feel like a modern assistant surface rather than a card-heavy prototype. |
| 005 | [Visual Baseline Rebaseline](phase-005-visual-baseline-rebaseline/phase.md) | `draft` | 0.5d | Lock the compact shell before behavior-heavy stages add modes, attachments, and tool-loop UI. |

## Entry Criteria

- Branch is `feat/nova-development` and plan-030 stage 001 context grounding is treated as the companion baseline, not reimplemented here.
- Current Nova sidepanel visual behavior has been captured through screenshots or existing Playwright baselines.
- No mode, attachment, or agent-loop behavior is changed during this stage except where required to prevent visual dead controls.

## Exit Criteria

- [ ] Header, body, composer, message log, and footer use compact spacing tokens and remain keyboard accessible.
- [ ] Composer presents one action row: attach, slash/tools slot, mode slot placeholder, model picker, send.
- [ ] Nova visual baselines are rebaselined once and documented before later stages add behavior.
- [ ] `pnpm check:tokens`, targeted Nova visual tests, and accessibility smoke checks are recorded as evidence.

## Notes

- Status remains `draft` until implementation begins.
- Stage status derives from child phase statuses.
- Evidence must be stored under the relevant part `evidence/` directory.
