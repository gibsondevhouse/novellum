# Deferred Commitment Matrix

> Generated: 2026-05-27
> Source plans: plan-019, plan-021, plan-024

## plan-019-naming-consistency (entire plan)

| # | Commitment | Source Artifact | Plan Status | Tracker Status (ACTIVE) | Tracker Status (MASTER) |
|---|-----------|----------------|-------------|------------------------|------------------------|
| 019-1 | Stage 001: Audit & canonical name map | [`plan-019/stage-001`](../../../../archive/plan-019-naming-consistency/stage-001-audit-and-canonical-name-map/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 019-2 | Stage 002: Documentation alignment | [`plan-019/stage-002`](../../../../archive/plan-019-naming-consistency/stage-002-documentation-alignment/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 019-3 | Stage 003: Route renames | [`plan-019/stage-003`](../../../../archive/plan-019-naming-consistency/stage-003-route-renames/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 019-4 | Stage 004: Module renames | [`plan-019/stage-004`](../../../../archive/plan-019-naming-consistency/stage-004-module-renames/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 019-5 | Stage 005: Component renames | [`plan-019/stage-005`](../../../../archive/plan-019-naming-consistency/stage-005-component-renames/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 019-6 | Stage 006: Verification & cleanup | [`plan-019/stage-006`](../../../../archive/plan-019-naming-consistency/stage-006-verification-and-cleanup/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |

**Plan-level metadata:**
- Plan status: `deferred-to-v1.1` (frontmatter)
- CLOSEOUT: [`CLOSEOUT.md`](../../../../archive/plan-019-naming-consistency/CLOSEOUT.md) — dated 2026-05-26, resolution `deferred-to-v1.1`
- Execution history: never executed; all 6 stages remain `draft`
- Rationale: codebase-wide rename touches every import path; safer post-ship
- Preserved artifact: stage-001 phase-002 part-001 draft name map

## plan-021-reader-pagination (entire plan)

| # | Commitment | Source Artifact | Plan Status | Tracker Status (ACTIVE) | Tracker Status (MASTER) |
|---|-----------|----------------|-------------|------------------------|------------------------|
| 021-1 | Stage 001: Empty state | [`plan-021/stage-001`](../../../../archive/plan-021-reader-pagination/stage-001-empty-state/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 021-2 | Stage 002: Page margins & typography | [`plan-021/stage-002`](../../../../archive/plan-021-reader-pagination/stage-002-page-margins-and-typography/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 021-3 | Stage 003: Pagination engine | [`plan-021/stage-003`](../../../../archive/plan-021-reader-pagination/stage-003-pagination-engine/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 021-4 | Stage 004: Verification | [`plan-021/stage-004`](../../../../archive/plan-021-reader-pagination/stage-004-verification/stage.md) | `draft` | `deferred-to-v1.1` | `deferred-to-v1.1` |

**Plan-level metadata:**
- Plan status: `deferred-to-v1.1` (frontmatter)
- CLOSEOUT: [`CLOSEOUT.md`](../../../../archive/plan-021-reader-pagination/CLOSEOUT.md) — dated 2026-05-26, resolution `deferred-to-v1.1`
- Execution history: never executed; all 4 stages remain `draft`
- Rationale: reader empty state + pagination engine is a UX feature unrelated to V1 ship gate
- Source problem: `qa-docs/user-problems/problems-found-001.md` Problem 002

## plan-024-v1-final-mile (3 deferred stages only)

| # | Commitment | Source Artifact | Stage Status | Tracker Status (ACTIVE) | Tracker Status (MASTER) |
|---|-----------|----------------|-------------|------------------------|------------------------|
| 024-2 | Stage 002: Release engineering — signed/notarized builds, updater wiring, smoke installer, keyring verify, brand icons, signing certs, CI tag dry-run | [`plan-024/stage-002`](../../../../archive/plan-024-v1-final-mile/stage-002-release-engineering/stage.md) | `deferred-to-v1.1` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 024-3 | Stage 003: Ollama & shortcuts finish — local-model adapter toggle in Settings, global shortcut emitter bindings (save-scene, view-in-reader) | [`plan-024/stage-003`](../../../../archive/plan-024-v1-final-mile/stage-003-ollama-and-shortcuts-finish/stage.md) | `deferred-to-v1.1` | `deferred-to-v1.1` | `deferred-to-v1.1` |
| 024-6 | Stage 006: Documentation re-baseline — roadmap.md, agents-map.md, beta-program.md, AGENTS.md, MASTER-PLAN.md, novellum-docs/user/ pages | [`plan-024/stage-006`](../../../../archive/plan-024-v1-final-mile/stage-006-docs-rebaseline/stage.md) | `deferred-to-v1.1` | `deferred-to-v1.1` | `deferred-to-v1.1` |

**Plan-level metadata:**
- Plan status: `complete` (V1 DoD scope; 47/47 items satisfied)
- CLOSEOUT: [`CLOSEOUT.md`](../../../../archive/plan-024-v1-final-mile/CLOSEOUT.md) — dated 2026-05-26, resolution `complete + 3 stages deferred-to-v1.1`
- Completed stages: 001 (DoD verification), 004 (light-theme sweep, superseded by plan-026), 005 (AI surface decision, superseded by plan-025)
- Deferred stages have `phases: []` — no sub-structure scaffolded yet

## Summary

| Deferred Item | Stages | Execution State | Tracker Consistency |
|--------------|--------|-----------------|---------------------|
| plan-019 (full) | 6 | Never executed, all `draft` | ACTIVE + MASTER agree: `deferred-to-v1.1` |
| plan-021 (full) | 4 | Never executed, all `draft` | ACTIVE + MASTER agree: `deferred-to-v1.1` |
| plan-024 stage-002 | 1 | Never executed, `deferred-to-v1.1`, no phases scaffolded | ACTIVE + MASTER agree |
| plan-024 stage-003 | 1 | Never executed, `deferred-to-v1.1`, no phases scaffolded | ACTIVE + MASTER agree |
| plan-024 stage-006 | 1 | Never executed, `deferred-to-v1.1`, no phases scaffolded | ACTIVE + MASTER agree |

**Total deferred commitments: 5 workstreams, 13 stage-level units, 0 executed.**

No tracker discrepancies found between ACTIVE-PLAN.md and MASTER-PLAN.md for any deferred item.
