<script lang="ts">
	import EntityDetailHeader from '$lib/components/ui/EntityDetailHeader.svelte';
	import EntityHeaderPhoto from '$lib/components/ui/EntityHeaderPhoto.svelte';

	type CharacterHeaderModel = {
		name?: string;
		role?: string;
		occupation?: string;
		summary?: string;
		photoUrl?: string;
		age?: string;
		height?: string;
		weight?: string;
		build?: string;
		hair?: string;
		eyes?: string;
	};

	type HeaderField =
		| 'name'
		| 'role'
		| 'occupation'
		| 'summary'
		| 'age'
		| 'height'
		| 'weight'
		| 'build'
		| 'hair'
		| 'eyes';

	let {
		character,
		onFieldChange,
		onPhotoUpload,
	}: {
		character: CharacterHeaderModel | null;
		onFieldChange: (field: HeaderField, value: string) => void;
		onPhotoUpload?: (file: File) => void | Promise<void>;
	} = $props();
</script>

<EntityDetailHeader ariaLabel="Character header" attributesColumns={3}>
	{#snippet media()}
		<EntityHeaderPhoto
			imageUrl={character?.photoUrl}
			alt="Portrait of {character?.name || 'character'}"
			placeholderLabel="Photo"
			uploadLabel="Upload Photo"
			onUpload={onPhotoUpload}
		/>
	{/snippet}
	{#snippet identity()}
		<p class="dossier-eyebrow">Identity Dossier</p>
		<input
			class="entity-name input-inline"
			type="text"
			value={character?.name || ''}
			oninput={(event) => onFieldChange('name', (event.currentTarget as HTMLInputElement).value)}
			placeholder="Unnamed Character"
		/>
		<div class="role-row">
			<input
				class="entity-role input-inline"
				type="text"
				value={character?.role || ''}
				oninput={(event) => onFieldChange('role', (event.currentTarget as HTMLInputElement).value)}
				placeholder="Role"
			/>
			<span class="role-separator">•</span>
			<input
				class="entity-role input-inline"
				type="text"
				value={character?.occupation || ''}
				oninput={(event) => onFieldChange('occupation', (event.currentTarget as HTMLInputElement).value)}
				placeholder="Occupation"
			/>
		</div>
		<div class="identity-tags" aria-label="Identity quick tags">
			<span>{character?.role?.trim() || 'Role pending'}</span>
			<span>{character?.occupation?.trim() || 'Occupation pending'}</span>
		</div>
		<textarea
			class="entity-summary input-inline"
			rows="2"
			value={character?.summary || ''}
			oninput={(event) => onFieldChange('summary', (event.currentTarget as HTMLTextAreaElement).value)}
			placeholder="No summary recorded yet."
		></textarea>
	{/snippet}
	{#snippet attributes()}
		<div class="attribute-item">
			<span class="attribute-label">Age</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={character?.age || ''}
				oninput={(event) => onFieldChange('age', (event.currentTarget as HTMLInputElement).value)}
				placeholder="—"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Height</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={character?.height || ''}
				oninput={(event) => onFieldChange('height', (event.currentTarget as HTMLInputElement).value)}
				placeholder="—"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Weight</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={character?.weight || ''}
				oninput={(event) => onFieldChange('weight', (event.currentTarget as HTMLInputElement).value)}
				placeholder="—"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Build</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={character?.build || ''}
				oninput={(event) => onFieldChange('build', (event.currentTarget as HTMLInputElement).value)}
				placeholder="—"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Hair</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={character?.hair || ''}
				oninput={(event) => onFieldChange('hair', (event.currentTarget as HTMLInputElement).value)}
				placeholder="—"
			/>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Eyes</span>
			<input
				class="attribute-value input-inline"
				type="text"
				value={character?.eyes || ''}
				oninput={(event) => onFieldChange('eyes', (event.currentTarget as HTMLInputElement).value)}
				placeholder="—"
			/>
		</div>
	{/snippet}
</EntityDetailHeader>
