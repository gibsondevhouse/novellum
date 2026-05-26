# Modules

> Last verified: 2026-05-07

One page per shipped slice under [src/modules/](../../src/modules/). Each page describes purpose, public API (re-exports from `index.ts`), structure, and key tests. Modules are private by default — only barrel-exported symbols are public.

| Module | Status | Page |
| --- | --- | --- |
| ai | shipped | [ai.md](./ai.md) |
| assets | shipped | [assets.md](./assets.md) |
| continuity | shipped | [continuity.md](./continuity.md) |
| editor | shipped | [editor.md](./editor.md) |
| export | shipped | [export.md](./export.md) |
| nova | shipped (active in plan-023) | [nova.md](./nova.md) |
| outline | shipped | [outline.md](./outline.md) |
| project | shipped | [project.md](./project.md) |
| reader | shipped | [reader.md](./reader.md) |
| settings | shipped (active in plan-022) | [settings.md](./settings.md) |
| world-building | shipped | [world-building.md](./world-building.md) |
| story-bible | **deprecated** (legacy redirect → world-building) | [story-bible.md](./story-bible.md) |

For boundary rules and the canonical module layout, see [../02-architecture/modular-boundaries.md](../02-architecture/modular-boundaries.md).
