# Agents Map

> Last verified: 2026-06-15 (plan-048 frontend coherence)

Authoritative status of all Novellum runtime agents. Anchored to [src/lib/ai/](../../src/lib/ai/).
The V1.1 staged pipeline (`vibe-worldbuild` / `vibe-author`) is
documented separately below — those are pipeline *stages*, not runtime
agents.

## Shipped (4)

| Agent | TaskType | File | Output |
| --- | --- | --- | --- |
| **ContinuityAgent** | `continuity_check` | [continuity-agent.ts](../../src/lib/ai/continuity-agent.ts) | `ContinuityIssue[]` — structured issues for triage in the Continuity surface. |
| **EditAgent** | `edit` | [edit-agent.ts](../../src/lib/ai/edit-agent.ts) | `EditSuggestion[]` — line-level edits with rationale. |
| **RewriteAgent** | `rewrite` | [rewrite-agent.ts](../../src/lib/ai/rewrite-agent.ts) | `RewriteOption[]` — alternative versions of a passage. |
| **StyleAgent** | `style_check` | [style-agent.ts](../../src/lib/ai/style-agent.ts) | `StyleDeviation[]` — tone/voice consistency findings. |

## Cut from V1 (2026-05-13)

`BrainstormAgent`, `OutlineAgent`, `DraftAgent`, and `SummaryAgent` were
declared as planned TaskTypes but never shipped a parser. They were
removed from [types.ts](../../src/lib/ai/types.ts) and
[task-resolver.ts](../../src/lib/ai/task-resolver.ts) under plan-025 so
the V1 surface only advertises what actually works. The Nova chat
service falls back to `continue` for legacy callers. Re-introducing any
of these agents post-V1 means going through the "How to add a new
agent" checklist below.

## How to add a new agent

1. **Define the role and output schema.** Update [types.ts](../../src/lib/ai/types.ts) with the `TaskType` and output interfaces.
2. **Create the agent module.** New file at `src/lib/ai/<name>-agent.ts` with a parser that validates and shapes the LLM response.
3. **Register the prompt template.** Add ROLE/TASK/CONSTRAINTS/OUTPUT_FORMAT entries to [constants.ts](../../src/lib/ai/constants.ts) and wire them in [prompt-builder.ts](../../src/lib/ai/prompt-builder.ts).
4. **Wire the resolver.** Map the TaskType to the agent in [task-resolver.ts](../../src/lib/ai/task-resolver.ts).
5. **Add tests.** A parser test under [tests/ai/](../../tests/ai/) covering happy path and at least one malformed response.
6. **Update docs.** Promote the entry to "Shipped" in this file with the same date you ship.

## Pipeline stages (V1.1)

Distinct from the runtime agents above. Pipeline stages are stateful,
gated by reviewer checkpoints, and persist artifacts in
`project_metadata` (scope `'pipeline'`). Schema version: **`1.0.0`**.

### `vibe-worldbuild` family (shipped — plan-027 stage-002, UI — plan-028)

| Stage key | Output format | Canon projection |
| --- | --- | --- |
| `vibe-worldbuild.premise` | `json_worldbuild_premise` | None — artifact only. |
| `vibe-worldbuild.worldspec` | `json_worldbuild_worldspec` | None — artifact only. |
| `vibe-worldbuild.research` | `json_worldbuild_research_briefs` | None — deferred to `lore_entries` per ADR-0027. |
| `vibe-worldbuild.populated-world-bible` | `json_worldbuild_populated_bible` | Atomic insert into `characters`, `factions`, `locations`, `themes`, `glossary_terms`, `lore_entries`, `plot_threads`, `timeline_events`. |

Checkpoint lifecycle: `draft → review → accepted | rejected`. Rejected
checkpoints preserve their `reason`; re-upserting the same id resets
the record to `draft`. See [pipeline.md](./pipeline.md) for HTTP surface
and contract details.

**Outline UI (plan-028):** The worldbuild run/review/decision workflow
is surfaced at `/projects/[id]/outline` via a seven-layer hierarchy
navigator and stage detail panel. The run adapter is
[`worldbuild-pipeline-runner.ts`](../../src/modules/outline/services/worldbuild-pipeline-runner.ts);
runtime state is managed in
[`outline-store.svelte.ts`](../../src/modules/outline/stores/outline-store.svelte.ts).
The checkpoint review console includes queue filters, artifact review
detail, and explicit accept/reject controls. `vibe-author` UI parity
is deferred.

### `vibe-author` family (shipped — plan-027 stage-003)

