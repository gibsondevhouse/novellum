<script lang="ts">
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';
	import { DEFAULT_EXPORT_SETTINGS } from '../constants.js';
	import type {
		ExportDeliveryPreference,
		ExportFormat,
		ExportOptions,
		ManuscriptExportRequest,
		ManuscriptMetadata,
		ManuscriptProfileId,
	} from '../types.js';
	import { exportProject, normalizeManuscriptMetadata } from '../services/export-service.js';
	import { deliverExportBlob } from '../services/export-delivery.js';
	import {
		getExportChapterOptions,
		type ExportChapterOption,
	} from '../services/export-chapter-options.js';
	import { getProfile } from '../services/manuscript-profiles.js';
	import ExportFormatSelector from './ExportFormatSelector.svelte';
	import ManuscriptProfileSelector from './ManuscriptProfileSelector.svelte';
	import ManuscriptMetadataFields from './ManuscriptMetadataFields.svelte';
	import ExportFormattingOptions from './ExportFormattingOptions.svelte';
	import ChapterSubsetSelector from './ChapterSubsetSelector.svelte';
	import {
		createDefaultChapterSelection,
		resolveChapterSelection,
		type ChapterSelectionState,
	} from './chapter-selection.js';

	type DialogStatus =
		| 'idle'
		| 'validating'
		| 'exporting'
		| 'delivery-pending'
		| 'delivered'
		| 'cancelled'
		| 'failed';

	let {
		projectId,
		projectTitle = '',
		open,
		onClose,
	}: {
		projectId: string;
		projectTitle?: string;
		open: boolean;
		onClose: () => void;
	} = $props();

	let profileId = $state<ManuscriptProfileId>('standard_manuscript');
	let metadata = $state<ManuscriptMetadata>({ title: 'Untitled Manuscript' });
	let exportOptions = $state<ExportOptions>({
		...DEFAULT_EXPORT_SETTINGS,
		format: 'markdown',
	});
	let includeFrontMatter = $state(true);
	let includeBackMatter = $state(false);
	let frontMatterOverridden = $state(false);
	let backMatterOverridden = $state(false);
	let deliveryPreference = $state<ExportDeliveryPreference>('browser_download');
	let chapters = $state<ExportChapterOption[]>([]);
	let chapterSelection = $state<ChapterSelectionState>(createDefaultChapterSelection([]));
	let chapterLoadState = $state<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
	let status = $state<DialogStatus>('idle');
	let validationError = $state<string | null>(null);
	let statusMessage = $state<string | null>(null);
	let failureMessage = $state<string | null>(null);

	const isBusy = $derived(
		status === 'validating' || status === 'exporting' || status === 'delivery-pending',
	);
	const isBackupExport = $derived(exportOptions.format === 'backup_zip');
	const resolvedChapterSelection = $derived(resolveChapterSelection(chapterSelection, chapters));
	const primaryDisabled = $derived(
		isBusy ||
			(!isBackupExport &&
				(chapterLoadState !== 'loaded' || resolvedChapterSelection.error !== null)),
	);
	const selectedChapterSummary = $derived(
		isBackupExport
			? 'Project backup'
			: `${resolvedChapterSelection.count} chapter${
					resolvedChapterSelection.count === 1 ? '' : 's'
				}`,
	);
	const primaryLabel = $derived(
		status === 'exporting'
			? 'Generating...'
			: status === 'delivery-pending'
				? 'Delivering...'
				: isBackupExport
					? 'Download backup'
					: 'Export manuscript',
	);

	$effect(() => {
		if (!open) return;
		resetDialog();
		void loadChapters();
	});

	function resetDialog(): void {
		profileId = 'standard_manuscript';
		const profile = getProfile(profileId);
		metadata = { title: projectTitle.trim() || 'Untitled Manuscript' };
		exportOptions = { ...DEFAULT_EXPORT_SETTINGS, format: 'markdown' };
		includeFrontMatter = profile.defaults.includeFrontMatter;
		includeBackMatter = profile.defaults.includeBackMatter;
		frontMatterOverridden = false;
		backMatterOverridden = false;
		deliveryPreference = 'browser_download';
		chapters = [];
		chapterSelection = createDefaultChapterSelection([]);
		chapterLoadState = 'loading';
		status = 'idle';
		validationError = null;
		statusMessage = null;
		failureMessage = null;
	}

	async function loadChapters(): Promise<void> {
		try {
			const loadedChapters = await getExportChapterOptions(projectId);
			if (!open) return;
			chapters = loadedChapters;
			chapterSelection = createDefaultChapterSelection(loadedChapters);
			chapterLoadState = 'loaded';
		} catch (error) {
			if (!open) return;
			chapterLoadState = 'failed';
			failureMessage =
				error instanceof Error ? error.message : 'Unable to load chapters for export.';
		}
	}

	function handleProfileChange(nextProfileId: ManuscriptProfileId): void {
		profileId = nextProfileId;
		const profile = getProfile(nextProfileId);
		if (!frontMatterOverridden) {
			includeFrontMatter = profile.defaults.includeFrontMatter;
		}
		if (!backMatterOverridden) {
			includeBackMatter = profile.defaults.includeBackMatter;
		}
	}

	function handleFormatChange(format: ExportFormat): void {
		exportOptions = { ...exportOptions, format };
		clearMessages();
	}

	function handleExportOptionsChange(nextOptions: ExportOptions): void {
		exportOptions = nextOptions;
	}

	function handleFrontMatterChange(value: boolean): void {
		includeFrontMatter = value;
		frontMatterOverridden = true;
		exportOptions = { ...exportOptions, titlePage: value };
	}

	function handleBackMatterChange(value: boolean): void {
		includeBackMatter = value;
		backMatterOverridden = true;
	}

	function clearMessages(): void {
		validationError = null;
		statusMessage = null;
		failureMessage = null;
		if (status === 'failed' || status === 'cancelled' || status === 'delivered') {
			status = 'idle';
		}
	}

	function buildRequest(): ManuscriptExportRequest | null {
		const normalizedMetadata = normalizeManuscriptMetadata(
			metadata,
			projectTitle.trim() || 'Untitled Manuscript',
		);

		if (!normalizedMetadata.title) {
			validationError = 'Add a title before exporting.';
			return null;
		}

		if (!isBackupExport) {
			if (chapterLoadState === 'loading') {
				validationError = 'Wait for chapters to finish loading.';
				return null;
			}
			if (chapterLoadState === 'failed') {
				validationError = 'Reload chapters before exporting.';
				return null;
			}
			if (resolvedChapterSelection.error) {
				validationError = resolvedChapterSelection.error;
				return null;
			}
		}

		const selectedChapterIds = isBackupExport
			? undefined
			: resolvedChapterSelection.selectedChapterIds;

		return {
			exportOptions: {
				...exportOptions,
				titlePage: includeFrontMatter,
			},
			compileOptions: {
				profileId,
				metadata: normalizedMetadata,
				selectedChapterIds,
				includeFrontMatter,
				includeBackMatter,
			},
			deliveryPreference,
		};
	}

	async function handlePrimaryAction(): Promise<void> {
		clearMessages();
		status = 'validating';
		const request = buildRequest();
		if (!request) {
			status = 'idle';
			return;
		}

		try {
			status = 'exporting';
			statusMessage = 'Generating export...';
			const result = await exportProject(projectId, request);
			status = 'delivery-pending';
			statusMessage = 'Preparing download...';
			const delivery = await deliverExportBlob(result.blob, result.filename, {
				preference: request.deliveryPreference,
			});

			if (delivery.status === 'cancelled') {
				status = 'cancelled';
				statusMessage = 'Save cancelled.';
				return;
			}

			status = 'delivered';
			statusMessage =
				delivery.status === 'saved'
					? `Saved ${delivery.filename}`
					: `Downloaded ${delivery.filename}`;
		} catch (error) {
			status = 'failed';
			failureMessage =
				error instanceof Error
					? `${error.message} Try again or choose browser download.`
					: 'Export failed. Try again or choose browser download.';
			statusMessage = null;
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && !isBusy) {
			onClose();
		}
	}
