<script lang="ts">
	import {
		parseBackupArchive,
		buildPreviewSummary,
	} from '../services/portability/zip-import-parse.js';
	import { restoreBackupSnapshot } from '../services/portability/restore-service.js';
	import { PortabilityParseError } from '../services/portability/zip-import-parse.js';
	import type { ParsedArchive, PreviewSummary } from '../services/portability/zip-import-parse.js';
	import type { RestoreResult } from '../services/portability/restore-service.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	type DialogState = 'idle' | 'validating' | 'preview' | 'restoring' | 'success' | 'error';

	let {
		open,
		onClose,
		onRestoreComplete,
	}: {
		open: boolean;
		onClose: () => void;
		onRestoreComplete: () => void;
	} = $props();

	let dialogState = $state<DialogState>('idle');
	let parsedArchive = $state<ParsedArchive | null>(null);
	let preview = $state<PreviewSummary | null>(null);
	let restoreResult = $state<RestoreResult | null>(null);
	let errorMessage = $state('');

	// Reset dialogState when dialog opens
	$effect(() => {
		if (open) {
			dialogState = 'idle';
			parsedArchive = null;
			preview = null;
			restoreResult = null;
			errorMessage = '';
		}
	});

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		dialogState = 'validating';

		try {
			parsedArchive = await parseBackupArchive(file);
			preview = buildPreviewSummary(parsedArchive);
			dialogState = 'preview';
		} catch (err) {
			if (err instanceof PortabilityParseError) {
				errorMessage = err.message;
			} else {
				errorMessage = 'Failed to read archive. The file may be corrupted.';
			}
			dialogState = 'error';
		}
	}

	async function handleConfirmRestore() {
		if (!parsedArchive) return;
		dialogState = 'restoring';

		try {
			restoreResult = await restoreBackupSnapshot(parsedArchive);
			if (restoreResult.success) {
				dialogState = 'success';
			} else {
				errorMessage = restoreResult.error ?? 'Restore failed unexpectedly.';
				dialogState = 'error';
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Restore failed.';
			dialogState = 'error';
		}
	}

	function handleDone() {
		onRestoreComplete();
		onClose();
	}

	function handleRetry() {
		dialogState = 'idle';
		parsedArchive = null;
		preview = null;
		errorMessage = '';
	}

	/** Total entity count from table counts */
	function totalEntities(counts: Record<string, number>): number {
		return Object.values(counts).reduce((sum, n) => sum + n, 0);
	}
</script>

{#if open}
	<div class="modal-backdrop" role="presentation" onclick={onClose}>
		<div
			class="modal"
			role="dialog"
			aria-label="Import Backup"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h2 class="modal-title">Import Backup</h2>
			</div>

			<div class="modal-body">
				{#if dialogState === 'idle'}
					<p class="hint-text">
						Select a <code>.novellum.zip</code> backup file to restore a project into this browser.
					</p>
					<aside class="scope-warning" role="note" aria-label="Import scope warning">
						<strong>Preview format.</strong> The current <code>.novellum.zip</code> archive
						restores the legacy Dexie portability layer only. Data that lives only in SQLite
						will not be repopulated by this import. A canonical SQLite-backed restore path is
						in development.
					</aside>
					<label class="file-picker">
						<input type="file" accept=".zip,.novellum.zip" onchange={handleFileSelect} />
						<span class="file-picker-label">Choose backup file…</span>
					</label>
				{:else if dialogState === 'validating'}
					<p class="status-text">Validating archive…</p>
				{:else if dialogState === 'preview' && preview}
					<div class="preview-section">
						<p class="preview-heading">Archive Contents</p>
						<dl class="preview-grid">
							<dt>Project ID</dt>
							<dd>{preview.projectId}</dd>
							<dt>Exported</dt>
							<dd>{new Date(preview.exportedAt).toLocaleString()}</dd>
							<dt>App Version</dt>
							<dd>{preview.appVersion}</dd>
							<dt>Schema Version</dt>
							<dd>{preview.dbSchemaVersion}</dd>
							<dt>Total Entities</dt>
							<dd>{totalEntities(preview.tableCounts)}</dd>
							<dt>Planning Keys</dt>
							<dd>{preview.kvKeyCount}</dd>
						</dl>
					</div>
					<div class="warning-box">
						<p class="warning-title">⚠ Replace Warning</p>
						<p class="warning-text">
							Importing this backup will <strong>replace</strong> any existing data for this project in
							your current browser. This action cannot be undone.
						</p>
					</div>
				{:else if dialogState === 'restoring'}
					<div class="restoring-indicator" aria-busy="true" aria-label="Restoring in progress">
						<span class="spinner" aria-hidden="true"></span>
						<p class="status-text">Restoring project data…</p>
					</div>
				{:else if dialogState === 'success' && restoreResult}
					<div class="success-section">
						<p class="success-title">Restore Complete</p>
						<p class="success-detail">
							{restoreResult.rowsRestored} entities restored across {restoreResult.tablesRestored} tables.
							{#if restoreResult.kvKeysRestored > 0}
								{restoreResult.kvKeysRestored} planning keys restored.
							{/if}
						</p>
					</div>
				{:else if dialogState === 'error'}
					<div class="error-section">
						<p class="error-title">Import Failed</p>
						<p class="error-detail">{errorMessage}</p>
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				{#if dialogState === 'idle' || dialogState === 'validating'}
					<GhostButton onclick={onClose}>Cancel</GhostButton>
				{:else if dialogState === 'preview'}
					<GhostButton onclick={onClose}>Cancel</GhostButton>
					<PrimaryButton class="btn-danger" onclick={handleConfirmRestore}>
						Replace &amp; Restore
					</PrimaryButton>
				{:else if dialogState === 'success'}
					<PrimaryButton onclick={handleDone}>Done</PrimaryButton>
				{:else if dialogState === 'error'}
					<GhostButton onclick={onClose}>Close</GhostButton>
					<PrimaryButton onclick={handleRetry}>Try Another File</PrimaryButton>
				{:else if dialogState === 'restoring'}
					<GhostButton disabled>
						<span class="spinner btn-spinner" aria-hidden="true"></span>
						Restoring…
					</GhostButton>
				{/if}
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
		width: min(480px, 90vw);
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

	.hint-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: 1.5;
		margin: 0;
	}

	.hint-text code {
		background-color: var(--color-surface-overlay);
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
	}

	.scope-warning {
		margin: var(--space-3) 0 0 0;
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
		background-color: var(--color-surface-overlay);
		padding: 0 var(--space-1);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		color: var(--color-text-primary);
	}

	.status-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.file-picker {
		position: relative;
		display: flex;
		cursor: pointer;
	}

	.file-picker input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.file-picker-label {
		padding: var(--space-2) var(--space-4);
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		width: 100%;
		text-align: center;
		transition:
			border-color 0.15s,
			color 0.15s;
	}

	.file-picker:hover .file-picker-label {
		border-color: var(--color-nova-blue);
		color: var(--color-nova-blue);
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.preview-heading {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-1) var(--space-4);
		font-size: var(--text-xs);
		margin: 0;
	}

	.preview-grid dt {
		color: var(--color-text-muted);
	}

	.preview-grid dd {
		color: var(--color-text-secondary);
		margin: 0;
	}

	.warning-box {
		background-color: color-mix(in srgb, var(--color-error) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-error) 25%, transparent);
		border-radius: var(--radius-sm);
		padding: var(--space-3) var(--space-4);
	}

	.warning-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-1) 0;
	}

	.warning-text {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
	}

	.success-section {
		text-align: center;
		padding: var(--space-4) 0;
	}

	.success-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2) 0;
	}

	.success-detail {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.error-section {
		text-align: center;
		padding: var(--space-4) 0;
	}

	.error-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-error);
		margin: 0 0 var(--space-2) 0;
	}

	.error-detail {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}
</style>