| Stage key | Output format | Canon projection |
| --- | --- | --- |
| `vibe-author.premise` | `json_author_premise` | None — artifact only. |
| `vibe-author.outline` | `json_author_outline` | Legacy parser/task contract only; supported outline generation now uses `vibe-outline.draft` checkpoints. |
| `vibe-author.scene-draft` | `json_author_scene_draft` | None — surfaced via [`NovaSceneDraftCard`](../../src/modules/nova/components/NovaSceneDraftCard.svelte). Accept emits the envelope; the manuscript is never auto-mutated. |
| `vibe-author.revision-pack` | `json_author_revision_pack` | None — surfaced via [`NovaRevisionPackCard`](../../src/modules/nova/components/NovaRevisionPackCard.svelte) with per-issue Acknowledge. |

Delivery surface:

- Runner: [`runAuthorPipelineTask`](../../src/modules/nova/services/author-pipeline-runner.ts) — resolves the task, builds RAG context, calls OpenRouter, parses the response, attaches a `NovaArtifact` to the originating Nova message.
- Cards: [`NovaSceneDraftCard`](../../src/modules/nova/components/NovaSceneDraftCard.svelte) and [`NovaRevisionPackCard`](../../src/modules/nova/components/NovaRevisionPackCard.svelte) render parsed envelopes with explicit user-driven controls only.
- Review gates: scene draft checkpoints use the task-specific `/api/author-draft/checkpoints/*` routes for list, generate, accept, and reject. End-to-end coverage lives in [`tests/e2e/vibe-author-review-gates.spec.ts`](../../tests/e2e/vibe-author-review-gates.spec.ts).

Plan-043 retires user-facing `vibe-author.outline` application. Write-mode
outline prompts use the outline checkpoint flow (`POST /api/ai/outline/generate`
then `NovaOutlineDraftCheckpointCard` review) and legacy outline artifact cards
are read-only compatibility output.

Author-in-the-loop guarantee: every accept path emits a typed callback;
no card component imports the editor store or calls `insertText` /
`applyEdit`. The contract is enforced by source-string tests under
[`tests/ai/pipeline/`](../../tests/ai/pipeline/).

## Agent Tool Mutation Boundary (plan-045)

Nova Agent mode separates model-callable tools from author-issued mutation
commands.

Model-callable tool definitions live in
[`agent-tools.ts`](../../src/modules/nova/services/agent-tools.ts) and are
selected for model payloads through `listModelCallableTools()`. These tools may
read project context or create review artifacts, but they must not accept,
reject, apply, or project artifacts into manuscript/canon state.

Mutation command registrations live in
[`agent-mutation-tools.ts`](../../src/modules/nova/services/agent-mutation-tools.ts)
with `capability: 'mutation_command'`. They are excluded from model
advertisement, and the generic `dispatchTool()` path rejects mutation commands
unless a trusted app caller explicitly opts in with `allowMutationCommands`.

| Pipeline family | Model-callable surface | UI-issued mutation owner | Server guard |
| --- | --- | --- | --- |
| Author draft checkpoints | `authorDraft.get_scene_draft_context`, `authorDraft.generate_scene_draft_checkpoint`, `authorDraft.list_checkpoints` | [`NovaAuthorDraftCheckpointCard.svelte`](../../src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte) buttons call `acceptSceneDraftCheckpoint` / `rejectSceneDraftCheckpoint`. | `/api/author-draft/checkpoints/*` routes keep lifecycle, stale-target, and scene ownership guards in `author-draft-checkpoint-service.ts`. |
| Outline draft checkpoints | Outline generation/checkpoint review cards surface generated outline drafts for review. | [`NovaOutlineDraftCheckpointCard.svelte`](../../src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte) calls [`outline-checkpoint-actions.ts`](../../src/modules/nova/services/outline-checkpoint-actions.ts) for accept/reject. | `/api/outline/checkpoints/[checkpointId]/accept` and project-metadata lifecycle routes keep version, conflict, and rollback guards. |
| Worldbuilding checkpoints/proposals | Worldbuilding scan and generation routes create pending proposals/checkpoints. | Worldbuilding proposal cards and the outline review console call worldbuilding store/proposal services for accept/reject. | Worldbuild checkpoint/proposal routes keep atomic accept/reject and validation behavior before canon projection. |

Rejecting a review artifact is still a mutation because it records an author
decision and changes lifecycle state. Generation-only checkpoint tools remain
model-callable only while they create review artifacts and do not project into
manuscript or canon state.

## Checkpoint Route Ownership (plan-046)

Plan-046 distinguishes canonical route ownership from generic metadata
compatibility. Each checkpoint/proposal family has one supported lifecycle
path per operation:

