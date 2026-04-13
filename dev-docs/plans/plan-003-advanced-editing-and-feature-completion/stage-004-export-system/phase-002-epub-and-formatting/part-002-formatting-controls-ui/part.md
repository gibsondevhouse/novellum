---
title: Formatting Controls UI
slug: part-002-formatting-controls-ui
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-002-epub-and-formatting
estimated_duration: 1d
---

## Objective

Build the formatting settings UI in the Export modal and wire it to a new `ExportSettings` Dexie table. All three format drivers must read settings from this table when generating output.

## Context

- `src/modules/export/types.ts` — `ExportOptions`
- `src/lib/db/schema.ts` and `db.ts` — add `ExportSettings` entity (new Dexie version bump)

## Target Files

| File                                                        | Action                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| `src/lib/db/schema.ts`                                      | Update — add `ExportSettings` interface                   |
| `src/lib/db/db.ts`                                          | Update — add `export_settings` table; bump Dexie version  |
| `src/modules/export/services/export-settings-repository.ts` | Create                                                    |
| `src/modules/export/components/ExportModal.svelte`          | Create — export trigger + format selector + settings form |

## ExportSettings Schema

```ts
export interface ExportSettings {
	id: string; // one record per project: use projectId as the id
	projectId: string;
	titlePage: boolean; // default: true
	chapterStyle: 'heading' | 'chapter_number' | 'both'; // default: 'heading'
	fontFamily: string; // default: 'Georgia'
	fontSize: number; // default: 12
	lineSpacing: number; // default: 1.5
	createdAt: string;
	updatedAt: string;
}
```

## Export Modal Controls

| Control       | Type           | Options                                      |
| ------------- | -------------- | -------------------------------------------- |
| Format        | Radio / TabBar | Markdown, DOCX, EPUB                         |
| Title page    | Checkbox       | On/Off                                       |
| Chapter style | Select         | Heading text / Chapter number / Both         |
| Font family   | Select         | Georgia, Times New Roman, Arial, Courier New |
| Font size     | Number input   | 10–18pt                                      |
| Line spacing  | Select         | 1.0, 1.15, 1.5, 2.0                          |

Note: Font family and font size controls are disabled (greyed out) when Markdown is selected, since plain text does not use them.

## Acceptance Criteria

- [ ] `ExportSettings` table in Dexie; default record created on first export if none exists
- [ ] Export modal loads saved settings on open; changes auto-save to Dexie on blur/change
- [ ] All 3 format drivers receive the active `ExportSettings` via `exportProject()` and apply them
- [ ] Font/size controls disabled when Markdown format selected
- [ ] `pnpm run check` exits clean; `pnpm run lint` exits clean
