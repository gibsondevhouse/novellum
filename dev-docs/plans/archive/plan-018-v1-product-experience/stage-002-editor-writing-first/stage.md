---
title: Editor Writing-First Refactor
slug: stage-002-editor-writing-first
stage_number: 2
status: complete
owner: Architect Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-shell-extraction
  - phase-002-editor-modes-and-focus
  - phase-003-side-panel-components
  - phase-004-scene-metadata-service
estimated_duration: 7d
risk_level: high
---

## Goal

Decompose the editor route from its current 1174-line monolith into a composition of named components. The three-column layout (scene navigator, manuscript, story compass) becomes `EditorShell`. Three distinct editor modes (Writing, Planning, Revision) and a focus mode toggle give authors explicit control over UI density. Scene clarity and quick-intent data migrate fully from localStorage to SQLite.

> **Absorbs.** plan-016 stage-006 phases `editor-calm-down` and `editor-tools-and-modes` transferred here on 2026-04-28.

## Context (already in tree — do not duplicate)

**What plan-023 already delivered — do not re-implement:**

- **Word-processor geometry** — `--editor-page-*` tokens in `src/styles/tokens.css`; `ManuscriptEditorPane.svelte` renders as a fixed-width card with real margins (`src/modules/editor/components/ManuscriptEditorPane.svelte`).
- **Editor toolbar** — `src/lib/components/ui/PillToolbar.svelte` primitive; `src/modules/editor/components/EditorToolbar.svelte` consuming it, with bold/italic/heading/lists/spellcheck/view-in-reader/Nova toggle. Mounted in the editor route as `<EditorToolbar>`.
- **Nova right panel** — `src/modules/nova/components/NovaPanel.svelte`; `novaPanel` store (open/close/toggle); `novaSession` store (messages, streaming); `sendNovaChat` service with RAG context. All wired into the editor route. Nova is a right-column `<aside>` that the toolbar toggles.
- **View-in-reader handoff** — `handleViewInReader()` in the route navigates to `/books/{id}?scene={sceneId}`.
- **Preference consumption** — editor pane reads `--editor-font-size` / `--editor-line-height` from the `appearance` store (plan-023 stage-007). Route calls `void appearance.hydrate()` on `onMount`.
- **Existing components in `src/modules/editor/components/`**: `SaveStatus.svelte`, `SnapshotHistoryPanel.svelte`, `SnapshotPreviewModal.svelte`, `RecoveryPrompt.svelte`, `SceneEditorFrame.svelte`, `EditModeToolbar.svelte` (plan-017 work — do not modify autosave or snapshot semantics).

**What this stage adds (the gap):**

- `EditorShell.svelte` — extracts the three-column layout from the route.
- `SceneNavigator.svelte`, `SceneContextPanel.svelte`, `SceneCompassPanel.svelte` — extract the three inline asides currently coded directly in the route's template.
- `EditorModeToggle.svelte`, `FocusModeToggle.svelte` — new UI controls.
- `editor-preferences.svelte.ts` — persists editor mode + focus state per project via the preferences service.
- `scene-metadata-service.ts` — replaces the inline localStorage `loadSceneDefinition` / `loadQuickIntent` / `persistQuickIntent` functions with a SQLite-backed service that uses the existing `getProjectMetadata` / `setProjectMetadata` API.
- Route slimming: `src/routes/projects/[id]/editor/+page.svelte` reduces from 1174 lines to ~80 lines (data load + `<EditorShell>` mount).

**Key existing APIs (already available — no new infrastructure needed):**

- `getProjectMetadata<T>(pid, entityType, entityId, key, defaultValue)` — `src/lib/project-metadata.ts` — reads from SQLite via `/api/db/project-metadata`.
- `setProjectMetadata<T>(pid, entityType, entityId, key, value)` — same module.
- `editorState.activeSceneId` / `editorState.setActiveSceneId` — `src/modules/editor/stores/editor.svelte.ts`.
- `autosaveService.mount`, `flushNow`, `schedule`, `unmount` — `src/modules/editor/services/autosave-service.ts`.

