# Runner Flow — part-001 Wire Author Pipeline Artifact Path

> Captured 2026-05-26. Documents the end-to-end flow of
> `runAuthorPipelineTask(input)` for future maintainers and part-002
> UI authors.

## Sequence

```text
caller (part-002 UI / E2E)
   │
   ▼
runAuthorPipelineTask({ taskKey, projectId, sceneId, chapterId, instruction })
   │
   ├── isAuthorTaskKey(taskKey)?       ── no ──▶ append error msg, fail()
   │
   ├── resolveTask("pipeline:<key>", uiCtx)
   │       → AiTask { taskType: 'pipeline', pipelineTask: { … } }
   │
   ├── buildRagContext({ projectId, sceneId, policy: 'scene_plus_adjacent' })
   │       → AiContext (falls back to EMPTY_AI_CONTEXT on throw)
   │
   ├── novaSession.beginStream('nova')  → message { id, status: 'streaming' }
   │
   ├── buildPrompt(task, aiContext)     → system prompt (ROLE/TASK/…/OUTPUT FORMAT)
   │
   ├── OpenRouterClient.complete({ model, messages }, { signal })
   │       │
   │       ├── throws AbortError / signal.aborted ─▶ return { ok:false, reason:'aborted' }
   │       │
   │       └── throws other Error      ─▶ novaSession.fail(); return 'transport_failed'
   │
   ├── createAuthorArtifactFromModelOutput({ task, rawOutput })
   │       │
   │       ├── parse.ok === false       ─▶ novaSession.fail(fallbackMessage);
   │       │                                return 'parse_failed'
   │       │
   │       └── parse.ok === true        ─▶ toNovaArtifact(envelope, taskKey)
   │                                       → NovaArtifact { kind, envelope }
   │
   ├── novaSession.attachArtifact(messageId, artifact)
   │       → message { status: 'complete', artifact }
   │
   ▼
return { ok: true, messageId, artifact }
```

## Invariants

- The manuscript is **never** mutated. The runner only writes to the
  Nova message log via `novaSession`.
- A failed parse leaves `message.artifact === undefined` and
  `message.status === 'error'`. Part-002 UI must branch on artifact
  presence rather than message status alone.
- The runner uses **non-streaming** `OpenRouterClient.complete`
  because both scene-draft and revision-pack outputs require parsing
  the full payload before they become actionable.
- The runner records every exit edge as a typed `reason` so callers
  (and the part-003 E2E spec) can assert against them without parsing
  free-text error strings.

## Surface added to the Nova barrel

- `runAuthorPipelineTask` (function)
- `AuthorPipelineRunInput` (type)
- `AuthorPipelineRunResult` (type)
- `NovaArtifact` (type)

All future Nova consumers must import these through
`$modules/nova/index.ts` to satisfy `eslint-plugin-boundaries`.
