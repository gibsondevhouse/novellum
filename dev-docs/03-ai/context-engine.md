# Context Engine

> Last verified: 2026-06-28 (plan-057 context override API)

The Context Engine selects the **minimum viable context** for an AI task. Hallucination reduction at Novellum is mostly a context-discipline problem, not a prompt-tuning problem.

## Files

| File                                                                                       | Purpose                                                                                                      |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| [context-engine.ts](../../src/lib/ai/context-engine.ts)                                    | Defines scoping policies.                                                                                    |
| [context-builder.ts](../../src/lib/ai/context-builder.ts)                                  | Legacy scene context helper retained for older consumers.                                                    |
| [context-files.ts](../../src/lib/ai/context-files.ts)                                      | Optional file-based context (e.g., user-supplied notes).                                                     |
| [nova/context.ts](../../src/lib/server/nova/context.ts)                                    | Materializes Nova session context from attached projects/files and client context controls.                  |
| [nova/context-renderers.ts](../../src/lib/server/nova/context-renderers.ts)                | Deterministically renders project graphs, pinned entities, attached files, and truncation metadata.          |
| [outline-context-sufficiency.ts](../../src/lib/ai/pipeline/outline-context-sufficiency.ts) | Pure gate for deciding whether project/worldbuilding context is strong enough to request outline generation. |
| [serializer.ts](../../src/lib/ai/serializer.ts)                                            | JSON serialization with deterministic key ordering.                                                          |

## Scoping policies

Policies are picked per TaskType. Examples (canonical names live in [context-engine.ts](../../src/lib/ai/context-engine.ts)):

- **`scene_only`** — just the active scene.
- **`scene_plus_adjacent`** — active scene + previous and next scene in the same chapter.
- **`continuity_scope`** — scene + referenced characters + referenced locations + relevant lore entries + pertinent timeline events.
- **`chapter_only`** — full chapter, no inter-chapter context.
- **`character_card`** — full character record + relationships, no scene text.

A policy is a deterministic function: same project state + same scope identifier ⇒ same context payload.

## Hard rules

1. **Never the full manuscript.** Even for global tasks, prefer summary frames over raw text.
2. **Deterministic serialization.** Keys are sorted; arrays are sorted by stable IDs. Two runs over identical state must produce byte-identical context.
3. **Strip transient state.** Editor selection, undo stacks, and UI state never leak into context.
4. **Explicit "missing" markers.** A null relationship is rendered explicitly so the model knows the absence is intentional.

## Nova Project-Baseline Fallback (plan-030)

For Nova sidepanel requests, if `projectId` is present and there is no active scene,
the context contract still includes a compact project baseline before optional scene/outline scopes.

Required baseline fields:

- project title
- genre
- status
- project type
- target word count
- logline
- synopsis
- style preset id
- updated timestamp
- entity counts
- first story-frame summary (when available)

This preserves grounding for "what is this novel about?" class prompts without widening
to full-manuscript context.

## Route Context Contract (plan-048)

Frontend route context is derived by
[`deriveRouteContext`](../../src/lib/navigation-state.ts). The helper is pure
and shared by the active-context store, active-project store, and Nova panel.

The contract distinguishes:

- global routes such as `/`, `/projects`, `/settings`, `/nova`, `/images`, and
  `/styles`;
- project-scoped routes under `/projects/<id>`;
- editor scene routes under `/projects/<id>/editor/<sceneId>`;
- outline, world-building, export, continuity, and hierarchy routes.

Stale `page.params.id` values are ignored when the current path is not a
project route. This prevents global pages from accidentally inheriting a prior
project context.

Nova uses the same route contract to classify its visible surface:

- `global` when opened from the standalone Nova route;
- `project` when a project exists but no narrower workflow is active;
- `editor`, `outline`, `worldbuilding`, `export`, or `continuity` on those
  project surfaces.

This keeps context disclosure and review-gated generation prompts aligned with
the workspace the author is actually viewing.

