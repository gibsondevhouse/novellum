# Plan-046 Family Route Map Evidence

Date: 2026-06-12
Part: Stage 002 / Phase 001 / Part 001

## Updated Docs

- `dev-docs/03-ai/agents-map.md`

## Decision

Plan-046 defines route ownership by family instead of preserving every historical lifecycle surface as equivalent.

| Family | Canonical Ownership |
| --- | --- |
| `vibe-worldbuild` staged checkpoints | Generic metadata route remains canonical for staged checkpoint `upsert`, `review`, `accept`, `reject`, list, and read under owner `vibe-worldbuild`. Fixtures must use current `PipelineArtifactEnvelope` shape. |
| Worldbuilding scan proposals | `POST /api/worldbuilding/scan` creates proposal records; `POST /api/worldbuilding/proposals/{proposalId}/accept` and `/reject` are canonical for decisions. Generic metadata is storage/list compatibility, not the decision API. |
| Author draft checkpoints | `/api/author-draft/checkpoints/*` routes are canonical for context, list, generate, accept, and reject. Generic metadata is not canonical for author draft checkpoint lifecycle. |
| Outline draft checkpoints | `POST /api/ai/outline/generate` is canonical for generation; generic metadata remains supported for list/read/review/reject and fixture/internal upsert; `POST /api/outline/checkpoints/{checkpointId}/accept` is the only canonical accept/materialization route. |
| Legacy Nova outline apply | `/api/nova/outline/apply` is retired and remains only as `410 outline_apply_retired` compatibility. |

## Generic Metadata Scope

Generic metadata remains supported for:

- ordinary `scene`, `chapter`, and `project` metadata;
- `vibe-worldbuild` staged checkpoint lifecycle;
- outline checkpoint list/read/review/reject compatibility;
- outline fixture/internal upsert while tests and route helpers still need it.

Generic metadata is not canonical for:

- author draft checkpoint lifecycle;
- worldbuilding scan proposal accept/reject;
- outline checkpoint accept/materialization;
- retired Nova outline artifact apply.

## Client Helper Assignments

| Client | Canonical Route |
| --- | --- |
| `src/lib/project-metadata.ts` worldbuild helpers | Generic metadata `vibe-worldbuild` owner. |
| `src/modules/world-building/stores/world-building-store.svelte.ts` | Generic metadata `vibe-worldbuild` owner for staged checkpoints. |
| `src/modules/world-building/services/worldbuilding-proposal-service.ts` | Proposal accept/reject routes; Stage 003 should include `projectId` in request bodies or add an accepted route adapter. |
| `src/modules/nova/services/author-draft-api.ts` | `/api/author-draft/checkpoints/*`. |
| `src/modules/nova/services/outline-generation-runner.ts` | `/api/ai/outline/generate`. |
| `src/modules/nova/services/outline-checkpoint-actions.ts` | Generic metadata for outline review/reject and dedicated outline accept route for materialization. |

## Follow-Up For Stage 003

- Update stale plan-028 e2e fixtures to the current `PipelineArtifactEnvelope` shape or retire them if the passing `vibe-worldbuild-checkpoints.spec.ts` already owns the same coverage.
- Fix the worldbuilding proposal client/body mismatch by including `projectId` or by updating proposal routes to locate proposal records without requiring the caller to know `projectId`.

## Result

Acceptance criteria are satisfied. The next phase should expand this route ownership map into operation-level request/response rules.
