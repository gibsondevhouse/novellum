# Doc Sync — part-003

Author surface promoted from "scaffolded" to "shipped" across the AI
docs.

## `dev-docs/03-ai/pipeline.md`

- Date stamp bumped to 2026-05-27.
- Added `### vibe-author review-gate flow` section covering:
  - `src/lib/ai/pipeline/author-agent.ts` (parser).
  - `src/lib/ai/pipeline/author-schemas.ts` exposing
    `AUTHOR_SEVERITY_ORDER` (`critical → high → medium → low`).
  - `src/modules/nova/services/author-pipeline-runner.ts` and its
    `runAuthorPipelineTask()` result variants
    (`invalid_task | parse_failed | transport_failed | aborted`).
  - `NovaSceneDraftCard` (`Accept` / `Reject` / `Copy` via
    `navigator.clipboard`) and `NovaRevisionPackCard` (per-issue
    `Acknowledge`).
  - `NovaMessageLog` artifact branching on `message.artifact?.kind`.
  - Three-layer review-gate guardrail:
    1. Component contract — source-string tests in
       `tests/ai/pipeline/scene-draft-sidecar.test.ts` and
       `tests/ai/pipeline/revision-pack.test.ts` forbid manuscript-write
       imports.
    2. Runner contract — `tests/nova/services/author-pipeline-runner.test.ts`
       asserts the runner only attaches an artifact.
    3. HTTP contract — `tests/e2e/vibe-author-review-gates.spec.ts`
       asserts `/api/db/scenes` and `/api/db/chapters` stay empty after
       accept and reject.
  - Accept callback contract preserves the envelope for a future
    editor accept-pipeline (explicitly out of scope for plan-027).

## `dev-docs/03-ai/agents-map.md`

- Date stamp bumped to 2026-05-27.
- Replaced the "scaffolded" stub with a `vibe-author` family table
  (`premise`, `outline`, `scene-draft`, `revision-pack`) marked as
  "shipped — plan-027 stage-003".
- Linked the runner (`author-pipeline-runner.ts`), the two card
  components, and the e2e spec.
- Added an explicit author-in-the-loop guarantee referencing the
  `tests/ai/pipeline/` source-string tests.

## Cross-doc rationale

The Doc Sync deliverable closes the loop between the implementation
(parts 001 + 002) and the published surface. With this update, both
`pipeline.md` and `agents-map.md` reflect reality and point new
contributors at the correct files and tests. No other docs required
changes for this stage close (`AGENTS.md` already references the
runtime agents; the vibe-author surface is a pipeline family, not a
runtime agent).
