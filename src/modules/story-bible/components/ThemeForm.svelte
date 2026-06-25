<script lang="ts">
	import { untrack } from 'svelte';
	import type { Theme } from '$lib/db/domain-types';
	import { GhostButton, Input, PrimaryButton } from '$lib/components/ui/index.js';
	import type { ThemeFormData } from '../services/story-bible-crud.js';

	let {
		theme = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		theme?: Theme | null;
		saving?: boolean;
		onSave: (data: ThemeFormData) => void;
		onCancel: () => void;
	}>();

	let title = $state(untrack(() => theme?.title ?? ''));
	let description = $state(untrack(() => theme?.description ?? ''));
	let tensionPair = $state(untrack(() => theme?.tensionPair ?? ''));
	let imagery = $state(untrack(() => theme?.imagery ?? ''));
	let titleError = $state('');

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}

		titleError = '';
		onSave({
			title: title.trim(),
			description,
			tensionPair: tensionPair.trim(),
			imagery,
		});
	}
</script>

<form class="story-bible-form" onsubmit={handleSubmit}>
	<Input
		id="story-bible-theme-title"
		label="Title"
		bind:value={title}
		error={titleError}
		aria-required="true"
		aria-invalid={!!titleError}
	/>
	<Input id="story-bible-theme-tension" label="Tension Pair" bind:value={tensionPair} />
	<label class="field">
		<span>Description</span>
		<textarea bind:value={description} rows="4"></textarea>
	</label>
	<label class="field">
		<span>Imagery</span>
		<textarea bind:value={imagery} rows="3"></textarea>
	</label>
	<div class="form-actions">
		<GhostButton type="button" onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton type="submit" disabled={saving}>
			{saving ? 'Saving...' : theme ? 'Save Theme' : 'Create Theme'}
		</PrimaryButton>
	</div>
</form>

<style>
	.story-bible-form {
		display: grid;
		gap: var(--space-4);
	}

	.field {
		display: grid;
		gap: var(--space-1);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	textarea {
		width: 100%;
		resize: vertical;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
		padding: var(--space-2) var(--space-3);
		font: inherit;
		text-transform: none;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-border-focus);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
</style>
