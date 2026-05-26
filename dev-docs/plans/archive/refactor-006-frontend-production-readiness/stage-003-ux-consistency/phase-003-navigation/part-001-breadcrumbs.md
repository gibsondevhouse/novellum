---
title: Breadcrumb Navigation
slug: part-001-breadcrumbs
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-003-navigation
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.5d
---

## Objective

Add a `<Breadcrumb>` component and integrate it on all deep project routes so users always know where they are and can navigate back to any ancestor screen in one click.

## Scope

**In scope:**

- `src/lib/components/Breadcrumb.svelte` — new reusable component
- Integration on these routes:
  - `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`
  - `src/routes/projects/[id]/world-building/characters/[charId]/+page.svelte`
  - `src/routes/projects/[id]/world-building/lore/[loreId]/+page.svelte` (if it exists)
  - Any other `[id]/[childId]` deep route identified by `find src/routes -name "+page.svelte" -path "*\[*\]*\[*\]*"`

**Out of scope:**

- Animated breadcrumb transitions
- Breadcrumbs on top-level routes (Library, Nova, Images, Settings)

## Implementation Steps

1. Create `src/lib/components/Breadcrumb.svelte`. Props: `items: Array<{ label: string; href?: string }>`. Render as a `<nav aria-label="Breadcrumb"><ol>...</ol></nav>`. The last item is the current page (no `href`, `aria-current="page"`). Use `/` as separator rendered via CSS `::after` pseudo-element — no extra DOM nodes.

2. In `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`:
   - Read `projectId` from `$page.params.id`, scene name/chapter name from the page's `data` object.
   - Render `<Breadcrumb items={[{ label: 'Library', href: '/' }, { label: projectName, href: `/projects/${id}` }, { label: chapterName, href: `/projects/${id}/outline` }, { label: sceneName }]} />`.

3. In `src/routes/projects/[id]/world-building/characters/[charId]/+page.svelte`:
   - Render `<Breadcrumb items={[{ label: 'Library', href: '/' }, { label: projectName, href: `/projects/${id}` }, { label: 'Characters', href: `/projects/${id}/world-building/characters` }, { label: characterName }]} />`.

4. Apply the same pattern to other deep routes identified in step scope.

5. Style `Breadcrumb` with `--text-xs`, `--color-text-muted`, `--tracking-wide`. Items are separated by `›` rendered via CSS. No hardcoded values.

6. Run `pnpm run lint && pnpm run check`.

## Files

**Create:**

- `src/lib/components/Breadcrumb.svelte`

**Update:**

- `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`
- `src/routes/projects/[id]/world-building/characters/[charId]/+page.svelte`
- Any additional deep routes identified by the find command

## Acceptance Criteria

- [ ] `<Breadcrumb>` renders with correct `aria-label="Breadcrumb"` and `aria-current="page"` on the last item.
- [ ] All ancestor breadcrumb items are clickable links navigating to the correct route.
- [ ] Breadcrumbs appear on editor scene and character detail pages.
- [ ] `pnpm run lint && pnpm run check` exit 0.

## Edge Cases

- Project name may not be loaded yet when the breadcrumb mounts. Use a derived reactive value with a fallback of `'Project'` until the name resolves.
- If a route only has two levels (e.g., `/projects/[id]`), do not render breadcrumbs — they add no value at that depth.

## Notes

The breadcrumb `<ol>` is semantically superior to `<ul>` for ordered navigational trails. Use `<ol>` for correct screen reader announcement.
