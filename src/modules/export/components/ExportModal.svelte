<script lang="ts">
	import {
		getExportSettings,
		updateExportSettings,
	} from '../services/export-settings-repository.js';
	import { exportProject } from '../services/export-service.js';
	import type { ExportSettings } from '$lib/db/types.js';
	import type { ExportFormat } from '../types.js';

	let {
		projectId,
		open,
		onClose,
	}: {
		projectId: string;
		open: boolean;
		onClose: () => void;
	} = $props();

	let settings = $state<ExportSettings | null>(null);
	let format = $state<ExportFormat>('docx');
	let exporting = $state(false);
	let exportError = $state<string | null>(null);

	const isMarkdown = $derived(format === 'markdown');
	const isBackup = $derived(format === 'backup_zip');

	$effect(() => {
		if (open) {
			loadSettings();
		}
	});

	async function loadSettings() {
		settings = await getExportSettings(projectId);
	}

	async function handleTitlePageChange(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (!settings) return;
		settings = { ...settings, titlePage: checked };
		await updateExportSettings(projectId, { titlePage: checked });
	}

	async function handleChapterStyleChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value as ExportSettings['chapterStyle'];
		if (!settings) return;
		settings = { ...settings, chapterStyle: value };
		await updateExportSettings(projectId, { chapterStyle: value });
	}

	async function handleFontFamilyChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		if (!settings) return;
		settings = { ...settings, fontFamily: value };
		await updateExportSettings(projectId, { fontFamily: value });
	}

	async function handleFontSizeChange(e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		if (!settings) return;
		settings = { ...settings, fontSize: value };
		await updateExportSettings(projectId, { fontSize: value });
	}

	async function handleLineSpacingChange(e: Event) {
		const value = Number((e.target as HTMLSelectElement).value);
		if (!settings) return;
		settings = { ...settings, lineSpacing: value };
		await updateExportSettings(projectId, { lineSpacing: value });
	}

	async function handleExport() {
		if (!settings) return;
		exporting = true;
		exportError = null;
		try {
			const { filename, blob } = await exportProject(projectId, {
				format,
				titlePage: settings.titlePage,
				chapterStyle: settings.chapterStyle,
				fontFamily: settings.fontFamily,
				fontSize: settings.fontSize,
				lineSpacing: settings.lineSpacing,
			});
			downloadBlob(blob, filename);
			onClose();
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Export failed';
		} finally {
			exporting = false;
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
			aria-label="Export Project"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h2 class="modal-title">Export Project</h2>
			</div>

			{#if !settings}
				<div class="modal-body">
					<p class="loading-text">Loading settings…</p>
				</div>
			{:else}
				<div class="modal-body">
					<div class="field-group">
						<span class="field-label">Format</span>
						<div class="format-tabs" role="radiogroup" aria-label="Export format">
							{#each ['markdown', 'docx', 'epub', 'backup_zip'] as fmt (fmt)}
								<button
									role="radio"
									aria-checked={format === fmt}
									class="format-tab"
									class:active={format === fmt}
									onclick={() => {
										format = fmt as ExportFormat;
									}}
								>
									{fmt === 'markdown'
										? 'Markdown'
										: fmt === 'docx'
											? 'DOCX'
											: fmt === 'epub'
												? 'EPUB'
												: 'Backup ZIP'}
								</button>
							{/each}
						</div>
					</div>

					{#if isBackup}
						<div class="backup-hint">
							<p class="backup-hint-title">Portable Backup</p>
							<p class="backup-hint-text">
								Export a complete snapshot of this project including all story data, characters,
								locations, and planning notes. Use this to restore your project in another browser
								or as a safety backup.
							</p>
						</div>
					{/if}

					{#if !isBackup}
						<div class="field-group">
							<label class="field-label field-label--inline">
								<input
									type="checkbox"
									checked={settings.titlePage}
									onchange={handleTitlePageChange}
								/>
								Title Page
							</label>
						</div>

						<div class="field-group">
							<label class="field-label" for="chapter-style">Chapter Style</label>
							<select
								id="chapter-style"
								class="field-select"
								value={settings.chapterStyle}
								onchange={handleChapterStyleChange}
							>
								<option value="heading">Heading text</option>
								<option value="chapter_number">Chapter number</option>
								<option value="both">Both</option>
							</select>
						</div>

						<div class="field-group">
							<label class="field-label" for="font-family">Font Family</label>
							<select
								id="font-family"
								class="field-select"
								value={settings.fontFamily}
								disabled={isMarkdown}
								onchange={handleFontFamilyChange}
							>
								<option value="Georgia">Georgia</option>
								<option value="Times New Roman">Times New Roman</option>
								<option value="Arial">Arial</option>
								<option value="Courier New">Courier New</option>
							</select>
						</div>

						<div class="field-group">
							<label class="field-label" for="font-size">Font Size (pt)</label>
							<input
								id="font-size"
								type="number"
								class="field-input"
								min="10"
								max="18"
								value={settings.fontSize}
								disabled={isMarkdown}
								onchange={handleFontSizeChange}
							/>
						</div>

						<div class="field-group">
							<label class="field-label" for="line-spacing">Line Spacing</label>
							<select
								id="line-spacing"
								class="field-select"
								value={String(settings.lineSpacing)}
								disabled={isMarkdown}
								onchange={handleLineSpacingChange}
							>
								<option value="1">1.0</option>
								<option value="1.15">1.15</option>
								<option value="1.5">1.5</option>
								<option value="2">2.0</option>
							</select>
						</div>
					{/if}

					{#if exportError}
						<p class="error-text" role="alert">{exportError}</p>
					{/if}
				</div>
			{/if}

			<div class="modal-footer">
				<button class="btn-ghost" onclick={onClose} disabled={exporting}> Cancel </button>
				<button class="btn-primary" onclick={handleExport} disabled={exporting || !settings}>
					{exporting ? 'Exporting…' : isBackup ? 'Export Backup ZIP' : 'Export'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
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

	.loading-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.field-label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	.field-label--inline {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	.format-tabs {
		display: flex;
		gap: var(--space-2);
	}

	.format-tab {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: none;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition:
			border-color 0.15s,
			color 0.15s,
			background-color 0.15s;
	}

	.format-tab:hover {
		border-color: var(--color-border-strong);
		color: var(--color-text-primary);
	}

	.format-tab.active {
		border-color: var(--color-nova-blue);
		color: var(--color-nova-blue);
		background-color: rgba(59, 130, 246, 0.08);
	}

	.field-select,
	.field-input {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background-color: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		width: 100%;
	}

	.field-select:disabled,
	.field-input:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.backup-hint {
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-3) var(--space-4);
	}

	.backup-hint-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-1) 0;
	}

	.backup-hint-text {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: 1.5;
		margin: 0;
	}
</style>