| Family | Generate / Upsert | List / Read | Review | Accept | Reject | Client Owner |
| --- | --- | --- | --- | --- | --- | --- |
| `vibe-worldbuild` staged checkpoints | `PUT /api/db/project-metadata/{projectId}/pipeline/vibe-worldbuild/{checkpointId}` with `operation: "upsert"` and a current `PipelineArtifactEnvelope` | `GET /api/db/project-metadata/{projectId}/pipeline/vibe-worldbuild` and item `GET` | Same generic metadata item route with `operation: "review"` | Same generic metadata item route with `operation: "accept"` | Same generic metadata item route with `operation: "reject"` and non-empty reason | `src/lib/project-metadata.ts` worldbuild helpers and `world-building-store.svelte.ts` |
| Worldbuilding scan proposals | `POST /api/worldbuilding/scan` persists `WorldbuildProposalRecord` rows under owner `vibe-worldbuild-scan` | Project metadata list/read by owner for notification state | Pending proposal records are already review-ready | `POST /api/worldbuilding/proposals/{proposalId}/accept` with `projectId` body | `POST /api/worldbuilding/proposals/{proposalId}/reject` with `projectId` and reason | `worldbuilding-proposal-service.ts` should target the proposal routes and include project context |
| Author draft checkpoints | `POST /api/author-draft/checkpoints/generate` creates or reuses a `review` checkpoint | `GET /api/author-draft/checkpoints` and `GET /api/author-draft/scene-draft-context` | Generated scene drafts are already review-ready | `POST /api/author-draft/checkpoints/{checkpointId}/accept` | `POST /api/author-draft/checkpoints/{checkpointId}/reject` with reason | `author-draft-api.ts` and `NovaAuthorDraftCheckpointCard.svelte` |
| Outline draft checkpoints | `POST /api/ai/outline/generate` creates a `review` checkpoint; generic metadata upsert remains fixture/internal compatibility | `GET /api/db/project-metadata/{projectId}/pipeline/outlineDraftCheckpoints.v1` and item `GET` | Generic metadata item route with `operation: "review"` | `POST /api/outline/checkpoints/{checkpointId}/accept` with stale preconditions | Generic metadata item route with `operation: "reject"` and non-empty reason | `outline-generation-runner.ts`, `outline-checkpoint-actions.ts`, and `NovaOutlineDraftCheckpointCard.svelte` |

Worldbuilding scan proposals support an optional `canonDiff` contract for
author-reviewable `create`, `update`, `merge`, `link`, and `no_op` decisions.
The proposal card renders field-level changes and duplicate candidates before
the author accepts or rejects. Accept uses
[`acceptProposalAtomically`](../../src/lib/ai/pipeline/checkpoint-service.ts)
to project supported decisions inside one SQLite transaction; unsupported or
protected fields fail without partial canon writes. Historical proposals with
no `canonDiff` continue through the legacy create projection fallback.

Duplicate candidates are review evidence only. They can make a `merge`
decision visible, but they never auto-select a target or mutate canon without
the proposal accept route.

Accepted and rejected proposal records retain compact audit metadata on the
proposal: projection mode, decision, diff id, target id/display name, changed
field names, link targets, duplicate/evidence counts, and rejection reason
when applicable. The audit block intentionally avoids full entity snapshots,
prompt text, and raw provider output.
- Generic project metadata remains supported for ordinary `scene`, `chapter`,
  and `project` metadata. Under `scope: "pipeline"`, it is canonical only for
  `vibe-worldbuild` staged checkpoint lifecycle and for outline checkpoint
  list/read/review/reject compatibility. It is not canonical for author draft
  checkpoints, worldbuilding scan proposal accept/reject, or outline accept
  materialization. `/api/nova/outline/apply` is retired and returns
  `410 outline_apply_retired`.

## Observability & Tracing (plan-049)

Every agent run and high-level AI interaction is tracked through the **Agent Runtime Stack**.

- **Run Ledger**: A durable record of every run, its steps, tool calls, and outcomes. Stored in `agent_runs`, `agent_run_steps`, etc.
- **Tracing**: Redacted records of prompts, provider calls, tool routing, and parser results. Traces are stored in `agent_trace_events` and are linked to runs.
- **Redaction**: Credentials (API keys, passwords) and manuscript content are redacted by default in trace records using `redaction.ts`.
- **Diagnostics**: A support bundle can be exported via `GET /api/diagnostics/agent-runtime`, containing redacted runtime history and environment metadata for troubleshooting.

The `AiProvider` interface supports an optional `runtime` context in `CompletionRequest`, allowing providers to emit traces automatically when a `runId` is provided.

## Frontend Review Surface Language (plan-048)

Review-gated AI outputs use shared UI language from
[`review-gate-labels.ts`](../../src/lib/review-gate-labels.ts). The helper is
used by Nova author-draft checkpoints, Nova outline checkpoints, worldbuilding
proposal cards, and worldbuilding generation status displays.

