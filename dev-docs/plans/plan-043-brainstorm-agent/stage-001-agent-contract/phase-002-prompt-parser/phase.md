---
title: Prompt & Parser
slug: phase-002-prompt-parser
phase_number: 2
status: review
owner: Planner Agent
stage: stage-001-agent-contract
parts:
  - part-001-prompt-builder
  - part-002-parser-tests
estimated_duration: 0.5d
---

## Goal

Implement the prompt builder that constructs the brainstorm request (ROLE → TASK → CONTEXT →
CONSTRAINTS → OUTPUT) and the parser that reliably deserializes brainstorm output.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Prompt Builder](part-001-prompt-builder/part.md) | `review` | Codex | 0.3d |
| 002 | [Parser Tests](part-002-parser-tests/part.md) | `review` | Codex | 0.2d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Prompt builder wired to `PromptBuilder` service
- [ ] Parser correctly deserializes JSON output
- [ ] Parser validates schema constraints
- [ ] All tests pass with >90% coverage

## Notes

The prompt must be crafted to produce strictly formatted JSON. Use structured output formats
if the provider supports them (e.g., OpenRouter JSON mode). Fallback to manual JSON parsing
if needed, but with defensive guards.
