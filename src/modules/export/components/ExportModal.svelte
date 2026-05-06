<script lang="ts">
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { assembleManuscript } from '../services/manuscript-assembler.js';
	import { buildMarkdown } from '../services/markdown-driver.js';
	import { MANUSCRIPT_PROFILES, getProfile } from '../services/manuscript-profiles.js';
	// Backup export moved to Settings → Data (plan-018 stage-004).
	import type { ManuscriptProfileId, ManuscriptMetadata } from '../types.js';

	let {
		projectId,
		projectTitle,
		projectAuthor = '',
		open = false,
		onClose,
	}: {
		projectId: string;
		projectTitle: string;
		projectAuthor?: string;
		open?: boolean;
		onClose: () => void;
	} = $props();

	let selectedProfile = $state<ManuscriptProfileId>('standard_manuscript');
	let format = $state<'markdown' | 'docx' | 'epub'>('markdown');
	let metadata = $state<ManuscriptMetadata>({});
	let exporting = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	$effect(() => {
		if (open) {
			metadata = { title: projectTitle, author: projectAuthor };
			error = null;
			success = false;
		}
	});

	function makeSafeFilename(title: string, ext: string): string {
		const safe =
			(title ?? '')
				.replace(/[^a-z0-9\s-]/gi, '')
				.replace(/\s+/g, '_')
				.toLowerCase()
				.slice(0, 50) || 'manuscript';
		return `${safe}.${ext}`;
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

	async function handleExport() {
		exporting = true;
		error = null;
		success = false;

		try {
			const profile = getProfile(selectedProfile);
			const manuscript = await assembleManuscript(projectId, {
				profileId: selectedProfile,
				metadata,
				...profile.defaults,
			});

			let blob: Blob;
			let ext: string;

			if (format === 'markdown') {
				const text = buildMarkdown(manuscript);
				blob = new Blob([text], { type: 'text/markdown' });
				ext = 'md';
			} else if (format === 'docx') {
				const { buildDocx } = await import('../services/docx-driver.js');
				blob = await buildDocx(manuscript);
				ext = 'docx';
			} else {
				const { buildEpub } = await import('../services/epub-driver.js');
				blob = await buildEpub(manuscript);
				ext = 'epub';
			}

			downloadBlob(blob, makeSafeFilename(metadata.title ?? projectTitle, ext));
			success = true;
		} catch (e) {
			error = (e as Error).message;
		} finally {
			exporting = false;
		}
	}

	const profiles = Object.values(MANUSCRIPT_PROFILES);
</script>

{#if open}
	<div class="modal-backdrop" role="presentation" onclick={onClose}>
		<div
			class="modal"
			role="dialog"
			aria-label="Export Manuscript"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h2 class="modal-title">Export Manuscript</h2>
			</div>

			<div class="modal-body">
				<!-- Profile selector -->
				<section class="form-section">
					<h3 class="section-label">Profile</h3>
					<div class="profile-grid" role="radiogroup" aria-label="Manuscript profile">
						{#each profiles as profile (profile.id)}
							<label
								class="profile-card"
								class:profile-card--selected={selectedProfile === profile.id}
							>
								<input
									type="radio"
									name="profile"
									value={profile.id}
									checked={selectedProfile === profile.id}
									onchange={() => (selectedProfile = profile.id)}
									class="sr-only"
								/>
								<span class="profile-card__label">{profile.label}</span>
								<span class="profile-card__desc">{profile.description}</span>
							</label>
						{/each}
					</div>
				</section>

				<!-- Metadata form -->
				<section class="form-section">
					<h3 class="section-label">Metadata</h3>
					<div class="meta-grid">
						<Input
							id="export-title"
							label="Title"
							bind:value={metadata.title}
							placeholder="Project title"
						/>
						<Input
							id="export-author"
							label="Author"
							bind:value={metadata.author}
							placeholder="Author name"
						/>
						<Input
							id="export-subtitle"
							label="Subtitle"
							bind:value={metadata.subtitle}
							placeholder="Optional subtitle"
						/>
						<Input
							id="export-synopsis"
							label="Synopsis"
							bind:value={metadata.synopsis}
							placeholder="Optional synopsis"
						/>
					</div>
				</section>

				<!-- Format selector -->
				<section class="form-section">
					<h3 class="section-label">Format</h3>
					<div class="format-row" role="radiogroup" aria-label="Export format">
						<label class="format-option">
							<input
								type="radio"
								name="format"
								value="markdown"
								checked={format === 'markdown'}
								onchange={() => (format = 'markdown')}
							/>
							Markdown
						</label>
						<label class="format-option">
							<input
								type="radio"
								name="format"
								value="docx"
								checked={format === 'docx'}
								onchange={() => (format = 'docx')}
							/>
							Word (.docx)
						</label>
						<label class="format-option">
							<input
								type="radio"
								name="format"
								value="epub"
								checked={format === 'epub'}
								onchange={() => (format = 'epub')}
							/>
							EPUB
						</label>
					</div>
				</section>

				<!-- Status area -->
				{#if exporting}
					<p class="status-text">Compiling manuscript…</p>
				{/if}
				{#if error}
					<p class="error-text" role="alert">{error}</p>
				{/if}
				{#if success}
					<p class="success-text" role="status">Export downloaded successfully.</p>
				{/if}
			</div>

			<div class="modal-footer">
				<GhostButton onclick={onClose} disabled={exporting}>Cancel</GhostButton>
				<PrimaryButton onclick={handleExport} disabled={exporting}>
					{exporting ? 'Exporting…' : 'Export'}
				</PrimaryButton>
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
		gap: var(--space-5);
	}

	.modal-footer {
		padding: var(--space-4) var(--space-6);
		border-top: 1px solid var(--color-border-default);
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.section-label {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.profile-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3);
	}

	.profile-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		cursor: pointer;
		background-color: var(--color-surface-raised);
		transition: border-color 0.15s;
	}

	.profile-card--selected {
		border-color: var(--color-accent-primary);
		background-color: var(--color-surface-overlay);
	}

	.profile-card__label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.profile-card__desc {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
	}

	.meta-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.format-row {
		display: flex;
		gap: var(--space-5);
	}

	.format-option {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.status-text {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
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

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	@media (max-width: 760px) {
		.profile-grid,
		.meta-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

