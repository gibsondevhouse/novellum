<script lang="ts">
	import EntityDetailHeader from '$lib/components/ui/EntityDetailHeader.svelte';
	import EntityHeaderPhoto from '$lib/components/ui/EntityHeaderPhoto.svelte';

	type FactionHeaderField =
		| 'name'
		| 'factionType'
		| 'alignment'
		| 'summary'
		| 'publicReputation'
		| 'headquarters'
		| 'size'
		| 'sphereOfInfluence';

	type FactionHeaderModel = {
		name?: string;
		factionType?: string;
		alignment?: string;
		summary?: string;
		photoUrl?: string;
		publicReputation?: string;
		headquarters?: string;
		size?: string;
		sphereOfInfluence?: string;
	};

	let {
		faction,
		onFieldChange,
		onPhotoUpload,
	}: {
		faction: FactionHeaderModel | null;
		onFieldChange: (field: FactionHeaderField, value: string) => void;
		onPhotoUpload?: (file: File) => void | Promise<void>;
	} = $props();
</script>

<EntityDetailHeader ariaLabel="Faction header" attributesColumns={2}>
	{#snippet media()}
		<EntityHeaderPhoto
			imageUrl={faction?.photoUrl}
			alt="Emblem of {faction?.name || 'faction'}"
			placeholderLabel="Emblem"
			uploadLabel="Upload Emblem"
			onUpload={onPhotoUpload}
		/>
	{/snippet}
	{#snippet identity()}
		<input
			class="entity-name input-inline"
			type="text"
			value={faction?.name || ''}
			oninput={(event) => onFieldChange('name', (event.currentTarget as HTMLInputElement).value)}
			placeholder="Unnamed Faction"
		/>
		<div class="role-row">
			<input
				class="entity-role input-inline"
				type="text"
				value={faction?.factionType || ''}
				oninput={(event) => onFieldChange('factionType', (event.currentTarget as HTMLInputElement).value)}
				placeholder="Faction Type"
			/>
			<span class="role-separator">•</span>
			<input
				class="entity-role input-inline"
				type="text"
				value={faction?.alignment || ''}
				oninput={(event) => onFieldChange('alignment', (event.currentTarget as HTMLInputElement).value)}
				placeholder="Alignment / Posture"
			/>
		</div>
		<textarea
			class="entity-summary input-inline"
			rows="2"
			value={faction?.summary || ''}
			oninput={(event) => onFieldChange('summary', (event.currentTarget as HTMLTextAreaElement).value)}
			placeholder="No faction summary recorded yet."
		></textarea>
	{/snippet}
	{#snippet attributes()}
		<div class="attribute-item">
			<span class="attribute-label">Public Reputation</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={faction?.publicReputation || ''}
				oninput={(event) => onFieldChange('publicReputation', (event.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Headquarters</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={faction?.headquarters || ''}
				oninput={(event) => onFieldChange('headquarters', (event.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Size / Scale</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={faction?.size || ''}
				oninput={(event) => onFieldChange('size', (event.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Sphere of Influence</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={faction?.sphereOfInfluence || ''}
				oninput={(event) => onFieldChange('sphereOfInfluence', (event.currentTarget as HTMLInputElement).value)}
				placeholder="-"
			/>
		</div>
	{/snippet}
</EntityDetailHeader>
