---
title: Testing & Quality Hardening
slug: stage-004-testing-and-quality-hardening
stage_number: 4
status: complete
owner: Backend Agent
plan: plan-002-service-layer-and-state-hardening
phases:
  - phase-001-test-infrastructure
  - phase-002-service-and-pipeline-tests
estimated_duration: 4d
risk_level: low
---

## Goal

Establish Vitest as the test runner with a Dexie-compatible in-memory environment, then write unit tests for the three core non-UI layers built in this plan: repository layer, context engine, and prompt builder. Every subsequent path builds on these tests as a regression baseline.

## Phases

| #   | Phase                                                                     | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Test Infrastructure](phase-001-test-infrastructure/phase.md)             | `draft` | 1d            |
| 002 | [Service & Pipeline Tests](phase-002-service-and-pipeline-tests/phase.md) | `draft` | 3d            |

## Entry Criteria

- `stage-003-ai-pipeline-implementation` is `complete`
- All three layers (repository, context engine, prompt builder) are implemented and stable

## Exit Criteria

- All phases complete
- `pnpm run test` executes without failures
- Repository layer: ≥80% line coverage
- Context engine: ≥80% line coverage
- Prompt builder: ≥80% line coverage
- Coverage report added to `evidence/`
- `pnpm run check` and `pnpm run lint` pass

## Notes

Use `fake-indexeddb` to mock IndexedDB in the Vitest jsdom environment — this is required for Dexie tests to run outside a browser. Install as a dev dependency and configure via `vitest.config.ts` setup file.
