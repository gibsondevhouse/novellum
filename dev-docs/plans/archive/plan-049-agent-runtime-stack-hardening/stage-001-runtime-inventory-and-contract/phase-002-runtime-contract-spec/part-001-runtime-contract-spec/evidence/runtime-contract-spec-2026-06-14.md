# Runtime Contract Spec - 2026-06-14

Plan: `plan-049-agent-runtime-stack-hardening`  
Stage: `stage-001-runtime-inventory-and-contract`  
Phase: `phase-002-runtime-contract-spec`  
Part: `part-001-runtime-contract-spec`

## Contract Goals

The runtime ledger must make every local AI operation inspectable, recoverable, and review-safe without replacing the existing local-first stack.

The contract must:

- Preserve existing author-in-the-loop mutation boundaries.
- Link runtime records to existing checkpoints, proposals, consistency issues, scene mutations, and provider calls instead of copying full domain payloads.
- Record cancellation, retry, validation failure, parse failure, provider failure, and user review decisions even when no artifact is produced.
- Keep raw manuscript text, full prompt bodies, provider credentials, and raw provider errors out of diagnostics exports unless a future explicit opt-in artifact defines a redacted format.

## Canonical Runtime Families

| Family | Current surfaces | Durable owner |
| --- | --- | --- |
| `nova-chat` | Ask/Write streaming chat through `sendNovaChat()` and `/api/ai` proxy shape | Stage 002 run ledger, Stage 005 trace export |
| `nova-agent` | Agent mode loop, model-callable tools, `/api/nova/agent` | Stage 002 run/step/tool-call ledger, Stage 003 retry/cancel |
| `vibe-worldbuild` | Outline page stage-run pipeline and worldbuild checkpoints | Stage 002 artifact links, Stage 003 job locks |
| `worldbuilding-generate` | One-click entity draft generation | Stage 002 transient artifact/run links, Stage 003 cancellation |
| `worldbuilding-scan` | Scan proposal generation and proposal accept/reject | Stage 002 artifact links, Stage 003 jobs, Stage 005 diagnostics |
| `outline-generation` | `/api/ai/outline/generate`, outline checkpoints, materialization | Stage 002 run/artifact links, Stage 003 jobs |
| `author-draft` | Scene/chapter draft checkpoint generation, accept/reject | Stage 002 run/artifact/mutation links, Stage 003 batch jobs |
| `continuity-check` | Continuity executor and `consistency_issues` writes | Stage 002 run/artifact links, Stage 005 eval fixtures |
| `provider-diagnostics` | key tests, model list, Ollama status | Stage 004 model registry, Stage 005 diagnostics |

## Shared Status Vocabulary

Use one status vocabulary across runtime rows, with table-specific restrictions where needed.

| Status | Meaning |
| --- | --- |
| `pending` | Row exists but execution has not started. |
| `running` | Work is actively executing. |
| `retrying` | Previous attempt failed and a scheduled retry is pending or active. |
| `waiting_for_review` | Model/runtime work succeeded and produced an artifact that requires explicit author action. This is a successful generation terminal state, not a failure. |
| `completed` | The runtime unit finished and no further runtime action is required. For review artifacts, this only follows an accepted/rejected author decision or an intentionally non-mutating diagnostic result. |
| `failed` | Work ended with a non-retryable error or exhausted retry policy. |
| `cancelled` | User/system requested cancellation before normal completion. If a review artifact already exists, link it and keep the artifact lifecycle authoritative. |
| `expired` | Pending or waiting work exceeded a retention/lock deadline without completion. |

Rows may also keep source-specific statuses such as existing checkpoint `review`, proposal `pending_review`, or tool result `success` in a `sourceStatus` field, but runtime orchestration should normalize to the shared statuses above.

## `agent_runs`

`agent_runs` is the parent row for every user- or system-initiated AI workflow.

Minimum fields:

- `id`: stable runtime UUID.
- `projectId`: nullable only for provider diagnostics that do not target a project.
- `family`: one of the canonical runtime families.
- `entrypoint`: route/service/component source, e.g. `/api/ai/outline/generate` or `runAgentLoop`.
- `requestedBy`: `user`, `system`, `model_tool`, `trusted_ui`, or `test`.
- `status`: shared status.
- `modelProvider`: e.g. `openrouter`, `ollama`, or `mock`.
- `modelId`: selected model at request time.
- `modelCapabilitySnapshotId`: nullable link to the Stage 004 capability registry.
- `startedAt`, `completedAt`, `cancelledAt`, `updatedAt`.
- `target`: compact refs such as `projectId`, `chapterId`, `sceneId`, `checkpointId`, `proposalId`, `domainScope`, `pipelineTaskKey`.
- `inputHash`: deterministic hash of sanitized input and context packet.
- `contextHash`: populated when an existing context builder provides one, e.g. outline generation.
- `statusReason`: stable error/cancellation/review reason code.
- `errorCode`, `errorMessageRedacted`: nullable user-safe error.
- `retryOfRunId`: nullable link to the prior run when user/system retries.

