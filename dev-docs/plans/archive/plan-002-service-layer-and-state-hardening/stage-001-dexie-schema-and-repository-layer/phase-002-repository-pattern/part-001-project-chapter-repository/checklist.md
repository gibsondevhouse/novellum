---
part: part-001-project-chapter-repository
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `phase-001-full-entity-schema-and-migrations` — verify both parts are `complete`
- [ ] Read `src/lib/db/db.ts` — confirm `projects` and `chapters` tables exist in v2 schema
- [ ] Read `src/lib/db/schema.ts` — confirm `Project` and `Chapter` interfaces are exported
- [ ] Read `dev-docs/modular-boundaries.md` — confirm `src/modules/project-hub/services/` is the correct location

## Post-Implementation

- [ ] `project-repository.ts` created at correct path with all 5 exports
- [ ] `chapter-repository.ts` created at correct path with all 5 exports
- [ ] Both use `crypto.randomUUID()` for `id` generation
- [ ] Both set `updatedAt` on every update operation
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean (no boundary violations)
