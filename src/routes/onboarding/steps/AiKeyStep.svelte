<script lang="ts">
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { saveKey } from '$lib/ai/credential-service.js';

	interface Props {
		onNext: () => void;
		onSkip?: () => void;
	}
	let { onNext, onSkip }: Props = $props();

	let apiKey = $state('');
	let saving = $state(false);
	let errorMsg = $state('');
	let successMsg = $state('');

	async function handleSave() {
		if (!apiKey.trim()) {
			errorMsg = 'Please enter an API key.';
			return;
		}
		saving = true;
		errorMsg = '';
		successMsg = '';
		try {
			await saveKey('openrouter', apiKey.trim());
			successMsg = 'API key saved.';
			onNext();
		} catch (err) {
			errorMsg =
				err instanceof Error && err.message
					? err.message
					: 'Failed to save key. Please try again.';
		} finally {
			saving = false;
		}
	}
</script>

<div class="step">
	<h2 class="step-heading">Enable AI writing assistance <span class="optional">(optional)</span></h2>
	<p class="step-body">
		Novellum uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer"
			>OpenRouter</a
		> to connect you to AI models. Bring your own API key — Novellum never stores it in the cloud.
	</p>
	<div class="step-field">
		<Input
			id="ai-key-input"
			label="OpenRouter API key"
			type="password"
			placeholder="sk-or-v1-..."
			bind:value={apiKey}
			autocomplete="off"
		/>
	</div>
	{#if errorMsg}
		<p class="step-feedback step-feedback--error" role="alert">{errorMsg}</p>
	{/if}
	{#if successMsg}
		<p class="step-feedback step-feedback--success" role="status">{successMsg}</p>
	{/if}
	<div class="step-actions">
		<PrimaryButton onclick={handleSave} disabled={saving}>
			{saving ? 'Saving…' : 'Save key'}
		</PrimaryButton>
		<GhostButton onclick={onSkip}>Skip for now</GhostButton>
	</div>
</div>

<style>
	.step {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.step-heading {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}
	.optional {
		font-size: var(--text-base);
		font-weight: var(--font-normal);
		color: var(--color-text-muted);
	}
	.step-body {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
	}
	.step-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.step-feedback {
		font-size: var(--text-sm);
		margin: 0;
	}
	.step-feedback--error {
		color: var(--color-error, var(--color-danger));
	}
	.step-feedback--success {
		color: var(--color-success);
	}
	.step-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
