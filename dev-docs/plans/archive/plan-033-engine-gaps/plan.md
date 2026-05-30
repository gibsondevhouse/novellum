# Plan 033 — What's Actually Missing

This is not a feature wishlist. These are gaps discovered by reading the real code — things
that are either broken today or that make the "automated novel engine" promise hollow.

---

## Broken today (will fail on first real use)

### 1. Landmark saves are hardblocked by the locations API

The generated landmark schema is `{name, description, tags}`. The `/api/db/locations` POST
runs `validateLocation()` which returns HTTP 400 with "realmId is required for landmarks" if
`realmId` is absent. The modal never sends `realmId`. Every user who generates a landmark and
clicks Save sees an error.

The fix requires a realm-picker step in the modal before saving a landmark, or a fallback that
saves with no realmId and lets the user assign it in the dossier. Neither is implemented.

### 2. Realm saves are structurally broken too

Same route, same validator: "realmType is required for realms." The generation schema has no
`realmType` field. Generated realms either fail or save with an empty realmType, which breaks
the realm-type filters everywhere in the locations section.

The fix requires either: (a) adding `realmType` to the generation schema and AI prompt, or
(b) defaulting it to something sensible like `"fantasy"` and letting the user correct it.

---

## Nova is completely blind to your worldbuilding

This is the largest architectural gap between what you're trying to build and what exists.

### 3. Ask mode has no worldbuilding context — anywhere

Nova's `ask` task uses the `scene_plus_adjacent` context policy. In `context-engine.ts` that
policy returns the active scene's beats + the characters assigned specifically to that scene +
adjacent scenes. It does not load loreEntries, factions, plot threads, or timeline events.

On worldbuilding pages specifically: `activeSceneId` comes from `?sceneId=` in the URL. That
parameter is never present on any worldbuilding route, so Nova receives `emptyContext()` — it
literally knows nothing about your project when you're in the worldbuilding section. You can
type "tell me about my main factions" and Nova will respond based on zero information.

The only context policy that loads full worldbuilding data is `continuity_scope`, which also
loads every scene in the project and is designed for continuity checking.

**What this means in practice:** A user builds 5 characters, 3 factions, 10 lore entries via
the generation engine, then opens Nova to write the first scene. Nova has never seen any of it.

### 4. Even in the editor, Nova doesn't know your factions or lore

The `ask` context policy's `scene_plus_adjacent` case in context-engine explicitly sets
`loreEntries: []`, `factions: []`, `plotThreads: []`. These are hardcoded empty arrays — they
are never loaded by this policy. So even in a scene where you have characters from a specific
faction, Nova cannot tell you what that faction believes or wants.

The `continuity_scope` policy loads all of these, but it's only invoked for continuity checks,
not for Ask mode.

**What's missing:** A `worldbuilding_scope` context policy that loads characters + factions +
loreEntries + plotThreads + timeline events without loading all scene text, and Nova's Ask mode
on worldbuilding pages should use this policy instead of `scene_plus_adjacent`.

---

## Generated output quality degrades as your project grows

### 5. Generation only passes existing names, not what those entities do

`loadExistingNames()` in the generate endpoint sends a comma-separated name list to the AI:
"Existing character names (avoid exact duplicates): Kira, Marcus, Sasha."

The AI knows to not reuse those names, but it doesn't know Kira is the protagonist, Marcus is
the mentor, and Sasha is the antagonist. If you generate a 4th character, the AI might produce
another protagonist-archetype because it doesn't know your cast already has one.

The fix is to pass the first 5-10 existing entities' core fields (name + role + faction for
characters; name + type for factions) not just names.

### 6. Lineage generates characters, not lineages

The lineage page passes `entityKind="character"` to the generate button. The AI receives a
prompt asking it to generate a "character" with name/role/bio/faction/traits. It has no
concept that you want a bloodline, dynasty, or inherited tradition. The "lineage" EntityKind
doesn't exist in the type system.

---

## The engine loop is incomplete

### 7. There is no worldbuilding → outline path

You've built worldbuilding generation. The outline pipeline (vibe-author) exists. There is
no connection between them. After generating a full cast and 3 factions and 5 plot threads,
there is no button that says "now suggest an outline using my worldbuilding." The user has to
navigate to the outline view and manually prompt Nova (who, per gaps 3 and 4, still can't
see any of the worldbuilding).

### 8. There is no prose generation path from worldbuilding

The "automated novel engine" as described means: logline → synopsis → world → outline → draft.
Everything up to "world" now has some tooling. Outline → draft is where Nova writes scenes.
But Nova writing scenes requires the user to open the editor, navigate to a scene, and prompt
Nova — and Nova still doesn't know the worldbuilding. The loop never closes.

This is the biggest promise-to-delivery gap. The generation engine fills your worldbuilding
database. It doesn't write your novel.

---

## Project setup is a silent failure mode

### 9. Logline and synopsis are not surfaced before generation

The `logline_missing` warning appears in the modal after generation runs. The soft copy says
"Add them in project settings for better results." This is backwards — the user already got
generic output and may have already saved it.

There's no friction between "new project" and "click generate" that says "your generation
quality depends on your logline and synopsis — fill those first." The project creation card
accepts title + genre as minimum, which is enough to get past the gate.

---

## What is actually working and worth keeping

- The generation endpoint is solid: correct provider handling, mock mode, prompt shape, JSON
  array parsing, name-deduplication, logline/synopsis injection.
