---
title: Source Basis
slug: plan-039-source-basis
created: 2026-06-01
---

# Source Basis

## Repo Files Consulted

- `dev-docs/plans/plan-039-manuscript-export-ui/plan.md`
- `.github/instructions/plan-conventions.instructions.md`
- `src/modules/export/types.ts`
- `src/modules/export/constants.ts`
- `src/modules/export/services/export-service.ts`
- `src/modules/export/services/manuscript-assembler.ts`
- `src/modules/export/services/manuscript-profiles.ts`
- `src/modules/export/components/ExportModal.svelte`
- `src/modules/export/index.ts`
- `src/lib/desktop/index.ts`
- `src/lib/desktop/tauri-impl.ts`

## Key Findings

1. The skeleton plan objective is correct: this is UI and glue around existing export services, not a new export-driver plan.
2. Supported export formats are `markdown`, `docx`, `epub`, and `backup_zip`.
3. Existing manuscript profiles are `standard_manuscript`, `reader_copy`, `ebook_draft`, and `plain_text_archive`.
4. `exportProject()` currently creates fixed compile options internally. This must change for profile, metadata, and selected chapters to work.
5. `assembleManuscript()` already supports `selectedChapterIds`, so chapter subset selection should use existing assembler behavior.
6. Existing `ExportModal.svelte` is JSON portability oriented. Manuscript export should be dedicated or clearly separated.
7. Browser download behavior exists inline in the existing modal and should be centralized.
8. Desktop capability methods exist, but Tauri implementation may still be placeholder behavior. Fallback is mandatory.

## Planning Convention Findings

- Plan directory must be `dev-docs/plans/<plan-slug>/`.
- Stage directories use `stage-NNN-<slug>/`.
- Phase directories use `phase-NNN-<slug>/`.
- Part directories use `part-NNN-<slug>/`.
- Each part must include `part.md`, `checklist.md`, `impl.log.md`, and `evidence/`.
- Logs are append-only.
- Evidence files should be date-stamped.
