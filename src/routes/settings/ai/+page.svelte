<script lang="ts">
	import { onMount } from 'svelte';
	import { OpenRouterPanel, OllamaPanel, ProviderComingSoon } from '$modules/settings';
	import { featureFlags } from '$lib/feature-flags.svelte.js';

	let activeProvider = $state<'openrouter' | 'ollama' | 'lm-studio'>('openrouter');

	onMount(async () => {
		await featureFlags.hydrate();
	});
</script>

<svelte:head>
	<title>AI — Novellum</title>
</svelte:head>

<div class="provider-subnav" role="tablist">
	<button
		role="tab"
		aria-selected={activeProvider === 'openrouter'}
		data-active={activeProvider === 'openrouter'}
		class="provider-tab"
		class:provider-tab--active={activeProvider === 'openrouter'}
		onclick={() => (activeProvider = 'openrouter')}
		type="button"
	>
		OpenRouter
	</button>
	<button
		role="tab"
		aria-selected={activeProvider === 'ollama'}
		data-active={activeProvider === 'ollama'}
		class="provider-tab"
		class:provider-tab--active={activeProvider === 'ollama'}
		onclick={() => (activeProvider = 'ollama')}
		type="button"
	>
		Ollama
	</button>
	<button
		role="tab"
		aria-selected={activeProvider === 'lm-studio'}
		data-active={activeProvider === 'lm-studio'}
		class="provider-tab"
		disabled
		type="button"
	>
		LM Studio
		<span class="badge-soon">Coming soon</span>
	</button>
</div>

{#if activeProvider === 'openrouter'}
	<OpenRouterPanel />
{:else if activeProvider === 'ollama'}
	<OllamaPanel />
{:else}
	<ProviderComingSoon
		name="LM Studio"
		description="Use any GGUF model via the LM Studio local server."
	/>
{/if}

<section class="labs-section" aria-labelledby="labs-heading">
	<h3 id="labs-heading" class="labs-heading">Lab Features</h3>
	<p class="labs-description">
		Opt-in previews of in-development AI capabilities. Enabling Labs reveals experimental
		surfaces — additional Nova actions, draft agents, and prompt-system tools — that
		haven't completed their stability review. Expect rough edges, occasional regressions,
		and breaking changes between releases. Disable at any time to return to the stable
		feature set.
	</p>
	<label class="labs-toggle-label">
		<input
			type="checkbox"
			class="labs-toggle"
			checked={featureFlags.labsEnabled}
			onchange={(e) => featureFlags.setLabsEnabled((e.target as HTMLInputElement).checked)}
		/>
		Enable Lab features
	</label>
</section>

<style>
	.provider-subnav {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border-subtle);
		padding-bottom: var(--space-3);
	}

	.provider-tab {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		border: none;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-standard);
		font-family: inherit;
	}

	.provider-tab:not(:disabled):hover {
		color: var(--color-text-primary);
		background: var(--color-surface-hover);
	}

	.provider-tab--active {
		color: var(--color-text-primary);
		background: var(--color-surface-overlay);
	}

	.provider-tab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.badge-soon {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		background: var(--color-surface-elevated);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.labs-section {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border-subtle);
	}

	.labs-heading {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2);
	}

	.labs-description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-4);
	}

	.labs-toggle-label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.labs-toggle {
		cursor: pointer;
	}
</style>
