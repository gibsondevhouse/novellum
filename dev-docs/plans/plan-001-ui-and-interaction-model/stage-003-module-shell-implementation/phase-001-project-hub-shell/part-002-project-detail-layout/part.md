---
title: Project Detail Layout
slug: part-002-project-detail-layout
part_number: 2
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-001-project-hub-shell
stage: stage-003-module-shell-implementation
estimated_duration: 1d
---

## Objective

Implement `src/routes/projects/[id]/+layout.svelte` and its load function. This layout is the parent shell for all per-project routes (Hub, Story Bible, Outliner, Draft Editor). It loads the project record from Dexie, provides it to child routes via layout data, and handles the not-found case gracefully.

## Reference Docs

- [SvelteKit layout data](https://svelte.dev/docs/kit/load#Layout-data)
- [SvelteKit `error` helper](https://svelte.dev/docs/kit/errors)
- [Dexie `table.get()`](<https://dexie.org/docs/Table/Table.get()>)
- Data model: `dev-docs/data-model.md` — `projects` table schema

## Implementation Steps

1. Create `src/routes/projects/[id]/+layout.ts`:

```ts
// src/routes/projects/[id]/+layout.ts
import { error } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
	const project = await db.projects.get(params.id);
	if (!project) {
		error(404, `Project "${params.id}" not found`);
	}
	return { project };
};
```

1. Create `src/routes/projects/[id]/+layout.svelte`:
   - Receive `data.project` from the load function
   - Render a top header bar with `data.project.title`
   - Render a tab bar or secondary nav linking to Hub, Story Bible, Outline, Editor within the project
   - Render `<slot />` (or `{@render children()}` in Svelte 5) for child pages
   - Pass `data.project.id` to the `<Sidebar>` component as `projectId`

1. Create stub child page `src/routes/projects/[id]/+page.svelte` (project hub landing):
   - Render: project title heading, word count, last modified timestamp, empty project stats grid

## Acceptance Criteria

- [ ] `/projects/{id}` loads and renders the project title from Dexie
- [ ] `/projects/nonexistent-id` triggers a 404 error with a user-visible message
- [ ] Sidebar receives `projectId` and shows per-project links
- [ ] Child routes (`/bible`, `/outline`, `/editor`) are accessible via the secondary nav
- [ ] `pnpm run check` and `pnpm run lint` pass
