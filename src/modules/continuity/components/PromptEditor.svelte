<script lang="ts">
	import type { Project } from '$lib/db/types';
	import { apiPut } from '$lib/api-client';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
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
		<h2>Prompts</h2>
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
			<button class="save-button" onclick={handleSave} disabled={saving}>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>
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
		align-items: center;
		justify-content: space-between;
	}
	
	.header h2 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		margin: 0;
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
	}

	.save-button {
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

	.save-button:hover:not(:disabled) {
		background-color: var(--color-teal-dark);
	}

	.save-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>