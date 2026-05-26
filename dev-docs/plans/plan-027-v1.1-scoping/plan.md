---
title: V1.1 Fiction Pipeline Scoping and Delivery
slug: plan-027-v1.1-scoping
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-26
last_updated: 2026-05-27
target_completion: 2026-07-08
completed_at: 2026-05-27T11:05:00Z
stages:
  - stage-001-pipeline-foundation
  - stage-002-vibe-worldbuild
  - stage-003-vibe-author
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - e2e
---

## Objective

Establish and ship Novellum's staged fiction pipeline for V1.1 with explicit review/accept gates, starting from `Vibe-Worldbuild` and continuing into `Vibe-Author`, while aligning implementation to the verified schema hierarchy `arcs -> acts -> milestones -> chapters -> scenes -> beats -> stages`.

## Scope

**In scope:**

- Stage-typed orchestrator contract for worldbuild and authoring flows.
- Prompt library scaffolds persisted via `templates` when project-owned variants are needed.
- Checkpoint contract for `draft` artifacts and explicit accept/reject promotion into canon tables.
- Worldbuild stages: premise, worldspec, research briefs, and populated world bible.
- Author stages: premise, outline, scene draft sidecar, and revision pack.
- Schema scope decision for first-class `factions`, `themes`, and `glossary_terms` entities (with migration if approved).

**Out of scope:**

- Automatic manuscript mutation from AI output.
- Provider-surface expansion beyond current OpenRouter pipeline.
- Full tutoring UX copywriting pass beyond stage-level instructional hooks.

## Stages

| #   | Stage                                                      | Status  | Est. Duration |
| --- | ---------------------------------------------------------- | ------- | ------------- |
| 001 | [Pipeline Foundation](stage-001-pipeline-foundation/stage.md) | `complete` | 7d            |
| 002 | [Vibe-Worldbuild](stage-002-vibe-worldbuild/stage.md)         | `complete` | 9d            |
| 003 | [Vibe-Author](stage-003-vibe-author/stage.md)                 | `complete` | 10d   |

## Quality Gates

- [x] **lint** — `pnpm lint` and `pnpm lint:css` clean
- [x] **typecheck** — `pnpm check` clean
- [x] **tests** — `pnpm test` clean
- [x] **boundaries** — no modular-boundary violations
- [x] **e2e** — staged pipeline acceptance flows pass in Playwright
- [x] **docs_sync** — architecture + AI pipeline docs reconciled

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Contract mismatch between docs and orchestrator implementation depth | high | Stage 001 establishes typed contracts first, with parser tests before feature wiring. |
| Schema overreach for factions/themes/glossary | medium | Gate with explicit scope ADR and only ship migration for approved entities. |
| Hierarchy regression from assuming 5 layers instead of 7 | high | Hard-code 7-layer mapping in contracts, context builder tests, and outline integration acceptance. |
| Cost/latency spikes from oversized prompt payloads | medium | Enforce context policies, template constraints, and checkpointed stage boundaries. |

## Notes

Research inputs for this plan are pinned to `dev-docs/research/novellum-orientation-2026-05-26.md`, `dev-docs/research/fiction-pipeline-foundations-2026-05-26.md`, and `dev-docs/research/schema-verification-2026-05-26.md`. The schema correction (`arcs -> acts -> milestones -> chapters -> scenes -> beats -> stages`) is non-optional in all stage contracts.
