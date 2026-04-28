<script lang="ts">
	import { untrack } from 'svelte';
	import type { PlotThread, Scene } from '$lib/db/domain-types';
	import type { EntityFormCallbacks } from '../types.js';
	import { PLOT_THREAD_STATUS_OPTIONS } from '../constants.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import { SurfacePanel } from '$lib/components/ui/index.js';

	type Status = (typeof PLOT_THREAD_STATUS_OPTIONS)[number];

	let {
		thread = null,
		scenes = [],
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		thread?: PlotThread | null;
		scenes?: Scene[];
		saving?: boolean;
	} & EntityFormCallbacks<PlotThread>>();

	let title = $state(untrack(() => thread?.title ?? ''));
	let description = $state(untrack(() => thread?.description ?? ''));
	let status = $state<Status>(untrack(() => (thread?.status as Status) ?? 'open'));
	let selectedSceneIds = $state<string[]>(untrack(() => thread?.relatedSceneIds ?? []));
	let selectedCharIds = $state<string[]>(untrack(() => thread?.relatedCharacterIds ?? []));
	let titleError = $state('');

	function toggleScene(id: string) {
		selectedSceneIds = selectedSceneIds.includes(id)
			? selectedSceneIds.filter((s) => s !== id)
			: [...selectedSceneIds, id];
	}

	function handleSubmit() {
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}
		titleError = '';
		onSave({
			title: title.trim(),
			description,
			status,
			relatedSceneIds: selectedSceneIds,
			relatedCharacterIds: selectedCharIds,
		});
	}
</script>

<SurfacePanel class="form-panel">
	<div class="field">
		<label class="label" for="pt-title">Title <span aria-hidden="true">*</span></label>
		<input
			id="pt-title"
			class="input"
			class:input-error={!!titleError}
			type="text"
			bind:value={title}
			aria-required="true"
			aria-invalid={!!titleError}
			aria-describedby={titleError ? 'pt-title-error' : undefined}
		/>
		{#if titleError}
			<p id="pt-title-error" class="error-text" role="alert">{titleError}</p>
		{/if}
	</div>
	<div class="field">
		<label class="label" for="pt-desc">Description</label>
		<textarea id="pt-desc" class="input textarea" bind:value={description} rows={3}></textarea>
	</div>
	<div class="field">
		<label class="label" for="pt-status">Status</label>
		<select id="pt-status" class="input" bind:value={status}>
			{#each PLOT_THREAD_STATUS_OPTIONS as s (s)}
				<option value={s}>{s}</option>
			{/each}
		</select>
	</div>
	{#if scenes.length > 0}
		<div class="field">
			<span class="label">Related Scenes</span>
			<div class="check-list">
				{#each scenes as scene (scene.id)}
					<label class="check-item">
						<input
							type="checkbox"
							checked={selectedSceneIds.includes(scene.id)}
							onchange={() => toggleScene(scene.id)}
						/>
						<span>{scene.title || '(Untitled scene)'}</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}
	<div class="actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>
			{saving ? 'Saving…' : thread ? 'Save Changes' : 'Create Thread'}
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
