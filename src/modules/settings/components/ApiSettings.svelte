<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte.js';

	let apiKey = $state('');
	let isChecking = $state(false);

	onMount(() => {
		const storedKey = localStorage.getItem('novellum_openrouter_key');
		if (storedKey) {
			apiKey = storedKey;
		}
	});

	async function saveKey() {
		isChecking = true;

		try {
			// Verify key with OpenRouter auth check endpoint or a simple model fetch
			const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${apiKey.trim()}`
				}
			});

			if (!res.ok) {
				throw new Error('Invalid key');
			}

			localStorage.setItem('novellum_openrouter_key', apiKey.trim());
			toast('API key saved successfully.', 'success');
		} catch {
			toast('Invalid API key. Please check again.', 'error');
		} finally {
			isChecking = false;
		}
	}

	function removeKey() {
		localStorage.removeItem('novellum_openrouter_key');
		apiKey = '';
		toast('API key removed.', 'info');
	}
</script>

<div class="api-settings-panel">
	<header class="panel-header">
		<h2>AI Integration</h2>
		<p class="panel-desc">Configure your OpenRouter API key to enable AI assistance features.</p>
	</header>

	<div class="setting-group">
		<label for="openrouter-key" class="setting-label">OpenRouter API Key</label>
		<div class="input-wrapper">
			<input
				id="openrouter-key"
				type="password"
				bind:value={apiKey}
				placeholder="sk-or-v1-..."
				class="text-input"
			/>
		</div>
		<p class="help-text">
			Your key is stored locally in your browser and never sent to our servers.
		</p>
	</div>

	<footer class="panel-actions">
		<button
			type="button"
			class="btn btn-secondary"
			onclick={removeKey}
			disabled={!apiKey || isChecking}
		>
			Clear Key
		</button>
		<button
			type="button"
			class="btn btn-primary"
			onclick={saveKey}
			disabled={!apiKey || isChecking}
		>
			{isChecking ? 'Verifying...' : 'Save Key'}
		</button>
	</footer>
</div>

<style>
	.api-settings-panel {
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 600px;
	}

	.panel-header h2 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--text-xl);
		font-weight: var(--font-weight-medium);
	}

	.panel-desc {
		margin: 0 0 var(--space-6) 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.setting-group {
		margin-bottom: var(--space-6);
	}

	.setting-label {
		display: block;
		margin-bottom: var(--space-2);
		font-weight: var(--font-weight-medium);
		font-size: var(--text-sm);
	}

	.input-wrapper {
		display: flex;
		gap: var(--space-2);
	}

	.text-input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-family: inherit;
		font-size: var(--text-base);
	}

	.text-input:focus {
		outline: none;
		border-color: var(--color-border-focus);
	}

	.help-text {
		margin: var(--space-2) 0 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.panel-actions {
		display: flex;
		align-items: center;
		flex-direction: row-reverse;
		gap: var(--space-4);
		border-top: 1px solid var(--color-border-default);
		padding-top: var(--space-4);
		margin-top: var(--space-6);
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-family: inherit;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		border: none;
		transition: opacity var(--duration-base) var(--ease-standard);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--color-nova-blue);
		color: var(--color-text-on-dark);
	}

	.btn-primary:active:not(:disabled) {
		opacity: 0.8;
	}

	.btn-secondary {
		background: transparent;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-default);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-surface-elevated);
	}
</style>