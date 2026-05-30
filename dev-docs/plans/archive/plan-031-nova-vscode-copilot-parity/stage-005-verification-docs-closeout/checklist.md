---
stage: stage-005-verification-docs-closeout
last_updated: 2026-05-28
status: draft
---

# Stage Checklist

## Pre-Implementation

- [ ] Stages 001–004 are implemented and all child phases are at review or ready for closeout.
- [ ] No known Critical or High risk remains unmitigated without an explicit waiver.
- [ ] Implementation agents have placed evidence artifacts in every completed part directory.

## Implementation

- [ ] Complete `phase-001-quality-gates` — Quality Gates
- [ ] Complete `phase-002-docs-sync` — Docs Sync
- [ ] Complete `phase-003-tracker-reconciliation` — Tracker Reconciliation
- [ ] Complete `phase-004-reviewer-signoff` — Reviewer Signoff

## Post-Implementation

- [ ] All required quality gates pass or have a documented waiver accepted by Reviewer Agent.
- [ ] `dev-docs/04-modules/nova.md` and `dev-docs/03-ai/pipeline.md` reflect the shipped mode, attachment, and Agent loop contracts.
- [ ] ACTIVE-PLAN and MASTER-PLAN are updated; plan-030 stage 002/003 supersession is recorded.
- [ ] Final PR readiness package includes summary, risks, evidence index, and validation command output.
- [ ] Stage `impl.log.md` entries, if any, are append-only.
- [ ] Reviewer Agent has reviewed all child phases.
