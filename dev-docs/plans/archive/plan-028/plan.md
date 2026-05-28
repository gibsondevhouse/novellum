---
title: V1.1 Hierarchical Pipeline UI
slug: plan-028-v1.1-hierarchical-pipeline-ui
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-26
last_updated: 2026-05-26
completed_at: 2026-05-26
target_completion: 2026-07-17
stages:
  - stage-001-outline-hierarchy-foundation
  - stage-002-worldbuild-stage-run-flow
  - stage-003-worldbuild-checkpoint-review-console
  - stage-004-verification-and-doc-sync
dependencies:
  - plan-027-v1.1-scoping
quality_gates:
  - lint
  - lint_css
  - typecheck
  - tests
  - boundaries
  - e2e
  - docs_sync
---

## Objective

Build the production UI for Novellum's seven-layer pipeline hierarchy, worldbuild stage orchestration, and explicit checkpoint review gates while preserving the no-auto-apply canon contract.

## Scope

**In scope:**

- Outline-first surface at `/projects/[id]/outline` for Arc -> Stage traversal and stage-scoped pipeline actions.
- Worldbuild-first pipeline family (`vibe-worldbuild.*`) including run, review, accept, reject, and history visibility.
- Deterministic frontend contracts for hierarchy path selection, stage runtime state, checkpoint lifecycle, and API adapter boundaries.
- Verification coverage (unit, integration, e2e) and docs/evidence sync for reviewer closeout.

**Out of scope:**

- `vibe-author` UI parity in this plan (explicitly deferred to follow-up plan).
- New backend schema, new persistence endpoint families, or direct provider SDK calls.
- Any workflow that bypasses checkpoint lifecycle or auto-mutates canon without explicit accept.

## Locked Contracts

- **Hierarchy model:** `PipelineHierarchyPath` with strict parent-required invariants:
  `arcId -> actId -> milestoneId -> chapterId -> sceneId -> beatId -> stageId`.
- **Runtime model:** deterministic stage-run state machine:
  `idle`, `ready`, `queued`, `running`, `completed_pending_checkpoint`, `failed`, `cancelled`.
  Streaming-only states are deferred unless explicitly enabled later.
- **Worldbuild run contract:** stage key + active hierarchy path + instruction/options in; draft artifact envelope + checkpoint id/lifecycle out.
- **Checkpoint decision contract:** explicit `review`, `accept`, `reject(reason)` transitions only; no silent canon mutation.
- **API policy:** reuse existing routes only (`/api/ai`, `/api/db/project-metadata/.../pipeline/...`, and existing `/api/db/*` entity routes).

## Stages

| #   | Stage                                                                 | Status  | Est. Duration |
| --- | --------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Outline Hierarchy Foundation](stage-001-outline-hierarchy-foundation/stage.md) | `complete` | 6d      |
| 002 | [Worldbuild Stage Run Flow](stage-002-worldbuild-stage-run-flow/stage.md) | `complete` | 7d            |
| 003 | [Worldbuild Checkpoint Review Console](stage-003-worldbuild-checkpoint-review-console/stage.md) | `complete` | 7d |
| 004 | [Verification and Doc Sync](stage-004-verification-and-doc-sync/stage.md) | `complete` | 4d            |

## Quality Gates

- [x] **lint** — `pnpm lint` clean
- [x] **lint_css** — `pnpm lint:css` clean
- [x] **typecheck** — `pnpm check` clean
- [x] **tests** — `pnpm test` clean
- [x] **boundaries** — no `eslint-plugin-boundaries` violations
- [x] **e2e** — hierarchical traversal + worldbuild run/review/accept/reject/failure paths green
- [x] **docs_sync** — architecture + AI pipeline docs reconciled with shipped UI behavior

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| UI path state allows impossible parent/child combinations | high | Ship and test a single typed path contract with parent-clear cascades and stale-node repair. |
| Stage run UX bypasses checkpoint lifecycle | high | Route all run results through draft checkpoints and require explicit review/accept/reject actions. |
| Frontend duplicates payload/transition logic | medium | Centralize run/checkpoint adapters and keep components view-only for lifecycle transitions. |
| Scope creep into `vibe-author` parity | medium | Keep explicit defer note in stage/phase/part artifacts; reject non-worldbuild additions in this plan. |

## Notes

- Source draft retained as non-canonical reference:
  [`# plan-028-v1.1-hierarchical-pipeline-ui.md`](./%23%20plan-028-v1.1-hierarchical-pipeline-ui.md)
- Canonical execution artifacts for this plan are `plan.md`, stage/phase/part files, and per-part evidence.