</script>

{#if open}
	<div class="dialog-backdrop" role="presentation" onclick={() => !isBusy && onClose()}>
		<div
			class="dialog"
			role="dialog"
			aria-label="Export manuscript"
			aria-modal="true"
			tabindex="-1"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => {
				event.stopPropagation();
				handleKeydown(event);
			}}
		>
			<header class="dialog-header">
				<div>
					<h2>Export manuscript</h2>
					<p>{projectTitle || projectId}</p>
				</div>
				<label class="destination-field">
					<span>Destination</span>
					<select
						value={deliveryPreference}
						disabled={isBusy}
						onchange={(event) =>
							(deliveryPreference = event.currentTarget.value as ExportDeliveryPreference)}
					>
						<option value="browser_download">Browser download</option>
						<option value="auto">Desktop when available</option>
					</select>
				</label>
			</header>

			<div class="dialog-body">
				<section class="panel">
					<ExportFormatSelector
						value={exportOptions.format}
						disabled={isBusy}
						onChange={handleFormatChange}
					/>
				</section>

				<section class:panel--disabled={isBackupExport} class="panel">
					<ManuscriptProfileSelector
						value={profileId}
						disabled={isBusy || isBackupExport}
						onChange={handleProfileChange}
					/>
				</section>

				<section class:panel--disabled={isBackupExport} class="panel">
					<ManuscriptMetadataFields
						value={metadata}
						disabled={isBusy || isBackupExport}
						onChange={(nextMetadata) => {
							metadata = nextMetadata;
							clearMessages();
						}}
					/>
				</section>

				<section class:panel--disabled={isBackupExport} class="panel">
					{#if chapterLoadState === 'loading'}
						<p class="loading-text" role="status">Loading chapters...</p>
					{:else}
						<ChapterSubsetSelector
							{chapters}
							state={chapterSelection}
							disabled={isBusy || isBackupExport}
							onChange={(nextState) => {
								chapterSelection = nextState;
								clearMessages();
							}}
						/>
					{/if}
				</section>

				<section class:panel--disabled={isBackupExport} class="panel">
					<ExportFormattingOptions
						options={exportOptions}
						{includeFrontMatter}
						{includeBackMatter}
						disabled={isBusy || isBackupExport}
						onOptionsChange={handleExportOptionsChange}
						onFrontMatterChange={handleFrontMatterChange}
						onBackMatterChange={handleBackMatterChange}
					/>
				</section>
			</div>

			<footer class="dialog-footer">
				<div class="status-block">
					<p class="summary-text">{selectedChapterSummary}</p>
					{#each resolvedChapterSelection.warnings as warning (warning)}
						<p class="warning-text" role="status">{warning}</p>
					{/each}
					{#if validationError}
						<p class="error-text" role="alert">{validationError}</p>
					{/if}
					{#if failureMessage}
						<p class="error-text" role="alert">{failureMessage}</p>
					{/if}
					{#if statusMessage}
						<p class:success-text={status === 'delivered'} class="status-text" role="status">
							{statusMessage}
						</p>
					{/if}
				</div>
				<div class="footer-actions">
					<GhostButton onclick={onClose} disabled={isBusy}>Close</GhostButton>
					{#if status === 'failed'}
						<SecondaryButton onclick={handlePrimaryAction}>Retry</SecondaryButton>
					{/if}
					<PrimaryButton onclick={handlePrimaryAction} disabled={primaryDisabled}>
						{primaryLabel}
					</PrimaryButton>
				</div>
			</footer>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-surface-ground) 82%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.dialog {
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		width: min(960px, 92vw);
		max-height: 92vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.dialog-header,
	.dialog-footer {
		padding: var(--space-4) var(--space-6);
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
		justify-content: space-between;
	}

	.dialog-header {
		border-bottom: 1px solid var(--color-border-default);
	}

	.dialog-footer {
		border-top: 1px solid var(--color-border-default);
		align-items: center;
	}

	h2,
	p {
		margin: 0;
	}

	h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
	}

	.dialog-header p {
		margin-top: var(--space-1);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.destination-field {
		min-width: 13rem;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
	}

	.destination-field select {
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-normal);
		padding: var(--space-2) var(--space-3);
	}

	.dialog-body {
		overflow-y: auto;
		padding: var(--space-4) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.panel {
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		padding: var(--space-4);
	}

	.panel--disabled {
		opacity: 0.65;
	}

	.loading-text,
	.summary-text,
	.warning-text,
	.error-text,
	.status-text {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.loading-text,
	.summary-text,
	.status-text {
		color: var(--color-text-secondary);
	}

	.warning-text {
		color: var(--color-warning, var(--color-text-secondary));
	}

	.error-text {
		color: var(--color-error);
	}

	.success-text {
		color: var(--color-success-on-dark);
	}

	.status-block {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.footer-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: flex-end;
	}

	@media (max-width: 720px) {
		.dialog {
			width: 92vw;
		}

		.dialog-header,
		.dialog-footer {
			flex-direction: column;
			align-items: stretch;
		}

		.destination-field {
			min-width: 0;
		}

		.footer-actions {
			justify-content: flex-start;
		}
	}
</style>
