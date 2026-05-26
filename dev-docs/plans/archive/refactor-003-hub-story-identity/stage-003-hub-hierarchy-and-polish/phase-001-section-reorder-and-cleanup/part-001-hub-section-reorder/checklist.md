---
part: part-001-hub-section-reorder
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Stages 001 and 002 complete: hero and metrics carousel both render in page
- [ ] Read current `+page.svelte` in full — identify every wrapper and CSS class to be removed

## Post-Implementation

- [ ] Inspect rendered HTML in browser DevTools: no `.hub-grid`, `.hub-primary`, `.hub-secondary` elements
- [ ] DOM order confirmed: hero → metrics → progress → action-card → metadata
- [ ] Progress bar still shows correct word count and percentage
- [ ] Action card link navigates to `/projects/[id]/editor`
- [ ] Metadata panel shows status, created date, target (no missing fields)
- [ ] `.hub-lower` container is visible in DevTools with correct max-width
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
