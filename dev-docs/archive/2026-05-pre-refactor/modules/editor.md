# Draft Editor

> Shipped: plan-023 stages 001–007

## Purpose

Provide the primary manuscript writing surface for chapter and scene drafting. The editor is a word-processor–style surface: fixed-width page, real margins, no full-bleed canvas.

## Module Location

`src/modules/editor/`

## Architecture

```text
routes/projects/[id]/editor/+page.svelte    — route, lifted TipTap instance
  ├── ManuscriptEditorPane.svelte           — TipTap canvas + bubble menu
  ├── EditorToolbar.svelte                  — PillNav toolbar (Format/Block/Insert/Tools/View)
  └── stores/editor.svelte.ts               — activeSceneId reactive state
services/
  ├── autosave-service.ts                   — debounced scene persistence
  └── scene-repository.ts                  — CRUD via /api/db/scenes
```

## Features

- TipTap 3 rich-text canvas with StarterKit, Underline, Image, Table extensions.
- Bubble menu for inline formatting on selection.
- PillNav toolbar with Format / Block / Insert / Tools / View groups and a Nova copilot button.
- Autosave (debounced, per-scene).
- Scene navigation (sidebar list + prev/next buttons).
- View-in-reader handoff: opens `books/<id>?scene=<sceneId>` scrolled to the current scene.
- Editor typography is user-controllable via Appearance settings (`--editor-font-size` / `--editor-line-height` CSS tokens set by `$lib/stores/appearance.svelte.ts`).
- Story Compass: per-scene goal/obstacle/turn metadata panel.
- Spellcheck toggle (HTML attribute forwarded to TipTap contenteditable).

## Preference Binding

On mount the route calls `appearance.hydrate()` (plan-023 stage-007). This reads `app.editor.fontSize` and `app.editor.lineSpacing` from the SQLite preferences store and applies them as CSS custom properties on `<html>`. `ManuscriptEditorPane` consumes `var(--editor-font-size)` and `var(--editor-line-height)` directly.

## Module Boundaries

Allowed imports (per `eslint-plugin-boundaries`):

- `module-editor` and its routes may import from `lib`, `module-nova`, `module-ai`.
- `module-editor` must NOT import from `module-reader`, `module-project`, or other feature modules directly (use route-level composition instead).

## Design Constraints

- Editor layer is presentation-focused; no business logic or state ownership outside `editor.svelte.ts`.
- All AI invocations go through the Nova panel — no direct AI calls from editor components.
- Performance: TipTap instance is lifted to the route to avoid re-creation on re-render.
