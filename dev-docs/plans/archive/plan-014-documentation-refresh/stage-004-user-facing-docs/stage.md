---
title: User-Facing Docs
slug: stage-004-user-facing-docs
stage_number: 4
status: draft
owner: Planner Agent
plan: plan-014-documentation-refresh
phases:
  - phase-001-user-docs
estimated_duration: 1d
risk_level: low
---

## Goal

Refresh `novellum-docs/docs/setup-guide.md` and `novellum-docs/docs/user-manual.md` plus supporting files (`portability-recovery-runbook.md`, `checklists/ui-review.md`, `audits/component-inventory.md`) so author-facing instructions match the shipped product and recovery flows.

## Phases

| #   | Phase                                              | Status  | Est. Duration |
| --- | -------------------------------------------------- | ------- | ------------- |
| 001 | [User Docs Refresh](phase-001-user-docs/phase.md)  | `draft` | 1d            |

## Entry Criteria

- Stages 002 and 003 `complete`; terminology and module descriptions stable.

## Exit Criteria

- Setup guide matches current `package.json` scripts and env requirements.
- User manual reflects current module naming (Personae, Atlas, Archive, Threads, Chronicles).
- Portability runbook matches the current `.novellum.zip` export/import flow.
- `pnpm run lint` passes.

## Notes

User manual must be verified by navigating the running app; screenshots are out of scope for this plan but captions/steps must match live routes.
