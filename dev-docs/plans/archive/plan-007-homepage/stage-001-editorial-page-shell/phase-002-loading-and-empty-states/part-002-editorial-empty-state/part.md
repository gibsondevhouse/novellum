---
title: Editorial Empty State
slug: part-002-editorial-empty-state
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-loading-and-empty-states
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Replace the bare "No projects yet" three-liner with a vertically centred editorial composition that uses `--font-display` for the headline and feels like an invitation rather than a UI error condition.

## Scope

**In scope:**

- Rework the `{:else if getProjects().length === 0}` branch in `+page.svelte`
- Headline in `--font-display`, `--text-4xl`, `--tracking-tight`, `--color-text-primary`: `"Every great novel starts somewhere."`
- Sub-copy in `--font-sans`, `--text-base`, `--color-text-muted`: `"Create your first project and begin building your story."`
- Single `.btn-primary` CTA: `"Create Your First Project"`
- Vertical centering: use `min-height: calc(100vh - 200px)` with `display: flex; align-items: center; justify-content: center; flex-direction: column` on the wrapper
- `text-align: center` on the composition
- `max-width: 440px` on the text block to keep it tightly measured

**Out of scope:**

- Illustrations or icon assets
- Animation on empty-state entry

## Implementation Steps

1. In `src/routes/+page.svelte`, replace the `.empty-state` content with the new composition:
   - `h2.empty-title` → `--font-display`, `--text-4xl`, `--color-text-primary`
   - `p.empty-subtitle` → `--font-sans`, `--text-base`, `--color-text-muted`, `margin-bottom: var(--space-6)`
   - `.btn-primary` → unchanged, retains `onclick={() => (showCreateForm = true)}`
2. Update `.empty-state` CSS:
   - `min-height: 60vh`, `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: center`
   - `text-align: center`, `padding: var(--space-8) var(--panel-padding)`
3. Add `.empty-text-block` wrapper with `max-width: 440px` around title and subtitle
4. Remove `.empty-title` and `.empty-subtitle` font-size rules that duplicate token values (use token classes or direct `font-*` properties that reference tokens only)
5. Run `pnpm run lint` and `pnpm run check`

## Files

**Update:**

- `src/routes/+page.svelte`

## Acceptance Criteria

- [ ] Empty state headline renders in DM Serif Display at `~36px` (`--text-4xl`)
- [ ] Composition is vertically centred in the viewport area below the header
- [ ] CTA button still triggers `showCreateForm = true`
- [ ] Text block is max `440px` wide even on wide viewports
- [ ] Zero lint and type errors

## Edge Cases

- On very short viewports (≤568px landscape mobile) the `min-height: 60vh` may clip — reduce to `min-height: 40vh` via media query if needed
- The copy is provisional — do not block this part on copy approval; placeholder copy ships and a future copy-editing pass replaces it

## Notes

- Headline copy: `"Every great novel starts somewhere."` — chosen for brevity and literary tone; replaces `"No projects yet"`
- Sub-copy: `"Create your first project and begin building your story."` — replaces `"Start writing your novel."`