## Entry Criteria

- `src/modules/editor/components/SaveStatus.svelte`, `SnapshotHistoryPanel.svelte`, `SnapshotPreviewModal.svelte` exist in tree (already true — plan-017 delivered these).
- `src/lib/project-metadata.ts` exports `getProjectMetadata` and `setProjectMetadata` (already true — used in current editor route).
- `pnpm run check` and `pnpm run lint` pass on the current tree.

## Exit Criteria

- `src/routes/projects/[id]/editor/+page.svelte` contains only: data `$props` destructure, `onMount` (appearance hydrate only), and a single `<EditorShell>` mount passing all data as props. No signal derivation, no localStorage access, no AI logic, no inline HTML structure.
- New components ship (Svelte 5 Runes, `$state`/`$derived`/`$effect` only — no legacy `let` reactivity):
  - `src/modules/editor/components/EditorShell.svelte` — three-column layout owner.
  - `src/modules/editor/components/SceneNavigator.svelte` — left `<aside>` with scene list, chapter grouping, active-scene highlighting.
  - `src/modules/editor/components/SceneContextPanel.svelte` — participants, POV select, location input, chapter/arc context.
  - `src/modules/editor/components/SceneCompassPanel.svelte` — scene compass rows, live signals, progress flags, quick-intent form.
  - `src/modules/editor/components/EditorModeToggle.svelte` — three-segment control (Writing / Planning / Revision); updates `editorPreferences.mode`.
  - `src/modules/editor/components/FocusModeToggle.svelte` — single toggle; updates `editorPreferences.focusMode`.
- `src/modules/editor/stores/editor-preferences.svelte.ts` — `$state` store with `mode: 'writing' | 'planning' | 'revision'` and `focusMode: boolean`, per-project persistence via `getPreference`/`setPreference` (key pattern `editor.preferences.{projectId}`), `hydrate(projectId)` async method.
- `src/modules/editor/services/scene-metadata-service.ts` — exports `loadSceneClarity(projectId, sceneId)`, `saveSceneClarity(projectId, sceneId, data)`, `loadQuickIntent(projectId, sceneId)`, `saveQuickIntent(projectId, sceneId, data)` — all backed by `getProjectMetadata`/`setProjectMetadata`. No `localStorage` access in this service.
- Editor mode behavior in `EditorShell`:
  - **Writing:** `SceneCompassPanel` and `SceneContextPanel` hidden; `SceneNavigator` visible; Nova panel togglable.
  - **Planning:** `SceneContextPanel` + `SceneCompassPanel` visible; `SceneNavigator` visible.
  - **Revision:** `SnapshotHistoryPanel` visible in right column; Nova togglable.
- Focus mode: when `focusMode === true`, `SceneNavigator` and both right panels collapse (CSS class toggle, no DOM removal); `EditorModeToggle` and `FocusModeToggle` remain in the toolbar row.
- Tests pass:
  - `tests/editor/editor-mode.test.ts` — mode toggle updates preference store; shell renders correct panels per mode.
  - `tests/editor/scene-metadata-service.test.ts` — `loadSceneClarity` returns default on miss; `saveSceneClarity` calls `setProjectMetadata` with correct args; round-trip through the service produces original data.
- Autosave/snapshot semantics unchanged — all plan-017 stage-007 tests still pass.
- `pnpm run check` clean; `pnpm run lint` clean (boundaries: `module-editor` is the owner; no new leakage).

## Phases

### Phase-001 — Shell extraction

**Goal:** Extract the three-column layout from the route into `EditorShell.svelte`. Route becomes a thin data-pass-through. No behavior changes — this is a pure structural refactor.

**Files:**

