<script lang="ts">
	import EntityDetailHeader from '$lib/components/ui/EntityDetailHeader.svelte';
	import EntityHeaderPhoto from '$lib/components/ui/EntityHeaderPhoto.svelte';

	type LineageHeaderField =
		| 'name'
		| 'lineageType'
		| 'summary'
		| 'origin'
		| 'eraAge'
		| 'regionHomeland'
		| 'currentStatus';

	type LineageHeaderModel = {
		name?: string;
		lineageType?: string;
		summary?: string;
		photoUrl?: string;
		origin?: string;
		eraAge?: string;
		regionHomeland?: string;
		currentStatus?: string;
	};

	let {
		lineage,
		onFieldChange,
		onPhotoUpload,
	}: {
		lineage: LineageHeaderModel | null;
		onFieldChange: (field: LineageHeaderField, value: string) => void;
		onPhotoUpload?: (file: File) => void | Promise<void>;
	} = $props();
</script>

<EntityDetailHeader ariaLabel="Lineage header" attributesColumns={2}>
	{#snippet media()}
		<EntityHeaderPhoto
			imageUrl={lineage?.photoUrl}
			alt="Crest for {lineage?.name || 'lineage'}"
			placeholderLabel="Crest"
			uploadLabel="Upload Sigil"
			onUpload={onPhotoUpload}
		/>
	{/snippet}
	{#snippet identity()}
		<input
			class="entity-name input-inline"
			type="text"
			value={lineage?.name || ''}
			oninput={(e) => onFieldChange('name', (e.currentTarget as HTMLInputElement).value)}
			placeholder="Unnamed Lineage"
		/>
		<input
			class="entity-role input-inline"
			type="text"
			value={lineage?.lineageType || ''}
			oninput={(e) => onFieldChange('lineageType', (e.currentTarget as HTMLInputElement).value)}
			placeholder="Lineage Type"
		/>
		<textarea
			class="entity-summary input-inline"
			rows="2"
			value={lineage?.summary || ''}
			oninput={(e) => onFieldChange('summary', (e.currentTarget as HTMLTextAreaElement).value)}
			placeholder="Lineage records track inherited identity, legacy, and ancestral continuity."
		></textarea>
	{/snippet}
	{#snippet attributes()}
		<div class="attribute-item">
			<span class="attribute-label">Origin</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={lineage?.origin || ''}
				oninput={(e) => onFieldChange('origin', (e.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Era / Age</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={lineage?.eraAge || ''}
				oninput={(e) => onFieldChange('eraAge', (e.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Region / Homeland</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={lineage?.regionHomeland || ''}
				oninput={(e) => onFieldChange('regionHomeland', (e.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Current Status</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={lineage?.currentStatus || ''}
				oninput={(e) => onFieldChange('currentStatus', (e.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
	{/snippet}
</EntityDetailHeader>
