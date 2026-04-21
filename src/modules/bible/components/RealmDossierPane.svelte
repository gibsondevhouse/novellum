<script lang="ts">
	import type { Location } from '$lib/db/types.js';
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
		formatMeta,
	}: {
		realm: Location | null;
		saving?: boolean;
		isCreating?: boolean;
		showDeleteConfirm?: boolean;
		onSave: (formData: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
		onCancel: () => void;
		onDelete: () => void | Promise<void>;
		onPhotoUpload?: (file: File) => void | Promise<void>;
		photoUrl?: string;
		formatMeta: (realm: Location) => string;
	} = $props();

	const eyebrow = $derived.by(() => {
		if (isCreating || !realm) return 'Realm System';
		return formatMeta(realm);
	});

	const title = $derived.by(() => {
		if (isCreating || !realm) return 'New Realm';
		return realm.name;
	});

	const copy = $derived.by(() => {
		if (isCreating) {
			return 'Define the rules of existence first: what is normal, what is dangerous, and which pressures shape every decision before a scene begins.';
		}

		return 'Realms should establish constraints, power, and default conflict. If two realms feel interchangeable, one is unnecessary.';
	});
</script>

<section class="character-dossier">
	<RealmDetailHeader
		{realm}
		{photoUrl}
		onPhotoUpload={onPhotoUpload}
		uploadDisabled={isCreating || !realm}
	/>

	<div class="realm-identity-intro">
		<p class="dossier-eyebrow">{eyebrow}</p>
		<h2 class="dossier-title">{title}</h2>
		<p class="dossier-copy">{copy}</p>
	</div>

	<div class="dossier-flow" aria-label="Realm dossier sections">
		<RealmForm realm={realm} {saving} {onSave} {onCancel} />
	</div>

	{#if !isCreating && realm}
		<div class="dossier-footer-actions">
			{#if showDeleteConfirm}
				<button class="bible-btn-sm bible-btn-danger" onclick={() => void onDelete()}>Confirm Delete</button>
				<button class="bible-btn-sm" onclick={onCancel}>Cancel</button>
			{:else}
				<button class="bible-btn-sm bible-btn-danger" onclick={() => void onDelete()}>Delete Realm</button>
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

	.realm-identity-intro {
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