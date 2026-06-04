# Outline Generation

> Last verified: 2026-06-04 (plan-040 closeout)

Plan-040 adds the review-gated bridge from worldbuilding context to a canonical project outline.

The author-visible flow is:

```text
Worldbuilding context -> Generate outline proposal -> Review in Nova -> Accept or reject
```

Generated outlines are non-canonical checkpoints until the author explicitly accepts them. Rejection never writes hierarchy rows. Acceptance is server-side and transactional.

## Source Files

| Area | Source |
| --- | --- |
| Context packet | [outline-context-builder.ts](../../src/lib/ai/pipeline/outline-context-builder.ts) |
| Sufficiency gate | [outline-context-sufficiency.ts](../../src/lib/ai/pipeline/outline-context-sufficiency.ts) |
| Prompt bundle | [outline-generation-prompt.ts](../../src/lib/ai/pipeline/outline-generation-prompt.ts) |
| Draft/checkpoint contract | [outline-draft-contract.ts](../../src/lib/ai/pipeline/outline-draft-contract.ts) |
| Checkpoint actions | [outline-checkpoint-service.ts](../../src/lib/ai/pipeline/outline-checkpoint-service.ts) |
| Generation route | [src/routes/api/ai/outline/generate/+server.ts](../../src/routes/api/ai/outline/generate/+server.ts) |
| Accept route | [src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts](../../src/routes/api/outline/checkpoints/%5BcheckpointId%5D/accept/+server.ts) |
| Materialization service | [outline-materialization-service.ts](../../src/lib/server/outline/outline-materialization-service.ts) |
| Conflict preflight | [outline-conflict-preflight.ts](../../src/lib/server/outline/outline-conflict-preflight.ts) |
| Nova UI | [NovaOutlineGenerationPanel.svelte](../../src/modules/nova/components/NovaOutlineGenerationPanel.svelte), [NovaOutlineDraftCheckpointCard.svelte](../../src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte) |

## Readiness Gate

`POST /api/ai/outline/generate` first builds an `OutlineContextPacket` and evaluates `evaluateOutlineContextSufficiency()`.

Required context bands:

- `project_identity`: project id and title.
- `primary_story_premise`: project premise, logline, story-frame premise, accepted worldbuild premise checkpoint, or synopsis.
- `character_or_plot_thread`: at least one character or plot thread from canonical rows or accepted worldbuild checkpoints.

Locations, factions, lore entries, timeline events, and themes enrich the packet but do not block generation by themselves. Low-context requests return `422 context_not_ready` with UI-safe missing codes, not raw context.

## Prompt and Schema

`buildOutlineGenerationPrompt()` emits the fixed Novellum prompt shape:

```text
ROLE
TASK
CONTEXT
CONSTRAINTS
OUTPUT FORMAT
```

The route asks the provider for OpenRouter/OpenAI-compatible JSON schema output named `novellum_outline_draft`. A valid `OutlineDraft` must include:

- artifact metadata: `type = vibe-outline.draft`, version `1`, schema version `1.0.0`
- nested `arcs[] -> acts[] -> chapters[] -> scenes[]`
- stable ids, slugs, titles, and order values on every node
- per-scene intent: `goal`, `conflict`, `turn`, `outcome`
- source context summary, included domains, entity counts, context hash, and prompt version

Invalid model output gets one bounded repair prompt. If repair also fails, the route returns `422 schema_validation_failed` with compact validation issues and no raw provider text.

## Checkpoint Lifecycle

Outline checkpoints are stored in `project_metadata`:

- `scope = pipeline`
- `ownerId = outlineDraftCheckpoints.v1`
- `key = checkpoint id`

Lifecycle:

```text
draft -> review -> accepted
              \-> rejected
```

Generation immediately creates a draft checkpoint and moves it to `review`. Upsert/review/reject use the project-metadata route:

```text
PUT /api/db/project-metadata/{projectId}/pipeline/outlineDraftCheckpoints.v1/{checkpointId}
```

The generic metadata route deliberately rejects outline `accept` operations. Accept must go through the dedicated materialization route:

```text
POST /api/outline/checkpoints/{checkpointId}/accept
```

The accept body must include the stale guard:

```json
{
  "projectId": "project-id",
  "expectedUpdatedAt": "checkpoint updatedAt",
  "expectedVersion": "1.0.0"
}
```

Missing preconditions return `400 invalid_request`. Mismatched preconditions return `409 stale_checkpoint`.

## Materialization

`acceptOutlineCheckpointMaterialization()` owns canonical writes. It:

1. Confirms the project exists.
2. Loads and validates the checkpoint.
3. Requires lifecycle `review` and schema version `1.0.0`.
4. Checks stale preconditions.
5. Runs `getOutlineConflictPreflight()`.
6. Builds a deterministic `OutlineMaterializationMap`.
7. Writes hierarchy rows and scene intent metadata inside one SQLite transaction.
8. Updates the checkpoint lifecycle to `accepted` as the final transactional write.

Generated Arc -> Act -> Chapter -> Scene output maps to:

- `arcs`
- `acts`
- one default `milestone` per act
- `chapters`
- `scenes`
- scene metadata sidecars for `quickIntent`, `quick-intent`, and `clarity`

The mapper does not invent beats or stages. Those remain empty until a future explicit generation contract produces them.

Rollback behavior: if materialization or the final checkpoint update fails, the transaction rolls back and the route returns safe `500 materialization_failed` copy. Raw SQLite errors are not exposed.

## Conflict Policy

Plan-040 does not merge or overwrite an existing outline. If any canonical hierarchy rows exist for the project, accept returns:

```json
{
  "code": "outline_conflict",
  "meta": {
    "counts": {},
    "state": "partial | populated",
    "total": 1
  }
}
```

Generation itself is still allowed when hierarchy exists. The generation response includes `outlineConflict` so Nova can warn that the checkpoint is review-only until the conflict is resolved.

## Nova States

Nova renders outline generation through `NovaOutlineGenerationPanel` and `NovaOutlineDraftCheckpointCard`.

Panel states:

- `empty`: no project selected
- `loading`: checking outline context
- `blocked`: required context missing
- `ready`: generation can run
- `running`: provider request in progress
- `failed`: retry available
- `cancelled`: abort leaves project unchanged
- `review-ready`: checkpoint can be reviewed
- `accepted`: server accepted response received
- `rejected`: checkpoint rejected

Card states:

- proposed/review checkpoint with Arc -> Act -> Chapter -> Scene tree and scene intent
- accept confirmation with stale-guard payload
- reject confirmation requiring a reason
- accepted audit summary with materialized counts and root arc ids
- rejected audit summary
- conflict or stale/materialization failure copy that keeps the checkpoint non-canonical

## Limits

- No in-place regeneration of an existing outline.
- No semantic merge, structural diff, or non-destructive import of generated nodes into a populated outline.
- No automatic manuscript edits or draft generation after outline acceptance.
- No client-side provider keys and no browser-side SQLite access.
- No generated beats/stages in V1; materialization preserves compatibility by leaving them empty.

## Verification

Plan-040 closeout evidence includes:

- unit tests for context, prompt, schema, checkpoint, and materialization mapping
- route tests for generation, no silent writes, accept, stale guard, audit metadata, rollback, and conflict
- Nova component/action tests for generation states and review actions
- targeted Playwright e2e for review/reject/accept and conflict-blocked accept
- full quality gate evidence under the plan closeout tree
