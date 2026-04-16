<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/types.js';
	import type { EntityFormCallbacks } from '../types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	let {
		entry = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		entry?: LoreEntry | null;
		saving?: boolean;
	} & EntityFormCallbacks<LoreEntry>>();

	let title = $state(untrack(() => entry?.title ?? ''));
	let category = $state(untrack(() => entry?.category ?? ''));
	let content = $state(untrack(() => entry?.content ?? ''));
	let tagsRaw = $state(untrack(() => (entry?.tags ?? []).join(', ')));
	let titleError = $state('');
	let categoryError = $state('');

	function handleSubmit() {
		titleError = '';
		categoryError = '';
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}
		if (!category.trim()) {
			categoryError = 'Category is required.';
			return;
		}
		onSave({
			title: title.trim(),
			category: category.trim(),
			content,
			tags: tagsRaw
				.split(',')
				.map((s: string) => s.trim())
				.filter(Boolean),
		});
	}
</script>

<div class="form-panel">
	<div class="field">
		<label class="label" for="lore-title">Title <span aria-hidden="true">*</span></label>
		<input
			id="lore-title"
			class="input"
			class:input-error={!!titleError}
			type="text"
			bind:value={title}
			aria-required="true"
			aria-invalid={!!titleError}
			aria-describedby={titleError ? 'lore-title-error' : undefined}
		/>
		{#if titleError}
			<p id="lore-title-error" class="error-text" role="alert">{titleError}</p>
		{/if}
	</div>
	<div class="field">
		<label class="label" for="lore-category">Category <span aria-hidden="true">*</span></label>
		<input
			id="lore-category"
			class="input"
			class:input-error={!!categoryError}
			type="text"
			bind:value={category}
			placeholder="magic, history, faction…"
			aria-required="true"
			aria-invalid={!!categoryError}
			aria-describedby={categoryError ? 'lore-category-error' : undefined}
		/>
		{#if categoryError}
			<p id="lore-category-error" class="error-text" role="alert">{categoryError}</p>
		{/if}
	</div>
	<div class="field">
		<label class="label" for="lore-content">Content</label>
		<textarea id="lore-content" class="input textarea" bind:value={content} rows={5}></textarea>
	</div>
	<div class="field">
		<label class="label" for="lore-tags">Tags <span class="hint">(comma-separated)</span></label>
		<input id="lore-tags" class="input" type="text" bind:value={tagsRaw} />
	</div>
	<div class="actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>
			{saving ? 'Saving…' : entry ? 'Save Changes' : 'Create Entry'}
		</PrimaryButton>
	</div>
</div>
