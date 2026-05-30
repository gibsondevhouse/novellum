---
title: Hardening & Polish
slug: stage-004-hardening-polish
stage_number: 4
status: draft
owner: Planner Agent
plan: plan-034
phases:
  - phase-001-guardrails
  - phase-002-testing-docs
estimated_duration: 4d
risk_level: medium
---

## Goal

Enforce safety guardrails (schema validation, provenance tracking, server-side access enforcement), add comprehensive testing coverage, and document the worldbuilding generation workflow for future maintenance and extension.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Guardrails](phase-001-guardrails/phase.md) | `draft` | 2d |
| 002 | [Testing & Docs](phase-002-testing-docs/phase.md) | `draft` | 2d |

## Entry Criteria

- Stage 003 (Generation Pipeline) is complete
- All phases through review-accept-flow are working end-to-end
- Audit logging infrastructure is ready

## Exit Criteria

- All phases complete
- Schema validation enforced at all generation points
- Provenance tracking captures section, model, timestamp, source context
- Server-side OpenRouter access enforced (no client-side key leakage)
- All artifact mutations audit-logged
- E2E tests cover full generation cycle (all 5 domains)
- State machine tests cover all error paths
- Dev documentation covers:
  - Generation workflow architecture
  - Adding new worldbuild domains
  - Extending prompt seeds
  - Troubleshooting generation failures
- All quality gates pass (`pnpm check`, `pnpm test`, `pnpm lint`)
- Reviewer Agent sign-off obtained

## Notes

**Risk level:** Medium, but this stage is **low-risk execution** because it hardens existing pipeline work without adding new features.

**Testing focus:** E2E tests should cover:

- Successful generation for each domain
- Missing context detection and graceful disabling
- Accept/reject behavior
- Error recovery and timeout handling
- Concurrent generation requests

**Documentation focus:** Should focus on **extension points** for future worldbuilding domains or generation modes (e.g., "regenerate section").

**No new features:** This stage is explicitly **not** for adding export, multi-step workflows, or new domains. It's for making the current feature production-safe and maintainable.
