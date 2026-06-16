# Module: `editor`

> Last verified: 2026-06-16
> Source: [src/modules/editor/](../../src/modules/editor/)

## Purpose

The manuscript writing surface (`/projects/[id]/editor*`) with TipTap editing, autosave, snapshot history, and the v2 **Page** presentation.

## v2 Surface Contract

- Primary writing canvas is parchment-based (`--color-parchment*`).
- Body prose uses `--font-prose` (Crimson Pro).
- Scene Rail + chapter/scene context chips follow warm candle/brass accents.
- Toolbar uses pill geometry and warm focus rings (`--color-border-focus`).

## Structure

```text
src/modules/editor/
├── components/    # Editor shell, page frame, toolbar, history panels
├── services/      # autosave, recovery, snapshots, repositories
├── stores/        # editor route/session state
├── types.ts
└── index.ts
```

## Persistence

- `scenes`, `scene_snapshots`, `chapters`, `beats` via `/api/db/*`.
- Debounced autosave writes and crash-recovery rehydration.

## Key Tests

- `tests/editor/*`
- `tests/visual/editor-page-geometry.test.ts`
- `tests/visual/editor-toolbar.test.ts`
