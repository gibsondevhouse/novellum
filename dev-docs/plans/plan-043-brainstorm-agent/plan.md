---
title: Brainstorm Agent
slug: plan-043-brainstorm-agent
version: 1.0.0
status: in-progress
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-25
target_completion: TBD
stages:
  - stage-001-agent-contract
  - stage-002-nova-ui
  - stage-003-accept-flow
  - stage-004-qa-docs
dependencies:
  - plan-042-quality-gates-closure
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - check:tokens
---

## Objective

Re-introduce `BrainstormAgent` (cut from internal V1 in plan-025) as a fully wired, review-gated feature.
This completes the **front end** of the author pipeline:

> **Brainstorm → Worldbuild → Outline → Draft → Manuscript**

A guided brainstorm session takes a seed idea from the author and produces structured creative seeds
— premise variants, thematic threads, genre hooks, protagonist sketches — that can be accepted into
worldbuilding context or saved as reference notes.

## Scope

**In scope:**

- `BrainstormAgent` service in `src/lib/ai/` following the `ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT FORMAT` prompt pattern.
- Brainstorm UI surface: a Nova-style guided session where the author provides a seed idea and receives a set of structured proposals.
- Review-gated accept flow: author accepts individual seeds into worldbuilding context (character seeds, realm seeds, premise notes) or discards them.
- Integration point with the worldbuilding module — accepted seeds surface as pre-filled draft context on the worldbuilding entity creation forms.
- Unit tests for the agent prompt, parser, and proposal schema.

**Out of scope:**

- Automatic worldbuilding entity creation from brainstorm output (author must trigger that explicitly).
- Brainstorm session persistence / history (first cut is ephemeral within the session).
- Multi-turn iterative brainstorm (single-shot output + accept/reject only).

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Agent Contract & Prompt](stage-001-agent-contract/stage.md) | `in-progress` | 1d |
| 002 | [Nova UI Integration](stage-002-nova-ui/stage.md) | `draft` | 1.5d |
| 003 | [Accept Flow & Worldbuild Hookup](stage-003-accept-flow/stage.md) | `draft` | 1d |
| 004 | [Tests, Docs & Quality Gates](stage-004-qa-docs/stage.md) | `draft` | 0.5d |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors
- [ ] **lint:css** — zero CSS lint errors
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all tests pass, new agent tests included
- [ ] **check:tokens** — zero token violations
- [ ] **manual_qa** — seed → brainstorm → accept → worldbuild context prefill path verified

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Brainstorm output schema is too freeform to reliably parse | medium | Constrain to a strict JSON schema; use structured outputs if provider supports it |
| Accepted seeds create duplicate worldbuilding entities | low | Accept inserts into a staging/pending state, not directly into canonical entities |

## Notes

`BrainstormAgent` was declared as a `TaskType` in the original agent registry but never wired to
a parser (cut by plan-025). The infrastructure (`ContextEngine`, `PromptBuilder`, `ModelRouter`)
is fully in place — this plan is feature implementation only, no new infrastructure needed.
See `src/lib/ai/` and `AGENTS.md` for current agent contracts.
