<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte.js';
	import { PrimaryButton, SecondaryButton, Input } from '$lib/components/ui/index.js';

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
			const res = await fetch('/api/ai/validate-key', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ apiKey: apiKey.trim() }),
			});

			if (!res.ok) {
				throw new Error('Validation request failed');
			}

			const data = await res.json();
			if (!data.valid) {
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
		<p class="panel-eyebrow">Primary Integration</p>
		<h2>AI Integration</h2>
		<p class="panel-desc">Configure your OpenRouter API key to enable AI assistance features.</p>
	</header>

	<div class="setting-group">
		<Input
			id="openrouter-key"
			type="password"
			label="OpenRouter API Key"
			bind:value={apiKey}
			placeholder="sk-or-v1-..."
		/>
		<p class="help-text">
			Your key is stored locally in your browser and never sent to our servers.
		</p>
	</div>

	<footer class="panel-actions">
		<PrimaryButton
			onclick={saveKey}
			disabled={!apiKey || isChecking}
		>
			{isChecking ? 'Verifying...' : 'Save Key'}
		</PrimaryButton>
		<SecondaryButton
			onclick={removeKey}
			disabled={!apiKey || isChecking}
		>
			Clear Key
		</SecondaryButton>
	</footer>
</div>

<style>
	.api-settings-panel {
		background: linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 600px;
	}

	.panel-eyebrow,
	.panel-header h2,
	.panel-desc {
		margin: 0;
	}

	.panel-eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.panel-header h2 {
		margin-top: var(--space-1);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-medium);
	}

	.panel-desc {
		margin-top: var(--space-2);
		margin-bottom: var(--space-6);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.setting-group {
		margin-bottom: var(--space-6);
	}

	.help-text {
		margin: var(--space-2) 0 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.panel-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		border-top: 1px solid var(--color-border-default);
		padding-top: var(--space-4);
		margin-top: var(--space-6);
	}
</style>