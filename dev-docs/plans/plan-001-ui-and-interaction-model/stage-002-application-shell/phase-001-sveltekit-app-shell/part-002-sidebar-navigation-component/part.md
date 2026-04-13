---
title: Sidebar Navigation Component
slug: part-002-sidebar-navigation-component
part_number: 2
status: complete
started_at: 2026-04-12
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-001-sveltekit-app-shell
stage: stage-002-application-shell
estimated_duration: 1d
---

## Objective

Build the `Sidebar.svelte` component — the persistent left-panel navigation element that lets writers move between modules within a project. The sidebar must highlight the active route and consume design system tokens for all styling.

## Reference Docs

- [Svelte 5 components](https://svelte.dev/docs/svelte/svelte-component)
- [SvelteKit `$page` store (active route)](https://svelte.dev/docs/kit/modules#$app-stores-page)
- [SvelteKit link options](https://svelte.dev/docs/kit/link-options)
- Design system: `dev-docs/design-system.md`

## Implementation Steps

1. Create `src/lib/components/Sidebar.svelte`:
   - Accept a `projectId: string | null` prop (null on home page, populated inside a project)
   - Render global nav item: **Projects** (links to `/`)
   - When `projectId` is set, render per-project nav items:
     - **Hub** → `/projects/{projectId}`
     - **Story Bible** → `/projects/{projectId}/bible`
     - **Outline** → `/projects/{projectId}/outline`
     - **Editor** → `/projects/{projectId}/editor`
   - Use `$page.url.pathname` to determine the active link and apply an `active` CSS class
   - All colors must use CSS custom properties from `tokens.css` — no hardcoded hex values

2. Update `src/routes/+layout.svelte` to pass `$page.params.id ?? null` as `projectId` to `<Sidebar />`

3. Add a `src/lib/components/index.ts` barrel export for all shared components.

## Acceptance Criteria

- [ ] Sidebar renders on every route without errors
- [ ] Active route link has visually distinct styling (uses `--color-teal` or `--color-nova-blue`)
- [ ] Navigation from Sidebar links uses SvelteKit client-side routing (no full reload)
- [ ] Per-project nav items only appear when a project is active
- [ ] No hardcoded color or spacing values — all from CSS variables
- [ ] `pnpm run check` and `pnpm run lint` pass
