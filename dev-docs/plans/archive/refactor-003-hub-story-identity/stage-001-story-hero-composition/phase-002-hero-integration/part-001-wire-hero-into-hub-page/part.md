---
title: Wire Hero into Hub Page
slug: part-001-wire-hero-into-hub-page
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-hero-integration
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Replace the current `.story-block` + `.hub-primary` markup in `+page.svelte` with a single `<ProjectHubHero>` component. Forward `project` and `openEdit` correctly. Remove the now-superseded story-block CSS from the scoped `<style>` block.

## Context

- `src/routes/projects/[id]/+page.svelte` currently has ~165+ lines; the hero integration must keep it ≤150 lines by extracting presentation into components (which this phase does)
- The `openEdit` function lives in `getContext('projectActions')` — it must be passed as `onEdit` prop to `ProjectHubHero`
- The `.hub-grid` layout currently places `.hub-primary` (3fr) and `.hub-secondary` (2fr) side by side; after this part the grid can be simplified to a single-column stack once the hero is in a component

## Scope

**In scope:**

- Import and render `ProjectHubHero` in `+page.svelte`
- Remove `.story-block`, `.story-content`, `.cover`, `.logline`, `.logline-empty`, `.story-content-label` markup and CSS
- Simplify the outer `.hub-grid` to no longer use a two-column layout for the hero (hero is self-contained)

**Out of scope:**

- Responsive breakpoints (→ part-002)
- Metrics carousel (→ stage-002)

## Implementation Steps

1. In `+page.svelte`, add import: `import { ProjectHubHero } from '$modules/project'` (or the resolved path alias)
2. Replace the `<section class="story-block">` block with `<ProjectHubHero project={project} onEdit={openEdit} />`
3. Remove the corresponding CSS from the `<style>` section: `.story-block`, `.cover`, `.cover-placeholder`, `.cover-label`, `.story-content`, `.story-content-label`, `.logline`, `.logline-empty`
4. Flatten the outer layout: instead of two-column `.hub-grid`, use a `.hub` flex column where `ProjectHubHero` sits at top, followed by the progress section, action card, and metadata

## Files

**Update:**

- `src/routes/projects/[id]/+page.svelte`

## Acceptance Criteria

- [ ] `<ProjectHubHero>` renders in the Hub page with correct `project` data
- [ ] Clicking the edit affordance in the hero opens the `EditProjectForm` modal
- [ ] Old `.story-block` markup and CSS fully removed from `+page.svelte`
- [ ] `+page.svelte` is ≤150 lines after this change
- [ ] `pnpm run check` exits clean; `pnpm run lint` exits clean
- [ ] Hub page still shows progress bar, action card, and metadata beneath the hero

## Edge Cases

- `project.synopsis` is empty — hero empty state renders; no crash
- `project.genre` is empty — no badge renders; no empty div gap

## Notes

- After this part the `.hub-grid` grid can be removed; layout above the progress section becomes a flex column with `gap: var(--space-8)` rather than a CSS grid
