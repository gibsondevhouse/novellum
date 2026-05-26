# Module: `reader`

> Last verified: 2026-05-25
> Source: [src/modules/reader/](../../src/modules/reader/)

## Purpose

Read-only manuscript consumption view with pagination and immersive v2 **Room** presentation.

## v2 Surface Contract

- Two-page parchment spread presentation.
- Ornament + drop-cap rhythm for chapter/scene starts.
- Ember ribbon accents and folio-style cues.
- Prose uses `--font-prose` with ink token family (`--color-ink*`).

## Structure

```text
src/modules/reader/
├── components/        # Reader panes, page shells, spread composition
└── reader-pages.ts    # scene-to-page pagination engine
```

## Routes

- `/books/[id]`

## Key Tests

- `tests/reader/*`
- `tests/visual/view-in-reader-handoff.test.ts`
- `tests/visual/visual-regression.test.ts` (reader scenarios)
