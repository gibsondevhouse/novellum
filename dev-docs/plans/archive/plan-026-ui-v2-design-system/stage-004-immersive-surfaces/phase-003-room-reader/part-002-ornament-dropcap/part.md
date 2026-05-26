---
title: Ornament + DropCap Chapter Openings
slug: part-002-ornament-dropcap
part_number: 2
status: complete
owner: Stylist Agent
phase: phase-003-room-reader
---

## Scope

Integrate the v2 editorial primitives `Ornament` and `DropCap` into the
reader's chapter openings:

- `BookPage.svelte`: render an `Ornament` under the chapter-title page
  and a `DropCap` on the first chunk of the first scene of each chapter
  (driven by a new `isChapterOpener` flag on `ReaderPage`).
- `ClassicReaderView.svelte`: render an `Ornament` under each chapter
  title and a `DropCap` on the first scene of each chapter.

Implements the candle-lit "first letter" treatment from the v2 kit.

See [`checklist.md`](checklist.md) and [`impl.log.md`](impl.log.md).
