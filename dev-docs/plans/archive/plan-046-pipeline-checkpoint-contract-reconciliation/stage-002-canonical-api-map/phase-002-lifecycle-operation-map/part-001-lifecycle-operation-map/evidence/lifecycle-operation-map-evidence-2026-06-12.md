# Plan-046 Lifecycle Operation Map Evidence

Date: 2026-06-12
Part: Stage 002 / Phase 002 / Part 001

## Updated Files

- `dev-docs/03-ai/agents-map.md`
- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`

## Transition Map

| Family | Initial State | Review | Accept | Reject |
| --- | --- | --- | --- | --- |
| `vibe-worldbuild` staged checkpoints | `upsert` creates `draft` and resets same key to `draft` | `draft -> review`; terminal checkpoints cannot move back to review | `review -> accepted`; already accepted is idempotent; rejected returns `409 invalid_transition` | `draft/review -> rejected`; accepted returns `409 invalid_transition`; reason required |
| Worldbuilding scan proposals | `POST /api/worldbuilding/scan` creates `pending_review` | pending proposals are already review-ready | `pending_review -> accepted`; accepted/rejected proposals return lifecycle errors | `pending_review -> rejected`; reason required; accepted proposals cannot be rejected |
| Author draft checkpoints | generation creates `review`; no `draft` lifecycle | n/a | `review -> accepted`; already accepted is idempotent; stale target returns `409 stale_target`; rejected returns `409 invalid_transition` | `review -> rejected`; already rejected is idempotent; accepted returns `409 invalid_transition`; reason required |
| Outline draft checkpoints | generation or metadata upsert creates `draft`; generation immediately reviews | `draft -> review`; terminal checkpoints cannot move back to review | only dedicated route, `review -> accepted`; requires `expectedUpdatedAt` and `expectedVersion`; conflicts/stale return 409 | `draft/review -> rejected`; accepted returns `409 invalid_transition`; reason required |
| Retired Nova outline apply | none | none | none | none |

## Stable Status Codes

| Family | Success | Bad Request / Invalid Payload | Missing Target | Invalid Transition / Stale | Failure |
| --- | --- | --- | --- | --- | --- |
| `vibe-worldbuild` staged checkpoints | `200 { ok, checkpoint }` | `400 invalid_payload` | `404 not_found` | `409 invalid_transition` | `400 projection_failed` |
| Worldbuilding scan proposals | `200 { ok, proposal }` | `400 invalid_request`; `422` lifecycle errors | `404 not_found` | `422 invalid_transition` | proposal route error payload |
| Author draft checkpoints | `200 { ok, checkpoint }` | `400` missing fields; `422 invalid_payload` | `404 not_found` or `scene_not_found` | `409 invalid_transition` or `stale_target` | `500 apply_failed` |
| Outline draft checkpoints | `200 { ok, checkpoint }` or `200 { ok, checkpoint, materialization }` | `400 invalid_request`, `invalid_payload`, or `invalid_version` | `404 not_found` | `409 invalid_transition`, `stale_checkpoint`, or `outline_conflict` | `500 materialization_failed` with rollback |
| Retired Nova outline apply | none | `410 outline_apply_retired` | n/a | n/a | n/a |

## Deliberate Differences

- Worldbuild checkpoint accept can be idempotent because accepting a populated bible checkpoint projects canon once and returns the accepted record on repeat.
- Outline accept is not idempotent through the HTTP contract because it requires stale preconditions and `review` lifecycle; repeated accept returns `409 invalid_transition`.
- Author draft accept can return the accepted checkpoint on repeat, but stale-target protection applies before scene overwrite unless `forceOverwrite` is used.
- Proposal accept/reject returns `422` for lifecycle errors today, while checkpoint routes generally use `409 invalid_transition`. This is a compatibility behavior to document before deciding whether to normalize it in Stage 003.
- Generic metadata `operation: "accept"` for outline owner is deliberately invalid and returns `409 invalid_transition`.

## Test Targets

- Worldbuild generic lifecycle: `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`.
- Stale plan-028 fixtures to update or retire: `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts`, `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts`.
- Proposal lifecycle: `tests/routes/worldbuilding-proposals.test.ts`.
- Author draft lifecycle: `tests/e2e/vibe-author-review-gates.spec.ts`, `tests/ai/pipeline/author-draft-checkpoint-service.test.ts`.
- Outline lifecycle: `tests/routes/outline-checkpoints.test.ts`, `tests/routes/outline-accept.test.ts`, `tests/routes/outline-checkpoint-audit.test.ts`, `tests/e2e/outline-generation-review.spec.ts`.

## Result

Acceptance criteria are satisfied. Phase 003 should lock the version policy used by these lifecycle routes before Stage 003 changes tests or adapters.
