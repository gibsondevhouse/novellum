---
title: Service & Pipeline Tests
slug: phase-002-service-and-pipeline-tests
phase_number: 2
status: complete
owner: Backend Agent
stage: stage-004-testing-and-quality-hardening
parts:
  - part-001-repository-tests
  - part-002-context-engine-tests
  - part-003-prompt-builder-tests
estimated_duration: 3d
---

## Goal

Write unit tests for the three non-UI layers built in this plan to achieve ≥80% line coverage on each. These tests form the regression baseline for all future paths.

## Parts

| #   | Part                                                          | Status  |
| --- | ------------------------------------------------------------- | ------- |
| 001 | [Repository Tests](part-001-repository-tests/part.md)         | `draft` |
| 002 | [Context Engine Tests](part-002-context-engine-tests/part.md) | `draft` |
| 003 | [Prompt Builder Tests](part-003-prompt-builder-tests/part.md) | `draft` |

## Entry Criteria

- `phase-001-test-infrastructure` is `complete`
- Vitest runs with `fake-indexeddb`

## Exit Criteria

- `pnpm run test` passes with zero failures
- Coverage report shows ≥80% line coverage for: repository services, `context-engine.ts`, `prompt-builder.ts`
- Coverage report (text or HTML) attached in `evidence/`
