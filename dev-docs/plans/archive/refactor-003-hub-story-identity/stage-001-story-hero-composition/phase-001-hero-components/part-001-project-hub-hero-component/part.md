---
title: ProjectHubHero Component Suite
slug: part-001-project-hub-hero-component
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-hero-components
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Create the four Svelte 5 components that together compose the Hub's story identity hero: `ProjectHubHero`, `ProjectHeroCover`, `ProjectHeroContent`, and `ProjectHeroSynopsis`. These components render the book cover, title, genre tag(s), logline, and full synopsis as one unified composition using design-system tokens exclusively.

## Context

- Current `+page.svelte` at `src/routes/projects/[id]/+page.svelte` has a `.story-block` section showing only cover + logline
- `Project` type is in `src/lib/db/types.ts`: fields include `title`, `genre`, `logline`, `synopsis`, `coverUrl` (if present)
- `openEdit` is already available via `getContext('projectActions')` in `+page.svelte` — the hero receives it as a prop
- Design tokens: `--font-display` for title/logline, `--font-sans` for secondary, `--text-4xl`/`--text-5xl` for title, `--text-lg` for logline, `--text-sm` for synopsis; surfaces use `--color-surface-raised` / `--color-surface-overlay`

## Scope

**In scope:**

- Create `ProjectHubHero.svelte` — two-column grid shell (cover left, content right); accepts `project: Project` and `onEdit: () => void`
- Create `ProjectHeroCover.svelte` — 2:3 aspect-ratio cover block; renders placeholder with `Add Cover` label when no `coverUrl`
- Create `ProjectHeroContent.svelte` — title, genre tag(s), logline, synopsis; uses `ProjectHeroSynopsis`
- Create `ProjectHeroSynopsis.svelte` — full synopsis block, no truncation; shows empty-state prompt when `project.synopsis` is blank
- Export all four from `src/modules/project/index.ts`

**Out of scope:**

- Cover image upload / file picker (placeholder only)
- Hero wiring into `+page.svelte` (→ part-002 of phase-002)

## Implementation Steps

1. Create `ProjectHeroCover.svelte`:
   - Props: `coverUrl?: string`, `onEdit: () => void`
   - Renders `<img>` if `coverUrl` exists; otherwise a styled placeholder `<button>` with "Add Cover" affordance
   - CSS: fixed aspect-ratio `2 / 3`; min-height set via aspect-ratio; `--color-surface-overlay` background; subtle border using `--color-border-default`

2. Create `ProjectHeroSynopsis.svelte`:
   - Props: `synopsis: string`, `onEdit: () => void`
   - Renders full `synopsis` paragraph when present; a ghost button "Add a synopsis" when empty
   - No `max-height`, no `overflow: hidden`, no line-clamp

3. Create `ProjectHeroContent.svelte`:
   - Props: `project: Project`, `onEdit: () => void`
   - Renders: title (`--font-display`, `--text-4xl`), genre tag badge, logline (`--font-display`, `--text-lg`, styled as `<blockquote>`), then `<ProjectHeroSynopsis>`
   - Edit affordance: small ghost icon-button (pencil) top-right of the content column; calls `onEdit()`; visually de-emphasised (opacity 0.5, visible on hover)

4. Create `ProjectHubHero.svelte`:
   - Props: `project: Project`, `onEdit: () => void`
   - CSS grid: `grid-template-columns: 240px 1fr` on desktop; gap `var(--space-10)`
   - Composes `<ProjectHeroCover>` and `<ProjectHeroContent>`
   - Container: `--color-surface-raised` background, `var(--space-10)` padding, border-radius `var(--radius-lg)` if that token exists (else 12px)

5. Update `src/modules/project/index.ts` to export all four components

## Files

**Create:**

- `src/modules/project/components/ProjectHubHero.svelte`
- `src/modules/project/components/ProjectHeroCover.svelte`
- `src/modules/project/components/ProjectHeroContent.svelte`
- `src/modules/project/components/ProjectHeroSynopsis.svelte`

**Update:**

- `src/modules/project/index.ts` — add four new exports

## Acceptance Criteria

- [ ] `ProjectHubHero` composes cover + content without any inline styles or hardcoded colour values
- [ ] `ProjectHeroCover` renders at 2:3 aspect ratio; placeholder is styled with `--color-surface-overlay`
- [ ] `ProjectHeroContent` renders title in `--font-display`, genre as a badge, logline as a display blockquote
- [ ] `ProjectHeroSynopsis` renders the full untruncated synopsis; empty state shows "Add a synopsis" ghost button
- [ ] Edit affordance (pencil icon button) calls `onEdit()` — invisible at rest, visible on hover
- [ ] All four components exported from `src/modules/project/index.ts`
- [ ] Each component ≤150 lines (Svelte template + script combined)
- [ ] `pnpm run check` exits clean

## Edge Cases

- `project.synopsis` is `null` or `''` — empty state renders
- `project.genre` is `''` — genre tag not rendered (no empty badge)
- `project.logline` is `''` — logline replaced with ghost "Add a logline" affordance matching `onEdit` trigger

## Notes

- Do not add `<style>` blocks with class names that collide with existing `.story-content`, `.logline`, or `.cover` classes in `+page.svelte` — those will be removed in phase-002 but naming conflicts should be avoided
- The herocomponents must use the `$props()` rune pattern (Svelte 5) — no `export let` syntax
