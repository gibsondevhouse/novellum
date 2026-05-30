---
title: Testing & Docs
slug: phase-002-testing-docs
phase_number: 2
status: draft
owner: Reviewer Agent
stage: stage-004-hardening-polish
parts:
  - part-001-add-e2e-tests
  - part-002-add-state-machine-tests
  - part-003-document-generation-workflow
estimated_duration: 2d
---

## Goal

Add comprehensive E2E and unit tests covering the full worldbuilding generation cycle and write developer documentation covering the workflow architecture, extension points, and troubleshooting.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add E2E Tests](part-001-add-e2e-tests/part.md) | `draft` | — | 0.75d |
| 002 | [Add State Machine Tests](part-002-add-state-machine-tests/part.md) | `draft` | — | 0.5d |
| 003 | [Document Generation Workflow](part-003-document-generation-workflow/part.md) | `draft` | — | 0.75d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] E2E tests cover: successful generation for all 5 domains, missing-context detection, accept/reject behavior, error recovery, and retry after failure
- [ ] State machine unit tests cover all states and all legal/illegal transitions
- [ ] Test coverage for generation pathway does not fall below 80%
- [ ] Dev documentation written in `dev-docs/03-ai/worldbuild-generation.md`
- [ ] Documentation covers: architecture overview, adding new domains, extending prompt seeds, troubleshooting failures
- [ ] All quality gates pass: `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm check:tokens`
- [ ] Reviewer Agent sign-off obtained

## Notes

E2E test file targets:

- `tests/world-building/worldbuild-generation.test.ts` — full cycle tests
- `tests/world-building/worldbuild-state-machine.test.ts` — state machine unit tests

Documentation should explicitly cover:

1. How to add a new worldbuilding domain (step-by-step)
2. How prompt seeds map to Nova task types
3. How accept triggers canon projection (which tables, which queries)
4. Troubleshooting: common failure modes and their logs

**This phase gates the `complete` status of the entire plan.**