- `src/modules/editor/components/EditorShell.svelte` — new file; receives all current route state as props.
- `src/routes/projects/[id]/editor/+page.svelte` — gutted to shell.
- `src/modules/editor/index.ts` — export `EditorShell`.

**Implementation:**

`EditorShell.svelte` interface:

```ts
interface Props {
  scenes: Scene[];
  project: Project;
  chapters: Chapter[];
  characters: Character[];
}
```

Move all of the following from the route into `EditorShell`:
- All `$state` declarations (`activeContent`, `currentSceneId`, `sceneDefinition`, `quickIntent`, `locationTag`, `storyCompassCollapsed`, `initialTotalWords`, `initializedBaseline`, `tipTapEditor`, `editorTick`, `spellcheckEnabled`).
- All `$derived` computations (word counts, signal derivations, sceneCompassRows, liveSignals, etc.).
- All `$effect` blocks (scene activation, autosave wiring, baseline init).
- All handler functions (`handleManuscriptChange`, `handleAskAi`, `handleViewInReader`, `goToScene`, `persistQuickIntent`, etc.).
- The entire template HTML (three-column layout, toolbar, footer).

Route `+page.svelte` after extraction:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorShell } from '$modules/editor';
  import { appearance } from '$lib/stores/appearance.svelte.js';
  import type { Chapter, Character, Project, Scene } from '$lib/db/domain-types';

  let { data } = $props<{
    data: { scenes: Scene[]; project: Project; chapters: Chapter[]; characters: Character[] };
  }>();

  onMount(() => { void appearance.hydrate(); });
</script>

<svelte:head><title>Editor — Novellum</title></svelte:head>

<EditorShell
  scenes={data.scenes}
  project={data.project}
  chapters={data.chapters}
  characters={data.characters}
/>
```

**Acceptance checklist:**

- [ ] Route `+page.svelte` is ≤ 25 lines after extraction.
- [ ] `EditorShell.svelte` renders the same three-column layout as before.
- [ ] All existing editor behaviors work: scene switching, autosave, Nova toggle, view-in-reader.
- [ ] `pnpm run check` clean; `pnpm run lint` clean.
- [ ] Manual smoke: open editor, write text, switch scenes, open Nova — no regressions.

---

### Phase-002 — Editor modes and focus

**Goal:** Add `EditorModeToggle` and `FocusModeToggle` controls, backed by a persistent `editor-preferences.svelte.ts` store. Wire mode state into `EditorShell` to conditionally show/hide panels.

**Files:**

- `src/modules/editor/stores/editor-preferences.svelte.ts` — new file.
- `src/modules/editor/components/EditorModeToggle.svelte` — new file.
- `src/modules/editor/components/FocusModeToggle.svelte` — new file.
- `src/modules/editor/components/EditorShell.svelte` — add mode/focus state wiring.
- `src/modules/editor/index.ts` — export new components and store.
- `tests/editor/editor-mode.test.ts` — new test file.

**Implementation:**

`editor-preferences.svelte.ts`:

```ts
import { getPreference, setPreference } from '$lib/preferences.js';

export type EditorMode = 'writing' | 'planning' | 'revision';

function createEditorPreferences() {
  let mode = $state<EditorMode>('writing');
  let focusMode = $state(false);
  let currentProjectId = $state<string | null>(null);

  async function hydrate(projectId: string) {
    currentProjectId = projectId;
    const saved = await getPreference<{ mode: EditorMode; focusMode: boolean }>(
      `editor.preferences.${projectId}`
    );
    if (saved) {
      mode = saved.mode ?? 'writing';
      focusMode = saved.focusMode ?? false;
    }
  }

  function setMode(next: EditorMode) {
    mode = next;
    if (currentProjectId) {
      void setPreference(`editor.preferences.${currentProjectId}`, { mode, focusMode });
    }
  }

  function toggleFocus() {
    focusMode = !focusMode;
    if (currentProjectId) {
      void setPreference(`editor.preferences.${currentProjectId}`, { mode, focusMode });
    }
  }

  return { get mode() { return mode; }, get focusMode() { return focusMode; }, hydrate, setMode, toggleFocus };
}

