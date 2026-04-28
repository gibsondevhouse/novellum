<script lang="ts">
	import { type Asset } from '$lib/db/domain-types';
	import { onMount } from 'svelte';
	import { createAssetsStore } from '$modules/assets/stores/assets.svelte';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import {
		DestructiveButton,
		GhostButton,
		PrimaryButton,
	} from '$lib/components/ui/index.js';
	import { updateProject } from '$modules/project/services/project-repository';

	let { projectId = null } = $props<{ projectId?: string | null }>();

	const store = createAssetsStore(() => projectId || undefined);
	let selectedAsset = $state<Asset | null>(null);
	let isAssigning = $state(false);
	let confirmDelete = $state(false);
	let assignProjectId = $state('');
	let assignUseFor = $state('cover');
	let toolbarUploadInput = $state<HTMLInputElement | null>(null);
	let emptyStateUploadInput = $state<HTMLInputElement | null>(null);

	onMount(() => {
		store.load();
	});

	$effect(() => {
		// Reload when projectId changes
		void projectId; 
		store.load();
	});

	$effect(() => {
		if (!selectedAsset) {
			return;
		}

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				selectedAsset = null;
				isAssigning = false;
				confirmDelete = false;
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => {
			window.removeEventListener('keydown', handleEscape);
		};
	});

	async function handleUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		const MAX_SIZE = 5 * 1024 * 1024; // 5MB

		for (const file of input.files) {
			if (file.size > MAX_SIZE) {
				alert(`File ${file.name} is too large. Maximum size is 5MB.`);
				continue;
			}

			const reader = new FileReader();
			reader.onload = async (re) => {
				const base64 = re.target?.result as string;
				await store.addAsset({
					projectId: projectId || 'global',
					name: file.name,
					mimeType: file.type,
					data: base64,
					sizeBytes: file.size
				});
			};
			reader.readAsDataURL(file);
		}
	}

	async function deleteAsset(id: string) {
		if (id.startsWith('cover-')) {
			const targetProjectId = id.replace('cover-', '');
			await updateProject(targetProjectId, { coverUrl: '' });
			store.load();
		} else {
			await store.removeAsset(id);
		}
		if (selectedAsset?.id === id) {
			selectedAsset = null;
			isAssigning = false;
			confirmDelete = false;
		}
	}

	async function assignAsset() {
		if (!selectedAsset || !assignProjectId || assignUseFor !== 'cover') return;
		await updateProject(assignProjectId, { coverUrl: selectedAsset.data });
		isAssigning = false;
		assignProjectId = '';
		store.load();
	}

	function bytesToSize(bytes: number) {
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes === 0) return '0 Byte';
		const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
		return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
	}
</script>

