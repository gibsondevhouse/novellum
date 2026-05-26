---
part: part-002-migration-strategy
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `part-001-complete-entity-schema/part.md` — confirm v2 schema is complete before writing migration
- [ ] Read current `src/lib/db/db.ts` — identify all v1 tables and their current fields
- [ ] Check if any `scenes` rows exist in dev database and decide whether to migrate or reset

## Post-Implementation

- [ ] `.version(2).upgrade()` present in `db.ts`
- [ ] `projectId` backfill logic present for `scenes` (and `beats` if they exist in v1)
- [ ] `resetDb()` function exported from `db.ts` and only callable when `import.meta.env.DEV`
- [ ] Manual test procedure recorded in `evidence/migration-test-YYYY-MM-DD.md`
- [ ] `pnpm run check` exits clean (attach output as evidence)
- [ ] `pnpm run lint` exits clean
