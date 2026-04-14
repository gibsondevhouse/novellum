<script lang="ts">
	import { onMount } from 'svelte';

	let apiKey = $state('');
	let isSaved = $state(false);
	let isInvalid = $state(false);
	let isChecking = $state(false);

	onMount(() => {
		const storedKey = localStorage.getItem('novellum_openrouter_key');
		if (storedKey) {
			apiKey = storedKey;
		}
	});

	async function saveKey() {
		isChecking = true;
		isInvalid = false;
		
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
			isSaved = true;
			setTimeout(() => {
				isSaved = false;
			}, 2000);
		} catch {
			isInvalid = true;
		} finally {
			isChecking = false;
		}
	}

	function removeKey() {
		localStorage.removeItem('novellum_openrouter_key');
		apiKey = '';
		isSaved = true;
		setTimeout(() => {
			isSaved = false;
		}, 2000);
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
		{#if isSaved}
			<span class="status-msg success">Settings saved!</span>
		{/if}
		{#if isInvalid}
			<span class="status-msg error">Invalid API key. Please check again.</span>
		{/if}
	</footer>
</div>

<style>
	.api-settings-panel {
		background: var(--surface-2, #1e1e1e);
		border: 1px solid var(--border-color, #333);
		border-radius: 8px;
		padding: 1.5rem;
		max-width: 600px;
	}

	.panel-header h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 500;
	}

	.panel-desc {
		margin: 0 0 1.5rem 0;
		color: var(--text-muted, #888);
		font-size: 0.875rem;
	}

	.setting-group {
		margin-bottom: 1.5rem;
	}

	.setting-label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.input-wrapper {
		display: flex;
		gap: 0.5rem;
	}

	.text-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		background: var(--surface-1, #111);
		border: 1px solid var(--border-color, #333);
		border-radius: 4px;
		color: var(--text-primary, #fff);
		font-family: inherit;
		font-size: 1rem;
	}

	.text-input:focus {
		outline: none;
		border-color: var(--focus-ring, #4a90e2);
	}

	.help-text {
		margin: 0.5rem 0 0 0;
		font-size: 0.75rem;
		color: var(--text-muted, #888);
	}

	.panel-actions {
		display: flex;
		align-items: center;
		flex-direction: row-reverse;
		gap: 1rem;
		border-top: 1px solid var(--border-color, #333);
		padding-top: 1rem;
		margin-top: 1.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: opacity 0.2s;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--primary-color, #4a90e2);
		color: white;
	}

	.btn-primary:active:not(:disabled) {
		opacity: 0.8;
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-primary, #fff);
		border: 1px solid var(--border-color, #333);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--surface-3, #2a2a2a);
	}

	.status-msg {
		font-size: 0.875rem;
		margin-right: auto;
	}

	.success {
		color: var(--success-color, #43a047);
	}

	.error {
		color: var(--error-color, #e53935);
	}
</style>