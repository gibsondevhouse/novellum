---
title: Card Text Hierarchy
slug: part-002-card-text-hierarchy
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-card-structure-and-book-identity
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Apply the full editorial text system to `ProjectCard`'s content block: display-font title, fine teal genre badge, clamped logline, muted meta — and bring `ProjectCreateCard` padding and border-radius into alignment.

## Scope

**In scope:**

- `.card-title`: `font-family: var(--font-display)`, `font-size: var(--text-xl)`, `color: var(--color-text-primary)`, `letter-spacing: var(--tracking-tight)`, `line-height: 1.2`
- `.card-genre`: `color: var(--color-teal)`, `font-size: var(--text-xs)`, `text-transform: uppercase`, `letter-spacing: var(--tracking-widest)`, `font-family: var(--font-sans)`, `font-weight: var(--font-weight-medium)`
- `.card-logline`: `font-size: var(--text-sm)`, `color: var(--color-text-secondary)`, `-webkit-line-clamp: 2` (already exists — confirm still active after layout change), `margin-bottom: var(--space-3)`
- `.card-meta`: `font-size: var(--text-xs)`, `color: var(--color-text-muted)`
- `.card-btn` padding: `var(--space-4)` top/bottom/sides (already exists — confirm still correct)
- `ProjectCreateCard` padding: align to `var(--space-4)` to match new card bodies

**Out of scope:**

- Tag list rendering (projects have one genre string — no tag array)
- Word-count or arc count on the card face (Project Hub scope)

## Implementation Steps

1. In `ProjectCard.svelte`, update `.card-title` CSS to apply `--font-display`, `--tracking-tight`, `line-height: 1.2`
2. Update `.card-genre` CSS to apply `text-transform: uppercase`, `--tracking-widest`, `--font-weight-medium` (or `500`)
3. Verify `.card-logline` `-webkit-line-clamp: 2` and `line-clamp: 2` are still active after structural refactor from Part 001
4. In `ProjectCreateCard.svelte`, align `padding` to `var(--space-4)` and `border-radius` to `var(--radius-md)` so it matches `ProjectCard`
5. Run `pnpm run lint` and `pnpm run check`

## Files

**Update:**

- `src/modules/project/components/ProjectCard.svelte`
- `src/modules/project/components/ProjectCreateCard.svelte`

## Acceptance Criteria

- [ ] Card title renders in DM Serif Display (confirm via DevTools computed `font-family`)
- [ ] Genre badge is uppercase teal with wide letter-spacing
- [ ] Logline is clamped to 2 lines on long text
- [ ] Meta text is clearly muted relative to logline
- [ ] `ProjectCreateCard` appears visually consistent in size and padding with the new card shell
- [ ] Zero lint and type errors

## Edge Cases

- A project with no logline: the `.card-logline` block should not render (already guarded by `{#if project.logline}`) — confirm this is still present after refactor
- A project with no genre: the `.card-genre` block should not render (already guarded by `{#if project.genre}`) — leave as-is
- Very short titles (1–2 words): display-font title should not appear over-spaced; `--tracking-tight` at `--text-xl` is correct

## Notes

- `--font-weight-semibold` is already used on `.card-title` — keep it; DM Serif Display has a single weight face (400 Regular), but `font-weight: 600` will render at 400 automatically (no bold variant). This is acceptable — the display size gives the heading visual weight without a bold cut.
- `--tracking-widest` on genre badge: `0.12em` from `design-system.md` — this is the correct token.
