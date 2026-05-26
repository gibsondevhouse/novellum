---
title: Hero Shell & Mode Switcher
slug: part-001-hero-shell-and-mode-switcher
part_number: 1
status: draft
owner: frontend
assigned_to: frontend
phase: phase-001-hero-zone
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Build `WorkspaceHeroShell` (the fixed upper zone container) and `StructureModeSwitcher` (the left/right arrow controls for cycling between Arcs/Acts/Chapters/Scenes), establishing the top-level navigation mechanism for the workspace structural hierarchy.

## Scope

**In scope:**

- `WorkspaceHeroShell` component — outer container that pins to top
- `StructureModeSwitcher` component — mode label + left/right arrows
- Integration with workspace mode store
- Visual styling aligned with Hub hero card language
- Keyboard accessibility for arrow controls

**Out of scope:**

- Hero card content rendering (Part 002)
- Collection zone (Phase 002)
- Scroll behavior (Stage 003)

## Implementation Steps

1. Create `src/modules/workspace/components/WorkspaceHeroShell.svelte`:
   - Accepts a `children` snippet for the hero card content
   - Renders `StructureModeSwitcher` at the top
   - Wraps content in a styled container matching Hub's `.hub-hero` card language
   - Uses `var(--color-surface-raised)`, `var(--radius-lg)`, `var(--space-10)` padding
   - Sets `min-height` to prevent layout jumps (approx 280px)
2. Create `src/modules/workspace/components/StructureModeSwitcher.svelte`:
   - Props: `activeMode: WorkspaceMode`
   - Events: `onPrev: () => void`, `onNext: () => void`
   - Renders: `← [Mode Label] →`
   - Left arrow calls `onPrev`, right arrow calls `onNext`
   - Mode label displays capitalized mode name (e.g., "Arcs", "Acts", "Chapters", "Scenes")
   - Arrows are `<button>` elements with `aria-label="Previous mode"` / `"Next mode"`
   - Subtle arrow styling: muted color, hover brightens, focus ring
3. Style the mode label prominently — it is the primary orientation cue
4. Export both components from workspace module barrel

## Files

**Create:**

- `src/modules/workspace/components/WorkspaceHeroShell.svelte`
- `src/modules/workspace/components/StructureModeSwitcher.svelte`

**Update:**

- `src/modules/workspace/index.ts` — export new components

## Acceptance Criteria

- [ ] `WorkspaceHeroShell` renders a card-styled container matching Hub's hero visual language
- [ ] `StructureModeSwitcher` displays the active mode label between left/right arrow buttons
- [ ] Arrow buttons call `onPrev` / `onNext` callbacks correctly
- [ ] Mode label updates reactively when `activeMode` changes
- [ ] Arrow buttons have accessible `aria-label` attributes
- [ ] Arrow buttons have hover and focus-visible states
- [ ] Shell has stable `min-height` to prevent layout jumps
- [ ] Lint and typecheck pass

## Edge Cases

- Shell should render correctly even when no hero card content is provided (empty children)
- Mode switcher should handle rapid clicks without issues

## Notes

> The `WorkspaceHeroShell` uses a Svelte 5 snippet (`children`) rather than a named slot. This follows the Svelte 5 runes pattern used throughout the codebase.
>
> The shell does NOT handle `position: sticky` itself — that responsibility belongs to the page-level layout in Stage 003. The shell is just the visual card container.
>
> Arrow styling should be subtle — think `var(--color-text-muted)` with `opacity: 0.5` at rest, brightening on hover. They should not compete visually with the mode label or hero card content.
