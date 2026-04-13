---
title: Panel Component & State
slug: part-001-panel-component-and-state
part_number: 1
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-001-ai-assistant-panel
stage: stage-004-ai-interaction-layer
estimated_duration: 0.75d
---

## Objective

Build `AiPanel.svelte` — the right-side panel in the Draft Editor that displays AI suggestions. Create a Svelte 5 rune-based store to manage the panel's open/closed state, loading state, and the current suggestion. Wire the panel into the editor layout and hook up the "Ask AI" button to call the OpenRouter proxy.

## Reference Docs

- [Svelte 5 `$state` rune](https://svelte.dev/docs/svelte/$state)
- [Svelte 5 `$derived` rune](https://svelte.dev/docs/svelte/$derived)
- AI orchestration: `novellum-docs/docs/ai-orchestration.md`
- Stage-003 editor shell: `stage-003-module-shell-implementation/phase-002-content-module-shells/part-003-draft-editor-shell/part.md`

## Implementation Steps

1. Create `src/lib/stores/ai.svelte.ts`:

```ts
// src/lib/stores/ai.svelte.ts
let isOpen = $state(false);
let isLoading = $state(false);
let suggestion = $state<string | null>(null);
let error = $state<string | null>(null);

export const aiStore = {
	get isOpen() {
		return isOpen;
	},
	get isLoading() {
		return isLoading;
	},
	get suggestion() {
		return suggestion;
	},
	get error() {
		return error;
	},
	toggle() {
		isOpen = !isOpen;
	},
	async requestSuggestion(prompt: string) {
		isLoading = true;
		error = null;
		suggestion = null;
		try {
			const res = await fetch('/api/ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt }),
			});
			if (!res.ok) throw new Error(`API error ${res.status}`);
			const data = await res.json();
			suggestion = data.content ?? data.choices?.[0]?.message?.content ?? null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			isLoading = false;
		}
	},
};
```

1. Create `src/lib/components/AiPanel.svelte`:
   - Import `aiStore` from `$lib/stores/ai.svelte`
   - Renders an `<aside class="ai-panel">` that is conditionally visible based on `aiStore.isOpen`
   - Shows a spinner/loading indicator when `aiStore.isLoading` is `true`
   - Displays `aiStore.suggestion` in a `<pre>` or `<p>` block when present
   - Displays `aiStore.error` styled as an error message when present
   - Has a close button that calls `aiStore.toggle()`

1. Update `src/routes/projects/[id]/editor/+page.svelte`:
   - Replace the static `<aside class="ai-panel">` placeholder with `<AiPanel />`
   - Wire the toolbar "Ask AI" button to call `aiStore.requestSuggestion(currentText)` where `currentText` is the content of the active scene's textarea

## Acceptance Criteria

- [ ] `src/lib/stores/ai.svelte.ts` created with `$state` runes
- [ ] `AiPanel.svelte` renders in editor layout
- [ ] Panel opens/closes via toolbar toggle button
- [ ] "Ask AI" button fires a POST to `/api/ai` and displays the response in the panel
- [ ] Loading state shows a visual indicator
- [ ] Error state shows error message in the panel
- [ ] `pnpm run check` and `pnpm run lint` pass
