<script lang="ts">
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import { buildPortabilitySnapshot } from '../services/portability/snapshot-service.js';

	let {
		projectId,
		open,
		onClose,
	}: {
		projectId: string;
		open: boolean;
		onClose: () => void;
	} = $props();

	let loading = $state(false);
	let exporting = $state(false);
	let copying = $state(false);
	let jsonPayload = $state<string | null>(null);
	let jsonFilename = $state('project-export.novellum.json');
	let actionError = $state<string | null>(null);
	let actionSuccess = $state<string | null>(null);

	$effect(() => {
		if (open) {
			void prepareJsonPayload();
		}
	});

	function makeSafeFilename(name: string): string {
		const safe =
			name
				.replace(/[^a-z0-9\s-]/gi, '')
				.replace(/\s+/g, '_')
				.toLowerCase()
				.slice(0, 50) || 'project';
		const datePart = new Date().toISOString().slice(0, 10);
		return `${safe}_${datePart}.novellum.json`;
	}

	async function prepareJsonPayload() {
		loading = true;
		actionError = null;
		actionSuccess = null;
		try {
			const snapshot = await buildPortabilitySnapshot(projectId);
			const projectRow = (snapshot.dexie.projects?.[0] ?? {}) as { title?: string };
			const title = projectRow.title ?? 'project';
			jsonFilename = makeSafeFilename(title);

			jsonPayload = JSON.stringify(
				{
					format: 'novellum_project_json',
					exportedAt: new Date().toISOString(),
					projectId,
					tableCounts: snapshot.tableCounts,
					data: snapshot.dexie,
					kv: snapshot.kv,
				},
				null,
				2,
			);
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Failed to prepare project JSON.';
		} finally {
			loading = false;
		}
	}

	async function handleExportJson() {
		if (!jsonPayload) return;
		exporting = true;
		actionError = null;
		actionSuccess = null;
		try {
			downloadBlob(new Blob([jsonPayload], { type: 'application/json' }), jsonFilename);
			actionSuccess = `Downloaded ${jsonFilename}`;
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Failed to export JSON file.';
		} finally {
			exporting = false;
		}
	}

	async function handleCopyJson() {
		if (!jsonPayload) return;
		copying = true;
		actionError = null;
		actionSuccess = null;
		try {
			await navigator.clipboard.writeText(jsonPayload);
			actionSuccess = 'Project JSON copied to clipboard.';
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Unable to copy JSON to clipboard.';
		} finally {
			copying = false;
		}
	}

	function downloadBlob(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

{#if open}
	<div class="modal-backdrop" role="presentation" onclick={onClose}>
		<div
			class="modal"
			role="dialog"
			aria-label="Export JSON Options"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h2 class="modal-title">Export Project JSON</h2>
			</div>

			{#if loading}
				<div class="modal-body">
					<p class="loading-text">Preparing project JSON...</p>
				</div>
			{:else}
				<div class="modal-body">
					<p class="intro-text">
						Choose how you want to work with your JSON export. Both options use the same full
						project payload.
					</p>

					<aside class="scope-warning" role="note" aria-label="Export scope warning">
						<strong>Preview format.</strong> This JSON is generated from the legacy Dexie
						portability layer and is not yet a complete SQLite-backed backup. Some entities
						that live only in SQLite may be omitted. A canonical
						<code>.novellum</code> backup format is in development.
					</aside>

					<div class="split-pane" role="group" aria-label="JSON export actions">
						<section class="pane">
							<h3 class="pane-title">Export JSON</h3>
							<p class="pane-description">
								Best when you need a file for backups, handoff, versioning, or import flows in other
								tools.
							</p>
							<PrimaryButton onclick={handleExportJson} disabled={!jsonPayload || exporting || copying}>
								{exporting ? 'Exporting...' : 'Export JSON'}
							</PrimaryButton>
						</section>

						<section class="pane">
							<h3 class="pane-title">Copy JSON</h3>
							<p class="pane-description">
								Best for quick sharing in chat, debugging payloads, or pasting into scripts and AI
								prompts.
							</p>
							<GhostButton onclick={handleCopyJson} disabled={!jsonPayload || exporting || copying}>
								{copying ? 'Copying...' : 'Copy JSON'}
							</GhostButton>
						</section>
					</div>

					{#if actionError}
						<p class="error-text" role="alert">{actionError}</p>
					{/if}

					{#if actionSuccess}
						<p class="success-text" role="status">{actionSuccess}</p>
					{/if}
				</div>
			{/if}

			<div class="modal-footer">
				<GhostButton onclick={onClose} disabled={loading || exporting || copying}>Close</GhostButton>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, black 60%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		width: min(820px, 92vw);
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		overflow: hidden;
	}

	.modal-header {
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--color-border-default);
	}

	.modal-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.modal-body {
		padding: var(--space-4) var(--space-6);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.modal-footer {
		padding: var(--space-4) var(--space-6);
		border-top: 1px solid var(--color-border-default);
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
	}

	.loading-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.intro-text {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.split-pane {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	.pane {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: linear-gradient(145deg, var(--color-surface-raised) 0%, var(--color-surface-overlay) 100%);
	}

	.pane-title {
		margin: 0;
		font-size: var(--text-lg);
		color: var(--color-text-primary);
		font-family: var(--font-display);
	}

	.pane-description {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.error-text {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-error);
	}

	.success-text {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-success-on-dark);
	}

	.scope-warning {
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 85%, transparent);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.scope-warning strong {
		color: var(--color-text-primary);
	}

	.scope-warning code {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-primary);
	}

	@media (max-width: 760px) {
		.split-pane {
			grid-template-columns: 1fr;
		}
	}
</style>
