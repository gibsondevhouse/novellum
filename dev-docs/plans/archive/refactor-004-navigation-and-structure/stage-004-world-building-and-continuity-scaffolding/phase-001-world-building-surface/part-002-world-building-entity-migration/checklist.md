---
part: part-002-world-building-entity-migration
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `part-001-world-building-route-scaffold` is `complete`
- [ ] All Bible entity routes reviewed and understood
- [ ] `part.md` reviewed and accepted

## Implementation

- [ ] Entity detail sub-routes created for all five types under `/world-building/`
- [ ] Redirects from all `/bible/**` routes to `/world-building/**` routes added
- [ ] Grep for hardcoded `/bible` paths in components — all updated
- [ ] Characters full CRUD verified on new route
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (screenshot of Characters detail page at `/world-building/characters/[id]`)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
