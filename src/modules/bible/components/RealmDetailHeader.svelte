<script lang="ts">
	import EntityDetailHeader from '$lib/components/ui/EntityDetailHeader.svelte';
	import EntityHeaderPhoto from '$lib/components/ui/EntityHeaderPhoto.svelte';
	import type { Location } from '$lib/db/types.js';

	let {
		realm,
		photoUrl = '',
		onPhotoUpload,
		uploadDisabled = false,
	}: {
		realm: Location | null;
		photoUrl?: string;
		onPhotoUpload?: (file: File) => void | Promise<void>;
		uploadDisabled?: boolean;
	} = $props();

	const linkedLandmarks = $derived.by(() => (realm?.landmarkIds?.length ?? 0).toString());
</script>

<EntityDetailHeader ariaLabel="Realm header" attributesColumns={3}>
	{#snippet media()}
		<EntityHeaderPhoto
			imageUrl={photoUrl}
			alt="Portrait of {realm?.name || 'realm'}"
			placeholderLabel="Photo"
			uploadLabel={uploadDisabled ? 'Save realm first' : 'Upload Photo'}
			{uploadDisabled}
			onUpload={onPhotoUpload}
		/>
	{/snippet}
	{#snippet identity()}
		<p class="dossier-eyebrow">Identity Dossier</p>
		<h2 class="entity-name">{realm?.name?.trim() || 'New Realm'}</h2>
		<div class="role-row">
			<p class="entity-role">{realm?.realmType?.trim() || 'Realm type pending'}</p>
			<span class="role-separator">•</span>
			<p class="entity-role">{realm?.tone?.trim() || 'Tone pending'}</p>
		</div>
		<div class="identity-tags" aria-label="Identity quick tags">
			<span>{realm?.realmType?.trim() || 'Type pending'}</span>
			<span>{realm?.tone?.trim() || 'Tone pending'}</span>
		</div>
		<p class="entity-summary">{realm?.description?.trim() || 'No summary recorded yet.'}</p>
	{/snippet}
	{#snippet attributes()}
		<div class="attribute-item">
			<span class="attribute-label">Story Role</span>
			<p class="attribute-value">{realm?.storyRole?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Conflict Pressure</span>
			<p class="attribute-value">{realm?.conflictPressure?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Power Structure</span>
			<p class="attribute-value">{realm?.powerStructure?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Cultural Baseline</span>
			<p class="attribute-value">{realm?.culturalBaseline?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Reality Rules</span>
			<p class="attribute-value">{realm?.realityRules?.trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Linked Landmarks</span>
			<p class="attribute-value">{linkedLandmarks}</p>
		</div>
	{/snippet}
</EntityDetailHeader>