Run transition rules:

- `pending -> running` when execution starts.
- `running -> waiting_for_review` when a checkpoint/proposal/review artifact is persisted and author action is required.
- `waiting_for_review -> completed` when the author accepts or rejects the linked artifact.
- `running -> completed` only for non-mutating tasks such as chat, diagnostics, model listing, and continuity with issues already persisted.
- `running -> failed` when provider/parse/validation/persistence fails and retry policy is exhausted or disabled.
- `running -> cancelled` when the active request is aborted before terminal output.
- `failed -> retrying -> running` only through a new attempt row or retry step; never mutate the failed run into a new hidden attempt.
- `pending/running/retrying -> expired` only by a watchdog or lock recovery process.

## `agent_run_steps`

`agent_run_steps` records the ordered work inside a run.

Minimum fields:

- `id`, `runId`, `sequence`, `parentStepId`.
- `kind`: `context_build`, `model_request`, `model_stream`, `tool_call`, `parse`, `validate`, `persist_artifact`, `await_user_review`, `decision`, `mutation`, `diagnostic`, `redaction`, `export`.
- `status`: shared status or `skipped` for intentionally omitted optional steps.
- `startedAt`, `completedAt`, `elapsedMs`.
- `source`: source path/route/service name.
- `inputHash`, `outputHash`: hashes of redacted step inputs/outputs.
- `errorCode`, `errorMessageRedacted`.
- `usageEstimateId`, `providerUsageId`: nullable links to usage rows.
- `artifactId`: nullable link when a step creates or consumes an artifact.

Step transition rules:

- Steps are append-only. Do not rewrite failed model or parser steps during retry; append another step linked by `parentStepId` or `retryOfStepId`.
- A run may have multiple `model_request` attempts before one `parse` succeeds.
- `await_user_review` is a completed step when the artifact is persisted and visible, while the parent run status becomes `waiting_for_review`.

## `agent_tool_calls`

`agent_tool_calls` records both model-requested tools and trusted app mutation commands.

Minimum fields:

- `id`, `runId`, `stepId`, `invocationId`.
- `toolId`.
- `capability`: existing Nova values `read_only`, `review_artifact_generation`, or `mutation_command`.
- `caller`: `model`, `trusted_ui`, `system`, or `test`.
- `status`: normalized shared status plus `sourceStatus` for current `ToolResult.status`.
- `inputRedactedJson`, `outputRedactedJson`, `inputHash`, `outputHash`.
- `startedAt`, `completedAt`.
- `errorCode`, `errorMessageRedacted`.
- `artifactId`: nullable link when the tool creates or mutates a review artifact.

Tool boundary rules:

- `caller: model` must never execute `capability: mutation_command`.
- `mutation_command` rows require `caller: trusted_ui` or `system` and must link to an existing review artifact when they accept/reject/apply.
- Model-callable `review_artifact_generation` tools may persist checkpoints/proposals, but the created artifact must enter `waiting_for_review` until author decision.
- Tool outputs in diagnostics must be redacted and may be omitted entirely for manuscript-containing content.

## `agent_jobs`

`agent_jobs` is for asynchronous, long-running, or batchable work. A job may own one run, or a parent run may own several jobs.

Minimum fields:

- `id`, `runId`, `projectId`.
- `jobType`: `outline_generation`, `author_scene_draft`, `author_chapter_batch`, `worldbuild_stage`, `worldbuilding_scan`, `worldbuilding_generate`, `continuity_check`, `diagnostic_export`.
- `status`: shared status plus optional queue internals `queued`, `claimed`.
- `priority`, `runAfter`, `lockedAt`, `lockedBy`, `lockExpiresAt`.
- `attempt`, `maxAttempts`, `retryOfJobId`.
- `payloadRedactedJson`, `payloadHash`.
- `progressCurrent`, `progressTotal`, `progressLabel`.
- `startedAt`, `completedAt`, `cancelledAt`, `updatedAt`.
- `errorCode`, `errorMessageRedacted`.

Job transition rules:

