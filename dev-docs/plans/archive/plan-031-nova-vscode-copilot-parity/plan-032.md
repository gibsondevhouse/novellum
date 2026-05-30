# Automated Novel Engine + Worldbuilding Help Disclosure

## Context

The user wants to evolve Novellum from a reactive chat-assistant app into a proactive generation engine:

1. **Automated worldbuilding** — user crafts logline + synopsis, then one-click generates individual entities or entire categories (characters, locations, factions, lore, etc.) without going through chat.
2. **Help disclosure** — explanation surfaces (orientation prose, guide lanes, empty-state notes) are always visible and take up too much space; they should collapse behind a "?" toggle.

This plan also documents the critique of the current agentic workflow so we understand what to build against.

---

## Part 0 — Critique of Current Agentic Workflow

### What's wrong

| Problem | Root cause |
|---|---|
| Everything is reactive — user must know what to ask | No proactive generation, no pipeline entry points |
| Proposals land in chat as text blobs | `ProposalEnvelope` is wired only to the message log, not to entity forms |
| No worldbuilding write tools | Agent tools only read project data + propose outline/scene |
| Write-mode detection is fragile | Regex heuristics in `chat-service.ts` |
| Context is editor-centric | RAG policy built around active scene; worldbuilding-first context doesn't exist |
| No sequence: logline → synopsis → world | No pipeline that treats creation order as a funnel |
| 8-step cap may be too low for category generation | A 5-character batch needs more reasoning budget |

### What we keep

- `ProposalEnvelope` + no-auto-apply constraint → we mirror this for worldbuilding (proposals require explicit user action to persist)
- `WorldbuildCharacterDraft` / `WorldbuildLocationDraft` / `WorldbuildFactionDraft` / `WorldbuildLoreEntryDraft` / `WorldbuildPlotThreadDraft` / `WorldbuildTimelineEventDraft` types in `src/lib/ai/pipeline/worldbuild-agent.ts` → these become the generation contract
- `loadKeyOrRespond()` + `provider.complete()` pattern in `src/routes/api/ai/+server.ts` → replicated in the new generate endpoint
- `extractJsonObject()` in `worldbuild-agent.ts` → reused for response parsing
- `submitCreateCharacter()` / `submitCreateLocation()` etc. in `world-building-crud.svelte.ts` → called on save from the modal; no new persistence logic needed

---

## Part 1 — Worldbuilding Generation Pipeline

### User flow

```
Project created (title + genre + logline + synopsis)
     ↓
Any worldbuilding page (e.g. Characters → Individuals)
     ↓
Clicks "✦ Generate a character"   OR   "✦ Suggest 3"
     ↓
Loading state (spinner in-place)
     ↓
GeneratedEntityModal opens with pre-filled form(s)
  • Single: form ready to review + Save / Discard
  • Batch: draft list with checkboxes + "Save selected" / "Discard all"
     ↓
Save → calls existing submitCreate* → entity persists → modal closes
```

**Key design principle:** generation never touches the DB without an explicit user save action.

---

### Stage 1 — New API Endpoint

**File:** `src/routes/api/worldbuilding/generate/+server.ts`

```
POST /api/worldbuilding/generate
Body: {
  projectId: string,
  entityKind: 'character' | 'faction' | 'lineage' | 'realm' | 'landmark' |
              'lore-entry' | 'plot-thread' | 'timeline-event',
  count: 1 | 3 | 5,
  context?: string     // optional user hint
}
Response: {
  drafts: WorldbuildEntityDraft[],
  entityKind: string,
  projectContext: { title, genre, logline }
}
```

- Uses `loadKeyOrRespond()` pattern from `/api/ai/+server.ts` (lines 85–160) — copy the auth/error shape
- Loads project fields (logline, synopsis, genre) server-side from DB
- Loads first 20 existing entity names for the category to prevent duplicate suggestions
- Calls `provider.complete()` non-streaming with `maxTokens: 4000` (existing `MAX_OUTPUT_TOKENS = 2000` is its own route constant — this endpoint sets its own ceiling)
- Parses response with `extractJsonObject()` from `worldbuild-agent.ts`
- Maps parsed data to the appropriate `WorldbuildXxxDraft` type
- Returns `{ drafts }` or `{ error: { code, message } }`

**System prompt shape (per entityKind):**
> You are a fiction worldbuilding assistant. Given the project below, generate {count} {entityKind}(s) as a JSON array matching the schema.
> Project title: … | Genre: … | Logline: … | Synopsis: …
> Existing {entityKind} names (avoid duplicates): …
> Return ONLY a JSON array. Schema: [provided per entity kind]

