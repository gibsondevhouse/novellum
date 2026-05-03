<script lang="ts">
	import type { LoreEntry } from '$lib/db/domain-types';
	import { DestructiveButton, GhostButton } from '$lib/components/ui/index.js';
	import LoreEntryDetailHeader from './LoreEntryDetailHeader.svelte';
	import TraditionEntryForm from './TraditionEntryForm.svelte';

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
		onSave: (
			formData: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
		) => void | Promise<void>;
		onCancel: () => void;
		onDelete: () => void | Promise<void>;
	} = $props();

	const eyebrow = $derived.by(() => {
		if (isCreating || !entry) return 'Archive — Traditions';
		return entry.category.replace('tradition:', '') || 'tradition';
	});
</script>

<section class="character-dossier">
	<LoreEntryDetailHeader {entry} formatMeta={() => eyebrow} />

	<div class="dossier-flow" aria-label="Tradition dossier sections">
		<TraditionEntryForm {entry} {saving} {onSave} {onCancel} />
	</div>

	{#if !isCreating && entry}
		<div class="dossier-footer-actions">
			{#if showDeleteConfirm}
				<DestructiveButton size="sm" onclick={() => void onDelete()}
					>Confirm Delete</DestructiveButton
				>
				<GhostButton size="sm" onclick={onCancel}>Cancel</GhostButton>
			{:else}
				<DestructiveButton size="sm" onclick={() => void onDelete()}
					>Delete Tradition</DestructiveButton
				>
			{/if}
		</div>
	{/if}
</section>
