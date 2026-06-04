---
title: Outline Generation — Worldbuilding to Outline
slug: plan-040-outline-generation
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-01
last_updated: 2026-06-04
target_completion: 2026-06-17
stages:
  - stage-001-outline-contract-and-checkpoint-storage
  - stage-002-generation-service-and-prompt
  - stage-003-nova-outline-review-surface
  - stage-004-accept-materialization-and-conflict-safety
  - stage-005-quality-gates-docs-and-closeout
dependencies:
  - plan-037-agentic-worldbuild-scan
  - plan-038-novel-engine-v1
quality_gates:
  - check
  - lint
  - lint:css
  - tests
  - tokens
  - e2e
  - docs_sync
  - manual_verify
---

## Objective

Close the gap between worldbuilding and drafting by adding AI-assisted outline generation.
Authors with established worldbuilding context should be able to generate a structured outline as a reviewable checkpoint, inspect it in Nova, and explicitly accept it before anything is materialized into the project hierarchy.

Target authoring loop:

```text
Worldbuild → Outline → Draft → Review → Manuscript
```

This plan extends the existing review-gated generation pattern established by plan-037 and the author draft checkpoint/application flow from plan-038. It does not bypass the local-first storage model, the OpenRouter-only AI boundary, or the “AI suggests, author accepts” safety contract.

## Scope

**In scope:**

- Define a typed `OutlineDraft` contract for Arc → Act → Chapter → Scene output, including per-scene intent fields: `goal`, `conflict`, `turn`, and `outcome`.
- Build a checkpointed outline draft model stored under project metadata / pipeline scope until the author accepts or rejects it.
- Add context sufficiency checks so outline generation does not run from empty or low-signal worldbuilding context.
- Add an outline generation service that uses existing AI pipeline boundaries: `ContextEngine → PromptBuilder → ModelRouter → OpenRouter`.
- Support a two-pass generation strategy: structure spine first, scene-intent cards second, merged into one reviewable checkpoint.
- Surface outline generation and review inside Nova using production UX states: empty, ready, loading, review-ready, accepted, rejected, failed, and conflict-blocked.
- Materialize accepted outline checkpoints into existing hierarchy records atomically through server-side DB/API boundaries.
- Preserve plan-038 draft pipeline compatibility by storing scene intent data where downstream draft context can read it.
- Add unit, route, component, and e2e tests proving no outline writes occur before explicit accept.
- Sync internal docs and capture quality-gate evidence.

**Out of scope:**

- Regenerating an existing outline in place.
- Structural diffing, semantic merge tools, or automatic merge of generated and manually edited outlines.
- Cross-project outline templates.
- Public template marketplace, account sync, telemetry, or cloud persistence.
- Direct provider SDK calls or client-side API-key exposure.
- Silent manuscript edits or automatic draft generation after outline acceptance.

## Product Contract

Plan-040 delivers one author-visible capability:

> “Generate a draft outline from my project’s current worldbuilding, review it, then accept it into the project outline when I’m satisfied.”

The accepted outline becomes normal project hierarchy data. Rejected or unaccepted outlines remain non-canonical checkpoints.

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Outline Contract & Checkpoint Storage](stage-001-outline-contract-and-checkpoint-storage/stage.md) | `complete` | 2d |
| 002 | [Generation Service & Prompt](stage-002-generation-service-and-prompt/stage.md) | `complete` | 3d |
| 003 | [Nova Outline Review Surface](stage-003-nova-outline-review-surface/stage.md) | `complete` | 2.5d |
| 004 | [Accept Materialization & Conflict Safety](stage-004-accept-materialization-and-conflict-safety/stage.md) | `complete` | 3d |
| 005 | [Quality Gates, Docs & Closeout](stage-005-quality-gates-docs-and-closeout/stage.md) | `complete` | 1.5d |

## Stage Breakdown

### Stage 001 — Outline Contract & Checkpoint Storage

Define the durable shape of outline drafts, checkpoint lifecycle, validation errors, ownership keys, and metadata access helpers before any model or UI work starts.

### Stage 002 — Generation Service & Prompt

Implement context assembly, sufficiency checks, prompt/schema generation, provider execution, parse/repair behavior, and checkpoint creation.

### Stage 003 — Nova Outline Review Surface

Give authors a usable Nova workflow for triggering outline generation, reading the proposed hierarchy, inspecting scene intent, accepting/rejecting, and recovering from failures.

### Stage 004 — Accept Materialization & Conflict Safety

Convert an accepted checkpoint into hierarchy records using a single server-side transaction, with stale guards, conflict policy, rollback evidence, and audit-friendly lifecycle mutation.

### Stage 005 — Quality Gates, Docs & Closeout

Add regression coverage, e2e/manual verification, docs sync, evidence capture, and final reviewer handoff.

## Guardrails

- Generated outlines are drafts until explicit author acceptance.
- Accept must be server-side and transactional; partial hierarchy writes are a Critical defect.
- Rejection never writes to hierarchy tables.
- Generation may read scoped project/worldbuilding context; it must not send the whole manuscript.
- AI requests must use existing OpenRouter routing and structured JSON validation.
- Client code must never import `better-sqlite3`, touch SQLite directly, or access API keys.
- UI copy must distinguish “Proposed outline” from “Accepted outline.”
- Scene intent fields are required for downstream draft generation; missing intent fields fail validation.

