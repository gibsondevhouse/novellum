<script lang="ts">
	import type { LoreEntry } from '$lib/db/types.js';
	import LoreEntryDetailHeader from './LoreEntryDetailHeader.svelte';
	import MythEntryForm from './MythEntryForm.svelte';

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
		if (isCreating || !entry) return 'Archive — Myths';
		return entry.category.replace('myth:', '') || 'myth';
	});
</script>

<section class="character-dossier">
	<LoreEntryDetailHeader
		{entry}
		formatMeta={() => eyebrow}
	/>

	<div class="dossier-flow" aria-label="Myth dossier sections">
		<MythEntryForm {entry} {saving} {onSave} {onCancel} />
	</div>

	{#if !isCreating && entry}
		<div class="dossier-footer-actions">
			{#if showDeleteConfirm}
				<button class="bible-btn-sm bible-btn-danger" onclick={() => void onDelete()}>Confirm Delete</button>
				<button class="bible-btn-sm" onclick={onCancel}>Cancel</button>
			{:else}
				<button class="bible-btn-sm bible-btn-danger" onclick={() => void onDelete()}>Delete Myth</button>
			{/if}
		</div>
	{/if}
</section>
