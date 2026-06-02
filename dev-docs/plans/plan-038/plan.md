---
title: Novel Engine v1 — Draft From Outline (Guided Pipeline)
slug: plan-038-novel-engine-v1
version: 1.0.0
status: in-progress
owner: Planner Agent
created: 2026-06-01
last_updated: 2026-06-01
target_completion: 2026-06-07
stages:
  - stage-001-agentic-surface
  - stage-002-context-fetch-injection
  - stage-003-checkpoint-pipeline
  - stage-004-chapter-draft-runner
  - stage-005-quality-gap-closure
dependencies:
  - plan-037-agentic-worldbuild-scan
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Deliver a guided, checkpointed pipeline that takes an approved outline in the DB and
generates scene drafts (one-by-one or by chapter), surfaces them as reviewable artifacts in
Nova, and writes accepted drafts into `scenes.content` with explicit user confirmation.
This makes Novellum feel like a real long-form "novel engine" without needing one giant prompt.

## Scope

**In scope:**

- Stabilize the agentic surface: fix agent task role/description copy that actively discourages tool
  calls, and fix Nova Composer UX copy labelling Agent mode as "coming soon".
- Make `buildContext` reliable in server execution contexts via dependency-injected fetch.
- Author Draft Checkpoint mechanism stored in `project_metadata` with create / list / accept / reject.
- Accept path writes HTML prose + wordCount to `scenes.content` with stale-guard and explicit confirmation.
- Chapter drafting runner in Nova: loads ordered scenes, generates one checkpoint per scene,
  supports AbortSignal cancellation and progress indication.
- Outline intent (goal/conflict/turn/outcome) included in scene draft context.
- Source-contract tests for new Nova components.
- Unit tests for checkpoint service, context builder, and agent mode copy assertions.

**Out of scope:**

- Worldbuilding → outline generation (v2).
- New SQLite tables (all artifacts stored in existing `project_metadata`).
- Streaming scene drafts (non-streaming generation only for v1).
- Auto-applying accepted prose to manuscript (explicit accept → apply only).

## Stages

| #   | Stage                                                                 | Status        | Est. Duration |
| --- | --------------------------------------------------------------------- | ------------- | ------------- |
| 001 | [Agentic Surface Stabilization](stage-001-agentic-surface/stage.md)  | `in-progress` | 0.5d          |
| 002 | [Context Fetch Injection](stage-002-context-fetch-injection/stage.md)| `draft`       | 0.5d          |
| 003 | [Checkpoint + Apply Pipeline](stage-003-checkpoint-pipeline/stage.md) | `complete`   | 2d            |
| 004 | [Chapter Draft Runner](stage-004-chapter-draft-runner/stage.md)      | `complete`    | 1d            |
| 005 | [Quality & Gap Closure](stage-005-quality-gap-closure/stage.md)      | `draft`       | 1d            |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **typecheck** — `pnpm check` reports 0 errors
- [ ] **lint** — `pnpm lint` passes (pre-existing violations documented and deferred)
- [ ] **tests** — `pnpm test` passes all suites
- [ ] **check:tokens** — `pnpm check:tokens` 0 violations

## Risks & Mitigations

| Risk                                           | Likelihood | Mitigation                                           |
| ---------------------------------------------- | ---------- | ---------------------------------------------------- |
| `buildContext` relative-URL failures on server | medium     | Stage 002 fetch injection resolves this explicitly   |
| LLM sidecar parse failures                     | medium     | Two-attempt repair prompt in generate route          |
| Stale scene overwrites                         | low        | Stale-guard hash check + force-overwrite confirmation |
| `rawOutput` leaking model output to client     | low        | Stage 005 strips it from the production response      |

## Notes

- Codex implemented stages 003 and 004 prior to plan artifact creation. Stage 001 phase-001
  (task definitions) is also done; phase-002 (Composer copy) remains.
- The `draft` lifecycle value is defined in the contract but never assigned by the service
  (all checkpoints start at `review`). This should either be removed or given a trigger in
  stage 005.
- `unresolvedThreads` in `SceneDraftContext` is always `[]` — plot thread loading deferred to
  stage 005.
