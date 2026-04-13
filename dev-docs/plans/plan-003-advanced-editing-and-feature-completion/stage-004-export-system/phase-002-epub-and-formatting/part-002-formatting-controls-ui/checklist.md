---
part: part-002-formatting-controls-ui
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `src/lib/db/schema.ts` — note current Dexie version before bumping again
- [ ] Read `src/lib/db/db.ts` — plan migration strategy for `export_settings` table (new table, no data migration needed)
- [ ] Read `src/modules/export/types.ts` — confirm `ExportOptions` fields align with `ExportSettings` schema

## Post-Implementation

- [ ] `ExportSettings` interface in `schema.ts` matches spec
- [ ] Dexie version bumped; `export_settings` table declared with index `"id, projectId"`
- [ ] Default record created automatically if none exists for project on first export
- [ ] Export modal loads correct saved settings
- [ ] Settings changes persist on blur/change (no "Save" button needed)
- [ ] Font/size controls disabled for Markdown format
- [ ] All 3 format drivers produce correct output with non-default settings (test with custom font/size/spacing)
- [ ] `pnpm run check` — zero errors; `pnpm run lint` — zero errors
