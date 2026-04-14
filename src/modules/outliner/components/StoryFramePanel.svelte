<script lang="ts">
	import { untrack } from 'svelte';
	import type { StoryFrame } from '$lib/db/types.js';
	import { updateStoryFrame } from '$modules/outliner/services/story-structure-service.js';

	let { storyFrame, onUpdate } = $props<{
		storyFrame: StoryFrame;
		onUpdate: (patch: Partial<StoryFrame>) => void;
	}>();

	let premise = $state(untrack(() => storyFrame.premise));
	let theme = $state(untrack(() => storyFrame.theme));
	let toneNotes = $state(untrack(() => storyFrame.toneNotes));
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		premise = storyFrame.premise;
		theme = storyFrame.theme;
		toneNotes = storyFrame.toneNotes;
	});

	function scheduleSave(patch: Partial<Omit<StoryFrame, 'id' | 'projectId'>>) {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			await updateStoryFrame(storyFrame.id, patch);
			onUpdate(patch);
		}, 1000);
	}
</script>

<div class="story-frame-panel">
	<div class="field">
		<label class="field-label" for="sf-premise">Premise</label>
		<p class="field-hint">The core "what if" or central situation driving your story.</p>
		<textarea
			id="sf-premise"
			class="field-textarea"
			rows="3"
			placeholder="A story about…"
			bind:value={premise}
			oninput={() => scheduleSave({ premise })}
		></textarea>
	</div>
	<div class="field">
		<label class="field-label" for="sf-theme">Theme</label>
		<p class="field-hint">The central truth or question the story explores.</p>
		<textarea
			id="sf-theme"
			class="field-textarea"
			rows="2"
			placeholder="What does this story say about…"
			bind:value={theme}
			oninput={() => scheduleSave({ theme })}
		></textarea>
	</div>
	<div class="field">
		<label class="field-label" for="sf-tone">Tone Notes</label>
		<p class="field-hint">Mood, voice, and stylistic intent.</p>
		<textarea
			id="sf-tone"
			class="field-textarea"
			rows="2"
			placeholder="Dark and grounded, with moments of…"
			bind:value={toneNotes}
			oninput={() => scheduleSave({ toneNotes })}
		></textarea>
	</div>
</div>

<style>
	.story-frame-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.field-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.field-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.field-textarea {
		width: 100%;
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		line-height: 1.5;
		padding: var(--space-2) var(--space-3);
		resize: vertical;
		transition: border-color 0.1s;
	}

	.field-textarea:focus {
		outline: none;
		border-color: var(--color-border-default);
		box-shadow: var(--focus-ring);
	}
</style>