- The review modal works for characters, factions, lore entries, plot threads, and timeline
  events (all of which have valid API routes with no missing required fields).
- The generation state machine (SvelteSet, abort, phases) is clean.
- The help-disclosure toggles are done.
- Nova's bounded agentic mode (MAX_AGENT_STEPS=8), Ask/Write modes, and attachment system
  are solid infrastructure that just needs the right context fed into it.

---

## Priority order

**Fix first (broken today):**
1. Landmark save: add realm-picker step in modal before saving a landmark draft
2. Realm save: add `realmType` to the generation schema and default it to the project genre

**Fix next (makes Nova useful):**
3. Add a `worldbuilding_scope` context policy that loads characters, factions, lore entries,
   plot threads without loading scene text
4. Use that policy when Nova runs on worldbuilding routes (no active sceneId) and as the
   basis for Ask mode when the user hasn't opened a scene yet

**Fix after that (makes generation quality scale):**
5. Pass existing entity summaries (not just names) to the generation prompt — first 10 entities,
   name + key fields
6. Add `lineage` as a proper EntityKind with its own schema and prompt

**Close the loop (makes this an engine, not a form-filler):**
7. Wire worldbuilding context into the vibe-author pipeline so outline generation can say
   "based on your 5 characters and 3 plot threads, here's a suggested 3-act structure"
8. Add a "Start writing" entry point from worldbuilding that prefills a scene with the relevant
   characters and opens Nova in Write mode with worldbuilding context loaded

---

## Detailed Technical Blueprint

Based on a codebase audit, these are the concrete implementation steps required to bridge the gaps identified above.

### Stage 1: Fix Validation and Schema Gaps (Gaps 1, 2)
**Goal**: Ensure generated realms and landmarks can be successfully saved to the database.

- **`src/routes/api/db/locations/+server.ts`**
  Modify `validateLocation`:
  - Relax `realmId` requirement for landmarks (allow null/empty) so they can be generated independently and assigned later via the dossier UI.
  - Relax `realmType` for realms or provide a default like `'unspecified'`.
- **`src/routes/api/worldbuilding/generate/+server.ts`**
  - Update `ENTITY_SCHEMA` for realms to include `realmType: "string"`.
  - Update `ENTITY_SCHEMA` for landmarks to include `realmId: "string | null"`.

### Stage 2: Hydrate Worldbuilding Context into Nova (Gaps 3, 4)
**Goal**: Allow Nova to see factions, lore, characters, and threads regardless of what page the user is on.

- **`src/lib/ai/types.ts`**
  - Add `'worldbuilding_scope'` to the `ContextPolicy` type.
- **`src/lib/ai/context-engine.ts`**
  - Implement `worldbuilding_scope` in `buildContext()`: load `project`, `characters`, `factions`, `loreEntries`, `plotThreads`, `locations`, and `timelineEvents`.
- **`src/lib/ai/task-resolver.ts`**
  - Update the `ask` task's context policy. Either default it to `worldbuilding_scope` universally, or implement a dynamic check in `resolveTask` based on `uiCtx` to use `worldbuilding_scope` when outside the editor, and `scene_plus_adjacent` when inside.

### Stage 3: Enhance Generation Prompts & Types (Gaps 5, 6, 9)
**Goal**: Make generation output smarter, aware of existing lore, and handle lineages correctly.

- **`src/routes/api/worldbuilding/generate/+server.ts`**
  - Revamp `loadExistingNames()`: Instead of fetching just names, select `name`, `role`, `factionId` (for characters) and aggregate them into a summary string.
  - Implement `Lineage` schema in `ENTITY_SCHEMA` and branch the logic so lineage generations don't fall back to `character`.
- **`src/modules/project/components/CreateProjectForm.svelte`**
  - Make `logline` and `synopsis` required fields to ensure high-quality contextual output across the pipeline from day one. (Currently, the modal shows a context warning, but it's too late).

### Stage 4: Close the Authoring Loop (Gaps 7, 8)
**Goal**: Connect the Worldbuilding tools to the Outline and Draft generation.

- **`src/modules/nova/services/author-pipeline-runner.ts`**
  - Update `vibe-author.outline` policy to load worldbuilding context explicitly. Currently, it uses `outline_scope` which ignores `characters` and `loreEntries`. Change this so the outline generator sees the complete cast and world state.
- **`src/modules/outline/components` & `src/modules/world-building/components`**
  - Add explicit UX actions (e.g. "Draft Scene with Nova") that pre-fills a prompt for Nova using `worldbuilding_scope` so Nova writes the prose incorporating chosen world entities.

### Stage 5: Guardrails and Token Safety
**Goal**: Guarantee `worldbuilding_scope` performs well without overflowing the model context windows.

- **`src/lib/ai/context-engine.ts`**
  - Implement token-budgeting or hard limiters in the `worldbuilding_scope` query (e.g., pulling only the first N major factions or limiting the payload to strict subsets of bio/description). The current `scene_plus_adjacent` pulls full scene prose, which eats tokens. `worldbuilding_scope` should pull many entities but *exclude* scene prose entirely to stay within standard 4k/8k context windows for fast responses.
- **`src/modules/outline/components`**
  - Make sure the UI gracefully handles errors if the pipeline throws during outline generation (expanding test coverage to catch new `AuthorPipelineRunResult` failure modes).
