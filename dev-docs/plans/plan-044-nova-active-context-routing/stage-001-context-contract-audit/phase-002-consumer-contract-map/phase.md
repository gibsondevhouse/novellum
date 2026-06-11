---
title: Consumer Contract Map
slug: phase-002-consumer-contract-map
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-001-context-contract-audit
---

## Consumer Analysis

The following components and services consume active context. They all currently receive this context via the `NovaPanel` props in `src/routes/+layout.svelte` or directly from `page.url.searchParams`.

### 1. NovaPanel & NovaComposer
- **Contract**: `projectId`, `activeSceneId`, `activeChapterId`.
- **Usage**:
  - `NovaPanel`: Determines which quick prompts to show and whether to render the `NovaAuthorDraftEngine`.
  - `NovaComposer`: Passes context to `sendNovaChat`.
- **Dependency**: Highly sensitive to query-param brittleness in `+layout.svelte`.

### 2. NovaAuthorDraftEngine
- **Contract**: `projectId`, `activeChapterId`.
- **Usage**: Fetches scenes for the chapter and drives the agentic drafting run.
- **Dependency**: Won't show up in the sidebar on chapter-specific routes if `activeChapterId` is missing from the layout's prop-drilling.

### 3. Chat Service (`sendNovaChat`)
- **Contract**: `projectId`, `activeSceneId`, `activeChapterId`.
- **Usage**:
  - `resolveTask`: Picks 'ask' vs 'brainstorm' vs 'write'.
  - `buildRagContext`: Selects the RAG policy (`scene_plus_adjacent`, `outline_scope`, `worldbuilding_scope`).
- **Dependency**: Inaccurate context leads to irrelevant AI grounding or failure to resolve the intended task.

### 4. Scene Intent Store (`sceneIntent`)
- **Contract**: `sceneId`.
- **Usage**: Provides live editor state (intent, word count, signals) to Nova.
- **Verification**: `sendNovaChat` checks if `intentSnapshot.sceneId === input.activeSceneId`. If `activeSceneId` is null (due to routing issues), live intent is never attached to the AI prompt.

## Conclusion

The "Active Context" contract should be centralized and derived from both `page.params` and `page.url.searchParams`. This will ensure Nova remains grounded regardless of whether the user navigates via deep paths or query-string deep links.
