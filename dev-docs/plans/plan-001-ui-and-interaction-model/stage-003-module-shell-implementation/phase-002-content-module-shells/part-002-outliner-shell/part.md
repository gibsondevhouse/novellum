---
title: Outliner Shell
slug: part-002-outliner-shell
part_number: 2
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-002-content-module-shells
stage: stage-003-module-shell-implementation
estimated_duration: 1d
---

## Objective

Create the Outliner module shell at `src/routes/projects/[id]/outline/`. The Outliner is a beat/scene management view. This part delivers the shell page with a vertical list area (empty state) and an "Add Beat" stub action. No drag-and-drop or reordering in this part.

## Reference Docs

- Module spec: `novellum-docs/docs/modules/outliner.md`
- [SvelteKit page load](https://svelte.dev/docs/kit/load)
- [Dexie `where` queries](<https://dexie.org/docs/Table/Table.where()>)
- Data model: `dev-docs/data-model.md` — `scenes` or `beats` table

## Implementation Steps

1. Create `src/routes/projects/[id]/outline/+page.ts`:

```ts
import { db } from '$lib/db/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const beats = await db.beats.where('projectId').equals(params.id).sortBy('order');
	return { beats };
};
```

1. Create `src/routes/projects/[id]/outline/+page.svelte`:
   - Heading: "Outline"
   - Toolbar with an "Add Beat" button (no-op stub — logs to console)
   - If `beats` is empty: empty-state card with message "No beats yet — click Add Beat to start outlining"
   - If `beats` has items: render a vertical list of beat cards (title, type badge) — read-only in this part
   - Beats list must be ordered by `order` field

## Acceptance Criteria

- [ ] Route `/projects/{id}/outline` renders without errors
- [ ] Empty state renders when `beats` is empty
- [ ] Beat list renders (read-only) when beats exist
- [ ] "Add Beat" button renders (no-op)
- [ ] `pnpm run check` and `pnpm run lint` pass
