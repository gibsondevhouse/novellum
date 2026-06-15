---
title: Draft Engine Readiness
slug: phase-002-draft-engine-readiness
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-003-editor-and-nova-integration
---

## Implementation

`NovaAuthorDraftEngine` visibility and context have been hardened.

### Changes in `NovaPanel.svelte`

- **Inclusive Routing**: `isEditorRoute` updated to `+/editor(\/|$)/` to include deep editor routes.
- **Chapter Route Support**: `isChapterRoute` added to match `/chapters/[chapterId]` routes.
- **Visibility Extension**: Draft Engine now shows on both editor and chapter routes.

### Context Resolution

`activeContext.chapterId` now resolves from:
1.  `?chapterId=...` (query)
2.  `page.params.chapterId` (route param)
3.  `page.data.chapter.id` (SvelteKit page data)

This ensures that even on `/editor/[sceneId]` routes, Nova can find the chapter ID from the page data and enable the Draft Engine for that chapter.

## Quality Gate Checklist

- [x] Draft Engine visible on deep editor routes? Yes.
- [x] Draft Engine visible on chapter outline routes? Yes.
- [x] Chapter context correctly passed? Yes (verified via `activeContext` test).
