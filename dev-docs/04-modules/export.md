# Module: `export`

> Last verified: 2026-05-25
> Source: [src/modules/export/](../../src/modules/export/)

## Purpose

Exports manuscript content to DOCX, EPUB, Markdown, and TXT via a shared assembly pipeline.

## v2 Surface Note

Export UI controls use shared v2 chrome primitives (warm surfaces, candle focus state, brass heading accents); export format logic itself is unaffected by visual theme changes.

## Structure

```text
src/modules/export/
├── components/
├── services/
├── constants.ts
├── types.ts
└── index.ts
```

## Persistence

- `export_settings` via `/api/db/export_settings`

## Drivers

- DOCX: `docx`
- EPUB: `epub-gen-memory`
- Markdown/TXT: in-module writers

## Key Tests

- `tests/export/*`