- `pending -> running` when claimed.
- `running -> retrying` only when the error is retryable and attempts remain.
- `retrying -> pending` when rescheduled.
- `running -> waiting_for_review` when the job produced review artifacts and no more worker action is required.
- `running -> completed` when the job has no review-gated artifact or the job is only a child step inside a parent run.
- `running -> cancelled` should ask provider/client work to abort and stop claiming new child jobs.
- Stale `running` jobs with expired locks become `expired` or `retrying` based on retry policy.

Batch rule:

- Author chapter draft generation must create one parent `author_chapter_batch` job and one child `author_scene_draft` job per scene. Partial completion is valid and must be resumable without regenerating already review-ready checkpoints unless `forceRegenerate` is explicit.

## `agent_artifacts`

`agent_artifacts` links a runtime run to existing domain records. It must not duplicate large payloads by default.

Minimum fields:

- `id`, `runId`, `stepId`.
- `artifactType`: `worldbuild_checkpoint`, `worldbuild_scan_proposal`, `outline_checkpoint`, `author_draft_checkpoint`, `consistency_issue`, `model_text`, `transient_draft`, `diagnostic_bundle`.
- `reviewState`: `none`, `draft`, `review`, `pending_review`, `accepted`, `rejected`, `failed_validation`.
- `storageKind`: `project_metadata`, `table`, `memory`, `file`, `none`.
- `storageRef`: compact ref such as `{ projectId, scope, ownerId, key }`, `{ table, id }`, or `{ filePath }`.
- `schemaVersion`: source artifact schema/version if available.
- `createdAt`, `updatedAt`.
- `summary`: short UI-safe summary.
- `contentHash`: hash of canonical artifact payload, if persisted.

Artifact rules:

- For current `project_metadata` artifacts, store owner/key refs and schema versions; do not copy the full JSON blob into runtime tables.
- For transient worldbuilding generation drafts and `propose.*` Agent tool envelopes, store either a redacted summary or an explicit `storageKind: memory` link so diagnostics know the artifact was not durable.
- Review-gated artifacts control user-visible decision state. The runtime run points at them; it does not replace their canonical lifecycle.

## Usage, Cost, and Model Capability Links

Usage should be captured in two forms:

- `estimated_usage`: prompt character counts, estimated prompt tokens, configured max output tokens, and budget reservation before the provider call.
- `provider_usage`: provider-reported prompt/completion/total tokens, finish reason, and provider confidence after the call.

Minimum fields:

- `runId`, `stepId`, `providerId`, `modelId`.
- `promptChars`, `completionChars`.
- `estimatedPromptTokens`, `estimatedCompletionTokens`, `estimatedCostUsd`.
- `providerPromptTokens`, `providerCompletionTokens`, `providerTotalTokens`, `providerCostUsd`.
- `finishReason`, `usageConfidence`: `estimated`, `provider_reported`, or `mixed`.

Rules:

- Never block a model request solely because provider cost is unknown; block only when configured budget policy says unknown-cost models are disallowed.
- Persist the selected model and capability snapshot before execution so later catalog drift does not change historical run interpretation.
- Existing routes that only return `tokensUsed` should be treated as partial provider usage.

## Trace Events

Trace events are append-only diagnostic breadcrumbs.

Minimum event fields:

- `id`, `runId`, `stepId`, `sequence`.
- `eventType`: `created`, `claimed`, `context_built`, `provider_request`, `provider_response`, `stream_delta`, `tool_requested`, `tool_completed`, `artifact_persisted`, `waiting_for_review`, `user_accepted`, `user_rejected`, `mutation_applied`, `cancel_requested`, `cancelled`, `retry_scheduled`, `failed`, `completed`, `diagnostic_exported`.
- `createdAt`.
- `severity`: `debug`, `info`, `warn`, `error`.
- `message`: user-safe compact message.
- `metadataRedactedJson`.

Trace rules:

- Do not store raw prompt, raw provider response, API keys, full manuscript text, or full before/after canon snapshots in trace rows.
- Store hashes, counts, schema versions, row ids, checkpoint ids, proposal ids, and stable error codes.
- Raw provider output may be retained only through an explicit local debug setting and must never be included in default support bundles.

## Diagnostics and Support Bundles

Default diagnostics export may include:

- Runtime rows and trace events.
- Provider id/model id, capability snapshot metadata, token/cost summaries.
- Checkpoint/proposal/issue ids and lifecycle summaries.
- Error codes and redacted messages.
- Environment facts needed for local diagnosis, such as active provider type and app version.

Default diagnostics export must exclude:

- API keys and credential-store paths.
- Raw prompts, raw model responses, full scene/manuscript text.
- Full project synopsis when a hash/length already exists.
- Full canon before/after payloads for proposal diffs.
- Local file attachment contents.

