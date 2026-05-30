---
title: Pre-Merge Polish
slug: stage-002-pre-merge-polish
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-035-fix-json-double-encoding
phases:
  - phase-001-type-assertion-cleanup
  - phase-002-pre-merge-verification
estimated_duration: 0.5d
risk_level: low
---

## Goal

Quick wins in files already touched by Stage 001, plus a final quality gate pass with evidence before cutting the PR to merge `fix/json-double-encoding` into `master`.

## Phases

| #   | Phase                                                                          | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Type Assertion Cleanup](phase-001-type-assertion-cleanup/phase.md)            | `draft` | 0.25d         |
| 002 | [Pre-Merge Verification](phase-002-pre-merge-verification/phase.md)            | `draft` | 0.25d         |

## Entry Criteria

- [ ] Stage 001 is `complete` (all phases pass quality gates)

## Exit Criteria

- [ ] All phases marked `complete`
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm check` — zero type errors
- [ ] `pnpm test` — all tests pass
- [ ] CHANGELOG.md has an entry for the fix
- [ ] PR is opened and references plan-035

## Notes

- This stage is intentionally scoped narrow: only files already open from Stage 001
- Do not introduce new abstractions or refactors here
- Evidence files must be committed before the PR is opened
