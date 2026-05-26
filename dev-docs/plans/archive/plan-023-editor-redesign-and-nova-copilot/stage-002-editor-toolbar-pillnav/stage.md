---
title: Editor Toolbar PillNav
slug: stage-002-editor-toolbar-pillnav
stage_number: 2
status: complete
owner: Stylist Agent
plan: plan-023-editor-redesign-and-nova-copilot
phases:
  - phase-001-pill-toolbar-primitive
  - phase-002-editor-toolbar-component
  - phase-003-mount-and-remove-pageheader
  - phase-004-tipTap-extensions-and-handlers
  - phase-005-tests-and-baseline
estimated_duration: 1.5d
risk_level: medium
---

## Goal

Replace the Medium-style `<header class="editor-toolbar">`
PageHeader (with its inline POV select, prev/next, and AI Commands
strip) with a word-processor toolbar built on a new pill-shaped
toolbar primitive that visually rhymes with `PillNav`.

The legacy in-content "AI Commands" buttons (Continue / Dialogue /
Tension / Summary) **disappear from the header** in this stage —
the underlying handler (`handleAskAi`) stays in source so stage-004+
can re-wire it through Nova. POV select and Previous/Next move into
a thin secondary row.

Source: [problems-found-001.md Problem 003](../../../qa-docs/user-problems/problems-found-001.md)
bullets 4 and 5 ("ai commands should be delivered through natural
language", "refactor the main content header to be an imported
pill nav refactored to house the editor toolbar").

## Entry Criteria

- Stage-001 (page geometry) is `complete` — `.editor-page` card is
  the writing surface, no in-canvas title input.
- `PillNav` exists at
  [src/lib/components/ui/PillNav.svelte](../../../../src/lib/components/ui/PillNav.svelte)
  with text-only segmented-control semantics. We do **not** modify
  `PillNav`'s contract (consumers in `AppHeader` and
  `WorldBuildingSubheaderNav` must remain untouched).
- TipTap `StarterKit` already provides bold / italic / strike /
  heading / bulletList / orderedList / blockquote. Underline,
  image, table, and find/replace are NOT yet installed.

## Exit Criteria

- New `PillToolbar` primitive in
  `src/lib/components/ui/PillToolbar.svelte` providing icon
  buttons, `pressed` toggle state, group dividers, and a dropdown
  slot — same pill-shaped container styling as `PillNav` so the
  visual language is shared.
- New `EditorToolbar.svelte` in
  `src/modules/editor/components/` that consumes `PillToolbar`
  and emits typed events for every supported action.
- `<header class="editor-toolbar">` PageHeader block in
  [src/routes/projects/[id]/editor/+page.svelte](../../../../src/routes/projects/[id]/editor/+page.svelte)
  replaced. POV select + Previous/Next move to a slim
  context-row below the toolbar; the four AI Command
  `GhostButton`s are removed (handler `handleAskAi` retained
  in source, marked for stage-004 re-wire).
- Toolbar exposes: bold, italic, **underline**, strike, H1, H2,
  bullet list, ordered list, blockquote, **insert image**,
  **insert table**, **spell check toggle**, **view-in-reader**.
  (View-in-reader UI button only — actual handoff lands in
  stage-003.)
- TipTap underline + image + table extensions added; existing
  bubble menu still works (no regression).
- Toolbar is keyboard accessible: roving tabindex inside the
  toolbar (one tab stop), arrow-key navigation between buttons,
  every button has `aria-label` + `aria-pressed` where toggleable.
- Two new visual baselines: toolbar at 1280×800 (full set
  visible) and 900×800 (responsive — overflow into "More" menu
  if needed).
- `pnpm run lint`, `pnpm run check`, `pnpm run test`,
  `pnpm run test:visual` all clean.
- `eslint-plugin-boundaries` clean — `PillToolbar` lives in `lib`,
  consumed from `modules/editor`, no reverse imports.

## Phases

