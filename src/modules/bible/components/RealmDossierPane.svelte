<script lang="ts">
	import type { Location } from '$lib/db/types.js';
	import { DestructiveButton, GhostButton } from '$lib/components/ui/index.js';
	import RealmDetailHeader from './RealmDetailHeader.svelte';
	import RealmForm from './RealmForm.svelte';

	let {
		realm,
		saving = false,
		isCreating = false,
		showDeleteConfirm = false,
		onSave,
		onCancel,
		onDelete,
		onPhotoUpload,
		photoUrl = '',
		formatMeta: _formatMeta,
	}: {
		realm: Location | null;
		saving?: boolean;
		isCreating?: boolean;
		showDeleteConfirm?: boolean;
		onSave: (
			formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
		) => void | Promise<void>;
		onCancel: () => void;
		onDelete: () => void | Promise<void>;
		onPhotoUpload?: (file: File) => void | Promise<void>;
		photoUrl?: string;
		formatMeta: (realm: Location) => string;
	} = $props();
</script>

<section class="character-dossier">
	<RealmDetailHeader {realm} {photoUrl} {onPhotoUpload} uploadDisabled={isCreating || !realm} />

	<div class="dossier-flow" aria-label="Realm dossier sections">
		<RealmForm {realm} {saving} {onSave} {onCancel} />
	</div>

	{#if !isCreating && realm}
		<div class="dossier-footer-actions">
			{#if showDeleteConfirm}
				<DestructiveButton size="sm" onclick={() => void onDelete()}
					>Confirm Delete</DestructiveButton
				>
				<GhostButton size="sm" onclick={onCancel}>Cancel</GhostButton>
			{:else}
				<DestructiveButton size="sm" onclick={() => void onDelete()}>Delete Realm</DestructiveButton
				>
			{/if}
		</div>
	{/if}
</section>
