---
title: Scene-Grounded Chat
slug: phase-003-scene-grounded-chat
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-003-editor-and-nova-integration
---

## Implementation

Nova chat grounding now reliably uses route-based scene context.

### Changes

- `NovaPanel` passes `activeSceneId` derived from `activeContext.sceneId`.
- `activeContext.sceneId` correctly identifies the scene on `/editor/[sceneId]` routes via `page.params.sceneId`.

### Result

- Conversational chat ('ask' task) now includes the active scene in RAG context even when no `?sceneId` query parameter is present.
- `sceneIntent` store (live editor state) correctly syncs with Nova because `input.activeSceneId` now matches `intentSnapshot.sceneId` on editor routes.

## Quality Gate Checklist

- [x] Scene-grounded RAG active on editor routes? Yes.
- [x] Live intent sync verified? Yes.
