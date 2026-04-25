<script lang="ts">
	import { onDestroy } from 'svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let {
		coverUrl: initialCoverUrl,
		onUpload,
	}: {
		coverUrl?: string;
		onUpload?: (file: File) => void | Promise<void>;
	} = $props();

	let localCoverUrl = $state<string | undefined>(undefined);
	let lastSyncedCoverUrl = $state<string | undefined>(undefined);
	let hasSyncedExternal = $state(false);
	let fileInputEl = $state<HTMLInputElement | null>(null);

	const displayUrl = $derived(localCoverUrl ?? initialCoverUrl);
	const coverTitle = 'No Cover';
	const coverInitial = 'N';

	function openFilePicker() {
		fileInputEl?.click();
	}

	function revokeIfBlob(url: string | undefined) {
		if (url?.startsWith('blob:')) {
			URL.revokeObjectURL(url);
		}
	}

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		revokeIfBlob(localCoverUrl);
		localCoverUrl = URL.createObjectURL(file);
		input.value = '';
		void onUpload?.(file);
	}

	$effect(() => {
		if (!hasSyncedExternal) {
			hasSyncedExternal = true;
			lastSyncedCoverUrl = initialCoverUrl;
			return;
		}

		const externalCoverChanged = initialCoverUrl !== lastSyncedCoverUrl;
		if (externalCoverChanged) {
			lastSyncedCoverUrl = initialCoverUrl;
		}

		if (externalCoverChanged && localCoverUrl) {
			revokeIfBlob(localCoverUrl);
			localCoverUrl = undefined;
		}
	});

	onDestroy(() => {
		revokeIfBlob(localCoverUrl);
	});
</script>

<div class="hero-cover" aria-label={displayUrl ? 'Book cover' : 'Cover placeholder'}>
	{#if displayUrl}
		<img class="hero-cover-img" src={displayUrl} alt="Book cover" />
		<div class="hero-cover-overlay" role="group" aria-label="Cover options">
			<GhostButton
				class="cover-action-btn cover-action-btn--upload"
				type="button"
				onclick={openFilePicker}
				title="Change cover image"
				aria-label="Change cover image"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M8 2v8M5 5l3-3 3 3"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M2 11v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			</GhostButton>
		</div>
	{:else}
		<div class="hero-cover-placeholder" aria-hidden="true">
			<div class="hero-cover-foil"></div>
			<span class="hero-cover-initial">{coverInitial}</span>
			<span class="hero-cover-spine">{coverTitle}</span>
			<span class="hero-cover-label">Upload Cover</span>
			<div class="cover-actions" role="group" aria-label="Cover options">
				<GhostButton
					class="cover-action-btn cover-action-btn--upload"
					type="button"
					onclick={openFilePicker}
					title="Upload cover image"
					aria-label="Upload cover image"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M8 2v8M5 5l3-3 3 3"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M2 11v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
				</GhostButton>
			</div>
		</div>
	{/if}
	<input
		bind:this={fileInputEl}
		type="file"
		accept="image/*"
		class="file-input-hidden"
		onchange={handleFileChange}
		aria-hidden="true"
		tabindex="-1"
	/>
</div>

<style>
	.hero-cover {
		width: 100%;
		aspect-ratio: 2 / 3;
		border-radius: var(--radius-md);
		overflow: hidden;
		border: 1px solid var(--color-border-subtle);
		background: none;
		display: block;
		position: relative;
	}
	.hero-cover-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.hero-cover-overlay {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, black 55%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		opacity: 0;
		transition: opacity var(--duration-base) var(--ease-standard);
	}
	.hero-cover:hover .hero-cover-overlay {
		opacity: 1;
	}
	.hero-cover-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(
			160deg,
			var(--color-surface-elevated) 0%,
			var(--color-surface-overlay) 100%
		);
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
	}
	.hero-cover-foil {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 22% 18%, color-mix(in srgb, white 26%, transparent) 0%, transparent 45%),
			linear-gradient(125deg, color-mix(in srgb, white 12%, transparent), transparent 55%);
		mix-blend-mode: screen;
		pointer-events: none;
	}
	.hero-cover-initial {
		position: relative;
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 6vw, 3.6rem);
		line-height: 1;
		color: color-mix(in srgb, white 88%, var(--color-text-primary));
		text-shadow: 0 2px 18px color-mix(in srgb, black 45%, transparent);
	}
	.hero-cover-spine {
		position: absolute;
		left: var(--space-3);
		right: var(--space-3);
		bottom: var(--space-3);
		text-transform: uppercase;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: color-mix(in srgb, white 78%, var(--color-text-primary));
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.hero-cover-label {
		position: relative;
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}
	.cover-actions {
		position: relative;
		display: flex;
		gap: var(--space-3);
	}
	:global(.cover-action-btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		background: color-mix(in srgb, var(--color-surface-elevated) 70%, transparent);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			color var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard),
			background var(--duration-base) var(--ease-standard);
	}
	:global(.cover-action-btn:hover:not(:disabled)) {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
		background: var(--color-surface-elevated);
	}
	:global(.cover-action-btn:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	:global(.cover-action-btn:disabled) {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.file-input-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}
	@media (max-width: 640px) {
		.hero-cover {
			max-width: 200px;
			margin-inline: auto;
		}
	}
</style>
