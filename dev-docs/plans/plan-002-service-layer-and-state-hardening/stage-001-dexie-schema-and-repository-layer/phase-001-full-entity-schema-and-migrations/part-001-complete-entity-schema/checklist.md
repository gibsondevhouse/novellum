---
part: part-001-complete-entity-schema
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `dev-docs/data-model.md` in full — note every entity's fields, types, and optionality
- [ ] Read current `src/lib/db/schema.ts` — identify what already exists vs what is missing
- [ ] Read current `src/lib/db/db.ts` — note current Dexie version number and declared tables
- [ ] Confirm that bumping to version 2 will not corrupt data for any existing table that has changed columns (check: only new tables are being added; no existing table structure changes)
- [ ] Confirm that `dev-docs/modular-boundaries.md` allows `schema.ts` and `db.ts` to live in `src/lib/db/` (they do — `src/lib/` is the shared layer)

## Post-Implementation

- [ ] All entity interfaces in `schema.ts` match fields in `data-model.md` exactly (no extra or missing fields)
- [ ] Every interface has `id: string`, `createdAt: string`, `updatedAt: string`
- [ ] All project-scoped entities have `projectId: string`
- [ ] `db.ts` version is `2`; all 10 tables declared with correct index strings
- [ ] `pnpm run check` output shows zero errors (attach as evidence)
- [ ] `pnpm run lint` output shows zero errors
