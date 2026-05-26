---
part: part-001-editor-sidebar-registration
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Stages 001 and 002 complete
- [ ] Editor route files reviewed; current behavior at `/editor` (no sceneId) understood
- [ ] `part.md` reviewed and accepted

## Implementation

- [ ] `ActiveProjectSection` Editor item verified (href, label, active state)
- [ ] `/editor` landing page renders chapter/scene list
- [ ] Each scene item links to `/editor/[sceneId]`
- [ ] Empty state handled when project has no scenes
- [ ] No header-dependent code in editor route files
- [ ] `[sceneId]` route still renders `DocumentEditorFrame` correctly
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (screenshot of Editor landing page — scene list — with sidebar Editor item active)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