Canonical labels:

- `review` / `pending_review` / `draft` → `Pending review`
- `accepted` / `applied` → `Accepted`
- `rejected` → `Rejected`

Action labels remain explicit: `Accept`, `Reject`, and `Review changes`.
The helper is frontend copy only; lifecycle authority stays in the family-owned
routes documented below.

## Lifecycle and error responses

Lifecycle and error responses are intentionally family-specific where the
product behavior differs:

| Family | Success | Invalid Request / Payload | Missing Target | Invalid Transition / Stale State | Materialization Failure |
| --- | --- | --- | --- | --- | --- |
| `vibe-worldbuild` staged checkpoints | `200 { ok, checkpoint }` | `400 invalid_payload` | `404 not_found` | `409 invalid_transition` | `400 projection_failed` on projection errors |
| Worldbuilding scan proposals | `200 { ok, proposal }` | `400 invalid_request`; `422` for proposal lifecycle errors | `404 not_found` | `422 invalid_transition` | Projection errors stay in proposal error payloads |
| Author draft checkpoints | `200 { ok, checkpoint }` | `400` missing request fields; `422 invalid_payload` | `404 not_found` or `scene_not_found` | `409 invalid_transition` or `stale_target` | `500 apply_failed` |
| Outline draft checkpoints | Generic review/reject `200 { ok, checkpoint }`; accept `200 { ok, checkpoint, materialization }` | `400 invalid_request`, `invalid_payload`, or `invalid_version` | `404 not_found` | `409 invalid_transition`, `stale_checkpoint`, or `outline_conflict` | `500 materialization_failed` with rollback |
| Retired Nova outline apply | None | `410 outline_apply_retired` | n/a | n/a | n/a |

Accept idempotency is not uniform: worldbuild checkpoint accept returns the
accepted checkpoint when it is already accepted; author draft accept is also
idempotent for accepted checkpoints; outline accept requires a `review`
checkpoint and stale preconditions, so accepting an already accepted outline
checkpoint returns `409 invalid_transition`.

Version policy is also family-specific:

| Family | Current Version | Compatibility Policy | Unknown / Malformed Version Behavior |
| --- | --- | --- | --- |
| `vibe-worldbuild` staged checkpoints | Checkpoint record `1.0.0`; current artifact fixtures use `parserVersion: "1.0.0"` and a `PipelineArtifactEnvelope` with `pipeline`, `model`, `hierarchy`, and `notes`. | E2E fixtures and clients must emit the current envelope instead of relying on legacy `family`-only artifacts. Existing persisted `1.0.0` rows remain supported. | Malformed artifacts fail `400 invalid_payload`. Unknown checkpoint record versions are not accepted for review, accept, or reject and return `400 invalid_version`. |
| Worldbuilding scan proposals | No independent schema version field; owner `vibe-worldbuild-scan` and `WorldbuildProposalRecord` shape define the contract. | Proposal rows are consumed only through the proposal routes with project context. Historical proposal rows must already deserialize to `WorldbuildProposalRecord`. | Malformed proposal rows fail before projection. Unknown future proposal shapes are not compatibility-supported. |
| Author draft checkpoints | Owner `authorDraftCheckpoints.v1`; artifact `version: 1`. | Generated checkpoints are already review-ready and must validate against `authorDraftCheckpointSchema`. There is no legacy `draft` lifecycle compatibility layer. | Zod validation rejects malformed or unknown artifact versions as `invalid_payload`; accept/reject never migrates old shapes. |
| Outline draft checkpoints | Owner `outlineDraftCheckpoints.v1`; checkpoint schema `1.0.0`; draft artifact `version: 1` and `schemaVersion: "1.0.0"`. | Outline generation creates current review checkpoints. Generic metadata upsert is fixture/internal compatibility only and rejects non-current checkpoint schema versions. | Upsert rejects unsupported checkpoint versions with `400 invalid_version`; accept also enforces current checkpoint and draft versions before materialization. |
| Retired Nova outline apply | None. | No compatibility adapter. | Always returns `410 outline_apply_retired`. |

Plan-046 stale fixture remediation rule: update tests that still seed legacy
checkpoint artifacts to the current family schema when they cover behavior
that remains canonical. Retire or rewrite tests only when the route itself is
retired, such as `/api/nova/outline/apply`.

## Cross-references

- AGENTS.md at the repo root reflects the same status. Keep both in sync.
- [pipeline.md](./pipeline.md) — how agents are invoked.
- [prompt-system.md](./prompt-system.md) — prompt construction.
- [context-engine.md](./context-engine.md) — what context each agent receives.
