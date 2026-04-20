<script lang="ts">
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

	async function handlePhotoFileChange(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		await onPhotoUpload?.(file);
		input.value = '';
	}
</script>

<div class="faction-header">
	<div class="header-photo">
		<div class="photo-placeholder">
			{#if faction?.photoUrl?.trim()}
				<img class="photo-image" src={faction.photoUrl} alt="Emblem of {faction.name || 'faction'}" />
			{:else}
				<svg viewBox="0 0 300 200" aria-hidden="true">
					<rect width="300" height="200" fill="currentColor" opacity="0.05" />
					<text x="150" y="100" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="currentColor" opacity="0.3">
						Emblem
					</text>
				</svg>
			{/if}
		</div>
		<label class="upload-photo-btn">
			<span>Upload Emblem</span>
			<input type="file" accept="image/*" onchange={handlePhotoFileChange} />
		</label>
	</div>

	<div class="header-info">
		<div class="identity-quick">
			<input class="faction-name input-inline" type="text" value={faction?.name || ''} oninput={(event) => onFieldChange('name', (event.currentTarget as HTMLInputElement).value)} placeholder="Unnamed Faction" />
			<div class="role-row">
				<input class="faction-role input-inline" type="text" value={faction?.factionType || ''} oninput={(event) => onFieldChange('factionType', (event.currentTarget as HTMLInputElement).value)} placeholder="Faction Type" />
				<span class="role-separator">•</span>
				<input class="faction-role input-inline" type="text" value={faction?.alignment || ''} oninput={(event) => onFieldChange('alignment', (event.currentTarget as HTMLInputElement).value)} placeholder="Alignment / Posture" />
			</div>
			<textarea class="faction-summary input-inline" rows="2" value={faction?.summary || ''} oninput={(event) => onFieldChange('summary', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="No faction summary recorded yet."></textarea>
		</div>

		<div class="attributes-grid">
			<div class="attribute-item">
				<span class="attribute-label">Public Reputation</span>
				<input class="attribute-value input-inline" type="text" value={faction?.publicReputation || ''} oninput={(event) => onFieldChange('publicReputation', (event.currentTarget as HTMLInputElement).value)} placeholder="-" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Headquarters</span>
				<input class="attribute-value input-inline" type="text" value={faction?.headquarters || ''} oninput={(event) => onFieldChange('headquarters', (event.currentTarget as HTMLInputElement).value)} placeholder="-" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Size / Scale</span>
				<input class="attribute-value input-inline" type="text" value={faction?.size || ''} oninput={(event) => onFieldChange('size', (event.currentTarget as HTMLInputElement).value)} placeholder="-" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Sphere of Influence</span>
				<input class="attribute-value input-inline" type="text" value={faction?.sphereOfInfluence || ''} oninput={(event) => onFieldChange('sphereOfInfluence', (event.currentTarget as HTMLInputElement).value)} placeholder="-" />
			</div>
		</div>
	</div>
</div>

<style>
	.faction-header {
		display: grid;
		grid-template-columns: minmax(220px, 260px) 1fr;
		gap: var(--space-5);
		align-items: start;
		padding-bottom: var(--space-5);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 55%, transparent);
	}

	.photo-placeholder {
		width: 100%;
		aspect-ratio: 3 / 2;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 65%, transparent);
		border-radius: var(--radius-lg);
		background: linear-gradient(180deg, color-mix(in srgb, var(--color-surface-overlay) 75%, transparent) 0%, color-mix(in srgb, var(--color-surface-ground) 90%, transparent) 100%);
		overflow: hidden;
	}

	.photo-placeholder svg,
	.photo-image {
		width: 100%;
		height: 100%;
		display: block;
	}

	.photo-image {
		object-fit: cover;
	}

	.upload-photo-btn {
		margin-top: var(--space-2);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 82%, transparent);
		border-radius: var(--radius-md);
		padding: 0.45rem 0.7rem;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		background: color-mix(in srgb, var(--color-surface-overlay) 30%, transparent);
		cursor: pointer;
	}

	.upload-photo-btn input {
		display: none;
	}

	.header-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.identity-quick {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.faction-name {
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
	}

	.faction-role {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.role-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.role-separator {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2) var(--space-3);
	}

	.attribute-item {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding-bottom: var(--space-1);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent);
	}

	.attribute-label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.input-inline {
		width: 100%;
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		padding: 0.15rem 0.2rem;
		border-radius: var(--radius-sm);
	}

	.input-inline:hover {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.input-inline:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
	}

	@media (max-width: 1024px) {
		.faction-header {
			grid-template-columns: 1fr;
		}
	}
</style>