export const editorPreferences = createEditorPreferences();
```

`EditorModeToggle.svelte` — three-segment pill control with buttons for Writing / Planning / Revision. Reads `editorPreferences.mode`, calls `editorPreferences.setMode(next)` on click. No props needed (reads directly from store). Uses design tokens only; no bespoke colors.

`FocusModeToggle.svelte` — single toggle button (icon or text "Focus"). Reads `editorPreferences.focusMode`, calls `editorPreferences.toggleFocus()` on click. `aria-pressed` bound to current value.

In `EditorShell.svelte`:
- Import `editorPreferences` and call `void editorPreferences.hydrate(project.id)` in `onMount`.
- Add `EditorModeToggle` and `FocusModeToggle` to the toolbar row (after `EditorToolbar`).
- Conditionally show/hide panels:
  - `SceneCompassPanel`: visible when `editorPreferences.mode !== 'writing' && !editorPreferences.focusMode`.
  - `SceneContextPanel` participants section: visible when `editorPreferences.mode === 'planning' && !editorPreferences.focusMode`.
  - `SnapshotHistoryPanel`: visible when `editorPreferences.mode === 'revision' && !editorPreferences.focusMode`.
  - `SceneNavigator`: hidden when `editorPreferences.focusMode === true` (add CSS `visibility: hidden; width: 0` toggle — no DOM removal).

`tests/editor/editor-mode.test.ts` — vi.mock the preferences client. Tests: `setMode('planning')` updates store; `toggleFocus` flips flag; `hydrate` restores saved values; Writing mode hides compass; Planning mode shows compass; focus mode hides navigator.

**Acceptance checklist:**

- [ ] `editorPreferences.mode` persists across simulated navigation (hydrate → setMode → re-hydrate returns same value).
- [ ] Writing mode: `SceneCompassPanel` and `SceneContextPanel` hidden.
- [ ] Planning mode: both context panels visible.
- [ ] Revision mode: `SnapshotHistoryPanel` visible.
- [ ] Focus mode: `SceneNavigator` hidden; toolbar still accessible.
- [ ] `EditorModeToggle` has `aria-pressed` correctly set for the active segment.
- [ ] `FocusModeToggle` has `aria-pressed` bound.
- [ ] All `tests/editor/editor-mode.test.ts` tests pass.
- [ ] `pnpm run check` clean; `pnpm run lint` clean.

---

### Phase-003 — Side panel components

**Goal:** Extract the three inline asides currently coded in `EditorShell` into standalone Svelte components: `SceneNavigator`, `SceneContextPanel`, and `SceneCompassPanel`.

**Files:**

- `src/modules/editor/components/SceneNavigator.svelte` — new file.
- `src/modules/editor/components/SceneContextPanel.svelte` — new file.
- `src/modules/editor/components/SceneCompassPanel.svelte` — new file.
- `src/modules/editor/components/EditorShell.svelte` — replace inline asides with the new components.
- `src/modules/editor/index.ts` — export new components.

**Implementation:**

`SceneNavigator.svelte` props:

```ts
interface Props {
  scenes: Scene[];
  chapters: Chapter[];
  activeSceneId: string | null;
  activeContent: string; // for live word count of active scene
  onSelectScene: (sceneId: string) => void;
}
```

Renders the `<aside class="doc-list">` currently in `EditorShell`. Receives `activeSceneId` and `activeContent` to compute the live word count for the active scene. Calls `onSelectScene` on button click. No internal state beyond what can be derived from props.

`SceneContextPanel.svelte` props:

```ts
interface Props {
  scene: Scene | null;
  characters: Character[];
  locationTag: string;
  onPovChange: (characterId: string) => void;
  onLocationChange: (tag: string) => void;
  onLocationBlur: () => void;
  onToggleParticipant: (characterId: string) => void;
}
```

Renders the participants + POV select + location input section. No internal state.

`SceneCompassPanel.svelte` props:

```ts
interface Props {
  sceneCompassRows: Array<{ label: string; value: string; missing: boolean }>;
  liveSignals: string[];
  progressFlags: string[];
  quickIntent: QuickIntent;
  sceneTargetWords: number;
  activeWordCount: number;
  pacingHint: string;
  collapsed?: boolean;
  onCollapseToggle: () => void;
  onQuickIntentChange: (next: QuickIntent) => void;
  onQuickIntentBlur: () => void;
}
```

Renders the story compass section with compass rows, live signals, quick-intent form, progress. All derivation (`sceneCompassRows`, `liveSignals`) stays in `EditorShell` — these components are display-only.

In `EditorShell`, replace the three inline `<aside>` blocks with:

```svelte
<SceneNavigator
  {scenes} {chapters}
  activeSceneId={editorState.activeSceneId}
  {activeContent}
  onSelectScene={setActiveScene}
