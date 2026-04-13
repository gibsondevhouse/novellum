---
part: part-002-scene-beat-repository
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] `part-001-project-chapter-repository` is `complete`
- [ ] `scenes` and `beats` tables confirmed in Dexie v2 schema with correct indexes

## Post-Implementation

- [ ] `scene-repository.ts` and `beat-repository.ts` created with all exports listed in `part.md`
- [ ] Index queries (by `chapterId`, by `projectId`) use Dexie `.where()` — not in-memory filter
- [ ] `updatedAt` set on every update call
- [ ] `pnpm run check` exits clean (evidence attached)
- [ ] `pnpm run lint` exits clean
