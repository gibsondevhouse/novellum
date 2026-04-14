<script lang="ts">
	import { type Asset } from '$lib/db';
	import { onMount } from 'svelte';
	import { createAssetsStore } from '$modules/assets/stores/assets.svelte';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';

	let { projectId = null } = $props<{ projectId?: string | null }>();

	const store = createAssetsStore(() => projectId || undefined);
	let selectedAsset = $state<Asset | null>(null);

	onMount(() => {
		store.load();
	});

	$effect(() => {
		// Reload when projectId changes
		void projectId; 
		store.load();
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
		await store.removeAsset(id);
		if (selectedAsset?.id === id) {
			selectedAsset = null;
		}
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
		<label class="upload-btn">
			<span>Upload Image</span>
			<input type="file" multiple accept="image/*" onchange={handleUpload} style="display: none;" />
		</label>
	</div>

	{#if store.loading}
		<div class="loading">Loading assets...</div>
	{:else if store.assets.length === 0}
		<EmptyStatePanel
			title="No images yet"
			description="Upload reference visuals, character portraits, and map designs to use across your projects."
		>
			{#snippet actions()}
				<label class="upload-btn">
					<span>Upload Image</span>
					<input type="file" multiple accept="image/*" onchange={handleUpload} style="display: none;" />
				</label>
			{/snippet}
		</EmptyStatePanel>
	{:else}
		<div class="grid">
			{#each store.assets as asset (asset.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="asset-card"
					onclick={() => (selectedAsset = asset)}
					class:selected={selectedAsset?.id === asset.id}
				>
					<div class="img-wrapper">
						<img src={asset.data} alt={asset.name} />
					</div>
					<div class="asset-meta">
						<span class="asset-name">{asset.name}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if selectedAsset}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="dialog-backdrop" onclick={() => (selectedAsset = null)}>
			<div class="dialog" onclick={(e) => e.stopPropagation()}>
				<div class="dialog-header">
					<h2>{selectedAsset.name}</h2>
					<button class="close-btn" onclick={() => (selectedAsset = null)}>✕</button>
				</div>
				<div class="dialog-content">
					<img src={selectedAsset.data} alt={selectedAsset.name} />
					<div class="dialog-meta">
						<span>Size: {bytesToSize(selectedAsset.sizeBytes)}</span>
						<span>Date: {new Date(selectedAsset.createdAt).toLocaleDateString()}</span>
					</div>
				</div>
				<div class="dialog-footer">
					<button class="btn-danger" onclick={() => deleteAsset(selectedAsset!.id)}>
						Delete Image
					</button>
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
	.upload-btn {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		cursor: pointer;
		font-weight: 500;
		font-size: var(--text-sm);
		transition: background 0.2s ease;
	}
	.upload-btn:hover {
		background-color: var(--color-surface-overlay);
	}
	.loading {
		text-align: center;
		color: var(--color-text-muted);
		padding: var(--space-8);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-4);
	}
	.asset-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.2s ease, border-color 0.2s ease;
		display: flex;
		flex-direction: column;
	}
	.asset-card:hover {
		transform: translateY(-2px);
		border-color: var(--color-border-hover);
	}
	.asset-card.selected {
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
		background: var(--color-surface);
	}
	.asset-name {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.dialog-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: var(--space-4);
	}
	.dialog {
		background: var(--color-surface);
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
	.close-btn {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: var(--space-1);
	}
	.close-btn:hover {
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
	}
	.btn-danger {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-status-error);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: background 0.2s ease;
	}
	.btn-danger:hover {
		background: var(--color-status-error);
		color: white;
		border-color: var(--color-status-error);
	}
</style>
