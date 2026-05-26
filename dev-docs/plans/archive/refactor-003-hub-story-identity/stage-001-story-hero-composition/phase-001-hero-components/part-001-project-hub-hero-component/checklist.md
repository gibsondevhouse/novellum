---
part: part-001-project-hub-hero-component
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `src/lib/db/types.ts` — confirm all `Project` fields used in hero (`title`, `genre`, `logline`, `synopsis`, `coverUrl`)
- [ ] Read `src/modules/project/index.ts` — note current exports to avoid collision
- [ ] Read `dev-docs/design-system.md` — confirm exact token names for font, text-size, surface, border, spacing tokens
- [ ] Check that `--font-display` is loaded (DM Serif Display via Google Fonts in app.html or CSS)

## Post-Implementation

- [ ] `ProjectHubHero.svelte` renders without TypeScript errors
- [ ] `ProjectHeroCover.svelte` shows placeholder at correct 2:3 aspect ratio (screenshot)
- [ ] `ProjectHeroContent.svelte` shows title, genre badge, logline, and synopsis in correct visual hierarchy
- [ ] `ProjectHeroSynopsis.svelte` shows full text with no truncation — resize browser to verify no overflow:hidden
- [ ] Edit pencil button invisible at rest, visible on hover — verify behaviour in browser
- [ ] All four components added to `src/modules/project/index.ts` exports
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
- [ ] Each component ≤150 lines (run `wc -l` on each; attach output)
