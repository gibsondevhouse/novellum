<script lang="ts">
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

	async function handlePhotoFileChange(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		await onPhotoUpload?.(file);
		input.value = '';
	}
</script>

<div class="character-header">
	<div class="header-photo">
		<div class="photo-placeholder">
			{#if character?.photoUrl?.trim()}
				<img class="photo-image" src={character.photoUrl} alt="Portrait of {character.name || 'character'}" />
			{:else}
				<svg viewBox="0 0 300 200" aria-hidden="true">
					<rect width="300" height="200" fill="currentColor" opacity="0.05" />
					<text x="150" y="100" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="currentColor" opacity="0.3">
						Photo
					</text>
				</svg>
			{/if}
		</div>
		<label class="upload-photo-btn">
			<span>Upload Photo</span>
			<input type="file" accept="image/*" onchange={handlePhotoFileChange} />
		</label>
	</div>

	<div class="header-info">
		<div class="identity-quick">
			<p class="dossier-eyebrow">Identity Dossier</p>
			<input
				class="character-name input-inline"
				type="text"
				value={character?.name || ''}
				oninput={(event) => onFieldChange('name', (event.currentTarget as HTMLInputElement).value)}
				placeholder="Unnamed Character"
			/>
			<div class="role-row">
				<input
					class="character-role input-inline"
					type="text"
					value={character?.role || ''}
					oninput={(event) => onFieldChange('role', (event.currentTarget as HTMLInputElement).value)}
					placeholder="Role"
				/>
				<span class="role-separator">•</span>
				<input
					class="character-role input-inline"
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
				class="character-summary input-inline"
				rows="2"
				value={character?.summary || ''}
				oninput={(event) => onFieldChange('summary', (event.currentTarget as HTMLTextAreaElement).value)}
				placeholder="No summary recorded yet."
			></textarea>
		</div>

		<div class="attributes-grid">
			<div class="attribute-item">
				<span class="attribute-label">Age</span>
				<input class="attribute-value input-inline" type="text" value={character?.age || ''} oninput={(event) => onFieldChange('age', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Height</span>
				<input class="attribute-value input-inline" type="text" value={character?.height || ''} oninput={(event) => onFieldChange('height', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Weight</span>
				<input class="attribute-value input-inline" type="text" value={character?.weight || ''} oninput={(event) => onFieldChange('weight', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Build</span>
				<input class="attribute-value input-inline" type="text" value={character?.build || ''} oninput={(event) => onFieldChange('build', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Hair</span>
				<input class="attribute-value input-inline" type="text" value={character?.hair || ''} oninput={(event) => onFieldChange('hair', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="attribute-item">
				<span class="attribute-label">Eyes</span>
				<input class="attribute-value input-inline" type="text" value={character?.eyes || ''} oninput={(event) => onFieldChange('eyes', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
		</div>
	</div>
</div>

<style>
	.character-header {
		display: grid;
		grid-template-columns: minmax(220px, 260px) 1fr;
		gap: var(--space-5);
		align-items: start;
		padding-bottom: var(--space-5);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 55%, transparent);
	}

	.header-photo {
		width: 100%;
	}

	.photo-placeholder {
		width: 100%;
		aspect-ratio: 3 / 2;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 65%, transparent);
		border-radius: var(--radius-lg);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-surface-overlay) 75%, transparent) 0%,
			color-mix(in srgb, var(--color-surface-ground) 90%, transparent) 100%
		);
		display: grid;
		place-items: center;
		color: var(--color-text-secondary);
		overflow: hidden;
	}

	.photo-placeholder svg {
		width: 100%;
		height: 100%;
	}

	.photo-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
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

	.upload-photo-btn:hover {
		border-color: color-mix(in srgb, var(--color-nova-blue) 40%, var(--color-border-default));
		color: var(--color-text-primary);
	}

	.upload-photo-btn input {
		display: none;
	}

	.header-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-2) 0;
	}

	.identity-quick {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.dossier-eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.character-name {
		margin: 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.character-role {
		margin: 0;
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.character-summary {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		max-width: 60ch;
		line-height: var(--leading-relaxed);
		resize: vertical;
		min-height: 4.5rem;
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

	.identity-tags {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.identity-tags span {
		padding: 0.3rem 0.6rem;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-surface-overlay) 78%, transparent);
		border: 1px solid var(--color-border-default);
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

	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
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

	.attribute-value {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	@media (max-width: 1024px) {
		.character-header {
			grid-template-columns: 1fr;
		}

		.attributes-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.character-header {
			gap: var(--space-4);
		}

		.role-row {
			flex-wrap: wrap;
		}

		.attributes-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
