---
title: Story Bible Shell
slug: part-001-story-bible-shell
part_number: 1
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-002-content-module-shells
stage: stage-003-module-shell-implementation
estimated_duration: 1d
---

## Objective

Create the Story Bible module shell at `src/routes/projects/[id]/bible/`. This delivers a tabbed page structure that writers will use to manage Characters, Locations, Factions, and Lore in later stages. In this part, tabs exist navigation-only; content area shows empty-state placeholders.

## Reference Docs

- Module spec: `novellum-docs/docs/modules/story-bible.md`
- [SvelteKit page load](https://svelte.dev/docs/kit/load)
- [Dexie `where` queries](<https://dexie.org/docs/Table/Table.where()>)
- Data model: `dev-docs/data-model.md` — `characters`, `locations`, `factions` tables

## Implementation Steps

1. Create `src/routes/projects/[id]/bible/+page.ts`:

```ts
import { db } from '$lib/db/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const [characters, locations] = await Promise.all([
		db.characters.where('projectId').equals(params.id).toArray(),
		db.locations.where('projectId').equals(params.id).toArray(),
	]);
	return { characters, locations };
};
```

1. Create `src/routes/projects/[id]/bible/+page.svelte`:
   - Tab bar with tabs: Characters | Locations | Factions | Lore
   - Active tab content area (default: Characters)
   - Each tab shows an empty-state message: "No [entities] yet. Click + to add one."
   - "Add Character" / "Add Location" buttons are non-functional stubs (no-op click handler with `console.log`)
   - Only Characters and Locations tabs need data wired; Factions and Lore can be pure placeholders

## Acceptance Criteria

- [ ] Route `/projects/{id}/bible` renders without errors
- [ ] Tab bar shows all four tabs; clicking switches active tab
- [ ] Empty-state message shows per tab
- [ ] Stub add buttons render (no-op)
- [ ] `pnpm run check` and `pnpm run lint` pass
