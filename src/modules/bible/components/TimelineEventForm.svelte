<script lang="ts">
	import { untrack } from 'svelte';
	import type { TimelineEvent, Character } from '$lib/db/types.js';
	import type { EntityFormCallbacks } from '../types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import { SurfacePanel } from '$lib/components/ui/index.js';

	let {
		event = null,
		characters = [],
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		event?: TimelineEvent | null;
		characters?: Character[];
		saving?: boolean;
	} & EntityFormCallbacks<TimelineEvent>>();

	let title = $state(untrack(() => event?.title ?? ''));
	let date = $state(untrack(() => event?.date ?? ''));
	let description = $state(untrack(() => event?.description ?? ''));
	let selectedCharIds = $state<string[]>(untrack(() => event?.relatedCharacterIds ?? []));
	let selectedSceneIds = $state<string[]>(untrack(() => event?.relatedSceneIds ?? []));
	let titleError = $state('');

	function toggleChar(id: string) {
		selectedCharIds = selectedCharIds.includes(id)
			? selectedCharIds.filter((c) => c !== id)
			: [...selectedCharIds, id];
	}

	function handleSubmit() {
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}
		titleError = '';
		onSave({
			title: title.trim(),
			date,
			description,
			relatedCharacterIds: selectedCharIds,
			relatedSceneIds: selectedSceneIds,
		});
	}
</script>

<SurfacePanel class="form-panel">
	<div class="field">
		<label class="label" for="te-title">Title <span aria-hidden="true">*</span></label>
		<input
			id="te-title"
			class="input"
			class:input-error={!!titleError}
			type="text"
			bind:value={title}
			aria-required="true"
			aria-invalid={!!titleError}
			aria-describedby={titleError ? 'te-title-error' : undefined}
		/>
		{#if titleError}
			<p id="te-title-error" class="error-text" role="alert">{titleError}</p>
		{/if}
	</div>
	<div class="field">
		<label class="label" for="te-date"
			>Date <span class="hint">(narrative date, e.g. "Year 3, Day 47")</span></label
		>
		<input id="te-date" class="input" type="text" bind:value={date} placeholder="Year 1, Day 1" />
	</div>
	<div class="field">
		<label class="label" for="te-desc">Description</label>
		<textarea id="te-desc" class="input textarea" bind:value={description} rows={3}></textarea>
	</div>
	{#if characters.length > 0}
		<div class="field">
			<span class="label">Related Characters</span>
			<div class="check-list">
				{#each characters as char (char.id)}
					<label class="check-item">
						<input
							type="checkbox"
							checked={selectedCharIds.includes(char.id)}
							onchange={() => toggleChar(char.id)}
						/>
						<span>{char.name}</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}
	<div class="actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>
			{saving ? 'Saving…' : event ? 'Save Changes' : 'Create Event'}
		</PrimaryButton>
	</div>
</SurfacePanel>

<style>
	.check-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		max-height: 180px;
		overflow-y: auto;
		padding: var(--space-2);
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
	}

	.check-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.error-text {
		font-size: var(--text-xs);
		color: var(--color-error);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}
</style>