Redaction failures must fail closed: if a field is not explicitly classified as safe, diagnostics should omit it or replace it with a hash/count.

## Review-Gated Mutation Boundary

The runtime contract preserves the Plan-045 boundary:

- Model-callable tools can read state and generate review artifacts.
- Model-callable tools cannot accept, reject, apply, or project artifacts into manuscript/canon state.
- UI/app accept/reject/apply actions are runtime events and may be represented as `agent_tool_calls` with `capability: mutation_command`, but only with `caller: trusted_ui` or `system`.
- A run that creates an outline checkpoint, author draft checkpoint, worldbuild checkpoint, or worldbuilding proposal ends in `waiting_for_review`.
- The artifact's canonical lifecycle remains in the existing checkpoint/proposal service. Runtime rows link and summarize; they do not become the source of truth for acceptance.

## Current Path Mapping

| Current path | Future run family | Future artifact link | Future job need | Notes |
| --- | --- | --- | --- | --- |
| `sendNovaChat()` + `/api/ai` stream | `nova-chat` | optional `model_text` | no | Persist prompt/context hashes and stream usage if available. |
| `runAgentLoop()` + `/api/nova/agent` | `nova-agent` | tool-created artifacts | optional | Fold direct OpenRouter route behind provider abstraction or record OpenRouter-specific transport explicitly. |
| `runWorldbuildPipelineTask()` | `vibe-worldbuild` | `worldbuild_checkpoint` | yes | Replace module-local `activeRunKey` with durable job lock. |
| `/api/worldbuilding/generate` | `worldbuilding-generate` | `transient_draft` until user save | optional | Persist cancellation/failure even when drafts stay transient. |
| `/api/worldbuilding/scan` | `worldbuilding-scan` | `worldbuild_scan_proposal` | yes | Link one run/job to all proposal ids generated in the transaction. |
| `/api/worldbuilding/proposals/*` | `worldbuilding-scan` decision event | `worldbuild_scan_proposal` | no | Trusted UI decision event; accept may project canon rows. |
| `/api/ai/outline/generate` | `outline-generation` | `outline_checkpoint` | yes | Record attempts, repair prompt attempt, context hash, and conflict preflight. |
| `/api/outline/checkpoints/*/accept` | `outline-generation` decision event | `outline_checkpoint` | no | Link materialized hierarchy counts and stale precondition result. |
| `/api/author-draft/checkpoints/generate` | `author-draft` | `author_draft_checkpoint` | yes | Preserve generation failure checkpoint behavior as explicit failed artifact link. |
| `NovaAuthorDraftEngine` chapter loop | `author-draft` | many `author_draft_checkpoint` rows | yes | Parent/child job structure required for resume. |
| `/api/author-draft/checkpoints/*/accept` | `author-draft` decision event | `author_draft_checkpoint` | no | Link scene id and stale guard metadata; never let model caller invoke it. |
| `runContinuityCheck()` | `continuity-check` | `consistency_issue` rows | optional | Link created issue ids and parse empty/malformed behavior. |
| settings AI routes | `provider-diagnostics` | diagnostic rows only | no | Redact provider errors and key candidates. |

## Edge Cases

- A run can produce one or more review artifacts and still be `waiting_for_review` even when all model/provider work succeeded.
- A cancelled request may still leave a persisted checkpoint or proposal if cancellation arrived after persistence. The artifact lifecycle is authoritative; the run should be `cancelled` with an artifact link and a trace event noting late cancellation.
- A provider failure during author draft generation may create a rejected failure checkpoint. Runtime rows should link that artifact as `failed_validation` or `rejected` based on the checkpoint source lifecycle.
- Retrying an outline or author draft generation should not overwrite a prior failed run. Create a new run linked through `retryOfRunId`.
- Reusing an existing active author draft checkpoint without regeneration should create a short run with `completed` status and an artifact link marked `reused`.
- Accepting an already accepted worldbuild or author draft checkpoint may be idempotent at the domain layer; runtime should still record a decision attempt with `sourceStatus: already_accepted`.
- Outline accept is not idempotent and must preserve stale precondition failures as runtime `failed` decision steps.
- Tool-call outputs that include manuscript or canon text must be summarized/hash-linked before trace or diagnostics export.

## Implementation Order Guidance

1. Stage 002 should add the run, step, artifact, and usage tables first, plus helper APIs that can wrap current synchronous routes without changing behavior.
2. Stage 003 should add the queue/job layer only after run/artifact links exist.
3. Stage 004 should backfill model capability snapshots and budget enforcement against the run ledger.
4. Stage 005 should build traces, eval fixtures, and diagnostics export from ledger data instead of adding separate telemetry storage.
