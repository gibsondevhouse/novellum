---
part: part-002-structural-metrics-carousel
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Part-001-structural-metric-card complete and exported
- [ ] Part-001-hub-metrics-service complete and exported
- [ ] Stage-001 complete: hero renders in Hub page (`+page.svelte` already updated)

## Post-Implementation

- [ ] Carousel renders below hero with 4 cards in a row (desktop screenshot to evidence)
- [ ] Arcs and Acts display "–" — confirm no console errors
- [ ] Chapters count matches actual Dexie chapter count — verify by adding a chapter in dev and refreshing
- [ ] Scenes count matches actual Dexie scene count — verify similarly
- [ ] Mobile horizontal scroll functions — swipe or drag to confirm (mobile screenshot to evidence)
- [ ] Loading skeleton visible briefly on first load (slow network in DevTools if needed)
- [ ] `+page.svelte` still ≤150 lines after adding the carousel import and element (`wc -l` output)
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
