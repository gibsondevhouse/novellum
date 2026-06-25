<script lang="ts">
	import { untrack } from 'svelte';
	import type { Character } from '$lib/db/domain-types';
	import { GhostButton, Input, PrimaryButton } from '$lib/components/ui/index.js';
	import type { CharacterFormData } from '../services/story-bible-crud.js';

	let {
		character = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		character?: Character | null;
		saving?: boolean;
		onSave: (data: CharacterFormData) => void;
		onCancel: () => void;
	}>();

	let name = $state(untrack(() => character?.name ?? ''));
	let role = $state(untrack(() => character?.role ?? ''));
	let bio = $state(untrack(() => character?.bio ?? ''));
	let faction = $state(untrack(() => character?.faction ?? ''));
	let traitsRaw = $state(untrack(() => (character?.traits ?? []).join(', ')));
	let goalsRaw = $state(untrack(() => (character?.goals ?? []).join(', ')));
	let notes = $state(untrack(() => character?.notes ?? ''));
	let tagsRaw = $state(untrack(() => (character?.tags ?? []).join(', ')));
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
			role: role.trim(),
			bio,
			faction: faction.trim(),
			pronunciation: character?.pronunciation ?? '',
			aliases: character?.aliases ?? [],
			diasporaOrigin: character?.diasporaOrigin ?? '',
			photoUrl: character?.photoUrl ?? '',
			anomalies: character?.anomalies ?? [],
			traits: splitList(traitsRaw),
			goals: splitList(goalsRaw),
			flaws: character?.flaws ?? [],
			arcs: character?.arcs ?? [],
			notes,
			tags: splitList(tagsRaw),
		});
	}
</script>

<form class="story-bible-form" onsubmit={handleSubmit}>
	<Input
		id="story-bible-character-name"
		label="Name"
		bind:value={name}
		error={nameError}
		aria-required="true"
		aria-invalid={!!nameError}
	/>
	<Input id="story-bible-character-role" label="Role" bind:value={role} />
	<Input id="story-bible-character-faction" label="Faction" bind:value={faction} />
	<label class="field">
		<span>Bio</span>
		<textarea bind:value={bio} rows="4"></textarea>
	</label>
	<Input id="story-bible-character-traits" label="Traits" bind:value={traitsRaw} />
	<Input id="story-bible-character-goals" label="Goals" bind:value={goalsRaw} />
	<label class="field">
		<span>Notes</span>
		<textarea bind:value={notes} rows="4"></textarea>
	</label>
	<Input id="story-bible-character-tags" label="Tags" bind:value={tagsRaw} />
	<div class="form-actions">
		<GhostButton type="button" onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton type="submit" disabled={saving}>
			{saving ? 'Saving...' : character ? 'Save Character' : 'Create Character'}
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
