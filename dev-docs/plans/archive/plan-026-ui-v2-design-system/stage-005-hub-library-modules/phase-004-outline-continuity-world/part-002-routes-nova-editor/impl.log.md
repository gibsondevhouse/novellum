# Impl Log — Routes + Nova + Editor

## 2026-05-24

- Removed `--color-nova-blue` references from:
  - `src/routes/projects/[id]/world-building/+page.svelte`
    (landing radial, CTA, lane index, lane entry link).
  - `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`
    (page-level radial + history hover).
  - `src/modules/editor/components/SceneEditorFrame.svelte`
    (caret).
  - `src/modules/editor/components/EditorShell.svelte`
    (`.meter-fill`).
  - `src/modules/editor/components/SceneSignalNudge.svelte`
    (`.nudge-btn--nova` + hover).
  - `src/modules/nova/components/NovaMessageLog.svelte`
    (`.nova-error-hint a`).
  - `src/modules/nova/components/NovaComposer.svelte`
    (`.nova-action-send` recoloured to candle/brass on ink).
- Visual: AI surfaces now read warm candle + brass, paired with
  ink text on send, consistent with v2 anatomy.
- Remaining nova-blue references live only in
  `src/routes/styles/+page.svelte` (the design-system showcase) —
  deferred to Phase 6 doc rebuild.
- Gates: `pnpm check:tokens` 322/0, `pnpm check` 0/0, `pnpm lint`
  clean, `pnpm lint:css` clean, `pnpm test` 1059/1059.
