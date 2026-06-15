---
title: Worldbuilding and Outline Review Flow Closure
slug: plan-053-worldbuilding-outline-review-flow-closure
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-06-15
last_updated: 2026-06-15
target_completion: 2026-07-15
stages:
  - stage-001-worldbuilding-proposal-review-surface
  - stage-002-worldbuilding-generation-execution-state
  - stage-003-outline-review-panel-polish
  - stage-004-worldbuilding-persistence-error-handling
  - stage-005-verification-and-documentation
dependencies:
  - plan-037-agentic-worldbuild-scan
  - plan-040-outline-generation
  - plan-047-worldbuilding-canon-merge-diff
  - plan-049-agent-runtime-stack-hardening
  - plan-052-pipeline-nova-editor-trust-closure
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - e2e
  - check:tokens
  - docs_sync
  - manual_verify
---

## Objective

Close the remaining worldbuilding and outline trust gaps by surfacing persisted worldbuilding proposals for review, making generation buttons reflect real execution state, and replacing outline debug metadata with readable reviewer-facing labels.

## Scope

**In scope:**

- Wire worldbuilding scan proposals into product routes with pending counts, proposal tiles, review actions, refresh, and navigation-safe state.
- Connect worldbuilding Generate affordances to real generation execution and the existing generation state machine instead of only opening a seeded Nova prompt.
- Polish outline checkpoint queue and review panels so lifecycle, task, metadata, and payload information are readable and appropriately disclosed.
- Remove noisy production console errors from worldbuilding character persistence paths in favor of structured/user-safe handling.
- Add unit/component/E2E evidence for proposal review, generation state transitions, and outline review copy.

**Out of scope:**

- Replacing worldbuilding canon merge semantics from plan-047.
- Adding new worldbuilding entity categories beyond the existing domain model.
- Building a large-novel performance harness; that remains a separate candidate opportunity.
- Introducing a cloud queue or external vector database.
- Auto-accepting generated worldbuilding or outline artifacts.

## Product Contract

Authors can see, review, accept, reject, and recover from worldbuilding and outline generation outputs through explicit review surfaces. Status widgets reflect real execution and review state rather than aspirational UI.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Worldbuilding Proposal Review Surface](stage-001-worldbuilding-proposal-review-surface/stage.md) | `draft` | 3d |
| 002 | [Worldbuilding Generation Execution State](stage-002-worldbuilding-generation-execution-state/stage.md) | `draft` | 3d |
| 003 | [Outline Review Panel Polish](stage-003-outline-review-panel-polish/stage.md) | `draft` | 2d |
| 004 | [Worldbuilding Persistence Error Handling](stage-004-worldbuilding-persistence-error-handling/stage.md) | `draft` | 1d |
| 005 | [Verification And Documentation](stage-005-verification-and-documentation/stage.md) | `draft` | 1d |

## Guardrails

- Worldbuilding scan proposals remain non-canonical until explicit accept.
- Generate buttons must transition through truthful states: missing-context, running or queued, review-ready, failed, accepted, or rejected.
- Outline raw payloads and debug metadata are hidden by default and exposed only through advanced/debug disclosure.
- Readiness guards must block generation with clear missing-context reasons rather than opening Nova optimistically.
- No console-only production failures for author-facing save/persistence paths.

## Adjacent Development Opportunities Included

- Add pending proposal badges to worldbuilding navigation and domain cards so scan results become discoverable immediately.
- Introduce shared label helpers from plan-052 for outline lifecycle and task labels.
- Use runtime queue/controller metadata from plans 049 and 051 where present, but keep synchronous review-gated behavior working without forcing background execution.
- Create a repeatable review-center pattern for future AI proposal families beyond worldbuilding and outline.

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** - zero lint errors
- [ ] **lint:css** - zero CSS lint errors
- [ ] **typecheck** - zero type errors and zero warnings
- [ ] **tests** - relevant unit and integration suites pass
- [ ] **e2e** - targeted Playwright coverage passes for changed product flows
- [ ] **check:tokens** - zero visual token violations
- [ ] **docs_sync** - docs and trackers reflect shipped behavior
- [ ] **manual_verify** - Reviewer Agent validates user-facing behavior and review gates

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Proposal tiles may duplicate existing domain cards and create visual clutter. | medium | Use domain-level pending sections and concise badges instead of adding a second full dashboard. |
| Generation state may claim work is running when only Nova prompt seeding happened. | high | Replace the action contract first and test state transitions against actual route calls. |
| Outline debug cleanup may hide necessary reviewer diagnostics. | medium | Keep diagnostics behind explicit advanced details and preserve raw payload for developer inspection. |
| Worldbuilding accept/reject routes may have branch-specific behavior. | medium | Ground implementation in current route tests and use source-contract coverage before UI wiring. |

## Candidate Basis

This plan expands `dev-docs/plans/candidate-plans/worldbuilding-outline.md` into a full plan tree and folds adjacent release-candidate opportunities into the matching execution stages.

## Notes

This is a draft/deferred implementation plan. Do not execute it or mark any child artifact `in-progress` until the plan is explicitly activated. Do not mark it `complete` until Reviewer Agent sign-off is real.
