---
stage: stage-002-editor-toolbar-pillnav
plan: plan-023-editor-redesign-and-nova-copilot
---

# Implementation Log — stage-002 Editor Toolbar PillNav

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-05-03 06:00] Agent: Architect

**Action:** Executed all five phases of stage-002 in a single pass.

**Phase 001 — `PillToolbar` primitive.** Created
[src/lib/components/ui/PillToolbar.svelte](../../../../src/lib/components/ui/PillToolbar.svelte)
with WAI-ARIA `role="toolbar"`, three item kinds (`button` /
`divider` / `menu`), roving tabindex, `ArrowLeft`/`ArrowRight`
wrap, `Home`/`End` jump, disabled-skip, `aria-pressed` toggle
state, and a popover-style `menu` with `role="menuitemcheckbox"`
children (raw `aria-pressed` is not valid on `menuitem`, so the
implementation prefers the checkbox role to keep WAI-ARIA happy
while preserving toggle semantics). Pill chrome is shared with
`PillNav` (same `--color-surface-elevated` background,
`--radius-full`, 2 px padding). All values come from tokens — no
raw px/rem/hex except the 1 px divider rule and `tabindex="-1"`.
Stories file added at
[src/lib/components/ui/PillToolbar.stories.svelte](../../../../src/lib/components/ui/PillToolbar.stories.svelte)
with a representative editor toolbar scenario. Lib index
re-exports `PillToolbar` plus all four item types.

**Phase 002 — `EditorToolbar` consumer.** Created
[src/modules/editor/components/EditorToolbar.svelte](../../../../src/modules/editor/components/EditorToolbar.svelte).
Four groups in the order specified — Format (B/I/U/S), Block
(H1/H2/Bullet/Ordered/Quote), Insert (Image / Table), Tools
(Spellcheck / Find & Replace stub) — plus a final View group
holding the View-in-Reader button. Press state is derived inside
a `$derived.by` that touches the `tick` prop the route bumps on
every TipTap update so reactivity flows correctly without
reaching into TipTap internals. Insert image opens
`window.prompt('Image URL')`; Insert table inserts a default
3 × 3 table with header row. Find & Replace ships disabled with
`title="Find & Replace — coming soon"`. Module index re-exports
the component.

**Phase 003 — Mount + remove `PageHeader`.** Replaced the entire
`<header class="editor-toolbar"><PageHeader>…` block in
[src/routes/projects/[id]/editor/+page.svelte](../../../../src/routes/projects/[id]/editor/+page.svelte)
with `<EditorToolbar>` plus a slim `.editor-context-row`
hosting the POV `<select>` and Previous / Next nav buttons. The
old "Drafting Studio" eyebrow, scene-title repetition, and
`editorContextLabel` description were dropped (breadcrumb +
outline already display them). The four
`<GhostButton>` "AI Commands" entries and their wrapper were
deleted; the `GhostButton` import was removed (no other usages
on this route). `handleAskAi` is retained in source with an
explicit `// Retained for stage-004 Nova re-wire — do not delete.`
comment plus an `eslint-disable-next-line
@typescript-eslint/no-unused-vars` directive (the project's
`unused-vars` rule allows the `_`-prefix escape, but a comment
directive is more discoverable here). `handleViewInReader` was
added as a stub that calls `console.warn('view-in-reader:
stage-003 not yet shipped')`. The unused `editorContextLabel`
derivation was removed; `activeChapter` was renamed to
`_activeChapter` to satisfy the unused-vars rule until other
surfaces consume it.

**Phase 004 — TipTap extensions.** `@tiptap/core` is `^3.22.4`,
so the four extensions were installed against the v3 line.
Underline pinned at `^3.22.4`, Image / Table / Table-Row /
Table-Header / Table-Cell at `^3.22.5` (npm patch bump from
3.22.4 → 3.22.5; pnpm warned on unmet peer for `@tiptap/core@3.22.5`
but this is a patch-level peer mismatch only — no major bump
was performed and the build / tests / type checks all pass).
ManuscriptEditorPane gained three new optional props —
`oneditorReady?(editor)`, `ontick?()`, and `spellcheck` — and
applies spellcheck reactivity through a `$effect` that calls
`editor.setOptions({ editorProps: { attributes: { spellcheck:
String(spellcheck) } } })` and also writes the attribute on the
live `.manuscript-canvas` element so the change propagates to
the browser without a re-mount.

