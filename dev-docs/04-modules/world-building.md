# Module: `world-building`

> Last verified: 2026-05-25
> Source: [src/modules/world-building/](../../src/modules/world-building/)

## Purpose

Unified shell for characters, locations, lore, threads, and chronology entities.

## v2 Surface Contract

- Domain tiles and top-section landing use shared candle/teal spotlight direction.
- Lane/index treatments use brass labels and warm separators.
- Inputs, chips, and selection affordances use candle focus tint.

## Structure

```text
src/modules/world-building/
├── components/
├── services/
├── stores/
├── constants.ts
├── types.ts
└── index.ts
```

## Persistence

- `characters`, `character_relationships`, `locations`, `lore_entries`,
  `plot_threads`, `timeline_events`, `milestones` via `/api/db/*`.

## Routes

- `/projects/[id]/world-building/*`
- legacy `/projects/[id]/story-bible` redirect

## Key Tests

- world-building flows are covered across `tests/visual/visual-regression.test.ts`
  and integration/repository suites.
