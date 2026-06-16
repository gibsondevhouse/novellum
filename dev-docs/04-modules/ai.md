# Module: `ai`

> Last verified: 2026-06-16
> Source: [src/modules/ai/](../../src/modules/ai/)

## Purpose

UI composition layer for embedded AI interactions (suggestions, rewrites, actions) on feature surfaces.

## v2 Surface Contract

- Suggestion overlays use candle-on-ink primary actions.
- Rewrite/assist mode badges follow warm chip treatments.
- Embedded AI cards align with the shared warm-surface hierarchy.

## Structure

```text
src/modules/ai/
├── components/
├── services/
├── types.ts
└── index.ts
```

## Relationship to `src/lib/ai`

- `src/modules/ai` handles author-facing UI wiring.
- `src/lib/ai` handles PromptBuilder, ContextEngine, task resolution,
  model routing, and parsing contracts.

## Key Tests

- `tests/ai/*`
- visual overlays are covered in visual regression suites.
