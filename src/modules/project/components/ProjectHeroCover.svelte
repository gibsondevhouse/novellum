<script lang="ts">
	import { onDestroy } from 'svelte';

	let {
		coverUrl: initialCoverUrl,
		onUpload,
	}: { coverUrl?: string; onUpload?: (file: File) => void | Promise<void> } = $props();

	let localCoverUrl = $state<string | undefined>(undefined);
	let lastSyncedCoverUrl = $state<string | undefined>(undefined);
	let hasSyncedExternal = $state(false);
	let fileInputEl = $state<HTMLInputElement | null>(null);

	const displayUrl = $derived(localCoverUrl ?? initialCoverUrl);

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
			<button
				class="cover-action-btn cover-action-btn--ai"
				disabled
				title="AI cover generation — coming soon"
				aria-label="Generate cover with AI (coming soon)"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M8 2l.9 2.6L11.5 5.5l-2.6.9L8 9l-.9-2.6L4.5 5.5l2.6-.9L8 2z"
						fill="currentColor"
					/>
					<path
						d="M13 9l.5 1.5L15 11l-1.5.5L13 13l-.5-1.5L11 11l1.5-.5L13 9z"
						fill="currentColor"
					/>
					<path
						d="M4 11l.4 1.1 1.1.4-1.1.4L4 14l-.4-1.1L2.5 12.5l1.1-.4L4 11z"
						fill="currentColor"
					/>
				</svg>
			</button>
			<button
				class="cover-action-btn cover-action-btn--upload"
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
			</button>
		</div>
	{:else}
		<div class="hero-cover-placeholder">
			<span class="hero-cover-label">Add Cover</span>
			<div class="cover-actions" role="group" aria-label="Cover options">
				<button
					class="cover-action-btn cover-action-btn--ai"
					disabled
					title="AI cover generation — coming soon"
					aria-label="Generate cover with AI (coming soon)"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M8 2l.9 2.6L11.5 5.5l-2.6.9L8 9l-.9-2.6L4.5 5.5l2.6-.9L8 2z"
							fill="currentColor"
						/>
						<path
							d="M13 9l.5 1.5L15 11l-1.5.5L13 13l-.5-1.5L11 11l1.5-.5L13 9z"
							fill="currentColor"
						/>
						<path
							d="M4 11l.4 1.1 1.1.4-1.1.4L4 14l-.4-1.1L2.5 12.5l1.1-.4L4 11z"
							fill="currentColor"
						/>
					</svg>
				</button>
				<button
					class="cover-action-btn cover-action-btn--upload"
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
				</button>
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
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
	}
	.hero-cover-label {
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}
	.cover-actions {
		display: flex;
		gap: var(--space-3);
	}
	.cover-action-btn {
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
	.cover-action-btn:hover:not(:disabled) {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
		background: var(--color-surface-elevated);
	}
	.cover-action-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	.cover-action-btn:disabled {
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
