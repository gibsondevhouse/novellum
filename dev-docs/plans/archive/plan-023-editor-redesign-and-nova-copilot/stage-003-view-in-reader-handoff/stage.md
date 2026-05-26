---
title: View-in-Reader Handoff
slug: stage-003-view-in-reader-handoff
stage_number: 3
status: complete
owner: Architect Agent
plan: plan-023-editor-redesign-and-nova-copilot
phases:
  - phase-001-target-scene-query-param
  - phase-002-classic-reader-deep-link
  - phase-003-toolbar-handler-and-route
  - phase-004-tests-and-baseline
estimated_duration: 1d
risk_level: low
---

## Goal

Wire the toolbar's **View in Reader** button (shipped in
stage-002 as a stub) to actually open `/books/[id]` for the
current project and scroll the reader to the page that contains
the active scene. Round-trip: returning to the editor (browser
back) keeps the user on the same scene.

Source: [problems-found-001.md Problem 003](../../../qa-docs/user-problems/problems-found-001.md)
last bullet: "view in reader should open the entire piece in the
reader interface, not just the current page, but the reader
should still be aware of the current page and scroll to it."

## Entry Criteria

- Stage-002 is `complete`. The toolbar `onViewInReader` callback
  is in place at
  [src/routes/projects/[id]/editor/+page.svelte](../../../../src/routes/projects/[id]/editor/+page.svelte)
  (function `handleViewInReader` line ~577) and currently logs a
  warning.
- `BookReaderView` already accepts a `targetPageId?: string | null`
  prop (plan-021 stage-003 phase-003) and applies it via the
  `onMount` deep-link branch. **No changes** to `BookReaderView`'s
  contract are needed.
- `buildReaderPages(project, chapters)` in
  [src/modules/reader/reader-pages.ts](../../../../src/modules/reader/reader-pages.ts)
  produces `ReaderPage[]` whose `scene`-typed entries carry the
  authoring `sceneId`. Use this mapping to translate
  `editor.activeScene.id` → `ReaderPage.id`.
- The reader is mounted from
  [src/routes/books/[id]/+page.svelte](../../../../src/routes/books/[id]/+page.svelte),
  which selects `ClassicReaderView` / `BookReaderView` /
  `ReaderFullscreenShell` based on `getReaderMode()`.
  `ClassicReaderView` already emits `id="scene-<id>"` anchors on
  every scene `<article>`. **No** scene→page lookup is needed
  for Classic — the anchor is enough.

## Exit Criteria

- Toolbar's **View in Reader** button navigates to
  `/books/<projectId>?scene=<activeSceneId>` (URL query, not
  hash, so SvelteKit data loaders observe it).
- Books route reads the `scene` query param and:
  - For `BookReaderView`: maps it to a `ReaderPage.id` via
    `buildReaderPages` and passes `targetPageId={...}`.
  - For `ClassicReaderView`: passes a new `targetSceneId` prop;
    `ClassicReaderView` adds an `onMount` that calls
    `element.scrollIntoView({ behavior: 'instant', block: 'start' })`
    on the matching `#scene-<id>` once rendered.
  - For `ReaderFullscreenShell`: same as `BookReaderView` —
    forwards `targetPageId`.
- The `scene` query param is consumed once and **not** mutated
  in URL after consumption. We avoid `replaceState` rewrites so
  browser back returns to the editor cleanly.
- `?scene=<unknown-id>` falls back gracefully — reader mounts
  normally with saved/initial position, no error toast required.
- Round-trip: clicking back in the browser returns to the editor
  on the same scene (editor URL is `/projects/<id>/editor`; scene
  selection lives in `editorState.activeSceneId` store, not the
  URL — verify the store survives the navigation).
- `pnpm run lint`, `pnpm run check`, `pnpm run test`,
  `pnpm run test:visual` all clean.

## Phases

| #   | Phase                                       | Owner    | Est.  | Status   |
| --- | ------------------------------------------- | -------- | ----- | -------- |
| 001 | Target-scene query param + Books route      | Architect| 0.25d | `ready`  |
| 002 | ClassicReaderView deep-link prop            | Architect| 0.25d | `ready`  |
| 003 | Toolbar handler + scene→page mapping helper | Architect| 0.25d | `ready`  |
| 004 | Tests + visual baseline                     | Architect| 0.25d | `ready`  |

---

### Phase 001 — Target-scene query param + Books route

**Goal:** Make the `/books/[id]` route forward a target-scene
hint to whichever reader view is active.

**Files:**

- **Update** [src/routes/books/[id]/+page.svelte](../../../../src/routes/books/[id]/+page.svelte):
  - Read `$page.url.searchParams.get('scene')` (use SvelteKit's
    page store; switch to `$page` rune-friendly access if the
    file is already on Svelte 5 patterns).
  - For `BookReaderView` and `ReaderFullscreenShell`: derive
    `targetPageId` by calling a new helper
    `mapSceneIdToReaderPageId(sceneId, project, chapters)` from
    `$modules/reader/reader-pages.ts` (created in phase-003).
  - For `ClassicReaderView`: pass the raw `targetSceneId` prop.
- **Create** if missing — or reuse — a thin `+page.ts` /
  `+page.server.ts` that exposes the URL param. If the existing
  loader doesn't, accessing `$page.url` from the component is
  fine and avoids a loader change.

**Acceptance:**

- [ ] Visiting `/books/<id>?scene=<sid>` mounts the reader and
      passes the appropriate prop.
- [ ] Visiting `/books/<id>` (no param) is unchanged.
- [ ] Unknown `?scene=` value does not throw; reader mounts at
      saved position.

