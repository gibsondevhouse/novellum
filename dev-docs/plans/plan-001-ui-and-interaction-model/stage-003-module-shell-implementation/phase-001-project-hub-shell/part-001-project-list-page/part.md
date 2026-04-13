---
title: Project List Page
slug: part-001-project-list-page
part_number: 1
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-001-project-hub-shell
stage: stage-003-module-shell-implementation
estimated_duration: 1d
---

## Objective

Implement `src/routes/+page.svelte` — the home/landing route. It queries the Dexie `projects` table and renders a card-based grid of projects. Writers can click a card to navigate into a project, or click "New Project" to create one (the create flow is a stub returning a random `id` for now).

## Reference Docs

- [Dexie.js quickstart](https://dexie.org/docs/Tutorial/Getting-started)
- [SvelteKit `load` function](https://svelte.dev/docs/kit/load)
- [Svelte 5 runes — `$state`](https://svelte.dev/docs/svelte/$state)
- Data model: `dev-docs/data-model.md` — `projects` table schema

## Implementation Steps

1. Create `src/routes/+page.ts` as the load function:

```ts
// src/routes/+page.ts
import { db } from '$lib/db/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const projects = await db.projects.toArray();
	return { projects };
};
```

1. Create `src/routes/+page.svelte`:
   - Receive `data.projects` from the load function
   - If `projects` is empty, render an empty state: heading "No projects yet" + "Create Your First Project" button
   - If `projects.length > 0`, render a card grid with: project title, word count, last modified date
   - Each card navigates to `/projects/{project.id}` on click
   - "New Project" button calls a `createProject()` helper in `src/lib/db/projects.ts` (create stub), then navigates to the new project

1. Create `src/lib/db/projects.ts` as a Dexie operation helper:

```ts
import { db } from './db';
import { goto } from '$app/navigation';

export async function createProject(title = 'Untitled Project'): Promise<string> {
	const id = crypto.randomUUID();
	await db.projects.add({ id, title, createdAt: Date.now(), updatedAt: Date.now() });
	return id;
}
```

1. Style using only CSS custom properties from `tokens.css` — no inline styles or hardcoded values.

## Acceptance Criteria

- [ ] `src/routes/+page.ts` load function returns `projects` array from Dexie
- [ ] `src/routes/+page.svelte` renders project grid when projects exist
- [ ] Empty state renders when `projects` is empty
- [ ] "New Project" creates a Dexie record and navigates to `/projects/{id}`
- [ ] Card click navigates to `/projects/{id}`
- [ ] All styles use CSS custom properties
- [ ] `pnpm run check` and `pnpm run lint` pass
