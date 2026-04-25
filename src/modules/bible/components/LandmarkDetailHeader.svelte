<script lang="ts">
	import EntityDetailHeader from '$lib/components/ui/EntityDetailHeader.svelte';
	import EntityHeaderPhoto from '$lib/components/ui/EntityHeaderPhoto.svelte';
	import type { Location } from '$lib/db/types.js';

	let {
		landmark,
		photoUrl = '',
		onPhotoUpload,
		uploadDisabled = false,
	}: {
		landmark: Location | null;
		photoUrl?: string;
		onPhotoUpload?: (file: File) => void | Promise<void>;
		uploadDisabled?: boolean;
	} = $props();

	const linkedCharacters = $derived.by(() => (landmark?.characterIds?.length ?? 0).toString());
</script>

<EntityDetailHeader ariaLabel="Landmark header" attributesColumns={3}>
	{#snippet media()}
		<EntityHeaderPhoto
			imageUrl={photoUrl}
			alt="Photo of {landmark?.name || 'landmark'}"
			placeholderLabel="Photo"
			uploadLabel={uploadDisabled ? 'Save landmark first' : 'Upload Photo'}
			{uploadDisabled}
			onUpload={onPhotoUpload}
		/>
	{/snippet}
	{#snippet identity()}
		<p class="dossier-eyebrow">Identity Dossier</p>
		<h2 class="entity-name">{landmark?.name?.trim() || 'New Landmark'}</h2>
		<div class="role-row">
			<p class="entity-role">{landmark?.activityType?.trim() || 'Activity pending'}</p>
			<span class="role-separator">•</span>
			<p class="entity-role">{landmark?.emotionalTone?.trim() || 'Tone pending'}</p>
		</div>
		<div class="identity-tags" aria-label="Identity quick tags">
			<span>{landmark?.purpose?.trim() || 'Purpose pending'}</span>
			<span>{landmark?.activityType?.trim() || 'Activity pending'}</span>
		</div>
		<p class="entity-summary">{landmark?.description?.trim() || 'No summary recorded yet.'}</p>
	{/snippet}
	{#snippet attributes()}
		<div class="attribute-item">
			<span class="attribute-label">Purpose</span>
			<p class="attribute-value">{landmark?.purpose?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Environment</span>
			<p class="attribute-value">{landmark?.environment?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Activity Type</span>
			<p class="attribute-value">{landmark?.activityType?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Emotional Tone</span>
			<p class="attribute-value">{landmark?.emotionalTone?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Change Over Time</span>
			<p class="attribute-value">{landmark?.changeOverTime?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Linked Characters</span>
			<p class="attribute-value">{linkedCharacters}</p>
		</div>
	{/snippet}
</EntityDetailHeader>
