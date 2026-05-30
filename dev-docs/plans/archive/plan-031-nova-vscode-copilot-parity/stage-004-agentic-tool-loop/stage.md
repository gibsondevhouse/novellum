---
title: Agentic Tool Loop
slug: stage-004-agentic-tool-loop
stage_number: 4
status: complete
owner: Planner Agent
plan: plan-031-nova-vscode-copilot-parity
phases:
  - phase-001-constraint-lift-and-tool-contract
  - phase-002-read-only-project-tools
  - phase-003-proposal-only-tools
  - phase-004-streaming-loop-implementation
  - phase-005-caps-abort-and-ui-states
  - phase-006-agentic-tests-and-source-contracts
estimated_duration: 6d
risk_level: critical
---

# Stage 004 — Agentic Tool Loop

## Goal

Enable a real, bounded Agent-mode tool loop using existing OpenRouter infrastructure, read-only project tools, and proposal-only mutation tools.

## Phases

| # | Phase | Status | Est. Duration | Goal |
| --- | --- | --- | --- | --- |
| 001 | [Constraint Lift and Tool Contract](phase-001-constraint-lift-and-tool-contract/phase.md) | `complete` | 0.75d | Lock the governance boundary before enabling runtime tool execution. |
| 002 | [Read-Only Project Tools](phase-002-read-only-project-tools/phase.md) | `complete` | 1.25d | Register pure project-data tools that let Agent mode inspect project state without mutation rights. |
| 003 | [Proposal-Only Mutation-Like Tools](phase-003-proposal-only-tools/phase.md) | `complete` | 1.25d | Expose useful authoring actions while guaranteeing Nova never auto-applies changes. |
| 004 | [Streaming Loop Implementation](phase-004-streaming-loop-implementation/phase.md) | `complete` | 1.5d | Extend single-pass chat into a bounded Agent-mode tool loop without regressing Ask or Write. |
| 005 | [Caps, Abort, and UI States](phase-005-caps-abort-and-ui-states/phase.md) | `complete` | 0.75d | Prevent runaway token burn and make Agent mode observable to the user. |
| 006 | [Agentic Tests and Source Contracts](phase-006-agentic-tests-and-source-contracts/phase.md) | `complete` | 0.5d | Prove Agent mode is real, bounded, and cannot mutate manuscript/editor paths through tools. |

## Entry Criteria

- Ask/Write/Agent mode routing is implemented and tested.
- Attachments and context disclosure are implemented or explicitly available for Agent mode context.
- Plan-031 plan.md records the lift of plan-030's no-broad-tool-calling constraint and the guardrails for this lift.

## Exit Criteria

- [x] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [x] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.
- [x] User abort, max-step exhaustion, tool error, and non-tool final response states are visible and tested.
- [x] Source-contract tests prove tool handlers do not import editor/manuscript mutation paths.

## Notes

- Status remains `draft` until implementation begins.
- Stage status derives from child phase statuses.
- Evidence must be stored under the relevant part `evidence/` directory.
