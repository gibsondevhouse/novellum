<script lang="ts">
	import { getCreating, getCreateError, submitCreate } from '../stores/project-hub.svelte.ts';
	import { emptyDraft, type ProjectDraft } from '../types/project-draft.js';
	import ProjectCoreFields from './ProjectCoreFields.svelte';
	import ProjectStoryFields from './ProjectStoryFields.svelte';
	import ProjectAdvancedFields from './ProjectAdvancedFields.svelte';

	let { oncancel }: { oncancel: () => void } = $props();

	// ── Draft state ──────────────────────────────────────────────
	let draft = $state<ProjectDraft>(emptyDraft());

	// Persist draft to sessionStorage so navigation doesn't lose work
	$effect(() => {
		try {
			sessionStorage.setItem('novellum:create-draft', JSON.stringify(draft));
		} catch {
			// sessionStorage unavailable (e.g. private mode + quota) — silently skip
		}
	});

	// Restore draft on mount
	$effect.pre(() => {
		try {
			const saved = sessionStorage.getItem('novellum:create-draft');
			if (saved) {
				const parsed = JSON.parse(saved) as ProjectDraft;
				draft = parsed;
			}
		} catch {
			// ignore
		}
	});

	// ── Disclosure state ─────────────────────────────────────────
	let showStory = $derived(draft.title.trim().length > 0);
	let showAdvanced = $state(false);

	// ── Validation ───────────────────────────────────────────────
	let titleBlurred = $state(false);
	let titleError = $derived(titleBlurred && !draft.title.trim() ? 'Title is required' : '');
	let canSubmit = $derived(draft.title.trim().length > 0 && !getCreating());

	// ── Handlers ─────────────────────────────────────────────────
	function patchDraft(patch: Partial<ProjectDraft>) {
		draft = { ...draft, ...patch };
	}

	function handleCancel() {
		try { sessionStorage.removeItem('novellum:create-draft'); } catch { /* ignore */ }
		oncancel();
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		titleBlurred = true;
		if (!draft.title.trim()) return;

		await submitCreate({
			title: draft.title.trim(),
			genre: draft.genre,
			logline: draft.logline || undefined,
			synopsis: draft.synopsis || undefined,
			targetWordCount: draft.targetWordCount ?? undefined,
		});

		try { sessionStorage.removeItem('novellum:create-draft'); } catch { /* ignore */ }
	}
</script>

<div
	class="overlay"
	role="dialog"
	aria-modal="true"
	aria-labelledby="create-dialog-title"
>
	<!-- Backdrop dismiss -->
	<button class="backdrop" tabindex="-1" aria-hidden="true" onclick={handleCancel}></button>

	<div class="card">
		<!-- Header -->
		<div class="card-header">
			<h2 class="card-title" id="create-dialog-title">New Project</h2>
			<button
				type="button"
				class="btn-close"
				onclick={handleCancel}
				aria-label="Close"
			>✕</button>
		</div>

		<!-- Form -->
		<form
			class="card-body"
			onsubmit={handleSubmit}
			novalidate
		>
			<!-- ── Section: Core ─────────────────────────────────────── -->
			<section class="form-section" aria-label="Core identity">
				<header class="section-header">
					<span class="section-label">Your Story</span>
				</header>
				<ProjectCoreFields
					{draft}
					onchange={patchDraft}
				/>
				{#if titleError}
					<p class="error-text" role="alert">{titleError}</p>
				{/if}
			</section>

			<!-- ── Section: Story ───────────────────────────────────── -->
			{#if showStory}
				<section
					class="form-section story-section"
					aria-label="Story intent"
				>
					<header class="section-header">
						<span class="section-label">Story</span>
					</header>
					<ProjectStoryFields {draft} onchange={patchDraft} />
				</section>
			{/if}

			<!-- ── Section: Advanced ────────────────────────────────── -->
			<div class="advanced-toggle-row">
				<button
					type="button"
					class="advanced-toggle"
					onclick={() => (showAdvanced = !showAdvanced)}
					aria-expanded={showAdvanced}
					aria-controls="advanced-section"
				>
					<span class="chevron" class:open={showAdvanced} aria-hidden="true">›</span>
					Advanced Options
				</button>
			</div>

			{#if showAdvanced}
				<section
					id="advanced-section"
					class="form-section advanced-section"
					aria-label="Advanced options"
				>
					<ProjectAdvancedFields {draft} onchange={patchDraft} />
				</section>
			{/if}

			<!-- ── Error ─────────────────────────────────────────────── -->
			{#if getCreateError()}
				<p class="error-text global-error" role="alert">{getCreateError()}</p>
			{/if}

			<!-- ── Actions ───────────────────────────────────────────── -->
			<div class="actions">
				<button type="button" class="btn-ghost" onclick={handleCancel} disabled={getCreating()}>
					Cancel
				</button>
				<button
					type="submit"
					class="btn-primary"
					disabled={!canSubmit}
				>
					{getCreating() ? 'Creating…' : 'Start Writing'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	/* ── Overlay ─────────────────────────────────────────── */
	.overlay {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
		padding: var(--space-4);
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.72);
		border: none;
		cursor: pointer;
	}

	/* ── Card ────────────────────────────────────────────── */
	.card {
		position: relative;
		z-index: 1;
		width: min(520px, 100%);
		max-height: 90vh;
		overflow-y: auto;
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		display: flex;
		flex-direction: column;
		animation: novellum-enter var(--duration-enter) var(--ease-editorial) both;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-6) var(--space-6) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
	}

	.card-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		margin: 0;
	}

	.btn-close {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: var(--space-1);
		border-radius: var(--radius-sm);
		line-height: 1;
		transition: color var(--duration-fast) var(--ease-standard);
	}

	.btn-close:hover {
		color: var(--color-text-primary);
	}

	.btn-close:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	/* ── Form body ───────────────────────────────────────── */
	.card-body {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0 var(--space-6) var(--space-6);
		overflow-y: auto;
	}

	/* ── Sections ────────────────────────────────────────── */
	.form-section {
		padding: var(--space-5) 0;
		border-top: 1px solid var(--color-border-subtle);
	}

	.form-section:first-of-type {
		border-top: none;
		padding-top: var(--space-5);
	}

	.section-header {
		margin-bottom: var(--space-4);
	}

	.section-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
	}

	.story-section {
		animation: novellum-enter var(--duration-enter) var(--ease-editorial) both;
	}

	.advanced-section {
		animation: novellum-enter var(--duration-enter) var(--ease-editorial) both;
		padding-top: var(--space-4);
	}

	/* ── Advanced toggle ─────────────────────────────────── */
	.advanced-toggle-row {
		padding: var(--space-2) 0;
		border-top: 1px solid var(--color-border-subtle);
	}

	.advanced-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: none;
		border: none;
		padding: var(--space-2) 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		font-family: var(--font-sans);
		transition: color var(--duration-fast) var(--ease-standard);
	}

	.advanced-toggle:hover {
		color: var(--color-text-primary);
	}

	.advanced-toggle:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
		border-radius: var(--radius-xs);
	}

	.chevron {
		display: inline-block;
		font-size: var(--text-base);
		transition: transform var(--duration-base) var(--ease-standard);
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	/* ── Error ───────────────────────────────────────────── */
	.global-error {
		background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
		border-radius: var(--radius-sm);
		padding: var(--space-3);
		margin-top: var(--space-4);
	}

	@media (prefers-reduced-motion: reduce) {
		.card,
		.story-section,
		.advanced-section {
			animation: none;
		}
		.chevron {
			transition: none;
		}
	}
</style>
