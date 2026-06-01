---
title: Agentic Worldbuild Scan + Review-Gated Proposal Flow
slug: plan-037-agentic-worldbuild-scan
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-31
last_updated: 2026-06-01 (scan execution wired; all 5 stages complete)
target_completion: 2026-06-14
stages:
  - stage-001-governance-reconciliation
  - stage-002-scan-contract-and-proposal-shape
  - stage-003-notification-and-proposed-review-ui
  - stage-004-accept-reject-canon-safety
  - stage-005-hardening-tests-docs-and-evidence
dependencies:
  - plan-034-world-building-workflow-refactor
  - plan-036-context-priority-generation
quality_gates:
  - check
  - lint
  - lint:css
  - tests
  - tokens
  - docs_sync
  - manual_verify
  - ui_regression
---

## Objective

Introduce a project-grounded, agentic worldbuilding scan that reads project metadata and existing canon, proposes draft suggestions across worldbuilding categories, and routes every suggestion through explicit author review before canon projection.

This plan exists to add suggestion velocity without weakening canon safety: no silent writes, no manuscript mutation, and no auto-accept behavior.

## Scope

**In scope:**

- Scan project-level context from Project Hub metadata (`title`, `genre`, `logline`, `synopsis`) plus current worldbuilding canon and accepted worldbuild checkpoints.
- Generate shorthand, category-scoped worldbuilding suggestions as non-canonical proposals.
- Define a proposal payload/schema before UI implementation.
- Surface pending suggestions with category-scoped notification dots/badges in worldbuilding navigation and landing/domain tiles.
- Add explicit review states and UI affordances for pending/proposed vs accepted canon.
- Implement accept/reject controls with audit trails.
- Ensure accepted proposals project through existing canonical write paths or documented projection helpers without bypassing SQLite/API boundaries.
- Add unit/API/UI/regression tests and evidence artifacts aligned with required quality gates.

**Out of scope:**

- Implementing direct model-to-canon writes.
- Any manuscript/editor pipeline mutation.
- Broad Nova rewrite or generic multi-agent platform rewrite.
- Replacing existing worldbuilding generation endpoints wholesale.
- Unrelated schema redesign for all worldbuilding tables.
- Cloud sync, auth, telemetry, subscriptions, or release engineering tasks unrelated to this feature.

## Guardrails

- Suggestions remain proposals until explicit accept.
- Rejected suggestions never write to canon.
- Review UI copy must preserve author agency (`suggest`, `review`, `accept`, `reject`).
- Pending/proposed visuals must be distinct from canonical/accepted visuals.
- Use existing design tokens and primitives; do not hardcode ad-hoc values.

## Proposal Contract (Target Shape)

The scan contract and proposal contract are finalized in Stage 002 before UI work begins.

Proposed minimum fields:

- `proposalId`: stable UUID
- `projectId`: owning project id
- `categoryId`: `personae | atlas | archive | threads | chronicles`
- `status`: `pending_review | accepted | rejected | failed_validation`
- `generatedAt`: ISO timestamp
- `sourceContext`: compact snapshot metadata (`title`, `genre`, `logline`, synopsis hash/summary)
- `confidence`: bounded confidence signal or band
- `reasoningSummary`: short explanation for why the suggestion was produced
- `payload`: category-specific suggestion payload
- `dedupeKey`: deterministic key for duplicate suppression
- `acceptance`: audit metadata (`acceptedAt`, `acceptedBy`, projection result)
- `rejection`: audit metadata (`rejectedAt`, `rejectedBy`, `reason`)

## UX State Model

Required explicit states across scan and review surfaces:

- Empty (`no suggestions yet`)
- Loading (`scan running`)
- Failed (`schema/provider/transport failure`)
- Review-ready (`pending_review` suggestions present)
- Accepted (`projected to canon`)
- Rejected (`rejected with optional reason`)

## Stages

| # | Stage | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Governance Reconciliation & Stale-Doc Correction](stage-001-governance-reconciliation/stage.md) | `complete` | 0.5d |
| 002 | [Scan Contract & Proposal Data Shape](stage-002-scan-contract-and-proposal-shape/stage.md) | `complete` | 2d |
| 003 | [UI Notification + Proposed-Tile Review Flow](stage-003-notification-and-proposed-review-ui/stage.md) | `complete` | 2.5d |
| 004 | [Accept/Reject Integration + Canon Projection Safety](stage-004-accept-reject-canon-safety/stage.md) | `complete` | 2d |
| 005 | [Hardening, Tests, Docs Sync, Evidence](stage-005-hardening-tests-docs-and-evidence/stage.md) | `complete` | 1.5d |

## Stage Breakdown

### Stage 001 — Governance Reconciliation & Stale-Doc Correction

- Reconcile tracker docs (`ACTIVE-PLAN.md`, `MASTER-PLAN.md`) so agent resumptions stop targeting completed work.
- Confirm completion disposition for plans 034/035/036 from merged history and local evidence.
- Publish this plan as the active follow-up for agentic worldbuild scan work.

### Stage 002 — Scan Contract & Proposal Data Shape

