---
title: Verification, Docs, and Closeout
slug: stage-005-verification-docs-closeout
stage_number: 5
status: complete
owner: Planner Agent
plan: plan-031-nova-vscode-copilot-parity
phases:
  - phase-001-quality-gates
  - phase-002-docs-sync
  - phase-003-tracker-reconciliation
  - phase-004-reviewer-signoff
estimated_duration: 2d
risk_level: medium
---

# Stage 005 — Verification, Docs, and Closeout

## Goal

Run the full gate stack, update module and AI pipeline docs, reconcile plan trackers, and package closeout evidence.

## Phases

| # | Phase | Status | Est. Duration | Goal |
| --- | --- | --- | --- | --- |
| 001 | [Quality Gates](phase-001-quality-gates/phase.md) | `complete` | 0.75d | Run and record the full verification command set. |
| 002 | [Docs Sync](phase-002-docs-sync/phase.md) | `complete` | 0.5d | Update developer documentation to match the final Nova runtime contract. |
| 003 | [Tracker Reconciliation](phase-003-tracker-reconciliation/phase.md) | `complete` | 0.5d | Make plan tracking truthful for plan-031 activation and plan-030 supersession. |
| 004 | [Reviewer Signoff](phase-004-reviewer-signoff/phase.md) | `complete` | 0.25d | Keep completion honest by requiring reviewer verification before status flips to complete. |

## Entry Criteria

- Stages 001–004 are implemented and all child phases are at review or ready for closeout.
- No known Critical or High risk remains unmitigated without an explicit waiver.
- Implementation agents have placed evidence artifacts in every completed part directory.

## Exit Criteria

- [x] All required quality gates pass or have a documented waiver accepted by Reviewer Agent.
- [x] `dev-docs/04-modules/nova.md` and `dev-docs/03-ai/pipeline.md` reflect the shipped mode, attachment, and Agent loop contracts.
- [x] ACTIVE-PLAN and MASTER-PLAN are updated; plan-030 stage 002/003 supersession is recorded.
- [x] Final PR readiness package includes summary, risks, evidence index, and validation command output.

## Notes

- Status remains `draft` until implementation begins.
- Stage status derives from child phase statuses.
- Evidence must be stored under the relevant part `evidence/` directory.