**Quality gate:** if `logline` and `synopsis` are both empty, the endpoint returns `{ warning: 'logline_missing', drafts: [...] }` — the modal surfaces a soft warning but still shows the (generic) output.

---

### Stage 2 — Client Service + Draft Store

**File:** `src/modules/world-building/services/worldbuilding-generation-service.ts`

Thin async function:
```typescript
export async function generateWorldbuildingEntities(params: {
  projectId: string;
  entityKind: EntityKind;
  count: 1 | 3 | 5;
  context?: string;
}): Promise<GenerationResult>
```
Calls `/api/worldbuilding/generate`, returns parsed result or throws typed error.

**File:** `src/modules/world-building/stores/generation-draft.svelte.ts`

Module-scoped Svelte 5 runes state machine:

```
type Phase = 'idle' | 'generating' | 'reviewing' | 'error'

let phase: Phase = $state('idle')
let entityKind: EntityKind | null = $state(null)
let drafts: WorldbuildEntityDraft[] = $state([])
let selectedIndexes: Set<number> = $state(new Set([0]))   // for batch checkboxes
let errorMessage: string | null = $state(null)
let abortController: AbortController | null = null   // non-reactive — plain let
```

Exported API: `startGeneration`, `abortGeneration`, `toggleDraftSelect`, `resetGeneration`, and read-only getters (`isGenerating`, `isReviewing`, `activeDrafts`).

`abortController` is intentionally non-reactive (plain `let`) — mirrors `Map<string, StreamController>` in `nova-session.svelte.ts`.

---

### Stage 3 — UI Components

**File:** `src/modules/world-building/components/GenerateButton.svelte`

Props: `{ entityKind: EntityKind; projectId: string; count?: 1|3|5; label?: string }`

Renders as a `GhostButton` size `sm` with `✦` prefix (consistent with existing `new +` label convention). Calls `startGeneration()` on click. Shows inline spinner when `phase === 'generating'`. Disabled while generating.

**File:** `src/modules/world-building/components/GeneratedEntityModal.svelte`

Reads `generation-draft.svelte.ts` store. Positioned overlay — fixed panel over the dossier area (same pattern as `NovaPanel.svelte` overlaying the editor).

Three states:
- **Generating** → loading skeleton + "Generating…" label + Abort button
- **Reviewing (single)** → pre-filled form + "Save" / "Discard" buttons
- **Reviewing (batch)** → draft list with checkboxes + per-draft name preview + "Save selected" / "Discard all" 
- **Error** → message + "Try again"

**Pre-fill mechanism:** `CharacterForm` accepts `character?: Character | null` and initializes state via `untrack(() => character?.name ?? '')` etc. We pass a `Partial<Character>` mapped from the draft — fields not in the draft default to empty. Wrap the form in `{#key selectedDraftIndex}` to force remount when the user navigates drafts in batch mode.

**Type mapping** (draft → existing form component):

| entityKind | Form component | Primary fields overlap |
|---|---|---|
| `character` | `CharacterForm.svelte` | name, role, bio, faction, traits[], goals[], flaws[], notes, tags[] |
| `faction` | `FactionForm.svelte` (or `FactionCoreIdentityPanel`) | name, type, description, mission, ideology |
| `realm` | `RealmForm.svelte` | name, description, tags[] |
| `landmark` | `LandmarkForm.svelte` | name, purpose, emotionalTone |
| `lore-entry` | `LoreEntryForm.svelte` | title, category, content, tags[] |
| `plot-thread` | `PlotThreadForm.svelte` | title, description, status |
| `timeline-event` | `TimelineEventForm.svelte` | title, description, date |

**On save:** call the matching `submitCreate*` function from `world-building-crud.svelte.ts`, then call `resetGeneration()`. Batch save loops through `selectedIndexes` and calls submit for each selected draft.

---

### Stage 4 — Wire into Empty States and Workspace Pages

**Files to modify:**

- `EmptyCharacterState.svelte` — add `projectId?: string` prop; render `GenerateButton entityKind="character"` alongside existing guidance
- `EmptyFactionState.svelte` — add `projectId?: string`; render `GenerateButton entityKind="faction"`
- `EmptyLineageState.svelte` — add `projectId?: string`; render `GenerateButton entityKind="lineage"`
- `RealmEmptyState.svelte` — add `projectId?: string`; render `GenerateButton entityKind="realm"` alongside "Add your first realm"
- `LandmarkEmptyState.svelte` — add `projectId?: string`; render `GenerateButton entityKind="landmark"` only when `hasRealms === true` (preserve existing gate)
- `WorldBuildingWorkspacePage.svelte` — add optional `projectId?: string` prop; render a "✦ Suggest 3" button (count=3) in the section header alongside the existing "new +" button

