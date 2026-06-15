## Novel Engine v1 — “Draft From Outline” (Guided Pipeline)

### Summary
Deliver a guided, checkpointed pipeline that takes an *approved outline in the DB* and generates **scene drafts** (one-by-one or by chapter), surfaces them as reviewable artifacts in Nova, and **writes accepted drafts into `scenes.content`** with explicit user confirmation (no silent edits). This makes Novellum feel like a real long-form “novel engine” without needing one giant prompt.

### Key Changes
1) **Stabilize the agentic surface (remove self-sabotage)**
- Update the `agent` task messaging so it *encourages* tool calls instead of claiming tools are disabled:
  - Update `/Users/gibdevlite/Dev/novellum/src/lib/ai/task-resolver.ts:109` role text.
  - Update `/Users/gibdevlite/Dev/novellum/src/lib/ai/constants.ts:112` + `/Users/gibdevlite/Dev/novellum/src/lib/ai/constants.ts:129` descriptions.
- Fix Nova Composer UX copy so Agent mode no longer says “coming soon / routed to Ask”:
  - Update `/Users/gibdevlite/Dev/novellum/src/modules/nova/components/NovaComposer.svelte:60` and mode option description at `/Users/gibdevlite/Dev/novellum/src/modules/nova/components/NovaComposer.svelte:20`.
- Align `prose_plus_scene_sidecar` contract text with `authorSceneSidecarSchema`:
  - Update `/Users/gibdevlite/Dev/novellum/src/lib/ai/constants.ts:158` to describe `{ sceneId, chapterId, povCharacterId, wordCount, usedCanonRefs, uncertainties, continuityRisks }`.

2) **Make pipeline context building reliable in server contexts**
- Refactor the context engine to support dependency-injected `fetch`:
  - Add an optional `fetch` parameter to `buildContext(...)` (defaulting to browser/global fetch for client usage).
  - Thread that fetch through `apiGet` usage so internal `/api/db/*` calls work on the server.
- In `/Users/gibdevlite/Dev/novellum/src/routes/api/ai/+server.ts:280`, call `buildContext(task, projectId, { fetch: event.fetch })` (or equivalent) when handling `{ action, projectId }` requests, instead of relying on global fetch. This avoids relative-URL failures in server execution. ([openrouter.ai](https://openrouter.ai/docs/guides/features/tool-calling?utm_source=openai))

3) **Checkpoint + Apply: turn “scene drafts” into real novel output**
- Add an **Author Draft Checkpoint** mechanism (mirroring worldbuild checkpoints) stored in `project_metadata`:
  - Record fields: `id`, `projectId`, `taskKey`, `artifactEnvelope`, `lifecycle` (`draft|review|accepted|rejected`), timestamps, and acceptance metadata (e.g. `appliedToSceneId`, `appliedAt`).
  - Minimal API surface:
    - `list` (by projectId + lifecycle)
    - `upsert` (save generated draft artifacts)
    - `accept` (apply to DB + mark accepted)
    - `reject` (mark rejected with reason)
- Wire **Scene Draft Accept** to actually write to the DB:
  - On accept of a `vibe-author.scene-draft` artifact:
    - `PUT /api/db/scenes/:id` with `{ content: prose, wordCount }` (and `updatedAt` auto-updated by the route).
    - Ensure the editor refreshes (invalidate/load or local store update).
  - Keep this strictly “explicit accept → apply”; no auto-apply in generation.

4) **Chapter drafting runner (the “engine” loop)**
- Add a “Draft chapter” runner that:
  - Loads all scenes for the selected chapter (ordered).
  - For each scene:
    - Calls `vibe-author.scene-draft` (non-streaming) and parses into an artifact.
    - Stores a draft checkpoint immediately (so you can resume after crashes).
    - Presents each draft in Nova (queue of cards) with Accept/Reject.
  - Provides cancellation (AbortSignal) and a visible progress indicator (e.g. `3/12 scenes drafted`).
- Context improvements for draft quality (outline-driven writing):
  - For scene drafting, include *scene’s outline intent* (goal/conflict/turn/outcome) in prompt context:
    - Either extend context policy for author scene-draft, or add a small “outline excerpt” object into `AiContext` derived from the existing seven-layer outline store.

### Test Plan
- Unit tests:
  - Agent mode prompt copy no longer claims tools are disabled (simple string assertions).
  - `prose_plus_scene_sidecar` description matches the author sidecar schema fields.
  - New author checkpoint accept applies `content` + `wordCount` to `/api/db/scenes/[id]`.
- Integration-style tests (Vitest + fetch mocks):
  - Chapter drafting runner:
    - generates N scene draft artifacts in order
    - persists checkpoints per scene
    - abort stops mid-run and preserves already-created checkpoints
- Manual QA (happy path):
  - Apply outline → run “Draft chapter” → accept 1 scene → verify editor shows new prose and persisted on refresh.

### Assumptions (Locked for v1)
- Workflow: **Guided pipeline with explicit acceptance** (no silent novel writes).
- Milestone: **Draft from an existing outline** first (worldbuilding→outline is v2).
- Storage: author draft artifacts are persisted in `project_metadata` (no new SQLite tables needed in v1).