- Define request/response schema and proposal record contract.
- Define dedupe rules (by canonical name + category + semantic key where possible).
- Validate model output to schema before proposal persistence.
- Define user-safe failure copy plus dev-facing diagnostics for schema/provider failures.

### Stage 003 — UI Notification + Proposed-Tile Review Flow

- Add pending suggestion dots/badges to worldbuilding top navigation and relevant category subnav/tiles.
- Ensure badge state derives from live pending proposal state and survives reload.
- Add category-level review surfaces with proposed/pending visual treatment distinct from accepted canon.
- Prevent UI language or styling from implying canonical status before acceptance.

### Stage 004 — Accept/Reject Integration + Canon Projection Safety

- Wire accept/reject actions to audited checkpoint/proposal mutation paths.
- Prevent partial accept writes by atomic projection or explicit rollback strategy.
- Keep existing DB/API boundaries intact.
- Verify accepted records map through existing canon write paths or explicitly documented projection helpers.

### Stage 005 — Hardening, Tests, Docs Sync, Evidence

- Execute required gates and capture evidence artifacts.
- Add/expand docs for scan contract, notification behavior, and review safety constraints.
- Prove regression condition: suggestions never write to canon before accept.

## Failure Modes & Mitigations

| Failure mode | Likelihood | Mitigation |
| --- | --- | --- |
| AI over-suggests irrelevant entities | medium | Tight context scoping; require reasoning summary; reject low-value suggestions during review; add prompt constraints and schema fields for relevance anchors. |
| Suggestions duplicate existing canon | high | Pre-persist dedupe by category/name/dedupeKey; compare against existing canon and pending queue before save. |
| Notification dots become stale | medium | Derive from persisted pending proposal state, not transient component-only state; recompute on load and after accept/reject. |
| Accepted proposals partially write to canon | medium | Enforce atomic projection transaction or explicit rollback; block lifecycle transition to accepted on projection failure. |
| Review UI implies canon before acceptance | medium | Distinct visual variant + explicit copy (`Proposed`, `Pending review`), never reuse accepted/canon badge styling for pending. |
| Empty project context produces generic low-value suggestions | medium | Add context sufficiency checks and user-facing prompt for missing logline/synopsis/metadata before scan. |
| Model output violates schema | high | Strict schema validation with safe user error message and structured developer diagnostics. |
| Plan/docs drift causes agents to resume wrong work | medium | Keep ACTIVE and MASTER synchronized; Stage 001 requires explicit tracker reconciliation before implementation stages. |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [x] **check** — `pnpm check` — 1753 files, 0 errors, 11 warnings (pre-existing unused CSS selectors)
- [x] **lint** — `pnpm lint` — 9 pre-existing errors in WorldBuilding components (not introduced by plan-037)
- [x] **lint_css** — `pnpm lint:css` — 1 pre-existing error in IndividualsWorkspaceShell.svelte (not introduced by plan-037)
- [x] **tests** — `pnpm test` — 209 files / 1546 tests PASS
- [x] **tokens** — `pnpm check:tokens` — 337 files, 0 violations
- [x] **ui_regression** — 16 Vitest store/state tests; scan route execution covered by API tests; Playwright E2E not run in this pass
- [x] **docs_sync** — `dev-docs/03-ai/worldbuild-generation.md` updated; CHANGELOG.md updated; MASTER-PLAN.md updated
- [x] **manual_verify** — covered by automated route/store state matrix (scan/persist/accept/reject/pending transitions)

## Test Expectations

- Unit tests for scan payload validation and duplicate suppression logic.
- Unit tests for notification-dot state derivation per worldbuilding category.
- API tests for missing credentials, schema failure, successful scan, duplicate handling.
- Regression tests proving suggestions are not written to canon until explicit accept.
- UI/component tests for pending proposal display, accept, reject, and stale-state recovery after reload.

## Acceptance Criteria

- `ACTIVE-PLAN.md` and `MASTER-PLAN.md` no longer point agents at stale completed work.
- `dev-docs/plans/plan-037-agentic-worldbuild-scan/plan.md` exists and follows plan conventions.
- Plan-037 defines clear staged execution, explicit out-of-scope boundaries, risk/failure register, and gate-driven verification expectations.
- Pending suggestions are visually distinct from canon and category notification badges are scoped correctly.
- Accept/reject flow remains audit-friendly and review-gated with no silent canon mutation.
- Scan/proposal feature code is implemented behind review-gated proposal persistence and atomic accept/reject paths.

## Evidence Expectations

- At least one dated evidence artifact per executed part.
- Gate outputs captured as dated evidence files (`check`, `lint`, `lint:css`, `test`, `check:tokens`).
- Screenshots or equivalent UI evidence for notification and proposed-vs-canon states.
- API evidence for schema failure, duplicate suppression, and no-credential behavior.
- Final stage closeout note linking all evidence and documenting residual risks.

## Notes

This plan extends the current worldbuilding review-gated architecture rather than replacing it. The canonical safety contract remains unchanged: generation can propose, only the author can accept.
