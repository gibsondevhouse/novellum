# Plan-046 Failing Spec Classification Evidence

Date: 2026-06-12
Part: Stage 001 / Phase 003 / Part 001

## Command

```bash
pnpm test:e2e --project=chromium
```

## Result

- Overall: failed.
- Passed: 15 tests.
- Failed: 4 tests.
- Passing checkpoint families:
  - `tests/e2e/outline-generation-review.spec.ts` passed.
  - `tests/e2e/vibe-author-review-gates.spec.ts` passed.
  - `tests/e2e/vibe-worldbuild-checkpoints.spec.ts` passed.

## Failure Summary

| Spec | Failing Test | Observed Failure | Classification | Recommended Action |
| --- | --- | --- | --- | --- |
| `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts` | `reject requires a reason - server rejects empty reason` | Initial upsert expected `200`, received `400`. | Stale fixture envelope. | Update fixture builder to current `PipelineArtifactEnvelope` shape before testing empty reject reason. |
| `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts` | `accept-after-reject returns 409 invalid_transition` | Reject step expected `200`, received `404` because preceding upsert did not create a valid checkpoint. | Stale fixture envelope cascading into missing checkpoint. | Fix fixture envelope, then preserve the accept-after-reject assertion. |
| `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts` | `draft -> review -> accept lifecycle produces visible queue entries` | Upsert failed with `400`. | Stale fixture envelope. | Update fixture builder to current worldbuild artifact envelope. |
| `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts` | `multiple checkpoints appear in queue with distinct lifecycles` | Upsert failed with `400`. | Stale fixture envelope. | Update fixture builder to current worldbuild artifact envelope. |

## Root Cause

Both failing plan-028 specs define `buildMinimalArtifact()` with:

- `family: "vibe-worldbuild"`
- no `pipeline` field
- no `model` field
- no `hierarchy` object
- no `notes` array

The current `PipelineArtifactEnvelope` contract requires:

- `pipeline: PipelineFamily`
- `model: string | null`
- `hierarchy: OutlineHierarchySemantics`
- `notes: string[]`

The generic worldbuild checkpoint upsert route calls `upsertWorldbuildCheckpoint()`, whose parser rejects artifacts unless `artifact.pipeline` is `vibe-worldbuild` or `vibe-worldbuild-domain`.

## Comparison Against Passing Current Spec

`tests/e2e/vibe-worldbuild-checkpoints.spec.ts` uses the same generic metadata route and passes. Its fixture includes the current envelope field `pipeline: "vibe-worldbuild"` and a full `hierarchy` object, so the route accepts it.

This means the generic worldbuild metadata lifecycle is still functional. The failing plan-028 specs are stale fixtures, not evidence that the product route is broken.

## Source Anchors

- Failing stale fixture builders:
  - `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts:38`
  - `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts:57`
- Current passing fixture builder:
  - `tests/e2e/vibe-worldbuild-checkpoints.spec.ts:34`
- Current artifact envelope contract:
  - `src/lib/ai/pipeline/contracts.ts:44`
  - `src/lib/ai/pipeline/contracts.ts:84`
- Current worldbuild checkpoint upsert validation:
  - `src/lib/ai/pipeline/checkpoint-service.ts:139`
  - `src/lib/ai/pipeline/checkpoint-service.ts:149`

## Result

Acceptance criteria are satisfied. Stage 002 should define whether these plan-028 specs should be updated to current fixture helpers or retired in favor of `vibe-worldbuild-checkpoints.spec.ts`.
