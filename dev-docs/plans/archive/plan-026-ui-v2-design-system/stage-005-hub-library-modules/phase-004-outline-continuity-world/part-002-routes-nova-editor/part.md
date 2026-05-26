---
title: Routes + Nova + Editor Nova-blue Sweep
slug: part-002-routes-nova-editor
part_number: 2
status: complete
owner: Stylist Agent
phase: phase-004-outline-continuity-world
---

## Scope

Finish the legacy `--color-nova-blue` cleanup outside the module
components covered by part-001:

- `src/routes/projects/[id]/world-building/+page.svelte`:
  - Landing radial swapped to candle / teal mix.
  - `.domain-tile__cta` background + border → candle / brass.
  - `.lane-index` → solid brass numeral.
  - `.lane-entry a` link → candle.
- `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`:
  - Editor-page background radial warmed to candle.
  - `.btn-history:hover` warmed.
- `src/modules/editor/components/SceneEditorFrame.svelte`: caret
  colour → candle.
- `src/modules/editor/components/EditorShell.svelte`: `.meter-fill`
  → candle/brass blend (paired with teal session meter).
- `src/modules/editor/components/SceneSignalNudge.svelte`: nudge
  button colour + border + hover → candle / brass mix.
- `src/modules/nova/components/NovaMessageLog.svelte`: error-hint
  link → candle.
- `src/modules/nova/components/NovaComposer.svelte`: send button
  → candle background, brass-blended border, ink text.

Out of scope (intentional):

- `src/routes/styles/+page.svelte` showcase route — Phase 6 doc
  rebuild owns this.

See [`checklist.md`](checklist.md) and [`impl.log.md`](impl.log.md).
