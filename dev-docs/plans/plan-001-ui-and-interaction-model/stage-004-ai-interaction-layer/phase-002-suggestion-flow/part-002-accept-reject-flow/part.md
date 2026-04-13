---
title: Accept / Reject Flow
slug: part-002-accept-reject-flow
part_number: 2
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-002-suggestion-flow
stage: stage-004-ai-interaction-layer
estimated_duration: 0.75d
---

## Objective

Add Accept, Reject, and Regenerate controls to `AiPanel.svelte`. Accepting appends the suggestion to the active scene's content and persists to Dexie. Rejecting clears the panel. Regenerating fires a fresh context-assembled request. This is the final interaction loop of the AI feature.

## Reference Docs

- [Dexie `table.update()`](<https://dexie.org/docs/Table/Table.update()>)
- [Svelte 5 `$state` rune](https://svelte.dev/docs/svelte/$state)
- Stage-003 editor store: `stage-003-module-shell-implementation/phase-002-content-module-shells/part-003-draft-editor-shell/part.md`

## Implementation Steps

1. Update `AiPanel.svelte` to render three action buttons when `aiStore.suggestion` is non-null:
   - **Accept** — merges suggestion into scene content and clears the panelsuggestion
   - **Reject** — clears `aiStore.suggestion` without touching scene content
   - **Regenerate** — calls `aiStore.requestSuggestion` again with the same context

1. Implement `acceptSuggestion` in `src/lib/stores/ai.svelte.ts`:

```ts
async acceptSuggestion(sceneId: string) {
  if (!suggestion) return;
  const scene = await db.scenes.get(sceneId);
  if (!scene) return;
  const updated = scene.content + '\n\n' + suggestion;
  await db.scenes.update(sceneId, { content: updated, updatedAt: Date.now() });
  suggestion = null;
  isOpen = false;
}
```

1. Update `editorStore` in `src/lib/stores/editor.svelte.ts` to expose a reactive `activeScene` getter so the editor `<textarea>` re-renders after Accept writes to Dexie:

```ts
// Invalidate or re-query from Dexie after accept
// Pattern: use a $derived or re-fetch from db.scenes.get(activeSceneId)
```

1. Add keyboard shortcuts:
   - `Escape` → Reject (clears suggestion)
   - `Ctrl+Enter` / `Cmd+Enter` → Accept

## Acceptance Criteria

- [ ] Accept button appends suggestion to `scene.content` in Dexie and closes the panel
- [ ] Editor textarea reflects the updated content without a page reload
- [ ] Reject button clears `aiStore.suggestion` — scene content unchanged
- [ ] Regenerate button fires a new AI request and displays new suggestion
- [ ] `Escape` key rejects, `Ctrl+Enter` / `Cmd+Enter` accepts
- [ ] No suggestion persists in `aiStore` after Accept or Reject
- [ ] `pnpm run check` and `pnpm run lint` pass
