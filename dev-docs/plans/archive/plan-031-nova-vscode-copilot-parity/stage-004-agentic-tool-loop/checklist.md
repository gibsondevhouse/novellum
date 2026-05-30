---
stage: stage-004-agentic-tool-loop
last_updated: 2026-05-28
status: draft
---

# Stage Checklist

## Pre-Implementation

- [ ] Ask/Write/Agent mode routing is implemented and tested.
- [ ] Attachments and context disclosure are implemented or explicitly available for Agent mode context.
- [ ] Plan-031 plan.md records the lift of plan-030's no-broad-tool-calling constraint and the guardrails for this lift.

## Implementation

- [ ] Complete `phase-001-constraint-lift-and-tool-contract` — Constraint Lift and Tool Contract
- [ ] Complete `phase-002-read-only-project-tools` — Read-Only Project Tools
- [ ] Complete `phase-003-proposal-only-tools` — Proposal-Only Mutation-Like Tools
- [ ] Complete `phase-004-streaming-loop-implementation` — Streaming Loop Implementation
- [ ] Complete `phase-005-caps-abort-and-ui-states` — Caps, Abort, and UI States
- [ ] Complete `phase-006-agentic-tests-and-source-contracts` — Agentic Tests and Source Contracts

## Post-Implementation

- [ ] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [ ] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.
- [ ] User abort, max-step exhaustion, tool error, and non-tool final response states are visible and tested.
- [ ] Source-contract tests prove tool handlers do not import editor/manuscript mutation paths.
- [ ] Stage `impl.log.md` entries, if any, are append-only.
- [ ] Reviewer Agent has reviewed all child phases.
