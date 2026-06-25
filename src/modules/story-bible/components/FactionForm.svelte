<script lang="ts">
	import { untrack } from 'svelte';
	import type { Faction } from '$lib/db/domain-types';
	import { GhostButton, Input, PrimaryButton } from '$lib/components/ui/index.js';
	import type { FactionFormData } from '../services/story-bible-crud.js';

	let {
		faction = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		faction?: Faction | null;
		saving?: boolean;
		onSave: (data: FactionFormData) => void;
		onCancel: () => void;
	}>();

	let name = $state(untrack(() => faction?.name ?? ''));
	let type = $state(untrack(() => faction?.type ?? ''));
	let description = $state(untrack(() => faction?.description ?? ''));
	let mission = $state(untrack(() => faction?.mission ?? ''));
	let ideology = $state(untrack(() => faction?.ideology ?? ''));
	let nameError = $state('');

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!name.trim()) {
			nameError = 'Name is required.';
			return;
		}

		nameError = '';
		onSave({
			name: name.trim(),
			type: type.trim(),
			description,
			mission,
			ideology,
		});
	}
</script>

<form class="story-bible-form" onsubmit={handleSubmit}>
	<Input
		id="story-bible-faction-name"
		label="Name"
		bind:value={name}
		error={nameError}
		aria-required="true"
		aria-invalid={!!nameError}
	/>
	<Input id="story-bible-faction-type" label="Type" bind:value={type} />
	<label class="field">
		<span>Description</span>
		<textarea bind:value={description} rows="4"></textarea>
	</label>
	<label class="field">
		<span>Mission</span>
		<textarea bind:value={mission} rows="3"></textarea>
	</label>
	<label class="field">
		<span>Ideology</span>
		<textarea bind:value={ideology} rows="3"></textarea>
	</label>
	<div class="form-actions">
		<GhostButton type="button" onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton type="submit" disabled={saving}>
			{saving ? 'Saving...' : faction ? 'Save Faction' : 'Create Faction'}
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