/>
<!-- ... ManuscriptEditorPane ... -->
<SceneCompassPanel
  {sceneCompassRows} {liveSignals} {progressFlags}
  {quickIntent} {sceneTargetWords} {activeWordCount} {pacingHint}
  collapsed={storyCompassCollapsed}
  onCollapseToggle={() => (storyCompassCollapsed = !storyCompassCollapsed)}
  onQuickIntentChange={(next) => (quickIntent = next)}
  onQuickIntentBlur={persistQuickIntent}
/>
```

`SceneContextPanel` is rendered inside `SceneCompassPanel` or as a sibling — keep the existing DOM structure for layout fidelity.

**Acceptance checklist:**

- [ ] `EditorShell.svelte` has no inline `<aside>` HTML blocks; each aside is a component import.
- [ ] Scene switching still works via `SceneNavigator` → `onSelectScene` callback.
- [ ] POV select and location input still persist on blur via `SceneContextPanel` callbacks.
- [ ] Story compass rows, live signals, quick-intent form render correctly in `SceneCompassPanel`.
- [ ] `pnpm run check` clean; `pnpm run lint` clean.
- [ ] No new module boundary violations.

---

### Phase-004 — Scene metadata service

**Goal:** Replace the inline localStorage functions (`loadSceneDefinition`, `loadQuickIntent`, `persistQuickIntent`) in `EditorShell` with a proper `scene-metadata-service.ts` backed by the existing `getProjectMetadata`/`setProjectMetadata` API. Remove localStorage from the read path.

**Files:**

- `src/modules/editor/services/scene-metadata-service.ts` — new file.
- `src/modules/editor/components/EditorShell.svelte` — replace inline localStorage helpers with service calls.
- `src/modules/editor/index.ts` — export service if needed by consumers.
- `tests/editor/scene-metadata-service.test.ts` — new test file.

**Implementation:**

`scene-metadata-service.ts`:

```ts
import { getProjectMetadata, setProjectMetadata } from '$lib/project-metadata.js';

export interface SceneClarity {
  sceneGoal: string;
  immediateObstacle: string;
  tensionSource: string;
  turningPoint: string;
  outcome: string;
  startState: string;
  endState: string;
  draftStatus: string;
  lengthEstimate: string;
}

export interface QuickIntent {
  goal: string;
  obstacle: string;
  outcome: string;
}

const EMPTY_CLARITY: SceneClarity = { sceneGoal: '', immediateObstacle: '', tensionSource: '', turningPoint: '', outcome: '', startState: '', endState: '', draftStatus: '', lengthEstimate: '' };
const EMPTY_INTENT: QuickIntent = { goal: '', obstacle: '', outcome: '' };

