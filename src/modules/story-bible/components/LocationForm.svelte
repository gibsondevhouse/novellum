<script lang="ts">
	import { untrack } from 'svelte';
	import type { Location } from '$lib/db/domain-types';
	import { GhostButton, Input, PrimaryButton } from '$lib/components/ui/index.js';
	import type { LocationFormData } from '../services/story-bible-crud.js';

	let {
		location = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		location?: Location | null;
		saving?: boolean;
		onSave: (data: LocationFormData) => void;
		onCancel: () => void;
	}>();

	let name = $state(untrack(() => location?.name ?? ''));
	let kind = $state(untrack(() => location?.kind ?? ''));
	let description = $state(untrack(() => location?.description ?? ''));
	let tagsRaw = $state(untrack(() => (location?.tags ?? []).join(', ')));
	let nameError = $state('');

	function splitList(raw: string): string[] {
		return raw
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!name.trim()) {
			nameError = 'Name is required.';
			return;
		}

		nameError = '';
		onSave({
			name: name.trim(),
			description,
			tags: splitList(tagsRaw),
			kind: kind.trim() as Location['kind'],
		});
	}
</script>

<form class="story-bible-form" onsubmit={handleSubmit}>
	<Input
		id="story-bible-location-name"
		label="Name"
		bind:value={name}
		error={nameError}
		aria-required="true"
		aria-invalid={!!nameError}
	/>
	<Input id="story-bible-location-kind" label="Kind" bind:value={kind} />
	<label class="field">
		<span>Description</span>
		<textarea bind:value={description} rows="5"></textarea>
	</label>
	<Input id="story-bible-location-tags" label="Tags" bind:value={tagsRaw} />
	<div class="form-actions">
		<GhostButton type="button" onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton type="submit" disabled={saving}>
			{saving ? 'Saving...' : location ? 'Save Location' : 'Create Location'}
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
