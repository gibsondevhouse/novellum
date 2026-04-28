<script lang="ts">
	import type { Location } from '$lib/db/domain-types';
	import { DestructiveButton, GhostButton } from '$lib/components/ui/index.js';
	import LandmarkDetailHeader from './LandmarkDetailHeader.svelte';
	import LandmarkForm from './LandmarkForm.svelte';

	type RealmOption = {
		id: string;
		name: string;
		realmType?: string;
	};

	let {
		landmark,
		realms,
		saving = false,
		isCreating = false,
		showDeleteConfirm = false,
		onSave,
		onCancel,
		onDelete,
		onPhotoUpload,
		photoUrl = '',
		formatMeta,
	}: {
		landmark: Location | null;
		realms: RealmOption[];
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
		formatMeta: (landmark: Location) => string;
	} = $props();

	const eyebrow = $derived.by(() => {
		if (isCreating || !landmark) return 'Landmark System';
		return formatMeta(landmark);
	});

	const title = $derived.by(() => {
		if (isCreating || !landmark) return 'New Landmark';
		return landmark.name;
	});

	const copy = $derived.by(() => {
		if (isCreating) {
			return 'Landmarks are specific, actionable places where scenes unfold. They should be visual, reusable, and inseparable from the conflicts they host.';
		}

		return 'Landmarks express the realm they belong to. If a scene can move somewhere else without consequence, the landmark is too weak.';
	});
</script>

<section class="character-dossier">
	<LandmarkDetailHeader
		{landmark}
		{photoUrl}
		{onPhotoUpload}
		uploadDisabled={isCreating || !landmark}
	/>

	<div class="landmark-identity-intro">
		<p class="dossier-eyebrow">{eyebrow}</p>
		<h2 class="dossier-title">{title}</h2>
		<p class="dossier-copy">{copy}</p>
	</div>

	<div class="dossier-flow" aria-label="Landmark dossier sections">
		<LandmarkForm {landmark} {realms} {saving} {onSave} {onCancel} />
	</div>

	{#if !isCreating && landmark}
		<div class="dossier-footer-actions">
			{#if showDeleteConfirm}
				<DestructiveButton size="sm" onclick={() => void onDelete()}
					>Confirm Delete</DestructiveButton
				>
				<GhostButton size="sm" onclick={onCancel}>Cancel</GhostButton>
			{:else}
				<DestructiveButton size="sm" onclick={() => void onDelete()}
					>Delete Landmark</DestructiveButton
				>
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

	.landmark-identity-intro {
		display: grid;
		gap: var(--space-2);
	}

	.dossier-flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.dossier-eyebrow,
	.dossier-copy {
		margin: 0;
	}

	.dossier-eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.dossier-title {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
	}

	.dossier-copy {
		margin-top: var(--space-2);
		max-width: 70ch;
		color: var(--color-text-secondary);
	}

	.dossier-footer-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.character-dossier {
			padding-right: 0;
		}
	}
</style>
