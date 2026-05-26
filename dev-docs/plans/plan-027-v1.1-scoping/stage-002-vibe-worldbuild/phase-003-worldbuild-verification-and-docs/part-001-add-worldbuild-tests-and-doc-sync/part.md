---
title: Add Worldbuild Tests and Doc Sync
slug: part-001-add-worldbuild-tests-and-doc-sync
part_number: 1
status: complete
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-003-worldbuild-verification-and-docs
started_at: 2026-05-26T20:20:00Z
completed_at: 2026-05-26T21:05:00Z
estimated_duration: 3d
---

## Objective

Lock in worldbuild behavior with targeted regression tests and documentation updates tied to the implemented contracts.

## Scope

**In scope:**

- Integration/e2e coverage for worldbuild stage progression.
- Contract regression tests for checkpoint transitions.
- AI and architecture doc synchronization.

**Out of scope:**

- Author-stage tests.
- Broad documentation rewrite outside impacted files.

## Implementation Steps

1. Add worldbuild-focused e2e and integration test cases.
2. Capture artifacts demonstrating checkpoint and projection behavior.
3. Update AI pipeline and data-model docs to match actual behavior.

## Files

**Create:**

- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`
- `tests/ai/pipeline/worldbuild-regression.test.ts`
- `dev-docs/plans/plan-027-v1.1-scoping/stage-002-vibe-worldbuild/phase-003-worldbuild-verification-and-docs/part-001-add-worldbuild-tests-and-doc-sync/evidence/worldbuild-contract-samples.md`

**Update:**

- `dev-docs/03-ai/pipeline.md`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/02-architecture/data-model.md`

## Acceptance Criteria

- [ ] E2E test validates draft -> review -> accepted worldbuild flow.
- [ ] Regression tests assert schema validation and projection rules.
- [ ] Docs match implemented checkpoint contract and persistence targets.
- [ ] Evidence includes concrete sample payloads and acceptance traces.

## Edge Cases

- Test fixtures must include both accepted and rejected checkpoint examples.
- Docs must call out any deferred schema extensions explicitly.

## Notes

This phase is the release-quality gate for Stage 002.