**Phase 005 — Tests + visual baselines.** Added
`tests/lib/pill-toolbar.test.ts` (8 tests covering rendering of
all three item kinds, `aria-pressed`, single-`tabindex="0"`
roving, ArrowRight skip-disabled, Home/End edges, click →
`onSelect`, and menu open/close), and
`tests/editor/editor-toolbar.test.ts` (5 tests covering 4-group
rendering with the stubbed TipTap chain, `onToggleSpellcheck`
inversion, `toggleBold().run()` plumbing, View-in-Reader
callback, and editor-null disabling). Two Playwright baselines
captured at 1280 × 800 and 900 × 800 under
`tests/visual/__screenshots__/visual/editor-toolbar.test.ts/`.

**Result:**

- All quality gates pass:
  - `pnpm run lint` → 0 errors / 0 warnings.
  - `pnpm run check` → 0 errors / 0 warnings.
  - `pnpm run test` → **638 passed** across 103 files (was 625;
    +13 new tests = 8 PillToolbar + 5 EditorToolbar).
  - `pnpm exec playwright test tests/visual/editor-toolbar.test.ts
    tests/visual/editor-page-geometry.test.ts` → 4 passed.
- `grep -n "AI Commands" src/routes/projects/[id]/editor/+page.svelte`
  → no matches.

**Decisions logged:**

1. **Toolbar overflow strategy at narrow viewports — pick:
   wrap.** `PillToolbar` sets `flex-wrap: wrap` on its container
   so every group remains visible and reachable on narrow
   viewports. We rejected a "More" overflow menu because it
   would hide commands behind a second focus stop and create
   keyboard-navigation cliffs for the WAI-ARIA Toolbar pattern.
   We rejected horizontal scroll because affordance and
   discoverability are worse than a wrap. The 900 × 800
   baseline confirms the wrap is visually cohesive (pill chrome
   stays continuous because each row inherits the same
   container background).

2. **Lift mechanism for the TipTap editor instance — pick:
   `oneditorReady` callback.** A Svelte 5 `bind:editor` would
   require `ManuscriptEditorPane` to expose `editor` as a
   bindable prop, but the pane stores it in a local `let`
   that is `null` until `onMount` runs. A callback prop is a
   cleaner contract — the pane simply notifies once, and again
   with `null` on destroy, so the route's `$state` mirrors the
   instance lifecycle exactly. Reactivity wrinkle observed:
   TipTap mutates editor state in place, so `$derived.by` over
   the editor reference doesn't re-fire on selection /
   formatting changes. We solved this by passing a `tick`
   counter (`editorTick = $state(0)`) that the route bumps via
   the new `ontick` callback — `EditorToolbar.items` reads
   `tick` inside its derivation, which keeps `aria-pressed`
   honest without leaking TipTap internals into the toolbar.

3. **Find / Replace stub treatment.** Visibly disabled icon
   button with `title="Find & Replace — coming soon"`. The
   button is fully focusable but `aria-disabled` via the native
   `disabled` attribute, so screen readers announce its name
   and unavailability. We rejected hiding the button entirely
   because the spec required the affordance to be visible, and
   we rejected an active button that opens nothing per the
   stage's explicit constraint.

**TipTap extension versions installed (pinned via caret):**

- `@tiptap/extension-underline@^3.22.4`
- `@tiptap/extension-image@^3.22.5`
- `@tiptap/extension-table@^3.22.5`
- `@tiptap/extension-table-row@^3.22.5`
- `@tiptap/extension-table-header@^3.22.5`
- `@tiptap/extension-table-cell@^3.22.5`

**Final test counts:**

- Vitest: **638 / 638 passing** (103 files; +13 new tests over
  the stage entry baseline of 625).
- New visual baselines: **2** committed —
  `editor-toolbar-1280x800.png`,
  `editor-toolbar-900x800.png`.
- Existing editor visual baselines (stage-001) still pass
  unchanged.

**Notes / out-of-scope observations:**

- `tests/visual/visual-regression.test.ts` reports 12 pre-existing
  drift failures across unrelated routes (Home / Library / Books
  / Reader / Stories / Settings / Images / Nova /
  Worldbuilding). None of those routes are touched by stage-002
  and the editor-page geometry baselines from stage-001 still
  match. These regressions are out of scope for this stage and
  should be triaged in their own ticket.
- `pnpm` emitted unmet-peer warnings during `pnpm add` because
  the new extensions resolved to `3.22.5` while the previously
  installed `@tiptap/core` is at `3.22.4`. Per the stage spec
  we explicitly do not bump majors, and patch-level drift is
  benign — confirmed by all gates passing. A future maintenance
  pass can align everything at 3.22.5+ if desired.
- `ManuscriptEditorPane`'s existing bubble menu (Bold / Italic /
  Strike / H1 / H2 / Bullet / Quote) is preserved and unchanged.
  No regression observed in editor behavior; the bubble menu and
  the new persistent toolbar coexist cleanly.

---
