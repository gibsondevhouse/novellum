# plan-021 Reader Gap Audit

> Generated: 2026-05-27
> Method: plan-021 acceptance criteria vs current reader implementation

## plan-021 Acceptance Themes vs Current State

### Stage 001: Empty State

| Criterion | Evidence | Classification |
|-----------|----------|---------------|
| Branded "no story selected" panel | `BookReaderView.svelte:125` — `.book-reader__empty` div | **shipped** |
| CTA to pick or create a story | BookReaderView empty state content | **shipped** |
| Visual baseline | `tests/visual/__screenshots__/…/reader-empty-state.png` | **shipped** |

### Stage 002: Page Margins & Typography

| Criterion | Evidence | Classification |
|-----------|----------|---------------|
| Real margins using design tokens | `BookPage.svelte`, `BookSpread.svelte` — page geometry components | **shipped** |
| Fixed max text column width (~65-75ch) | `reader-pages.ts` — page-box geometry with configurable dimensions | **shipped** |
| Paperback measure | `reader-pages.ts:56` — page-box height ~880px, ~28 lines | **shipped** |

### Stage 003: Pagination Engine

| Criterion | Evidence | Classification |
|-----------|----------|---------------|
| Split prose into discrete pages | `reader-pages.ts:157` — `chunkSceneContent()` | **shipped** |
| Hard break semantics | `reader-pages.ts:146` — `chunkByPageBox()` respects page-box budget | **shipped** |
| Deterministic client-side chunking | `reader-pages.ts:170` — `chunkByCharBudget()` + `chunkByPageBox()` — no backend pagination | **shipped** |
| Page types: cover, title, toc, chapter-title, scene, end | `reader-pages.ts:1-9` — `ReaderPageType` union | **shipped** |
| Chapter opener / drop-cap support | `reader-pages.ts:28` — `isChapterOpener` field | **shipped** |

### Stage 004: Verification

| Criterion | Evidence | Classification |
|-----------|----------|---------------|
| Pagination logic tests | `tests/reader/reader-pages.test.ts` | **shipped** |
| Deep link test | `tests/reader/classic-reader-deep-link.test.ts` | **shipped** |
| Default view test | `tests/reader/default-reader-view.test.ts` | **shipped** |
| View-in-reader handoff | `tests/visual/view-in-reader-handoff.test.ts` + screenshot | **shipped** |
| Visual baselines | `reader-empty-state.png`, `books-shelf.png` | **shipped** |

### Quality Gates

| Gate | Status |
|------|--------|
| Tests pass | `reader-pages.test.ts`, `classic-reader-deep-link.test.ts`, `default-reader-view.test.ts` all in test suite |
| No backend pagination | Confirmed: `reader-pages.ts` is pure client-side, no `/api/` calls |
| Reader route functional | `src/routes/books/[id]/+page.svelte` + `+page.ts` |

## Additional Components (beyond plan-021 scope)

The reader surface has grown beyond plan-021's original scope through later plans:
- `ClassicReaderView.svelte` — alternate reader layout
- `ReaderExperience.svelte` — experience wrapper
- `ReaderFullscreenShell.svelte` — fullscreen mode
- `reader-controller.ts` — controller layer
- `reader-mode.svelte.ts` — mode store (Svelte 5 rune)

## Summary

**All 4 stages of plan-021 are fully shipped. Zero residual gaps identified.**

The reader implementation covers every acceptance criterion with concrete code and test evidence. The implementation uses deterministic client-side pagination as required — no backend pagination was introduced.
