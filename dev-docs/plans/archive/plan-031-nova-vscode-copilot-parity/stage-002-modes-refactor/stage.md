---
title: Modes Refactor — Ask, Write, Agent
slug: stage-002-modes-refactor
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-031-nova-vscode-copilot-parity
phases:
  - phase-001-mode-type-and-session-state
  - phase-002-mode-ui-and-keyboard
  - phase-003-prompt-and-resolver-routing
  - phase-004-write-mode-pipeline-migration
  - phase-005-mode-regression-tests
estimated_duration: 4d
risk_level: high
---

# Stage 002 — Modes Refactor — Ask, Write, Agent

## Goal

Replace the misleading Chat/Scribe model with explicit Ask, Write, and Agent modes that route through distinct prompt and resolver contracts.

## Phases

| # | Phase | Status | Est. Duration | Goal |
| --- | --- | --- | --- | --- |
| 001 | [Mode Type and Session State](phase-001-mode-type-and-session-state/phase.md) | `draft` | 1d | Replace old mode primitives with a durable per-project Nova mode model. |
| 002 | [Mode UI and Keyboard Contract](phase-002-mode-ui-and-keyboard/phase.md) | `draft` | 0.75d | Expose the mode model through the compact composer without turning the sidepanel back into a bulky control surface. |
| 003 | [Prompt and Resolver Routing](phase-003-prompt-and-resolver-routing/phase.md) | `draft` | 1d | Make each mode route through the right AI contract instead of relying on prompt regexes. |
| 004 | [Write Mode Pipeline Migration](phase-004-write-mode-pipeline-migration/phase.md) | `draft` | 0.75d | Convert the old Scribe outline path into a real Write-mode proposal workflow. |
| 005 | [Mode Regression Tests](phase-005-mode-regression-tests/phase.md) | `draft` | 0.5d | Prove the mode refactor did not break grounding, proposal-only behavior, or compact UI state. |

## Entry Criteria

- Stage 001 compact action row is merged or available locally.
- Plan-030 stage 001 context grounding behavior remains intact.
- No agentic tool loop is enabled yet; this stage prepares the mode contract.

## Exit Criteria

- [x] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [x] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.
- [x] Write mode preserves existing Scribe outline capability but reframes it as proposal generation.
- [x] Last-used mode persists per project without leaking between projects.

## Notes

- Status remains `draft` until implementation begins.
- Stage status derives from child phase statuses.
- Evidence must be stored under the relevant part `evidence/` directory.
