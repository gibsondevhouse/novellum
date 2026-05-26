---
title: EmptyState Component
slug: part-002-empty-state-component
part_number: 2
status: complete
owner: frontend
assigned_to: frontend
phase: phase-001-feedback-systems
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Create a single reusable `<EmptyState>` primitive and replace all divergent empty-state markup across the application with it.

## Scope

**In scope:**

- `src/lib/components/EmptyState.svelte` — new canonical empty-state component
- Replacing all non-standard empty state implementations across routes and modules:
  - `src/routes/projects/[id]/continuity/+page.svelte` — custom `div`-based empty state
  - `src/routes/projects/[id]/editor/+page.svelte` — string-only empty message
  - Any other route with bespoke empty-state markup (audit with grep)

**Out of scope:**

- Routes already using an `EmptyStatePanel` or `EmptyDetailCard` component — only update these if the new component can be a drop-in replacement without breaking visual output

## Implementation Steps

1. Create `src/lib/components/EmptyState.svelte` with the following props interface:
   - `icon?: string` — SVG icon name or path (optional)
   - `title: string` — primary heading
   - `description?: string` — secondary explanatory text
   - `actionLabel?: string` — optional CTA button label
   - `onAction?: () => void` — optional CTA callback
   Use `--space-*`, `--text-*`, `--color-text-muted`, `--color-text-default` tokens. Centre the content. Use `<GhostButton>` for the optional CTA.

2. Identify all empty-state sites: `grep -rn "empty\|no items\|no results\|nothing here\|get started" src/ --include="*.svelte" -i`.

3. Replace each identified site with `<EmptyState title="..." description="..." />`, matching the existing copy exactly.

4. Run `pnpm run lint && pnpm run check`.

## Files

**Create:**

- `src/lib/components/EmptyState.svelte`

**Update:**

- `src/routes/projects/[id]/continuity/+page.svelte`
- `src/routes/projects/[id]/editor/+page.svelte`
- Any additional files identified in step 2

## Acceptance Criteria

- [ ] `<EmptyState>` renders with `title` only (minimum required prop).
- [ ] `<EmptyState>` renders CTA button when `actionLabel` and `onAction` are provided.
- [ ] Grep for bespoke empty-state markup in the migrated files returns no matches.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- If `EmptyStatePanel` or `EmptyDetailCard` already exists as a component, check whether it can be aliased to `EmptyState` or directly reused — do not create a third variant if one can be extended.

## Notes

The component should be visually consistent with the dark design system. No background fill — transparent, centred layout only.