## Nova Manual Context Overrides (plan-057)

`POST /api/nova/context` accepts optional `pinnedEntityIds` and `excludedEntityIds`
arrays alongside `projectIds`, `files`, `mode`, `requestedScopes`, and `entityHints`.

Manual override rules:

- Empty strings are ignored and duplicate ids are deduped by the server builder.
- Invalid override shapes are rejected with `400`.
- `excludedEntityIds` wins over `pinnedEntityIds` when the same id appears in both arrays.
- Excluded ids are removed from supported project graph rows and structured id references
  before context rendering.
- Pinned entities are surfaced in a dedicated `# Pinned Context` block before the implicit
  project context and are also reported as `includedItems` with `kind: "entity"` and
  `inclusion: "pinned"`.
- Non-existent pinned ids are dropped silently so stale client state cannot break context
  assembly.

This first pass supports explicit pinning for the entity classes currently needed by the
context control panel foundation: characters, locations, lore entries, plot threads, timeline
events, scenes, and chapters. It does not change RAG/vector ranking; it only applies
deterministic include/exclude overrides at the request context materialization layer.

The Nova sidebar persists manual overrides per active scene through the project metadata store:

- Scope: `scene`
- Owner id: active scene id
- Key: `nova-context-overrides.v1`
- Value: `{ pinnedEntityIds: string[], excludedEntityIds: string[] }`

The context-control store reloads this value when the active scene route changes. Nova chat applies
exclusions to the structured prompt context and adds registered pinned entity summaries to the
system prompt under `# User Context Overrides`.

## Outline Generation Sufficiency (plan-040)

Outline generation is blocked before prompt construction unless
`evaluateOutlineContextSufficiency()` returns `ok: true`.

Required context bands:

- `project_identity` — the current project has an id and title.
- `primary_story_premise` — one usable premise source exists: project premise, logline, story-frame premise, accepted worldbuild premise checkpoint, or synopsis.
- `character_or_plot_thread` — at least one character or plot thread exists as a canonical row or accepted worldbuild checkpoint.

Enriching bands are counted but not required for readiness: locations, factions, lore entries, timeline events, and themes. They can improve prompt grounding in the context packet phase, but their absence must not block generation by itself.

The gate returns UI-safe missing codes:

- `project_identity_missing`
- `story_premise_missing`
- `story_source_missing`

Malformed legacy JSON sources are ignored with a `malformed_legacy_json` warning that does not include the raw payload. Long synopsis text is represented by a deterministic summary plus hash/length metadata instead of requiring the full text to be echoed by callers.

## Worldbuilding Proposal Context Discipline

Worldbuilding scan proposals remain review artifacts until accepted. Prompt
context should prefer accepted canon rows and accepted worldbuild checkpoints
over pending proposal payloads. When pending proposals are surfaced for review,
use compact proposal metadata: source context hashes, field-level `canonDiff`
summaries, duplicate evidence labels/scores, and lifecycle state.

Accepted/rejected proposal audit metadata is also compact by design. It records
projection mode, decision, target identifiers, changed field names, link
targets, duplicate/evidence counts, and rejection reason where applicable. Do
not use audit records as a substitute for full canon retrieval, and do not feed
raw model output or full before/after entity snapshots back into prompts unless
a future task explicitly scopes that behavior.

## Adding a new policy

1. Add the policy name to the policy enum/union in [context-engine.ts](../../src/lib/ai/context-engine.ts).
2. Implement the resolver in [context-builder.ts](../../src/lib/ai/context-builder.ts).
3. Wire it from the TaskType in [task-resolver.ts](../../src/lib/ai/task-resolver.ts).
4. Add a test under [tests/ai/](../../tests/ai/) that asserts the produced shape against a fixture.
5. Document it here.

## See also

- [pipeline.md](./pipeline.md)
- [prompt-system.md](./prompt-system.md)