export async function loadSceneClarity(projectId: string, sceneId: string): Promise<SceneClarity> {
  const remote = await getProjectMetadata<Partial<SceneClarity> | null>(projectId, 'scene', sceneId, 'clarity', null);
  if (!remote) return { ...EMPTY_CLARITY };
  return { ...EMPTY_CLARITY, ...remote };
}

export async function saveSceneClarity(projectId: string, sceneId: string, data: SceneClarity): Promise<void> {
  await setProjectMetadata<SceneClarity>(projectId, 'scene', sceneId, 'clarity', data);
}

export async function loadQuickIntent(projectId: string, sceneId: string, fallbackGoal = ''): Promise<QuickIntent> {
  const remote = await getProjectMetadata<Partial<QuickIntent> | null>(projectId, 'scene', sceneId, 'quickIntent', null);
  if (!remote) return { ...EMPTY_INTENT, goal: fallbackGoal };
  return { goal: remote.goal ?? fallbackGoal, obstacle: remote.obstacle ?? '', outcome: remote.outcome ?? '' };
}

export async function saveQuickIntent(projectId: string, sceneId: string, data: QuickIntent): Promise<void> {
  await setProjectMetadata<QuickIntent>(projectId, 'scene', sceneId, 'quickIntent', data);
}
```

In `EditorShell.svelte`:
- Remove `loadSceneDefinition`, `loadQuickIntent`, `persistQuickIntent`, `definitionKey`, `quickIntentKey` inline functions.
- Remove all `localStorage.getItem` / `localStorage.setItem` calls related to scene clarity and quick intent.
- Replace the `$effect` that loads scene metadata with calls to `loadSceneClarity` and `loadQuickIntent` from the service.
- Replace `persistQuickIntent()` calls with `saveQuickIntent()` from the service.
- The `$effect` that previously wrote to `localStorage` is removed; the SQLite write happens via the service's save functions.
- Keep the `getProjectMetadata`/`setProjectMetadata` direct calls for the `reconcile` effect if they already exist — the service wraps the same API so either approach is acceptable, but prefer the service.

`tests/editor/scene-metadata-service.test.ts` — vi.mock `$lib/project-metadata.js`. Tests:
- `loadSceneClarity` returns `EMPTY_CLARITY` when remote is null.
- `loadSceneClarity` merges remote partial over defaults.
- `saveSceneClarity` calls `setProjectMetadata` with `('clarity', data)`.
- `loadQuickIntent` returns `fallbackGoal` when remote is null.
- `saveQuickIntent` calls `setProjectMetadata` with `('quickIntent', data)`.

**Acceptance checklist:**

- [ ] `EditorShell.svelte` contains zero `localStorage.getItem`/`localStorage.setItem` calls for scene clarity or quick intent.
- [ ] Scene clarity data survives a page reload (round-trip through SQLite via the service).
- [ ] `scene-metadata-service.ts` has no `localStorage` dependency.
- [ ] All `tests/editor/scene-metadata-service.test.ts` tests pass.
- [ ] Existing autosave / snapshot tests still pass (`pnpm run test`).
- [ ] `pnpm run check` clean; `pnpm run lint` clean.

## Out of Scope

- Changing autosave or snapshot semantics — owned by plan-017 stage-007. `SaveStatus.svelte` and `SnapshotHistoryPanel.svelte` are already available; this stage only wires them into the shell when `mode === 'revision'`.
- Word-processor geometry changes — delivered by plan-023 stage-001; do not touch `--editor-page-*` tokens.
- Nova panel behavior — delivered by plan-023 stages 004/005; this stage only changes visibility rules per editor mode.
- `EditorTopBar` as a separate component — the toolbar row in `EditorShell` (containing `EditorToolbar`, `EditorModeToggle`, `FocusModeToggle`) is not further decomposed in this stage.
- Scene rename UX — not in scope; scene title is owned by the `PageHeader` breadcrumb per plan-023 stage-001 decision.
