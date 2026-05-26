---
part: part-001-wire-hero-into-hub-page
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Phase-001 complete: all 4 hero components created and exported
- [ ] Read current `+page.svelte` in full — note every CSS class that belongs to the old story-block so none are missed
- [ ] Confirm the path alias for `src/modules/project/index.ts` (check `tsconfig.json` or `svelte.config.js`)

## Post-Implementation

- [ ] `<ProjectHubHero>` renders with real project data in browser — title, genre, logline, synopsis all visible
- [ ] Edit modal opens when edit affordance clicked
- [ ] No orphaned CSS class selectors from old story-block in `+page.svelte` style block
- [ ] `+page.svelte` line count ≤150 (`wc -l` output attached)
- [ ] Progress, action-card, metadata sections still render correctly below hero
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
