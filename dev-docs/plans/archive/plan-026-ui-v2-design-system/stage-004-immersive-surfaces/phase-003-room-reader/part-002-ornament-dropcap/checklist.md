# Checklist — Ornament + DropCap

## Pre-implementation

- [x] Confirm `Ornament` and `DropCap` are exported from
      `src/lib/components/ui/index.ts`.
- [x] Confirm tests on `reader-pages.ts` do not deep-equal page objects
      (only type arrays).

## Implementation

- [x] Add optional `isChapterOpener?: boolean` to `ReaderPage`.
- [x] Set `isChapterOpener` on first chunk of first scene during
      pagination.
- [x] Render `Ornament` under `chapter-title` block in `BookPage`.
- [x] Render `DropCap` on opener scene page in `BookPage`.
- [x] Render `Ornament` under chapter title in `ClassicReaderView`.
- [x] Render `DropCap` on `sceneIndex === 0` of each chapter in
      `ClassicReaderView`.

## Gates

- [x] `pnpm check:tokens` — 322/0
- [x] `pnpm check` — 0/0
- [x] `pnpm lint`
- [x] `pnpm lint:css`
- [x] `pnpm test` — 1059/1059