---

### Phase 002 — ClassicReaderView deep-link prop

**Goal:** Add a deep-link prop to `ClassicReaderView` that
scrolls to a target scene anchor on mount.

**Files:**

- **Update** [src/modules/reader/components/ClassicReaderView.svelte](../../../../src/modules/reader/components/ClassicReaderView.svelte):
  - Add `targetSceneId?: string | null` to `Props`.
  - In `onMount`, after the existing scroll/anchor logic (if
    any): if `targetSceneId` matches a rendered `#scene-<id>`,
    `el.scrollIntoView({ behavior: 'instant', block: 'start' })`.
    Use `requestAnimationFrame` once before the scroll to ensure
    layout has settled (the chapters are rendered synchronously,
    but a single rAF guards against transition timing).
  - Do **not** modify the URL (no `history.replaceState`).
  - Do **not** highlight or visibly mark the target scene (the
    user asked for "scroll to it", not for a focus ring).

**Acceptance:**

- [ ] New optional prop wired and used.
- [ ] Existing call sites (no prop) keep working.
- [ ] Scroll happens once on mount; subsequent prop changes do
      not re-scroll (per the deep-link contract — fresh
      navigation triggers a new mount).

---

### Phase 003 — Toolbar handler + scene→page mapping helper

**Goal:** Replace the stub `handleViewInReader` warning with a
real `goto()` call, and provide the scene→page mapping helper
the books route uses.

**Files:**

- **Update** [src/modules/reader/reader-pages.ts](../../../../src/modules/reader/reader-pages.ts):
  - Export a new pure function:

    ```ts
    export function mapSceneIdToReaderPageId(
      sceneId: string,
      project: ReaderInputProject,
      chapters: ReaderInputChapter[],
    ): string | null;
    ```

  - Implementation: `buildReaderPages(project, chapters)`, then
    return the `id` of the first page whose `sceneId === sceneId`,
    else `null`. Export type-stable.
- **Update** [src/routes/projects/[id]/editor/+page.svelte](../../../../src/routes/projects/[id]/editor/+page.svelte):
  - Replace the body of `handleViewInReader` with:

    ```ts
    function handleViewInReader(): void {
      if (!activeScene) {
        void goto(`/books/${data.project.id}`);
        return;
      }
      const url = `/books/${data.project.id}?scene=${encodeURIComponent(activeScene.id)}`;
      void goto(url);
    }
    ```

  - Import `goto` from `$app/navigation` if not already imported.

**Acceptance:**

- [ ] `mapSceneIdToReaderPageId` returns the correct
      `ReaderPage.id` for a sample fixture.
- [ ] Returns `null` for unknown sceneId without throwing.
- [ ] Editor toolbar button now triggers a real navigation;
      the previous `console.warn` is gone.

---

### Phase 004 — Tests + visual baseline

**Files to create:**

- `tests/reader/map-scene-to-page.test.ts` — vitest:
  - Builds a fixture with two chapters, three scenes each.
  - Asserts `mapSceneIdToReaderPageId` returns the right page
    id for the first/last scene of each chapter.
  - Asserts `null` for an unknown sceneId.
  - Asserts the function is referentially stable for repeated
    calls with the same input (or document if not — we're
    not memoizing).
- `tests/reader/classic-reader-deep-link.test.ts` — vitest +
  Testing Library:
  - Mounts `ClassicReaderView` with `targetSceneId='scene-2'`.
  - Asserts `scrollIntoView` was called on the matching anchor
    (jsdom: spy on `Element.prototype.scrollIntoView`).
  - Negative test: unknown sceneId does NOT call
    `scrollIntoView`.
- `tests/visual/view-in-reader-handoff.test.ts` — Playwright:
  - Navigate to `/books/<seeded-id>?scene=<seed-scene>` and
    capture a screenshot at 1280×800. Confirms the layout
    doesn't break with the param applied.

**Files to update:**

- [tests/editor/editor-toolbar.test.ts](../../../../tests/editor/editor-toolbar.test.ts)
  — if the `View in Reader` button has a callback assertion,
  upgrade it to verify the wiring still flows through
  `onViewInReader`. No need to assert URL navigation here —
  that's the route's responsibility.

**Acceptance:**

- [ ] Two new vitest files green.
- [ ] One new Playwright baseline committed.
- [ ] All gates clean.

---

## Risks & Mitigations

- **Page id stability across session.** `ReaderPage.id` values
  are derived deterministically from project/chapter/scene IDs by
  `buildReaderPages`. Verify this in the helper test —
  `buildReaderPages` must produce the same `page.id` for the same
  inputs across calls.
- **Browser back from reader returns to editor with no scene
  active.** `editorState.activeSceneId` is a `.svelte.ts` store;
  it's process-scoped, not URL-scoped. Confirm the store
  survives the navigation. If it doesn't, fall back to encoding
  the scene id in the editor URL — out of scope here, log as a
  follow-up.
- **Scroll-to-anchor jank on Classic mode.** A single rAF before
  `scrollIntoView` is the project's existing convention. If
  large books (>200 scenes) cause visible jump, consider an
  intersection observer or `block: 'center'` instead — log
  follow-up if observed.
- **`?scene=` colliding with a future feature.** Reserve the
  param name for this purpose. Document in the impl-log under
  "URL contract".

## Hand-off

After phase-004 completes, plan-023 is at parity with Problem 003
bullets 1–6. Stages 004–006 (Nova module) and stage-007 (preference
consumption) carry the remaining product work.
