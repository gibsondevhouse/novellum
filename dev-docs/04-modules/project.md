# Module: `project`

> Last verified: 2026-06-16
> Source: [src/modules/project/](../../src/modules/project/)

## Purpose

Project hub/dashboard surface and project-level repository services consumed by outline/editor/world-building flows.

## v2 Surface Contract

- Hub layout follows the six-tile narrative grid direction.
- Spotlight atmosphere blends candle + teal gradient tinting.
- Progress/status chips use warm semantic cues and brass/candle accents.

## Structure

```text
src/modules/project/
├── components/
├── services/      # repositories for arcs/acts/chapters/projects
├── stores/
├── types/
├── constants.ts
└── index.ts
```

## Canonical Repositories

- `arc-repository.ts`
- `act-repository.ts`
- `chapter-repository.ts`
- `project-repository.ts`

## Key Tests

- `tests/project/*`
- `tests/repositories/*`
- visual hub coverage in `tests/visual/visual-regression.test.ts`
