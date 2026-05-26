---
part: stage-003-view-in-reader-handoff
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-05-03 06:11] Agent: Architect

**Action:** Implemented all four phases of stage-003 (View-in-Reader Handoff).

**Result:**

Files changed:

- `src/modules/reader/reader-pages.ts` — added pure helper
  `mapSceneIdToReaderPageId(sceneId, project, chapters): string | null`.
  Re-derives `buildReaderPages` and returns the first page whose
  `sceneId` matches; `null` for unknown / empty input. Not memoized
  (documented at the call site).
- `src/modules/reader/components/ClassicReaderView.svelte` — added
  optional `targetSceneId?: string | null` prop. On mount, when
  provided and a matching `#scene-<id>` is rendered, schedules a
  single `requestAnimationFrame` then calls
  `el.scrollIntoView({ behavior: 'instant', block: 'start' })`. No
  URL mutation, no focus ring, no re-scroll on prop change (deep-link
  contract — fresh navigation triggers a new mount).
- `src/modules/reader/components/ReaderFullscreenShell.svelte` — added
  `targetPageId?: string | null` and forwarded it to the embedded
  `BookReaderView`. Required because the books route now passes the
  prop through this wrapper for the fullscreen mode.
- `src/routes/books/[id]/+page.svelte` — reads
  `page.url.searchParams.get('scene')` via `$app/state`. For
  `BookReaderView` and `ReaderFullscreenShell`, derives `targetPageId`
  via `mapSceneIdToReaderPageId`. For `ClassicReaderView`, passes the
  raw `targetSceneId`. Query param is consumed once, never rewritten
  (no `replaceState`).
- `src/routes/projects/[id]/editor/+page.svelte` — imported `goto`
  from `$app/navigation`. Replaced the stage-002 stub
  `handleViewInReader` (`console.warn(...)`) with a real
  `goto(/books/<id>?scene=<encodedSceneId>)`. Falls back to
  `/books/<id>` (no query) when no scene is active.

Tests added:

- `tests/reader/map-scene-to-page.test.ts` — 6 vitest cases. Fixture
  is 2 chapters × 3 scenes. Covers first/last/middle scenes, unknown
  id, empty id, and stable repeated calls.
- `tests/reader/classic-reader-deep-link.test.ts` — 3 vitest cases
  using Svelte 5 `mount` + a `vi.spyOn(Element.prototype, 'scrollIntoView')`
  spy and a synchronous `requestAnimationFrame` stub. Positive case
  asserts the right anchor (`scene-scene-2`) was scrolled with the
  correct options. Two negative cases (unknown id, null) assert the
  spy was not called.
- `tests/visual/view-in-reader-handoff.test.ts` — 1 Playwright case
  at 1280×800 against a freshly seeded project + chapter + scene.
  Asserts the URL preserves `?scene=<id>` (no rewrite) and captures
  the baseline at
  `tests/visual/__screenshots__/visual/view-in-reader-handoff.test.ts/view-in-reader-handoff.png`.

Quality gates:

- `pnpm run lint` — clean.
- `pnpm run check` — svelte-check, 0 errors / 0 warnings.
- `pnpm run test` — **647 passed (105 files)**, up from 638. The 9
  delta = 6 new map-scene-to-page + 3 new classic-reader-deep-link.
- `pnpm run test:visual` (scoped to the new file) — 1 passed.
  Baseline written and re-validated against itself.

**Notes:**

### Decision 1 — `editorState.activeSceneId` round-trip survival

`editorState` is a module-scoped singleton (`new EditorStore()` exported
from `src/modules/editor/stores/editor.svelte.ts`) holding Svelte 5
`$state` fields. SvelteKit client-side navigation via `goto()` does NOT
reload the module graph, so the singleton — including
`activeSceneId` — survives the editor → books → editor (browser-back)
round trip. The editor route reads `editorState.activeSceneId`
directly in its `activeScene` `$derived.by(...)`, so the same scene
remains active after returning. **No follow-up needed.** A scripted
Playwright verification of this round trip is a low-value addition for
this stage (the route's URL is not the source of truth for active
scene); deferred.

### Decision 2 — Visual fixture uses a real seeded scene id

The Playwright baseline does not synthesize a scene id; it POSTs to
`/api/db/projects`, `/api/db/chapters`, `/api/db/scenes` and uses the
returned `id` in the URL. This means the snapshot exercises the full
real path: route load → `mapSceneIdToReaderPageId` → ClassicReaderView
mounting with the prop. Project is deleted in the `finally` block to
keep local state clean.

### Decision 3 — URL contract reservation

`?scene=<sceneId>` is now a **reserved query param** on `/books/[id]`.
Future features adding query params to the books route must not reuse
this name. The route reads the param exactly once on mount and never
mutates the URL afterward, so browser back returns cleanly to the
originating editor route without a stale query.

### Notes / non-deviations

- ClassicReaderView's `id="scene-<id>"` lives on the inner `<h3>`, not
  the wrapping `<article>`. `getElementById('scene-<id>')` resolves
  the `<h3>`; `scrollIntoView({ block: 'start' })` on the heading
  brings the scene into view at the top, which matches user intent.
  (No spec change — anchor location was pre-existing.)
- jsdom does not implement `Element.prototype.scrollIntoView`. The
  vitest test installs a stub before spying — necessary, not a
  deviation.
- `tests/editor/editor-toolbar.test.ts` was not updated. It already
  contains a `view-in-reader button invokes onViewInReader` test
  asserting the wiring, which is the exact assertion the stage spec
  describes; no upgrade needed.
- Manual headed-browser smoke (editor → click → reader scrolls →
  browser back → editor on same scene) was not executed in this
  session. The architectural reasoning above (Decision 1) covers the
  store-survival half; the scroll half is covered by the vitest spy
  test plus the Playwright baseline mounting cleanly.

---
