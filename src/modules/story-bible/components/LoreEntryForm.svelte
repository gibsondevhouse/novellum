<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/domain-types';
	import { GhostButton, Input, PrimaryButton } from '$lib/components/ui/index.js';
	import type { LoreEntryFormData } from '../services/story-bible-crud.js';

	let {
		entry = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		entry?: LoreEntry | null;
		saving?: boolean;
		onSave: (data: LoreEntryFormData) => void;
		onCancel: () => void;
	}>();

	let title = $state(untrack(() => entry?.title ?? ''));
	let category = $state(untrack(() => entry?.category ?? ''));
	let content = $state(untrack(() => entry?.content ?? ''));
	let tagsRaw = $state(untrack(() => (entry?.tags ?? []).join(', ')));
	let titleError = $state('');

	function splitList(raw: string): string[] {
		return raw
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}

		titleError = '';
		onSave({
			title: title.trim(),
			category: category.trim(),
			content,
			tags: splitList(tagsRaw),
		});
	}
</script>

<form class="story-bible-form" onsubmit={handleSubmit}>
	<Input
		id="story-bible-lore-title"
		label="Title"
		bind:value={title}
		error={titleError}
		aria-required="true"
		aria-invalid={!!titleError}
	/>
	<Input id="story-bible-lore-category" label="Category" bind:value={category} />
	<label class="field">
		<span>Content</span>
		<textarea bind:value={content} rows="6"></textarea>
	</label>
	<Input id="story-bible-lore-tags" label="Tags" bind:value={tagsRaw} />
	<div class="form-actions">
		<GhostButton type="button" onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton type="submit" disabled={saving}>
			{saving ? 'Saving...' : entry ? 'Save Entry' : 'Create Entry'}
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
