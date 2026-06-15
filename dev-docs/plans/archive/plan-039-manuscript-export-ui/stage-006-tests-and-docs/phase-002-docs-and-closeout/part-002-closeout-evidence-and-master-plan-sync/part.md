---
title: Closeout evidence and MASTER-PLAN sync
slug: part-002-closeout-evidence-and-master-plan-sync
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-006-tests-and-docs
phase: phase-002-docs-and-closeout
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.15d
dependencies: ["part-001-module-docs"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Closeout evidence and MASTER-PLAN sync

## Objective

Capture validation evidence and update planning registry references for plan 039.

## Problem

Plan work is not operationally complete until evidence, status, and registry updates are accurate.

## Files

**Create:**

- `dev-docs/plans/plan-039-manuscript-export-ui/stage-006-tests-and-docs/phase-002-docs-and-closeout/part-002-closeout-evidence-and-master-plan-sync/evidence/validation-output-2026-06-01.md`
- `dev-docs/plans/plan-039-manuscript-export-ui/stage-006-tests-and-docs/phase-002-docs-and-closeout/part-002-closeout-evidence-and-master-plan-sync/evidence/reviewer-handoff-2026-06-01.md`

**Update:**

- `dev-docs/plans/MASTER-PLAN.md`
- `dev-docs/plans/plan-039-manuscript-export-ui/plan.md`

## Required Changes

- Record command output for lint, typecheck, tests, token check, and e2e status.
- Update plan status fields according to convention only after reviewer sign-off.
- Add or update plan 039 entry in MASTER-PLAN active plans.
- Create reviewer handoff with changed files, known risks, and validation evidence.

## UI/UX Requirements

- Reviewer handoff must mention any known UX compromises.

## Data Requirements

- Reviewer handoff must mention no migration or any migration if one was added.

## Error Handling Requirements

- Reviewer handoff must list known unhandled failure modes, if any.

## Tests

- Run `pnpm run lint`.
- Run `pnpm run check` or repo-equivalent typecheck.
- Run `pnpm run test`.
- Run `pnpm run check:tokens` if script exists.
- Run targeted e2e spec.

## Acceptance Criteria

- [x] Validation evidence file exists.
- [x] Reviewer handoff exists.
- [x] MASTER-PLAN updated if required.
- [x] No plan status is advanced beyond actual implementation state.

## Out of Scope

- Do not mark plan complete without Reviewer Agent sign-off.
- Do not fabricate command output.

## Dependencies

- part-001-module-docs

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Capture validation evidence and update planning registry references for plan 039.
2. **Problem:** Plan work is not operationally complete until evidence, status, and registry updates are accurate.
3. **Files:** Create: dev-docs/plans/plan-039-manuscript-export-ui/stage-006-tests-and-docs/phase-002-docs-and-closeout/part-002-closeout-evidence-and-master-plan-sync/evidence/validation-output-2026-06-01.md, dev-docs/plans/plan-039-manuscript-export-ui/stage-006-tests-and-docs/phase-002-docs-and-closeout/part-002-closeout-evidence-and-master-plan-sync/evidence/reviewer-handoff-2026-06-01.md. Update: dev-docs/plans/MASTER-PLAN.md, dev-docs/plans/plan-039-manuscript-export-ui/plan.md.
4. **Changes:** Record command output for lint, typecheck, tests, token check, and e2e status., Update plan status fields according to convention only after reviewer sign-off., Add or update plan 039 entry in MASTER-PLAN active plans., Create reviewer handoff with changed files, known risks, and validation evidence.
5. **UI/UX:** Reviewer handoff must mention any known UX compromises.
6. **Data:** Reviewer handoff must mention no migration or any migration if one was added.
7. **Errors:** Reviewer handoff must list known unhandled failure modes, if any.
8. **Tests:** Run `pnpm run lint`., Run `pnpm run check` or repo-equivalent typecheck., Run `pnpm run test`., Run `pnpm run check:tokens` if script exists., Run targeted e2e spec.
9. **Criteria:** Validation evidence file exists., Reviewer handoff exists., MASTER-PLAN updated if required., No plan status is advanced beyond actual implementation state.
10. **Out-of-scope:** Do not mark plan complete without Reviewer Agent sign-off., Do not fabricate command output.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-module-docs.
