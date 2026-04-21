<script lang="ts">
	import type { LoreEntry } from '$lib/db/types.js';
	import LoreEntryDetailHeader from './LoreEntryDetailHeader.svelte';
	import TechnologyEntryForm from './TechnologyEntryForm.svelte';

	let {
		entry,
		saving = false,
		isCreating = false,
		showDeleteConfirm = false,
		onSave,
		onCancel,
		onDelete,
	}: {
		entry: LoreEntry | null;
		saving?: boolean;
		isCreating?: boolean;
		showDeleteConfirm?: boolean;
		onSave: (formData: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
		onCancel: () => void;
		onDelete: () => void | Promise<void>;
	} = $props();

	const eyebrow = $derived.by(() => {
		if (isCreating || !entry) return 'Archive — Technology';
		return entry.category.replace('technology:', '') || 'technology';
	});
</script>

<section class="character-dossier">
	<LoreEntryDetailHeader
		{entry}
		formatMeta={() => eyebrow}
	/>

	<div class="dossier-flow" aria-label="Technology dossier sections">
		<TechnologyEntryForm {entry} {saving} {onSave} {onCancel} />
	</div>

	{#if !isCreating && entry}
		<div class="dossier-footer-actions">
			{#if showDeleteConfirm}
				<button class="bible-btn-sm bible-btn-danger" onclick={() => void onDelete()}>Confirm Delete</button>
				<button class="bible-btn-sm" onclick={onCancel}>Cancel</button>
			{:else}
				<button class="bible-btn-sm bible-btn-danger" onclick={() => void onDelete()}>Delete Technology</button>
			{/if}
		</div>
	{/if}
</section>

<style>
	.character-dossier {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		max-width: 920px;
		width: 100%;
		padding-right: var(--space-6);
	}

	.dossier-flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding: 0 var(--space-6);
	}

	.dossier-footer-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		flex-wrap: wrap;
		padding: 0 var(--space-6) var(--space-6);
	}

	@media (max-width: 768px) {
		.character-dossier {
			padding-right: 0;
		}
	}
</style>
