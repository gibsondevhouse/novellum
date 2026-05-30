---
title: Wire Author Pipeline Artifact Path
slug: part-001-wire-author-pipeline-artifact-path
part_number: 1
status: complete
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-003-author-drafting-revision-qa
started_at: 2026-05-26T23:30:00Z
completed_at: 2026-05-26T23:58:00Z
estimated_duration: 1d
---

## Objective

Surface parsed `vibe-author` pipeline artifacts (scene-draft prose + sidecar,
revision-pack issues) on Nova messages so downstream UI (`part-002`) can render
them. No prose is ever written back to the manuscript by this part.

## Scope

**In scope:**

- A new Nova service entry that runs an `AuthorTaskKey` pipeline task end-to-end:
  resolve task, build context, build prompt, fetch a single non-streamed
  OpenRouter completion, parse with `parseAuthorTaskOutput`, attach the parsed
  artifact to a Nova message.
- Extending `NovaMessage` with an optional `artifact` envelope so message-log
  consumers can branch on artifact type without reaching into pipeline modules.
- Extending `novaSession` with `attachArtifact()` / `failArtifact()` helpers
  that respect the existing immutability + streaming-status conventions.
- Unit tests covering the runner against `parseAuthorTaskOutput` success and
  every documented failure mode (parser error, transport failure, abort).

**Out of scope:**

- Rendering UI for the artifact (owned by `part-002`).
- Accept/reject side effects (owned by `part-002`).
- E2E + doc sync (owned by `part-003`).

## Implementation Steps

1. Add a `NovaArtifact` discriminated union to `src/modules/nova/types.ts` and
   thread it onto `NovaMessage` as an optional field.
2. Extend `novaSession` with `attachArtifact(messageId, artifact)` and
   `failArtifact(messageId, reason)` helpers that mutate in place via runes.
3. Create `src/modules/nova/services/author-pipeline-runner.ts` exposing
   `runAuthorPipelineTask(input)`.
4. Write unit tests in `tests/nova/services/author-pipeline-runner.test.ts`.

## Files

**Create:**

- `src/modules/nova/services/author-pipeline-runner.ts`
- `tests/nova/services/author-pipeline-runner.test.ts`

**Update:**

- `src/modules/nova/types.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/index.ts`

## Acceptance Criteria

- [ ] `NovaMessage.artifact` is an optional discriminated union covering at
      least scene-draft and revision-pack payloads.
- [ ] `runAuthorPipelineTask` resolves the task via `resolveTask`, builds an
      `AiContext` via the existing Nova RAG hook, calls a non-streaming
      OpenRouter completion, and pipes the raw output through
      `parseAuthorTaskOutput`.
- [ ] On parse success, the assistant message is `status: 'complete'` and has
      `artifact` populated.
- [ ] On parse failure, the assistant message is `status: 'error'` with the
      fallback message, and `artifact` remains `undefined`.
- [ ] Transport / abort errors surface as `status: 'error'` or `aborted` with
      no artifact attached and no manuscript mutations.
- [ ] Unit tests pass and cover success + parse error + transport failure +
      abort paths.

## Edge Cases

- Empty / whitespace-only model output → parser returns
  `missing_json_object`; the message must surface the fallback string.
- Scene-draft sidecar missing required IDs → message must remain
  non-actionable (no artifact attached).
- Stream abort mid-completion → no artifact attached; existing
  abort-status convention applies.

## Notes

This part deliberately uses a non-streaming completion because both
scene-draft and revision-pack outputs require parsing the full payload
before they become actionable. Streaming UX for prose drafts is a
future stretch and not in plan-027 scope.
