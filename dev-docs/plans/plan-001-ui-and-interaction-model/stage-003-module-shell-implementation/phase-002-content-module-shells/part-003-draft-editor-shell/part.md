---
title: Draft Editor Shell
slug: part-003-draft-editor-shell
part_number: 3
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-002-content-module-shells
stage: stage-003-module-shell-implementation
estimated_duration: 1d
---

## Objective

Create the Draft Editor shell at `src/routes/projects/[id]/editor/`. This page will host the primary prose writing experience. In this part, the shell renders: a document-selection sidebar listing all drafts/scenes, a central editing area (plain `<textarea>` as placeholder for the rich-text editor), and an AI panel placeholder div (to be activated in stage-004).

## Reference Docs

- Module spec: `novellum-docs/docs/modules/editor.md`
- [SvelteKit page load](https://svelte.dev/docs/kit/load)
- [Svelte 5 `$state` rune](https://svelte.dev/docs/svelte/$state)
- [Dexie `where` queries](<https://dexie.org/docs/Table/Table.where()>)
- Data model: `dev-docs/data-model.md` — `scenes` table (contains prose content)

## Implementation Steps

1. Create `src/routes/projects/[id]/editor/+page.ts`:

```ts
import { db } from '$lib/db/db';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const scenes = await db.scenes.where('projectId').equals(params.id).toArray();
	return { scenes };
};
```

1. Create `src/routes/projects/[id]/editor/+page.svelte`:
   - Three-panel layout: document list (left), editor area (center), AI panel (right — hidden/collapsed by default)
   - Document list: shows each scene title; clicking selects it and sets `activeSceneId` in `$state`
   - Editor area: `<textarea>` displaying `activeScene.content` (read-only in this part — no save yet)
   - If no scenes: center area shows empty state "No scenes yet — add one from the Outline"
   - AI panel: a placeholder `<aside>` with class `ai-panel` and text "AI Assistant (stage 4)"
   - AI panel toggle button in the toolbar (no-op for now)

1. Create `src/lib/stores/editor.svelte.ts` with a basic rune-based store:

```ts
// src/lib/stores/editor.svelte.ts
let activeSceneId = $state<string | null>(null);

export const editorStore = {
	get activeSceneId() {
		return activeSceneId;
	},
	setActiveScene(id: string | null) {
		activeSceneId = id;
	},
};
```

## Acceptance Criteria

- [ ] Route `/projects/{id}/editor` renders without errors
- [ ] Three-panel layout renders (document list, editor area, AI panel placeholder)
- [ ] Clicking a scene in the document list updates `activeSceneId`
- [ ] Empty state renders when `scenes` is empty
- [ ] AI panel placeholder renders with correct class (`ai-panel`) for stage-004 hook-in
- [ ] `src/lib/stores/editor.svelte.ts` store created
- [ ] `pnpm run check` and `pnpm run lint` pass
