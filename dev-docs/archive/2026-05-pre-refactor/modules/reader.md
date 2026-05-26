# Reader

## Purpose

Provide the long-form reading surface for finished or in-progress
manuscripts. Lets authors read their own work as a real book —
margined pages, real page breaks, and a graceful empty state when
nothing readable exists yet.

## Features

- Two-page book spread (single-page on narrow viewports)
- Deterministic pagination with anti-orphan/anti-widow rules
- Cover, title, table of contents, chapter, scene, and end pages
- Empty state for projects with no readable scene content
- Persisted page position per book
- Optional `targetPageId` deep-link prop for the editor → reader handoff
- Keyboard navigation (← / →) and persistent prev/next controls

## Requirements

- Determinism: identical input must yield identical pagination on
  every device. No reliance on font-load timing, sub-pixel
  rounding, or browser paged-media support.
- Tauri-safe: no dependence on `@page` screen rendering or
  multi-column hacks; pure JS chunking only.
- Virtualization: at most two `BookPage` instances are mounted at
  any time, regardless of manuscript length.
- Page geometry sourced from design tokens (`--reader-*`) so the
  pagination math and the visible page box stay in sync.

## Pagination Contract

The pagination engine lives at
[`src/modules/reader/reader-pages.ts`](../../src/modules/reader/reader-pages.ts)
and exposes:

- `buildReaderPages(project, chapters, options?)` — build the full
  page array for a project.
- `chunkSceneContent(text, options?)` — split a scene into pages.
- `ReaderPageBox` — explicit page-box geometry (`linesPerPage`,
  `charsPerLine`, optional `minTrailingLines`).
- `DEFAULT_READER_PAGE_BOX` — defaults aligned with stage-002
  reader typography (28 lines × 64 chars, min 2 trailing lines).

When `options.pageBox` is supplied the engine uses line-aware
accounting plus an anti-orphan rule that pushes a paragraph to the
next page rather than leaving a sub-`minTrailingLines` widow at
the top. When omitted it falls back to the legacy character-budget
heuristic.

Strategy decision and trade-off analysis live in
[`dev-docs/plans/plan-021-reader-pagination/research/strategy-spike.md`](../plans/plan-021-reader-pagination/research/strategy-spike.md).

## Constraints

- The reader must never auto-edit the manuscript; it consumes
  scene HTML and renders prose only.
- Empty states route the user back to the originating project hub
  or the books shelf; they do not silently create content.
- Reader prose typography uses the `--reader-prose-*` tokens, not
  the editor body stack.
