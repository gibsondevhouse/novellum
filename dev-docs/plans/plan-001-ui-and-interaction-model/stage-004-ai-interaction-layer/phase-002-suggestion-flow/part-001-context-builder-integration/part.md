---
title: Context Builder Integration
slug: part-001-context-builder-integration
part_number: 1
status: complete
completed_at: 2026-04-12
owner: AI Agent
phase: phase-002-suggestion-flow
stage: stage-004-ai-interaction-layer
estimated_duration: 0.75d
---

## Objective

Implement `src/lib/ai/context-builder.ts` — the module responsible for assembling a structured prompt context object from the active scene, nearby beats, and relevant story bible entries. This context is then serialized to the OpenRouter message array format and sent to the proxy endpoint.

## Reference Docs

- AI orchestration: `novellum-docs/docs/ai-orchestration.md`
- [OpenRouter message format](https://openrouter.ai/docs/requests#messages)
- [Dexie `where` + `anyOf`](<https://dexie.org/docs/Table/Table.where()>)
- Data model: `dev-docs/data-model.md`

## Context Payload Schema

The context builder must produce an object matching this shape before serialization:

```ts
interface AiContext {
	sceneText: string; // content of the active scene
	precedingBeat?: string; // beat before active scene (summary or title)
	followingBeat?: string; // beat after active scene (summary or title)
	characters: string[]; // names of characters referenced in the active scene
	projectTitle: string; // project title for system prompt grounding
}
```

## Implementation Steps

1. Create `src/lib/ai/context-builder.ts`:

```ts
import { db } from '$lib/db/db';
import type { AiContext } from './types';

export async function buildContext(projectId: string, sceneId: string): Promise<AiContext> {
	const [scene, project, allBeats, characters] = await Promise.all([
		db.scenes.get(sceneId),
		db.projects.get(projectId),
		db.beats.where('projectId').equals(projectId).sortBy('order'),
		db.characters.where('projectId').equals(projectId).toArray(),
	]);

	if (!scene || !project) throw new Error('Scene or project not found');

	const beatIndex = allBeats.findIndex((b) => b.sceneId === scene.id);
	const precedingBeat = beatIndex > 0 ? allBeats[beatIndex - 1].title : undefined;
	const followingBeat =
		beatIndex >= 0 && beatIndex < allBeats.length - 1 ? allBeats[beatIndex + 1].title : undefined;

	// Simple character detection: check if character name appears in scene text
	const mentionedChars = characters
		.filter((c) => scene.content.toLowerCase().includes(c.name.toLowerCase()))
		.map((c) => c.name);

	return {
		sceneText: scene.content,
		precedingBeat,
		followingBeat,
		characters: mentionedChars,
		projectTitle: project.title,
	};
}
```

1. Create `src/lib/ai/types.ts` with the `AiContext` interface and any shared AI types.

1. Create `src/lib/ai/serializer.ts` to convert `AiContext` into an OpenRouter `messages` array:

```ts
import type { AiContext } from './types';

export function serializeContext(ctx: AiContext, userPrompt: string) {
	const system = [
		`You are a writing assistant for the novel "${ctx.projectTitle}".`,
		ctx.characters.length > 0 ? `Characters in this scene: ${ctx.characters.join(', ')}.` : '',
		ctx.precedingBeat ? `Previous beat: ${ctx.precedingBeat}.` : '',
		ctx.followingBeat ? `Next beat: ${ctx.followingBeat}.` : '',
	]
		.filter(Boolean)
		.join(' ');

	return [
		{ role: 'system', content: system },
		{ role: 'user', content: `Scene so far:\n\n${ctx.sceneText}\n\n---\n\n${userPrompt}` },
	];
}
```

1. Update `aiStore.requestSuggestion` in `src/lib/stores/ai.svelte.ts` to:
   - Call `buildContext(projectId, sceneId)` before sending
   - Pass the serialized messages array in the POST body instead of a raw prompt string
   - Update `src/routes/api/ai/+server.ts` to accept a `messages` array in the request body

## Acceptance Criteria

- [ ] `src/lib/ai/context-builder.ts` created and exports `buildContext`
- [ ] `src/lib/ai/types.ts` created with `AiContext` interface
- [ ] `src/lib/ai/serializer.ts` created and exports `serializeContext`
- [ ] `aiStore.requestSuggestion` calls `buildContext` and serializes context before send
- [ ] `/api/ai` endpoint updated to accept `messages` array
- [ ] System prompt includes project title, character names, and adjacent beat titles
- [ ] `pnpm run check` and `pnpm run lint` pass
