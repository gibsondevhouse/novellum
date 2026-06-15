---
title: Pipeline, Nova, and Editor Trust Closure
slug: plan-052-pipeline-nova-editor-trust-closure
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-06-15
last_updated: 2026-06-15
target_completion: 2026-07-08
stages:
  - stage-001-artifact-action-contract
  - stage-002-durable-nova-artifact-actions
  - stage-003-author-facing-copy-and-metadata-polish
  - stage-004-verification-and-handoff
dependencies:
  - plan-045-agent-tool-mutation-boundary
  - plan-046-pipeline-checkpoint-contract-reconciliation
  - plan-048-frontend-experience-coherence
  - plan-051-governed-ai-controller-runtime
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

Close pre-release trust gaps in Nova, editor, and pipeline surfaces where generated artifacts appear actionable but do not produce durable, review-gated results, and remove internal engineering language from author-facing AI screens.

## Scope

**In scope:**

- Wire Nova chat scene-draft Accept/Reject actions to a durable review-gated pathway instead of local-only button state.
- Persist Nova revision-pack acknowledgements so they survive navigation and session reloads.
- Normalize author-facing labels, timestamps, identifiers, provenance, lifecycle states, and legacy artifact copy across Nova and editor cards.
- Audit and resolve dead or misleading chrome in Nova, AI settings, and updater status surfaces.
- Add source-contract, component, and E2E coverage for the corrected artifact actions and cleaned user-facing copy.

**Out of scope:**

- Introducing a new unrestricted manuscript mutation path from chat artifacts.
- Replacing the governed controller runtime or existing checkpoint services.
- Shipping full slash-command or LM Studio support unless the plan explicitly promotes an existing affordance.
- Changing provider credential storage or release-signing infrastructure.

## Product Contract

Authors can trust every visible Nova action. If a button says Accept, Reject, Acknowledge, or Copy, the result is observable, durable where appropriate, and does not silently mutate manuscript content outside an explicit review gate.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Artifact Action Contract](stage-001-artifact-action-contract/stage.md) | `draft` | 1d |
| 002 | [Durable Nova Artifact Actions](stage-002-durable-nova-artifact-actions/stage.md) | `draft` | 3d |
| 003 | [Author-Facing Copy And Metadata Polish](stage-003-author-facing-copy-and-metadata-polish/stage.md) | `draft` | 2d |
| 004 | [Verification And Handoff](stage-004-verification-and-handoff/stage.md) | `draft` | 1d |

## Guardrails

- No Nova chat artifact may apply manuscript content without explicit human confirmation and the existing stale/dirty editor safeguards.
- Review-gated checkpoint flows remain the canonical mutation boundary for scene drafts and outline materialization.
- Raw UUIDs, hashes, prompt versions, schema versions, and internal route labels are hidden from default author-facing surfaces.
- Future-facing affordances are either removed, accurately labelled as unavailable, or backed by a real route to documentation/settings.
- All changes preserve Svelte 5 runes patterns and the existing module boundaries.

## Adjacent Development Opportunities Included

- Create shared AI display-label helpers that can later be reused by worldbuilding and outline review surfaces.
- Treat revision acknowledgement as a lightweight durable review note under project metadata, creating a pattern for future non-mutating artifact annotations.
- Route inline chat artifact actions through the same audit vocabulary used by the governed controller when available, without making plan-051 completion a fake dependency.
- Use this plan to remove or demote stale pre-release affordances before release-candidate review.

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
| Chat scene draft envelopes may not contain enough target context to apply directly. | high | Persist them as explicit draft checkpoints or block with clear copy until context is sufficient; never pretend Accept applied prose. |
| Polish cleanup may remove details useful for debugging. | medium | Move internals behind advanced/debug disclosure instead of deleting diagnostics from developer paths. |
| Acknowledge persistence could be mistaken for accepting manuscript edits. | medium | Name it as review-note state and keep it separate from manuscript and canon mutations. |
| Plan-051 controller files may not be present in every branch snapshot. | medium | Use the current checkpoint and project-metadata services as the execution base; integrate controller audit only when the runtime exists. |

## Candidate Basis

This plan expands `dev-docs/plans/candidate-plans/pipeline-nova-editor.md` into a full plan tree and folds adjacent release-candidate opportunities into the matching execution stages.

## Notes

This is a draft/deferred implementation plan. Do not execute it or mark any child artifact `in-progress` until the plan is explicitly activated. Do not mark it `complete` until Reviewer Agent sign-off is real.
