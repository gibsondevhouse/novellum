# Context Engine

> Last verified: 2026-06-03 (plan-040 stage-002 context sufficiency gate)

The Context Engine selects the **minimum viable context** for an AI task. Hallucination reduction at Novellum is mostly a context-discipline problem, not a prompt-tuning problem.

## Files

| File | Purpose |
| --- | --- |
| [context-engine.ts](../../src/lib/ai/context-engine.ts) | Defines scoping policies. |
| [context-builder.ts](../../src/lib/ai/context-builder.ts) | Materializes a context payload from a policy + project state. |
| [context-files.ts](../../src/lib/ai/context-files.ts) | Optional file-based context (e.g., user-supplied notes). |
| [outline-context-sufficiency.ts](../../src/lib/ai/pipeline/outline-context-sufficiency.ts) | Pure gate for deciding whether project/worldbuilding context is strong enough to request outline generation. |
| [serializer.ts](../../src/lib/ai/serializer.ts) | JSON serialization with deterministic key ordering. |

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

## Adding a new policy

1. Add the policy name to the policy enum/union in [context-engine.ts](../../src/lib/ai/context-engine.ts).
2. Implement the resolver in [context-builder.ts](../../src/lib/ai/context-builder.ts).
3. Wire it from the TaskType in [task-resolver.ts](../../src/lib/ai/task-resolver.ts).
4. Add a test under [tests/ai/](../../tests/ai/) that asserts the produced shape against a fixture.
5. Document it here.

## See also

- [pipeline.md](./pipeline.md)
- [prompt-system.md](./prompt-system.md)