**Route pages to update** (all already have `data.projectId`):
Pass `projectId` into the above components — representative examples:
- `src/routes/projects/[id]/world-building/characters/individuals/+page.svelte`
- `src/routes/projects/[id]/world-building/locations/realms/+page.svelte`
- `src/routes/projects/[id]/world-building/factions/+page.svelte`
- (and all other worldbuilding section pages)

**Modal mount point:** Mount `GeneratedEntityModal` once inside `WorldBuildingWorkspacePage.svelte` (sibling to section content), not inside each page. The store provides context-free access.

---

### Stage 5 — Barrel Exports

`src/modules/world-building/index.ts` — add:
- `GenerateButton`, `GeneratedEntityModal` (components)
- `startGeneration`, `abortGeneration`, `resetGeneration`, `isGenerating` (store API)

---

## Part 2 — Help Disclosure Pattern

### Goal

All orientation/explanation text in worldbuilding pages is collapsed by default. A `?` button reveals it. Local `$state` — no persistence needed (the text is helpful on first visit; collapsing it every session is acceptable).

### Files to modify

**`src/modules/world-building/components/WorldBuildingTopSectionLanding.svelte`**

In `<script>`: add `let showOrientation = $state(false);`

In template: wrap the `.manifesto` / orientation block:
- Add a `.manifesto-toggle` header row: section title + `GhostButton` size `icon-sm`, `aria-label="Toggle orientation guide"`, `aria-expanded={showOrientation}`
- `{#if showOrientation}` wraps the `orientationTitle` + `orientation` prose block

**`src/routes/projects/[id]/world-building/+page.svelte`** (main landing)

In `<script>`: add `let expandedSection = $state<string | null>(null);`

Per domain section: the `.lane-grammar` grid (core questions, failure modes, completion signals) and `.lane-glossary` are hidden by default. Replace the static "Read Guide" jump link with a toggle button. The `.lane-meaning` paragraph stays always visible (one sentence — low noise).

**`src/modules/world-building/components/NarrativeLocationEmptyState.svelte`**

In `<script>`: add `let showNote = $state(false);`

When `note` prop is provided: render a `?` icon button; conditionally show note text. Existing `.narrative-location-empty__note` styling applies when visible.

**Pattern for all three:**
```svelte
<button
  type="button"
  class="help-toggle"
  aria-expanded={showHelp}
  aria-label="Show guidance"
  onclick={() => showHelp = !showHelp}
>?</button>
{#if showHelp}
  <div class="help-content"><!-- orientation prose --></div>
{/if}
```
`help-toggle` styled as `GhostButton` size `icon-sm` semantics using existing tokens (no new CSS component needed).

---

## Verification

```bash
pnpm check        # svelte-check + tsc — zero errors
pnpm lint         # eslint — zero violations
pnpm test         # 1359+ tests passing
pnpm check:tokens # zero token violations
```

**Manual checks:**
1. Open a project with logline + synopsis → navigate to Characters → click "✦ Generate a character" → spinner appears → modal opens with pre-filled name/bio/traits → click Save → character appears in list
2. Click "✦ Suggest 3" in section header → modal shows 3 drafts with checkboxes → select 2 → "Save selected" → 2 new characters added
3. On `RealmEmptyState` → generate button only appears when `hasRealms` gate passes (i.e., this tests landmark gate)
4. Navigate to `/world-building/` → orientation lane content NOT visible → click `?` on a domain → guide prose appears → click again → collapses
5. Navigate to Characters section landing → orientation block collapsed by default → `?` button reveals it
6. Project with no logline/synopsis → generate → soft warning in modal header but still shows generic output
7. Click generate → click Abort mid-flight → `phase` returns to `idle`, no modal shown

---

## Key Reused Infrastructure

| Need | Existing file |
|---|---|
| Auth + AI proxy | `src/routes/api/ai/+server.ts` → `loadKeyOrRespond()`, `provider.complete()` |
| Draft type contracts | `src/lib/ai/pipeline/worldbuild-agent.ts` → `WorldbuildCharacterDraft` etc. |
| JSON parsing | `src/lib/ai/pipeline/worldbuild-agent.ts` → `extractJsonObject()` |
| Entity persistence | `src/modules/world-building/stores/world-building-crud.svelte.ts` → `submitCreate*` |
| Form components | `CharacterForm`, `FactionForm`, `RealmForm`, `LandmarkForm`, `LoreEntryForm`, `PlotThreadForm`, `TimelineEventForm` |
| Button primitives | `GhostButton` from `src/lib/components/ui/` |
