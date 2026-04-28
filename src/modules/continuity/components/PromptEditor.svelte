<script lang="ts">
	import type { Project } from '$lib/db/domain-types';
	import { apiPut } from '$lib/api-client';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { PrimaryButton } from '$lib/components/ui/index.js';
	import { toast } from '$lib/stores/toast.svelte.js';

	let { project }: { project: Project } = $props();

	let saving = $state(false);

	let systemPrompt = $state('');
	let negativePrompt = $state('');
	let initialized = false;

	$effect(() => {
		if (!initialized && project) {
			systemPrompt = project.systemPrompt || '';
			negativePrompt = project.negativePrompt || '';
			initialized = true;
		}
	});

	let hasChanges = $derived(
		systemPrompt !== (project.systemPrompt || '') || negativePrompt !== (project.negativePrompt || '')
	);

	const systemLength = $derived(systemPrompt.trim().length);
	const negativeLength = $derived(negativePrompt.trim().length);

	async function handleSave() {
		saving = true;

		try {
			await apiPut(`/api/db/projects/${project.id}`, {
				systemPrompt,
				negativePrompt
			});
			project.systemPrompt = systemPrompt;
			project.negativePrompt = negativePrompt;
			toast('Prompts saved successfully.', 'success');
		} catch (error) {
			toast(error instanceof Error ? error.message : 'Failed to save prompts.', 'error');
		} finally {
			saving = false;
		}
	}
</script>

<div class="prompt-editor" role="region" aria-label="Project Prompts">
	<div class="header">
		<div>
			<p class="header-eyebrow">Prompt Controls</p>
			<h2>Project Prompt Settings</h2>
			<p class="header-description">These instructions are injected into AI tasks before domain context is assembled.</p>
		</div>
		<div class="header-metrics" aria-label="Prompt field summary">
			<span>System: {systemLength}</span>
			<span>Negative: {negativeLength}</span>
		</div>
	</div>

	<div class="grid">
		<SurfaceCard>
			<div class="field">
				<label for="system-prompt">System Prompt</label>
				<p class="description">Project-level context injected into all AI operations.</p>
				<textarea
					id="system-prompt"
					bind:value={systemPrompt}
					placeholder="Enter system prompt guidelines..."
					class="textarea"
				></textarea>
			</div>
		</SurfaceCard>

		<SurfaceCard>
			<div class="field">
				<label for="negative-prompt">Negative Prompt</label>
				<p class="description">Content and style restrictions for all AI generations.</p>
				<textarea
					id="negative-prompt"
					bind:value={negativePrompt}
					placeholder="Enter restrictions..."
					class="textarea"
				></textarea>
			</div>
		</SurfaceCard>
	</div>

	{#if hasChanges}
		<div class="actions">
			<PrimaryButton class="save-button" type="button" onclick={handleSave} disabled={saving}>
				{saving ? 'Saving...' : 'Save Prompt Settings'}
			</PrimaryButton>
		</div>
	{/if}
</div>

<style>
	.prompt-editor {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	
	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.header-eyebrow,
	.header h2,
	.header-description {
		margin: 0;
	}

	.header-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
	
	.header h2 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		margin-top: var(--space-1);
	}

	.header-description {
		margin-top: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		max-width: 62ch;
	}

	.header-metrics {
		display: inline-flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.header-metrics span {
		font-size: var(--text-xs);
		padding: 0.25rem 0.55rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
		color: var(--color-text-secondary);
	}

	.grid {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: 1fr;
	}
	
	@media (min-width: 768px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		height: 100%;
	}

	.field label {
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.description {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.textarea {
		width: 100%;
		flex: 1;
		min-height: 15rem;
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-base);
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		resize: vertical;
		transition: border-color var(--transition-color);
	}

	.textarea:focus {
		outline: none;
		border-color: var(--color-border-focus);
		box-shadow: var(--focus-ring);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}

	:global(.save-button) {
		padding: var(--space-2) var(--space-4);
		background-color: var(--color-teal);
		color: var(--color-black);
		border: none;
		border-radius: var(--radius-md);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: background-color var(--transition-color);
	}

	:global(.save-button:hover:not(:disabled)) {
		background-color: var(--color-teal-dark);
	}

	:global(.save-button:disabled) {
		opacity: 0.7;
		cursor: not-allowed;
	}

	@media (max-width: 900px) {
		.header {
			flex-direction: column;
		}
	}
</style>