---
title: Responsive Hero Layout
slug: part-002-responsive-hero-layout
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-hero-integration
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Apply responsive CSS to `ProjectHubHero` so that the cover + content two-column layout degrades gracefully to a single-column mobile stack. Cover appears above content on narrow screens. All existing design-system spacing and surface tokens must be preserved at every breakpoint.

## Context

- `ProjectHubHero.svelte` uses a CSS grid: `grid-template-columns: 240px 1fr`
- Target breakpoints (from design system conventions):
  - Desktop: ≥1024px — full two-column hero, cover `240px` wide
  - Tablet: 641px–1023px — cover `180px` wide, tighter gap
  - Mobile: ≤640px — single column (`grid-template-columns: 1fr`), cover stacks above content, cover max-width 200px centred

## Scope

**In scope:**

- Responsive CSS for `ProjectHubHero.svelte` (`<style>` block media queries)
- Responsive CSS for `ProjectHeroCover.svelte` — adjust aspect ratio behaviour on mobile
- Confirm `ProjectHeroContent` title/logline type scale still readable at mobile width

**Out of scope:**

- Responsive metrics carousel (→ stage-002)
- Responsive lower-section layout (→ stage-003)

## Implementation Steps

1. In `ProjectHubHero.svelte` `<style>` block:

```css
.hero-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-10);
  align-items: start;
}

@media (max-width: 1023px) {
  .hero-grid { grid-template-columns: 180px 1fr; gap: var(--space-6); }
}

@media (max-width: 640px) {
  .hero-grid { grid-template-columns: 1fr; gap: var(--space-6); }
}
```

1. In `ProjectHeroCover.svelte` on mobile: `max-width: 200px; margin-inline: auto;` to center the cover above the text

1. Verify title scale: `--text-4xl` (36px) may need to reduce to `--text-3xl` (30px) at ≤640px via a media query in `ProjectHeroContent.svelte`

## Files

**Update:**

- `src/modules/project/components/ProjectHubHero.svelte`
- `src/modules/project/components/ProjectHeroCover.svelte`
- `src/modules/project/components/ProjectHeroContent.svelte`

## Acceptance Criteria

- [ ] Desktop (≥1024px): two-column layout with 240px cover
- [ ] Tablet (768px): two-column layout with 180px cover, tighter gap
- [ ] Mobile (375px): cover stacks above content, cover centred, title readable
- [ ] No overflow or horizontal scroll introduced at any breakpoint
- [ ] Screenshots at all three breakpoints added to `evidence/`
- [ ] `pnpm run check` exits clean

## Notes

- Use CSS `@media` inside scoped `<style>` blocks — no Svelte reactive breakpoint stores
- Tablet breakpoint screenshot can be taken via browser DevTools responsive mode
