# Module: `export`

> Last verified: 2026-06-16
> Source: [src/modules/export/](../../src/modules/export/)

## Purpose

Exports manuscript content to Markdown, DOCX, and EPUB via a shared assembly pipeline, and preserves the project portability backup path separately.

## v2 Surface Note

Export UI controls use shared v2 chrome primitives (warm surfaces, candle focus state, brass heading accents); export format logic itself is unaffected by visual theme changes.

Plan 039 adds a dedicated manuscript export dialog at [ManuscriptExportDialog.svelte](../../src/modules/export/components/ManuscriptExportDialog.svelte). The project hub `Export manuscript` action opens this dialog. The existing JSON portability flow remains available through [ExportModal.svelte](../../src/modules/export/components/ExportModal.svelte) and is exposed as `Project JSON` from the hub export card.

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
- Manuscript export dialog metadata is ephemeral in Plan 039. Title defaults from the current project; author, subtitle, synopsis, copyright, and dedication are not persisted.

## Supported Formats

- Markdown: [markdown-driver.ts](../../src/modules/export/services/markdown-driver.ts)
- DOCX: [docx-driver.ts](../../src/modules/export/services/docx-driver.ts) using `docx`
- EPUB: [epub-driver.ts](../../src/modules/export/services/epub-driver.ts) using `epub-gen-memory`
- Backup ZIP: [zip-export.ts](../../src/modules/export/services/portability/zip-export.ts), labeled as project backup rather than manuscript output

PDF is not supported by the current export type union.

## Manuscript Profiles

Profiles are defined in [manuscript-profiles.ts](../../src/modules/export/services/manuscript-profiles.ts):

- `standard_manuscript`
- `reader_copy`
- `ebook_draft`
- `plain_text_archive`

Profile defaults control front/back matter defaults in the dialog. Users may override those toggles per export.

## Service Contract

[export-service.ts](../../src/modules/export/services/export-service.ts) accepts either the legacy `ExportOptions` call shape or the Plan 039 `ManuscriptExportRequest`:

- `exportOptions`: format and presentation options.
- `compileOptions`: profile ID, normalized metadata, optional `selectedChapterIds`, and front/back matter toggles.
- `deliveryPreference`: browser download, desktop when available, or auto.

For all-chapter export, `selectedChapterIds` is omitted. An empty `selectedChapterIds` array is rejected so it cannot accidentally mean "export all."

## Delivery

[export-delivery.ts](../../src/modules/export/services/export-delivery.ts) owns browser download and desktop fallback policy. Browser download is the guaranteed path. Desktop save is attempted only when the runtime capability is available; cancellation returns a neutral `cancelled` result rather than an error, and unimplemented desktop shell behavior falls back to browser download.

## Known Future Work

- PDF export requires a confirmed driver and a new plan.
- Native desktop file writing still needs a Tauri capability implementation.
- Custom user profiles and export history are not implemented.
- Metadata persistence is intentionally deferred.

## Key Tests

- [export-service.test.ts](../../src/modules/export/services/export-service.test.ts)
- [export-delivery.test.ts](../../src/modules/export/services/export-delivery.test.ts)
- [export-chapter-options.test.ts](../../src/modules/export/services/export-chapter-options.test.ts)
- [chapter-selection.test.ts](../../src/modules/export/components/chapter-selection.test.ts)
- [ManuscriptExportDialog.test.ts](../../src/modules/export/components/ManuscriptExportDialog.test.ts)
- [manuscript-export.spec.ts](../../tests/e2e/manuscript-export.spec.ts)
