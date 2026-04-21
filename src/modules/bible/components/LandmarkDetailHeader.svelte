<script lang="ts">
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

	async function handlePhotoFileChange(event: Event): Promise<void> {
		if (uploadDisabled) return;

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
			{#if photoUrl.trim()}
				<img class="photo-image" src={photoUrl} alt="Photo of {landmark?.name || 'landmark'}" />
			{:else}
				<svg viewBox="0 0 300 200" aria-hidden="true">
					<rect width="300" height="200" fill="currentColor" opacity="0.05" />
					<text x="150" y="100" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="currentColor" opacity="0.3">
						Photo
					</text>
				</svg>
			{/if}
		</div>
		<label class="upload-photo-btn" class:upload-photo-btn--disabled={uploadDisabled}>
			<span>{uploadDisabled ? 'Save landmark first' : 'Upload Photo'}</span>
			<input type="file" accept="image/*" onchange={handlePhotoFileChange} disabled={uploadDisabled} />
		</label>
	</div>

	<div class="header-info">
		<div class="identity-quick">
			<p class="dossier-eyebrow">Identity Dossier</p>
			<h2 class="character-name">{landmark?.name?.trim() || 'New Landmark'}</h2>
			<div class="role-row">
				<p class="character-role">{landmark?.activityType?.trim() || 'Activity pending'}</p>
				<span class="role-separator">•</span>
				<p class="character-role">{landmark?.emotionalTone?.trim() || 'Tone pending'}</p>
			</div>
			<div class="identity-tags" aria-label="Identity quick tags">
				<span>{landmark?.purpose?.trim() || 'Purpose pending'}</span>
				<span>{landmark?.activityType?.trim() || 'Activity pending'}</span>
			</div>
			<p class="character-summary">{landmark?.description?.trim() || 'No summary recorded yet.'}</p>
		</div>

		<div class="attributes-grid">
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

	.upload-photo-btn--disabled {
		opacity: 0.65;
		cursor: not-allowed;
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

	.dossier-eyebrow,
	.character-name,
	.character-summary,
	.character-role,
	.attribute-value,
	.attribute-label {
		margin: 0;
	}

	.dossier-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.character-name {
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.character-role {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.character-summary {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		max-width: 60ch;
		line-height: var(--leading-relaxed);
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
		letter-spacing: 0.07em;
		color: var(--color-text-muted);
	}

	.attribute-value {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 960px) {
		.character-header {
			grid-template-columns: 1fr;
		}

		.attributes-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.attributes-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