| #   | Phase                                  | Owner    | Est.  | Status   |
| --- | -------------------------------------- | -------- | ----- | -------- |
| 001 | PillToolbar primitive                  | Stylist  | 0.5d  | `ready`  |
| 002 | EditorToolbar component                | Stylist  | 0.25d | `ready`  |
| 003 | Mount + remove PageHeader surface      | Architect| 0.25d | `ready`  |
| 004 | TipTap extensions + handlers wiring    | Architect| 0.25d | `ready`  |
| 005 | Tests + visual baselines               | Architect| 0.25d | `ready`  |

---

### Phase 001 — PillToolbar primitive

**Goal:** A pill-shaped toolbar primitive that visually rhymes
with `PillNav` but has the semantics a word-processor toolbar
needs (icons, pressed state, dividers, overflow). `PillNav` stays
untouched.

**Files:**

- **Create** `src/lib/components/ui/PillToolbar.svelte`.
- **Update** [src/lib/components/ui/index.ts](../../../../src/lib/components/ui/index.ts)
  to export `PillToolbar` and its types.
- **Create** `src/lib/components/ui/PillToolbar.stories.svelte`
  (CSF, mirroring `PillNav.stories.svelte`).

**Public contract (Svelte 5 runes; export an item type):**

```ts
export type PillToolbarItem =
  | {
      kind: 'button';
      id: string;
      label: string;            // accessible name; tooltip
      icon: string | Snippet;   // text (e.g. 'B') or an icon snippet
      pressed?: boolean;        // toggle state → aria-pressed
      disabled?: boolean;
      onSelect: () => void;
    }
  | {
      kind: 'divider';
      id: string;
    }
  | {
      kind: 'menu';
      id: string;
      label: string;
      icon: string | Snippet;
      items: Array<{ id: string; label: string; pressed?: boolean; onSelect: () => void; }>;
    };

interface Props {
  items: PillToolbarItem[];
  ariaLabel: string;
  /** Density: compact toolbar by default; passes through to CSS. */
  density?: 'compact' | 'comfortable';
}
```

**Required behavior:**

- Rendered as `<div role="toolbar" aria-label={ariaLabel}>` with
  the same pill-shaped container styling as `PillNav`
  (`background: var(--color-surface-elevated)`, `border-radius:
  var(--radius-full)`, `padding: 2px`, `gap: 2px`).
- Roving tabindex: only one button has `tabindex="0"` at a time;
  `ArrowLeft` / `ArrowRight` move focus, wrapping at ends.
  `Home` / `End` jump to first/last. `Enter` / `Space` activate.
