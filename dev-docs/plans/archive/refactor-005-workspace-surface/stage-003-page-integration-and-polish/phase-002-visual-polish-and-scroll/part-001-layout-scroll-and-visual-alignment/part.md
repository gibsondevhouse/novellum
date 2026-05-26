---
title: Layout, Scroll & Visual Alignment
slug: part-001-layout-scroll-and-visual-alignment
part_number: 1
status: draft
owner: frontend
assigned_to: frontend
phase: phase-002-visual-polish-and-scroll
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Establish the fixed-hero / independently-scrolling-collection layout, hide the collection zone scrollbar, and ensure the complete Workspace surface visually aligns with the Hub's dark cinematic aesthetic — matching card chrome, spacing, typography, color tokens, and achieving a premium, editorial feel.

## Scope

**In scope:**

- CSS layout for fixed hero + scrolling collection (sticky positioning)
- Hidden scrollbar on collection zone
- Visual audit and alignment with Hub's design tokens
- Consistent spacing, radius, color, typography across all workspace components
- Empty state polish
- Overall feel: premium, structured, consistent

**Out of scope:**

- Responsive / mobile breakpoints (future pass)
- Animation / motion design (future pass)
- Performance optimization

## Implementation Steps

1. Update workspace page layout in `+page.svelte`:
   - Outer container: `display: flex; flex-direction: column; height: 100%`
   - Hero zone: `position: sticky; top: 0; z-index: 10; flex-shrink: 0`
   - Add `background` to hero zone to prevent content bleeding through during scroll
   - Collection zone: `flex: 1; overflow-y: auto; min-height: 0`
   - Hidden scrollbar on collection zone:
     - `.collection-zone::-webkit-scrollbar { display: none }`
     - `.collection-zone { scrollbar-width: none }`
2. Visual audit of `WorkspaceHeroShell`:
   - Match Hub's `.hub-hero`: `background: var(--color-surface-raised)`, `padding: var(--space-10)`, `border-radius: var(--radius-lg)`
   - Ensure mode switcher header integrates cleanly within the hero shell
3. Visual audit of `StructureCrudCard`:
   - Match Hub's `.hub-card`: `background: var(--color-surface-overlay)`, `border: 1px solid var(--color-border-default)`, `border-radius: var(--radius-lg)`
   - Verify padding is dense: `var(--space-4)` instead of hub's `var(--space-6)`
   - Verify text uses correct tokens
4. Visual audit of `CreateStructureCard`:
   - Dashed border: `border: 1px dashed var(--color-border-subtle)`
   - Muted and subordinate appearance
5. Visual audit of empty states:
   - No giant blank panels
   - Polished, intentional messaging
   - Centered within hero card area
6. Overall page spacing:
   - Max-width container matching Hub: `max-width: 1000px; margin: 0 auto`
   - Consistent gap between hero zone and collection zone: `var(--space-6)`
   - Page padding: `var(--space-10) var(--space-6)` matching Hub's `.hub`
7. Test all four modes + empty states visually to confirm consistency

## Files

**Create:**

- None

**Update:**

- `src/routes/projects/[id]/workspace/+page.svelte` — layout CSS additions
- `src/modules/workspace/components/WorkspaceHeroShell.svelte` — visual refinements (if needed)
- `src/modules/workspace/components/StructureCrudCard.svelte` — visual refinements (if needed)
- `src/modules/workspace/components/CreateStructureCard.svelte` — visual refinements (if needed)
- `src/modules/workspace/components/WorkspaceHeroCard.svelte` — visual refinements (if needed)

## Acceptance Criteria

- [ ] Hero zone stays fixed/sticky at top while page scrolls
- [ ] Collection zone scrolls independently below hero
- [ ] No visible scrollbar on collection zone (visually hidden, scroll functional)
- [ ] Hero zone has opaque background preventing content bleed-through
- [ ] Card surfaces match Hub tokens: `--color-surface-overlay`, `--color-border-default`, `--radius-lg`
- [ ] Typography matches Hub: display font for titles, sans for labels, correct text scale
- [ ] Spacing uses design system tokens consistently
- [ ] Max-width container centers page content at 1000px
- [ ] Empty states look intentional and polished, no giant blank areas
- [ ] Overall result feels premium, structured, and visually consistent with Hub
- [ ] Lint and typecheck pass
- [ ] All existing tests still pass

## Edge Cases

- Content taller than viewport: collection zone scrolls, hero stays pinned
- Content shorter than viewport: no unnecessary scroll behavior
- Hero with very long content: `min-height` prevents shrinking, but max-height or scroll within hero may be needed for extreme content

## Notes

> This is the final polish pass. All components should already be functional from Stage 002 and wired from Phase 001 of this stage. This part focuses purely on visual and layout refinement.
>
> Reference the Hub page's CSS as the source of truth for design token usage. The workspace should feel like a sibling surface to the Hub, not a separate design language.
>
> Key Hub CSS classes to reference:
>
> - `.hub` — outer container, max-width, padding, gap
> - `.hub-hero` — hero card surface
> - `.hub-card` — dashboard card chrome
> - `.hub-card__label` — uppercase muted label
> - `.hub-card__value` — large display value
