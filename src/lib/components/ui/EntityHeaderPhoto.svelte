<script lang="ts">
	let {
		imageUrl,
		alt,
		placeholderLabel = 'Photo',
		uploadLabel = 'Upload Photo',
		uploadDisabled = false,
		onUpload,
	}: {
		imageUrl?: string | null;
		alt: string;
		placeholderLabel?: string;
		uploadLabel?: string;
		uploadDisabled?: boolean;
		onUpload?: (file: File) => void | Promise<void>;
	} = $props();

	async function handleChange(event: Event): Promise<void> {
		if (uploadDisabled) return;
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		await onUpload?.(file);
		input.value = '';
	}
</script>

<div class="entity-header-photo">
	<div class="photo-placeholder">
		{#if imageUrl?.trim()}
			<img class="photo-image" src={imageUrl} {alt} />
		{:else}
			<svg viewBox="0 0 300 200" aria-hidden="true">
				<rect width="300" height="200" fill="currentColor" opacity="0.05" />
				<text
					x="150"
					y="100"
					text-anchor="middle"
					dominant-baseline="middle"
					font-size="16"
					fill="currentColor"
					opacity="0.3"
				>
					{placeholderLabel}
				</text>
			</svg>
		{/if}
	</div>
	{#if onUpload}
		<label class="upload-photo-btn" class:upload-photo-btn--disabled={uploadDisabled}>
			<span>{uploadLabel}</span>
			<input type="file" accept="image/*" onchange={handleChange} disabled={uploadDisabled} />
		</label>
	{/if}
</div>

<style>
	.entity-header-photo {
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
</style>
