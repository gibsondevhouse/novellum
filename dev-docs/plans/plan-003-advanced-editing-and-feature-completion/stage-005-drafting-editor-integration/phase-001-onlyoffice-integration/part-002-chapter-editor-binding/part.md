---
title: Chapter Editor Binding
slug: part-002-chapter-editor-binding
part_number: 2
status: complete
owner: Frontend Agent
phase: phase-001-onlyoffice-integration
estimated_duration: 1d
---

## Objective

Bind the editor (ONLYOFFICE or TipTap, per part-001 decision) bidirectionally to `scene.text` in Dexie: loading a scene pre-populates the editor with stored text; the editor exposes a change event that feeds into the autosave service (phase-002).

## Context

- `src/modules/editor/components/DocumentEditorFrame.svelte` (from part-001)
- `src/modules/outliner/services/scene-repository.ts` — `getById()` for initial load
- `src/modules/editor/stores/editor-store.ts` — extend with `activeScene`, `pendingText`

## Target Files

| File                                                           | Action                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/routes/(app)/projects/[id]/editor/[sceneId]/+page.svelte` | Create (≤150 lines)                                                   |
| `src/modules/editor/stores/editor-store.ts`                    | Update — add `activeScene`, `pendingText` reactive state              |
| `src/modules/editor/components/DocumentEditorFrame.svelte`     | Update — accept `initialContent` prop; emit `on:contentChange` events |

## Binding Contract

```ts
// editor route loads scene
const scene = await SceneRepository.getById(params.sceneId)
editorStore.setActiveScene(scene)

// DocumentEditorFrame takes initialContent and dispatches changes
<DocumentEditorFrame
  initialContent={scene.text}
  on:contentChange={(e) => editorStore.setPendingText(e.detail)}
/>
```

`editorStore.pendingText` is consumed by the autosave service (phase-002) — this part only sets up the store fields; autosave wiring is deferred to part-001-autosave-service.

## Acceptance Criteria

- [ ] `/projects/[id]/editor/[sceneId]` route exists and loads the scene from Dexie
- [ ] Editor pre-populated with `scene.text` on mount (empty string if `scene.text` is null/empty)
- [ ] Editing text dispatches `contentChange` events; `editorStore.pendingText` updates reactively
- [ ] Navigating away and back to the same scene shows the last-persisted text (not the in-memory draft — autosave persistence is phase-002's job)
- [ ] Scene title and chapter breadcrumb shown in editor header
- [ ] `pnpm run check` exits clean; `+page.svelte` ≤150 lines
