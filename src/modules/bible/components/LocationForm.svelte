<script lang="ts">
	import { untrack } from 'svelte';
	import type { Location } from '$lib/db/types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	let {
		location = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		location?: Location | null;
		saving?: boolean;
		onSave: (data: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => void;
		onCancel: () => void;
	}>();

	let name = $state(untrack(() => location?.name ?? ''));
	let description = $state(untrack(() => location?.description ?? ''));
	let tagsRaw = $state(untrack(() => (location?.tags ?? []).join(', ')));
	let nameError = $state('');

	function handleSubmit() {
		if (!name.trim()) {
			nameError = 'Name is required.';
			return;
		}
		nameError = '';
		onSave({
			name: name.trim(),
			description,
			tags: tagsRaw
				.split(',')
				.map((s: string) => s.trim())
				.filter(Boolean),
		});
	}
</script>

<div class="form-panel">
	<div class="field">
		<label class="label" for="loc-name">Name <span aria-hidden="true">*</span></label>
		<input
			id="loc-name"
			class="input"
			class:input-error={!!nameError}
			type="text"
			bind:value={name}
			aria-required="true"
			aria-invalid={!!nameError}
			aria-describedby={nameError ? 'loc-name-error' : undefined}
		/>
		{#if nameError}
			<p id="loc-name-error" class="error-text" role="alert">{nameError}</p>
		{/if}
	</div>
	<div class="field">
		<label class="label" for="loc-desc">Description</label>
		<textarea id="loc-desc" class="input textarea" bind:value={description} rows={3}></textarea>
	</div>
	<div class="field">
		<label class="label" for="loc-tags">Tags <span class="hint">(comma-separated)</span></label>
		<input id="loc-tags" class="input" type="text" bind:value={tagsRaw} />
	</div>
	<div class="actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>
			{saving ? 'Saving…' : location ? 'Save Changes' : 'Create Location'}
		</PrimaryButton>
	</div>
</div>