<div class="image-grid-container">
	<div class="toolbar">
		<GhostButton type="button" class="upload-btn" onclick={() => toolbarUploadInput?.click()}>
			Upload Image
		</GhostButton>
		<input
			bind:this={toolbarUploadInput}
			type="file"
			multiple
			accept="image/*"
			onchange={handleUpload}
			class="sr-only"
			aria-label="Upload image files"
		/>
	</div>

	{#if store.loading}
		<div class="loading">Loading assets...</div>
	{:else if store.albums.length === 0}
		<EmptyStatePanel
			title="No images yet"
			description="Upload reference visuals, character portraits, and map designs to use across your projects."
		>
			{#snippet actions()}
				<GhostButton type="button" class="upload-btn" onclick={() => emptyStateUploadInput?.click()}>
					Upload Image
				</GhostButton>
				<input
					bind:this={emptyStateUploadInput}
					type="file"
					multiple
					accept="image/*"
					onchange={handleUpload}
					class="sr-only"
					aria-label="Upload image files"
				/>
			{/snippet}
		</EmptyStatePanel>
	{:else}
		<div class="albums-container">
			{#each store.albums as album (album.id)}
				<section class="album-section">
					<h3 class="album-title">{album.title}</h3>
					<div class="grid">
						{#if album.coverUrl}
							<button
								type="button"
								class="asset-card cover-card"
								aria-label={`Open ${album.title} cover artwork`}
								onclick={() => {
									selectedAsset = {
										id: `cover-${album.id}`,
										projectId: album.id,
										name: `${album.title} Cover`,
										data: album.coverUrl!,
										mimeType: 'image/*',
										sizeBytes: 0,
										createdAt: new Date().toISOString(),
										updatedAt: new Date().toISOString()
									};
									confirmDelete = false;
								}}
							>
								<div class="img-wrapper">
									<img src={album.coverUrl} alt={`${album.title} Cover`} />
								</div>
								<div class="asset-meta">
									<span class="asset-name">Cover Artwork</span>
								</div>
							</button>
						{/if}
						{#each album.assets as asset (asset.id)}
							<button
								type="button"
								class={`asset-card ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
								aria-label={`Open asset ${asset.name}`}
								onclick={() => {
									selectedAsset = asset;
									confirmDelete = false;
								}}
							>
								<div class="img-wrapper">
									<img src={asset.data} alt={asset.name} />
								</div>
								<div class="asset-meta">
									<span class="asset-name">{asset.name}</span>
									<span class="asset-type">{bytesToSize(asset.sizeBytes)}</span>
								</div>
							</button>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}

	{#if selectedAsset}
		<div class="dialog-backdrop">
			<button
				type="button"
				class="dialog-backdrop-dismiss"
				aria-label="Close image preview dialog"
				onclick={() => {
					selectedAsset = null;
					isAssigning = false;
					confirmDelete = false;
				}}
			></button>
			<div class="dialog" role="dialog" tabindex="-1" aria-modal="true" aria-label={selectedAsset.name}>
				<div class="dialog-header">
					<h2>{selectedAsset.name}</h2>
					<GhostButton
						class="close-btn"
						type="button"
						aria-label="Close image preview"
						onclick={() => {
							selectedAsset = null;
							isAssigning = false;
						}}
					>
						✕
					</GhostButton>
				</div>
				<div class="dialog-content">
					<img src={selectedAsset.data} alt={selectedAsset.name} />
					<div class="dialog-meta">
						<span>Size: {bytesToSize(selectedAsset.sizeBytes)}</span>
						<span>Date: {new Date(selectedAsset.createdAt).toLocaleDateString()}</span>
					</div>
					{#if confirmDelete}
						<div class="delete-confirm" role="alert">
							<p>Delete this asset from the gallery?</p>
							<div class="delete-confirm__actions">
								<DestructiveButton type="button" onclick={() => selectedAsset && deleteAsset(selectedAsset.id)}>
									Confirm Delete
								</DestructiveButton>
								<GhostButton type="button" onclick={() => (confirmDelete = false)}>Cancel</GhostButton>
							</div>
						</div>
					{/if}
					
					{#if isAssigning}
						<div class="assign-form">
							<label for="assign-use-for" class="sr-only">Assign image as</label>
							<select id="assign-use-for" bind:value={assignUseFor} class="assign-select">
								<option value="cover">Project Cover</option>
								<option value="character">Character Portrait</option>
								<option value="scene">Scene Reference</option>
							</select>
							<label for="assign-project-id" class="sr-only">Project to assign image to</label>
							<select id="assign-project-id" bind:value={assignProjectId} class="assign-select">
								<option value="">-- Select Project --</option>
								{#each store.albums as album (album.id)}
									{#if album.id !== 'global'}
										<option value={album.id}>{album.title}</option>
									{/if}
								{/each}
							</select>
								<PrimaryButton type="button" onclick={assignAsset} disabled={!assignProjectId || assignUseFor !== 'cover'}>
								Confirm Assignment
								</PrimaryButton>
						</div>
					{/if}
				</div>
				<div class="dialog-footer">
						<GhostButton type="button" onclick={() => (isAssigning = !isAssigning)}>
						{isAssigning ? 'Cancel' : 'Assign to Project...'}
						</GhostButton>
						<DestructiveButton type="button" onclick={() => (confirmDelete = true)} disabled={confirmDelete}>
						{confirmDelete ? 'Awaiting confirmation' : 'Delete Image'}
						</DestructiveButton>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.image-grid-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		width: 100%;
	}
	.toolbar {
		display: flex;
		justify-content: flex-end;
	}
	:global(.upload-btn) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2) var(--space-4);
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		cursor: pointer;
		font-weight: 500;
		font-size: var(--text-sm);
		transition: background var(--duration-enter) var(--ease-standard);
	}
	:global(.upload-btn:hover) {
		background-color: var(--color-surface-overlay);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
	.loading {
		text-align: center;
		color: var(--color-text-muted);
		padding: var(--space-8);
	}
	.albums-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}
	.album-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.album-title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-4);
	}
	:global(.asset-card) {
		appearance: none;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		transition: transform var(--duration-enter) var(--ease-standard), border-color var(--duration-enter) var(--ease-standard);
		display: flex;
		flex-direction: column;
	}
	:global(.asset-card:hover) {
		transform: translateY(-2px);
		border-color: var(--color-border-strong);
	}
	:global(.asset-card.selected) {
		border-color: var(--color-text-primary);
	}
	.img-wrapper {
		width: 100%;
		aspect-ratio: 1;
		background: var(--color-surface-hover);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.img-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.asset-meta {
		padding: var(--space-3);
		background: var(--color-surface-overlay);
	}
	.asset-name {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.asset-type {
		display: block;
		margin-top: var(--space-1);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	
	.dialog-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: color-mix(in srgb, black 60%, transparent);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: var(--space-4);
	}
	:global(.dialog-backdrop-dismiss) {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}
	.dialog {
		position: relative;
		z-index: 1;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-xl);
		overflow: hidden;
	}
	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}
	.dialog-header h2 {
		margin: 0;
		font-size: var(--text-base);
		font-weight: 500;
	}
	:global(.close-btn) {
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		padding: var(--space-1);
	}
	:global(.close-btn:hover) {
		color: var(--color-text-primary);
	}
	.dialog-content {
		padding: var(--space-4);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		align-items: center;
		background: var(--color-surface-hover);
	}
	.dialog-content img {
		max-width: 100%;
		max-height: 60vh;
		object-fit: contain;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}
	.dialog-meta {
		display: flex;
		gap: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		width: 100%;
		justify-content: center;
	}
	.dialog-footer {
		padding: var(--space-4);
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: flex-end;
		gap: var(--space-4);
	}

	.delete-confirm {
		width: 100%;
		max-width: 420px;
		padding: var(--space-4);
		border: 1px solid color-mix(in srgb, var(--color-error) 35%, var(--color-border-default));
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-error) 8%, var(--color-surface-overlay));
	}

	.delete-confirm p {
		margin: 0;
		color: var(--color-text-primary);
	}

	.delete-confirm__actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}
	.assign-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
		max-width: 400px;
		margin-top: var(--space-4);
		padding: var(--space-4);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.assign-select {
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}
</style>
