---
title: Editor Page Geometry
slug: stage-001-editor-page-geometry
stage_number: 1
status: complete
owner: Architect Agent
plan: plan-023-editor-redesign-and-nova-copilot
phases:
  - phase-001-page-box-tokens
  - phase-002-fixed-width-canvas
  - phase-003-remove-title-field
  - phase-004-tests-and-baseline
estimated_duration: 1.5d
risk_level: medium
---

## Goal

Reshape the editor surface from a Medium-style full-bleed canvas
into a single fixed-width page with real margins and no in-canvas
title input — the visual feel of a word processor (Pages / Word /
iA Writer's "Page" mode), grounded in design tokens.

Source: [problems-found-001.md Problem 003](../../../qa-docs/user-problems/problems-found-001.md).

## Entry Criteria

- Plan-021 reader page tokens (`--reader-page-padding-block-*`,
  `--reader-page-padding-inline`, `--reader-measure-max`,
  `--reader-prose-*`) are present in
  [src/styles/tokens.css](../../../../src/styles/tokens.css)
  (added in plan-021 stage-002).
- Editor renders today via
  [src/modules/editor/components/ManuscriptEditorPane.svelte](../../../../src/modules/editor/components/ManuscriptEditorPane.svelte)
  with a `.editor-column` wrapper using `clamp()` for padding and
  `max-width: 720px`, plus a `<input class="title-input">` above
  the TipTap host. This is the surface stage-001 reshapes.

## Exit Criteria

- New `--editor-page-*` tokens defined in
  `src/styles/tokens.css`, mirroring (but distinct from) reader
  tokens — editor padding/measure can drift independently of the
  reader's.
- `.editor-column` (or its replacement) renders as a real page:
  visible top/right/bottom/left margins, a fixed measure, and a
  card-like surface (background + subtle elevation) that does not
  span the full viewport width at any breakpoint ≥ 768px.
- The `<input class="title-input">` and its `onTitleChange` /
  `localTitle` plumbing are removed from `ManuscriptEditorPane`.
  Scene title is owned solely by the surrounding `PageHeader`
  breadcrumb in
  [src/routes/projects/[id]/editor/+page.svelte](../../../../src/routes/projects/[id]/editor/+page.svelte).
- Scene rename remains possible (see phase-003 — decision logged
  in implementation log).
- Vitest coverage ≥ 80% for any new logic added; visual baseline
  captured under `tests/visual/editor-page-geometry/*`.
- `pnpm run lint`, `pnpm run check`, `pnpm run test` all clean.
- `eslint-plugin-boundaries` clean — no new module leakage.

## Phases

| #   | Phase                          | Owner    | Est.  | Status   |
| --- | ------------------------------ | -------- | ----- | -------- |
| 001 | Page-box tokens                | Stylist  | 0.25d | `ready`  |
| 002 | Fixed-width canvas             | Stylist  | 0.5d  | `ready`  |
| 003 | Remove title field             | Architect| 0.5d  | `ready`  |
| 004 | Tests + visual baseline        | Architect| 0.25d | `ready`  |

---

### Phase 001 — Page-box tokens

**Goal:** Add editor-scoped page tokens so subsequent phases bind
geometry to design tokens, not raw values.

**Files:**

- [src/styles/tokens.css](../../../../src/styles/tokens.css) — add tokens.

**Tokens to add** (place in the same `@layer base` block that
holds the reader tokens, immediately after them):

```css
/* Editor page box — word-processor geometry. Independent of
   --reader-page-* so editor and reader can drift in spec. */
--editor-page-padding-block-start: var(--space-12); /* 48px */
--editor-page-padding-block-end: var(--space-12);   /* 48px */
--editor-page-padding-inline: var(--space-10);      /* 40px */
--editor-measure-max: 65ch;
--editor-page-surface: var(--color-surface-raised);
--editor-page-shadow: var(--shadow-sm); /* or whatever the design system uses */
--editor-page-radius: var(--radius-md);
```

If `--shadow-sm`, `--radius-md`, or `--space-12` are not yet
defined, fall back to the closest existing token and log the
deviation in the implementation log — do **not** invent magic
numbers.

**Acceptance:**

- [ ] Tokens defined; no raw px/rem values left in scope.
- [ ] No existing `--reader-*` token altered.

---

### Phase 002 — Fixed-width canvas

**Goal:** Replace `clamp()`-driven adaptive padding and the
`max-width: 720px` line with token-driven, fixed geometry that
reads as a single page.

**Files:**

- [src/modules/editor/components/ManuscriptEditorPane.svelte](../../../../src/modules/editor/components/ManuscriptEditorPane.svelte)
  — rewrite `.editor-root` + `.editor-column` styles, drop
  `clamp(...)` padding.

**Required changes:**

1. `.editor-column` (rename to `.editor-page` for clarity) gets:
   - `max-width: var(--editor-measure-max)` — capped measure.
   - `padding-block-start: var(--editor-page-padding-block-start)`.
   - `padding-block-end: var(--editor-page-padding-block-end)`.
   - `padding-inline: var(--editor-page-padding-inline)`.
   - `background: var(--editor-page-surface)`.
   - `box-shadow: var(--editor-page-shadow)`.
   - `border-radius: var(--editor-page-radius)`.
   - `margin-block: var(--space-8)` so the page floats inside the
     scroll area with breathing room above and below.
2. `.editor-root` gets: `align-items: center` and a transparent
   background — the page is the visual surface, not the root.
3. The TipTap-injected `.manuscript-canvas` keeps its prose
   typography but inherits width from the parent page.
4. At viewports `< 720px`, gracefully degrade to full-bleed
   (`max-width: 100%`, drop shadow + radius) so phones aren't
   wasting horizontal pixels on margins.

**Acceptance:**

- [ ] No `clamp(...)` remains in `.editor-page` or `.editor-root`.
- [ ] At ≥ 1024px viewport the page is visibly inset and capped
      at the token measure.
- [ ] At ≤ 720px viewport the page goes full-bleed with no shadow.
- [ ] Bubble-menu positioning still works (it reads
      `editorHost.getBoundingClientRect()` — verify after layout
      change).

---

### Phase 003 — Remove title field

**Goal:** Kill the in-canvas title input. Scene title belongs in
the chrome (breadcrumb), not the writing surface.

**Files:**

- [src/modules/editor/components/ManuscriptEditorPane.svelte](../../../../src/modules/editor/components/ManuscriptEditorPane.svelte)
  — remove `title` prop, `onTitleChange` prop, `localTitle`
  derived state, `handleTitleChange` function, and the entire
  `<input class="title-input">` markup + its CSS rules
  (`.title-input` and any media queries).
- [src/routes/projects/[id]/editor/+page.svelte](../../../../src/routes/projects/[id]/editor/+page.svelte)
  — remove the `title` and `onTitleChange` attributes passed to
  `<ManuscriptEditorPane>` (lines ~662–667). Keep
  `handleTitleChange` in place for the rename surface chosen
  below; remove it if no longer referenced.
- [src/modules/editor/components/ManuscriptEditorPane.stories.svelte](../../../../src/modules/editor/components/ManuscriptEditorPane.stories.svelte)
  — drop `title` / `onTitleChange` from story args.
- [src/modules/editor/index.ts](../../../../src/modules/editor/index.ts)
  — no change unless the prop type was re-exported (verify).

**Decision required (architect logs in implementation log):**

Scene rename today happens by typing into the in-canvas title
input. Removing it requires a replacement surface. Choose one:

- **A. Editable PageHeader title.** Make the `PageHeader` title
  prop accept a callback that opens an inline rename. Lowest
  friction, keeps rename near the writing context.
  *Touch:* `src/lib/components/structure/PageHeader.svelte`
  (cross-module change — consult Architect agent rules).
- **B. Outline-only rename.** Defer rename to the outline
  sidebar (which already supports it). Cleanest separation of
  concerns; one extra click for the user.

Default to **B** unless the architect sees a strong reason to
expand `PageHeader`'s contract this stage. Defer A to a later
stage if needed.

**Acceptance:**

- [ ] No `<input class="title-input">` anywhere in `src/modules/editor/`.
- [ ] No `onTitleChange` prop on `ManuscriptEditorPane`.
- [ ] Rename path works end-to-end (manual smoke).
- [ ] No dangling references to `localTitle` / `handleTitleChange`
      in `ManuscriptEditorPane.svelte`.

---

### Phase 004 — Tests + visual baseline

**Goal:** Lock geometry behavior with tests so regressions are
caught.

**Files to create:**

- `tests/editor/manuscript-editor-pane.geometry.test.ts` — vitest
  with Testing Library:
  - Asserts no `<input>` with `aria-label="Scene title"` exists.
  - Asserts the rendered root carries the `editor-page` class (or
    whatever class the phase-002 rewrite picks).
- `tests/visual/editor-page-geometry.spec.ts` — Playwright:
  - One screenshot at 1280×800 (page inset).
  - One screenshot at 600×900 (full-bleed mobile).

**Files to update:**

- [src/modules/editor/components/ManuscriptEditorPane.stories.svelte](../../../../src/modules/editor/components/ManuscriptEditorPane.stories.svelte)
  — story args reflect the new prop set.

**Acceptance:**

- [ ] Vitest: new geometry test passes.
- [ ] Playwright: two visual baselines committed under
      `tests/visual/__snapshots__/editor-page-geometry/`.
- [ ] `pnpm run test` and `pnpm run test:visual` both clean.

---

## Risks & Mitigations

- **Bubble menu positioning regressions.** The current bubble
  menu math is `editorHost.getBoundingClientRect()` minus a
  fixed offset. Adding `box-shadow` and a non-zero
  `margin-block` on the page changes the host rect — verify
  visually after phase-002.
- **Scene rename UX regression.** Phase-003 removes the only
  in-editor rename surface. Mitigation: ship phase-003 with a
  clear successor surface (decision A or B above), not a TODO.
- **Mobile breakpoint mismatch with reader.** Reader uses its
  own breakpoint; editor introduces a separate one. Document the
  threshold in the implementation log so future changes can
  align them.

## Hand-off

After phase-004 completes:

- Stage-002 (toolbar pill-nav) picks up the now-clean
  `ManuscriptEditorPane` and the `<header class="editor-toolbar">`
  block in `src/routes/projects/[id]/editor/+page.svelte` (which
  still hosts the inline AI Commands surface — that surface is
  removed in stage-002, replaced by Nova in stage-004+).
- Stage-007 (preference consumption) layers font-size /
  line-spacing / theme on top of the geometry tokens introduced
  here.