## Failure Modes & Mitigations

| Failure mode | Severity | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Accepted outline partially writes hierarchy records | Critical | medium | Server transaction with rollback; accept lifecycle updates only after materialization succeeds; route tests simulate failure. |
| Model returns structurally invalid outline | High | high | Strict schema validation, bounded repair attempt, safe failure checkpoint/error state. |
| Generation runs from empty/weak context and produces generic output | High | medium | Context sufficiency gate blocks run and tells author exactly what is missing. |
| Existing outline is overwritten or duplicated | Critical | medium | Preflight conflict detection; accept blocked on populated hierarchy unless explicit non-destructive mode is implemented. |
| Scene intent not available to plan-038 draft runner | High | medium | Store intent in documented metadata/hierarchy sidecar and add downstream context tests. |
| Nova review UI implies generated data is canonical | Medium | medium | Dedicated copy and visual variant: `Proposed`, `Pending review`, `Accepted`, `Rejected`. |
| Provider/key/schema failure leaves user with no recovery path | Medium | medium | Preserve failed state, diagnostics, retry affordance, and non-destructive checkpoints only on valid output. |
| Model output leaks raw provider text into client payload | Medium | low | Strip raw output from production responses; keep developer-only diagnostics server-side or in evidence logs. |
| Cross-module imports bypass barrels | Medium | medium | Boundary lint gate; part work orders require public barrel updates. |
| Hardcoded UI values creep into Nova components | Low | medium | Token gate and source-contract tests for visual/state copy. |

## Quality Gates

All stages must pass before the plan can be marked `complete`:

- [x] **check** — `pnpm check` reports zero new type/Svelte errors.
- [x] **lint** — `pnpm lint` reports zero new lint/boundary errors.
- [x] **lint:css** — `pnpm lint:css` reports zero new stylelint errors. Waiver: known unrelated `IndividualsWorkspaceShell.svelte:183` duplicate `text-align` failure persists.
- [x] **tests** — `pnpm test` passes all relevant suites.
- [x] **tokens** — `pnpm check:tokens` reports zero hardcoded-token violations.
- [x] **e2e** — targeted Playwright flow covers generate → review → accept/reject/conflict states, or a documented waiver is approved.
- [x] **docs_sync** — internal AI/outline/Nova docs updated to match shipped behavior.
- [x] **manual_verify** — reviewer evidence confirms no hierarchy mutation before accept and atomic rollback behavior on forced failure.

## Test Expectations

- Unit tests for `OutlineDraft` validation, context sufficiency checks, prompt payload construction, parse/repair behavior, and hierarchy mapping.
- API/route tests for missing credentials, empty context, schema failure, successful checkpoint creation, accept success, accept conflict, accept rollback, reject success.
- Component tests for Nova trigger readiness, proposed outline display, scene intent visibility, disabled accept states, loading/failure/retry states.
- E2E coverage for one successful author path and one blocked/conflict path.
- Regression test proving generated outline checkpoints do not create arcs/acts/chapters/scenes until explicit accept.

## Acceptance Criteria

- `dev-docs/plans/plan-040-outline-generation/` contains a complete plan/stage/phase/part tree with no unresolved placeholders.
- Outline generation refuses to run when required project/worldbuilding context is absent and explains the missing prerequisites.
- Valid generation creates a reviewable outline checkpoint and does not modify canonical outline hierarchy.
- Nova displays the proposed Arc → Act → Chapter → Scene structure and required scene intent fields.
- Rejection records audit metadata and leaves hierarchy untouched.
- Acceptance materializes the outline through a server-side atomic transaction and then updates checkpoint lifecycle/audit metadata.
- Existing populated outline conflict is detected before destructive writes can occur.
- Plan-038 draft context can read accepted scene intent data.
- All quality gates and evidence artifacts are captured before closeout.

## Evidence Expectations

- One dated evidence artifact per completed part.
- Gate outputs for `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm check:tokens`, and targeted `pnpm test:e2e`.
- Screenshots or component-render output for Nova states: ready, loading, review-ready, accepted, rejected, failed, conflict-blocked.
- API/route evidence for no-context, schema failure, successful checkpoint, accept conflict, and rollback.
- Final closeout note documenting residual risks and any deferred work.

## Assumptions

- `OutlineDraft` is introduced as a new plan-040 contract; no existing source file currently defines it.
- V1 uses a simple author-visible “Generate outline” workflow with an internal two-pass model strategy, not a multi-screen staged outline wizard.
- Existing hierarchy may include additional layers beyond Arc → Act → Chapter → Scene. The materialization adapter must preserve compatibility without expanding the author-visible v1 contract unless code inspection proves additional generated layers are required.
- Checkpoint persistence should reuse the existing project metadata / pipeline lifecycle pattern unless implementation discovery proves a dedicated table is safer.

## Notes

This plan deliberately does not make outline generation a manuscript mutation path. It is a bridge between worldbuilding and the plan-038 draft engine: propose structure, review it, accept it, then let drafting operate from accepted outline context.
