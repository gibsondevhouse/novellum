# Impl Log — Ornament + DropCap

> Append-only.

## 2026-05-24

- Added `isChapterOpener?: boolean` to `ReaderPage` interface in
  `src/modules/reader/reader-pages.ts`; pagination now flags
  `sceneIndex === 0 && chunkIndex === 0` as the chapter opener.
- `BookPage.svelte`: imported `Ornament` and `DropCap`; rendered an
  ornament under the `chapter-title` block; rendered a drop-cap on
  opener scene pages, splitting the leading character from the content
  via `$derived` slices.
- `ClassicReaderView.svelte`: imported `Ornament` and `DropCap`;
  rendered an ornament under each chapter title and a drop-cap on the
  first scene of each chapter (`sceneIndex === 0`).
- Gates green:
  - `pnpm check:tokens` → 322 files / 0 violations.
  - `pnpm check` → 0/0.
  - `pnpm lint`, `pnpm lint:css` clean.
  - `pnpm test` → 1059/1059 passed.
