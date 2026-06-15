# Export Contract Inventory — 2026-06-02

Inspected source:

- `src/modules/export/types.ts`
- `src/modules/export/constants.ts`
- `src/modules/export/services/export-service.ts`
- `src/modules/export/services/manuscript-assembler.ts`
- `src/modules/export/services/manuscript-profiles.ts`
- `src/modules/export/services/markdown-driver.ts`
- `src/modules/export/services/docx-driver.ts`
- `src/modules/export/services/epub-driver.ts`
- `src/modules/export/services/portability/zip-export.ts`

Supported `ExportFormat` values:

- `markdown` -> Markdown driver, `.md`, `text/markdown`
- `docx` -> DOCX driver, `.docx`
- `epub` -> EPUB driver, `.epub`
- `backup_zip` -> project backup ZIP driver, `.novellum.zip`

Supported manuscript profiles:

- `standard_manuscript`: front matter on, back matter off
- `reader_copy`: front matter on, back matter on
- `ebook_draft`: front matter on, back matter on
- `plain_text_archive`: front matter off, back matter off

Pre-implementation gaps found:

- `exportProject()` received `ExportOptions` but built fixed `reader_copy` compile options.
- Metadata used project title plus empty author.
- `selectedChapterIds` was not accepted by the UI-to-service contract.
- Empty `selectedChapterIds` would have been unsafe if passed directly to the assembler because assembler filtering only applied for non-empty arrays.

Plan 039 implementation closed those gaps with `ManuscriptExportRequest`, metadata normalization, and explicit empty-selected-list rejection.
