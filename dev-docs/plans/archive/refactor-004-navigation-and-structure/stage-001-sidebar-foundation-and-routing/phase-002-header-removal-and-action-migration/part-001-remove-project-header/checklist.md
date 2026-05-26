---
part: part-001-remove-project-header
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Phase 001 (sidebar architecture) is `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready; current project layout is understood

## Implementation

- [ ] `<header class="project-header">` block removed from project layout
- [ ] `<ProjectModeSwitcher />` usage removed from project layout
- [ ] `ProjectModeSwitcher` import removed from project layout
- [ ] Header-related CSS removed from project layout
- [ ] `ProjectModeSwitcher.svelte` file deleted
- [ ] `index.ts` `ProjectModeSwitcher` export removed
- [ ] Grep confirms zero remaining `ProjectModeSwitcher` references in `src/`
- [ ] Content frame (`<slot>` or `<div class="mode-content">`) preserved
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (screenshot showing project layout with no header)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
