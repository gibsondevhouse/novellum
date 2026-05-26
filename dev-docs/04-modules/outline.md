# Module: `outline`

> Last verified: 2026-05-25
> Source: [src/modules/outline/](../../src/modules/outline/)

## Purpose

Hierarchy workspace for Arc → Act → Chapter → Scene → Beat composition.

## v2 Surface Contract

- Scene rows and hierarchy cards use candle-tinted emphasis states.
- Type badges and structural metadata use brass foreground accents.
- Hover and active affordances follow warm-surface variants.

## Structure

```text
src/modules/outline/
├── components/
├── services/
├── stores/
├── types/
├── types.ts
└── index.ts
```

## Persistence

- `arcs`, `acts`, `chapters`, `scenes`, `beats` + reorder endpoints via `/api/db/*`.

## Key Tests

- `tests/outline/*`