- Toggle buttons render `aria-pressed={pressed}` and gain a
  filled-pill style when pressed (reuses `--color-surface-hover`
  plus `--shadow-sm` like `PillNav`'s active state).
- Dividers render as `<span aria-hidden role="separator">` with a
  1px vertical line.
- Menus render as a button that opens a popover (use
  `<dialog>` with `popover="auto"` if the project already uses
  popovers; otherwise a focus-trapped div). Defer animation —
  match `PillNav` static motion for now.
- No icon library is mandated. Accept text glyphs (B / I / U)
  initially; the `icon` prop accepts a `Snippet` so future
  iterations can swap to SVGs without a contract break.

**Acceptance:**

- [ ] Component file + stories + lib export added.
- [ ] All styles via tokens — no raw px/rem/hex.
- [ ] Visually rhymes with `PillNav` (same container chrome).
- [ ] Keyboard navigation matches WAI-ARIA Toolbar pattern.
- [ ] No changes to `PillNav.svelte`.

---

### Phase 002 — EditorToolbar component

**Goal:** Editor-specific consumer of `PillToolbar` that knows
about TipTap commands and exposes a clean event API to the route.

**Files:**

- **Create** `src/modules/editor/components/EditorToolbar.svelte`.
- **Update** [src/modules/editor/index.ts](../../../../src/modules/editor/index.ts)
  to export `EditorToolbar`.

**Contract:**

```ts
interface Props {
  // TipTap editor instance from ManuscriptEditorPane (lifted up).
  editor: import('@tiptap/core').Editor | null;
  // Toolbar fires this; route owns spell-check toggle state.
  spellcheck: boolean;
  onToggleSpellcheck: (next: boolean) => void;
  // Stage-003 lands the actual handoff; this stage provides the button.
  onViewInReader: () => void;
}
```

**Toolbar groups (left → right, divided):**

1. **Format:** Bold (B), Italic (I), Underline (U), Strikethrough (S).
2. **Block:** H1, H2, Bullet list, Ordered list, Blockquote.
3. **Insert:** Image (menu opens a URL prompt for now), Table
   (menu picks rows × cols, default 3×3).
4. **Tools:** Spellcheck toggle (pressed = enabled), Find/Replace
   (stub button — `disabled` until a future stage; logged in
   impl-log).
5. **View:** View in Reader button (calls `onViewInReader`).

**Press-state derivation** uses TipTap's `editor.isActive(...)`
inside a `$derived` keyed on a tick counter the parent passes (or
re-derive from `editor` if Svelte 5 reactivity tracks
`editor.state` mutations adequately — verify; if not, lift a
`tick` `$state` and bump it from `ManuscriptEditorPane.onUpdate`).

**Acceptance:**

- [ ] All four groups render in order with dividers between.
- [ ] Toggle pressed state reflects actual TipTap state.
- [ ] Buttons are disabled when `editor === null`.
- [ ] Underline button works (depends on phase-004 extension).
- [ ] Image / Table menus open and call the appropriate
      `editor.chain().focus().<cmd>().run()`.

---

### Phase 003 — Mount toolbar + remove PageHeader surface

**Goal:** Wire the new toolbar into the editor route and delete
the AI Commands header.

**Files:**

- **Update** [src/routes/projects/[id]/editor/+page.svelte](../../../../src/routes/projects/[id]/editor/+page.svelte):

  1. Replace the entire `<header class="editor-toolbar">…</header>`
     block (lines ~620–656) with:
     - A new `<EditorToolbar>` mount (top of the editor area).
     - A new slim `<div class="editor-context-row">` below it
       hosting the POV `<select>` and the Previous / Next nav
       buttons. Drop the `Drafting Studio` eyebrow, scene-title
       repetition, and `editorContextLabel` description (the
       breadcrumb + outline already display these).
     - **Delete** the `<div class="ai-actions-wrap">` block and
       its four `GhostButton`s.
  2. **Keep** `function handleAskAi(...)` in source (lines ~550+)
     and add a comment: `// Retained for stage-004 Nova re-wire — do not delete.`
     Mark it with `// @ts-expect-error unused` if necessary, or
     export it as a no-op for the linter. Confirm the file passes
     `unused-imports`/`@typescript-eslint/no-unused-vars`.
  3. **Lift** the TipTap editor instance from
     `ManuscriptEditorPane` to the route OR add a `bind:editor`
     callback prop so `EditorToolbar` can receive it. Cleanest
     approach: add `oneditorReady?: (editor: Editor) => void` to
     `ManuscriptEditorPane`'s props, route stores it in a
     `$state<Editor | null>(null)`, passes it to `EditorToolbar`.
- **Update** [src/modules/editor/components/ManuscriptEditorPane.svelte](../../../../src/modules/editor/components/ManuscriptEditorPane.svelte):
  Add the `oneditorReady` prop and call it in `onMount` after
  `editor` is constructed; null it in `onDestroy`. Also add a
  `tick` callback prop so the toolbar can re-derive press state
  on selection updates (call from `onSelectionUpdate` /
  `onUpdate`). Bubble menu stays.

**Acceptance:**

- [ ] No `<PageHeader>` import in
      `src/routes/projects/[id]/editor/+page.svelte` unless it's
      still used elsewhere on that route — audit and remove if
      orphaned.
- [ ] No "AI Commands" string anywhere in the rendered editor
      route (`grep -n "AI Commands" src/routes/projects/[id]/editor/+page.svelte` returns nothing).
- [ ] POV select + Prev/Next still functional in the new context
      row.
- [ ] `handleAskAi` retained, lint clean.

---

### Phase 004 — TipTap extensions + handler wiring

**Goal:** Install the TipTap extensions the new toolbar buttons
require.

**Files:**

- [src/modules/editor/components/ManuscriptEditorPane.svelte](../../../../src/modules/editor/components/ManuscriptEditorPane.svelte)
  — extend the `extensions: [...]` array.

**Required additions** (verify each is in `package.json` first;
if not, install via pnpm and pin):

- `@tiptap/extension-underline` — for the Underline (U) button.
- `@tiptap/extension-image` — for the Insert Image menu.
- `@tiptap/extension-table` + `@tiptap/extension-table-row` +
  `@tiptap/extension-table-header` + `@tiptap/extension-table-cell`
  — for the Insert Table menu.

**Spellcheck wiring:**

- The TipTap `editorProps.attributes.spellcheck` is currently
  hard-coded `'true'`. Replace with a reactive value driven by
  the new `spellcheck` `$state` in the route, propagated to
  `ManuscriptEditorPane` via a `spellcheck` prop, applied via an
  `$effect` that calls
  `editor.setOptions({ editorProps: { attributes: { spellcheck: String(spellcheck) } } })`
  (or rebuilds extensions if necessary).

**Acceptance:**

- [ ] `pnpm-lock.yaml` shows the four new extensions pinned.
- [ ] All toolbar buttons exercise their commands; underline /
      image / table all work end-to-end.
- [ ] Toggling spellcheck disables the browser red-squiggle layer
      live (no reload).

---

### Phase 005 — Tests + visual baselines

**Files to create:**

- `tests/lib/pill-toolbar.test.ts` — vitest + Testing Library:
  - Renders all three item kinds.
  - Toggle button reflects `aria-pressed`.
  - Roving tabindex: only one button has `tabindex="0"`,
    arrow keys move focus, Home/End jump.
  - Disabled buttons are skipped on arrow navigation.
- `tests/editor/editor-toolbar.test.ts` — vitest:
  - Renders all 4 groups.
  - Spellcheck toggle calls `onToggleSpellcheck`.
  - Bold button calls TipTap `toggleBold`. (Mock the editor with
    a stub exposing `chain().focus().toggleBold().run()` and
    `isActive('bold')`.)
- `tests/visual/editor-toolbar.test.ts` — Playwright:
  - 1280×800 baseline (full toolbar visible).
  - 900×800 baseline (responsive — confirms overflow handling).

**Files to update:**

- [tests/editor/manuscript-editor-pane.geometry.test.ts](../../../../tests/editor/manuscript-editor-pane.geometry.test.ts)
  — if any assertion overlaps with the new prop set, adjust.

**Acceptance:**

- [ ] All gates green: lint, check, test, test:visual,
      boundaries.
- [ ] vitest count ≥ 625 + new tests added.
- [ ] Two new screenshot baselines committed under
      `tests/visual/__screenshots__/visual/editor-toolbar.test.ts/`.

---

## Risks & Mitigations

- **Lifting the TipTap editor changes the `ManuscriptEditorPane`
  contract.** Mitigation: make `oneditorReady` and `spellcheck`
  optional with sensible defaults; existing stories keep working.
- **`PillToolbar` overlap with `PillNav` contract drift.** They
  share visual language but not semantics. Document this in the
  `PillToolbar` JSDoc header so future contributors don't try to
  unify them.
- **Toolbar overflow at narrow viewports.** Prefer wrapping or an
  overflow "More" menu over horizontal scrolling. Decision logged
  in impl-log.
- **TipTap version drift.** The four new extensions must match
  the installed `@tiptap/core` major version. Verify before
  install; if a major bump is required, halt and consult the
  architect — out of scope for this stage.
- **Find/Replace stub.** Shipping a visibly-disabled button is
  acceptable; do **not** ship a button that opens nothing.
  Disabled with a tooltip "Coming soon" is the contract.

## Hand-off

After phase-005 completes:

- Stage-003 (view-in-reader handoff) wires the
  `onViewInReader` callback to route navigation that consumes
  the `targetPageId` prop plan-021 stage-003 added.
- Stage-004 (Nova module scaffold) re-houses `handleAskAi`'s
  four presets as Nova chat quick-prompts.
- Stage-007 (preference consumption) adds spellcheck-default and
  toolbar-density preference reads — both extension points are
  in place after this stage.
