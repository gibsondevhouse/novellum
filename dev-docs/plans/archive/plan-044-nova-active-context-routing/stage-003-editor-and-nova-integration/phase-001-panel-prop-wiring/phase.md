---
title: Panel Prop Wiring
slug: phase-001-panel-prop-wiring
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-003-editor-and-nova-integration
---

## Implementation

`src/routes/+layout.svelte` has been updated to use the `activeContext` store for prop-drilling into `NovaPanel`.

### Changes

- Removed local `$derived` variables for `activeProjectId`, `activeSceneId`, and `activeChapterId`.
- Imported `activeContext` store.
- Updated `NovaPanel` mount to use store properties.

```html
<NovaPanel
	projectId={activeContext.projectId}
	activeSceneId={activeContext.sceneId}
	activeChapterId={activeContext.chapterId}
/>
```

## Quality Gate Checklist

- [x] Props wired to `activeContext`? Yes.
- [x] Project ID persistence effect updated? Yes.
