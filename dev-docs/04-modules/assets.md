# Module: `assets`

> Last verified: 2026-05-25
> Source: [src/modules/assets/](../../src/modules/assets/)

## Purpose

Asset ingestion and gallery management for project imagery used in manuscript and world-building surfaces.

## v2 Surface Note

Assets UI follows the same warm shell hierarchy and candle-focused interaction states; no standalone color system is maintained in this module.

## Structure

```text
src/modules/assets/
├── components/
└── stores/
```

## Persistence

- `/api/local-files/image`
- `/api/local-files/normalize`
- `assets` table via `/api/db/*`

## Key Tests

- `tests/assets/*`
