<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte.js';
	import { PrimaryButton, SecondaryButton, Input, SurfacePanel } from '$lib/components/ui/index.js';
	import {
		deleteKey,
		getStatus,
		migrateLegacyLocalStorage,
		saveKey,
		testKey,
		type ProviderStatus,
	} from '$lib/ai/credential-service.js';

	let apiKey = $state('');
	let status = $state<ProviderStatus | null>(null);
	let isSaving = $state(false);
	let isTesting = $state(false);
	let isDeleting = $state(false);
	let isLoading = $state(true);

	const providerId = 'openrouter';

	const isBusy = $derived(isSaving || isTesting || isDeleting);
	const canSave = $derived(apiKey.trim().length >= 16 && !isBusy);
	const canTest = $derived((status?.configured === true || apiKey.trim().length >= 16) && !isBusy);
	const canDelete = $derived(status?.configured === true && !isBusy);

	onMount(async () => {
		try {
			await migrateLegacyLocalStorage();
		} catch {
			// migration failures are non-fatal; status fetch will still proceed.
		}
		try {
			status = await getStatus(providerId);
		} catch {
			status = null;
		} finally {
			isLoading = false;
		}
	});

	async function handleSave(event: SubmitEvent) {
		event.preventDefault();
		if (!canSave) return;
		isSaving = true;
		try {
			status = await saveKey(providerId, apiKey.trim());
			apiKey = '';
			toast('API key saved.', 'success');
		} catch {
			toast('Could not save API key. Please retry.', 'error');
		} finally {
			isSaving = false;
		}
	}

	async function handleTest() {
		if (!canTest) return;
		isTesting = true;
		try {
			const candidate = apiKey.trim();
			const result = candidate
				? await testKeyWithSupplied(candidate)
				: await testKey(providerId);
			if (result.ok) {
				toast('API key is valid.', 'success');
				status = await getStatus(providerId);
			} else {
				toast(`Key check failed: ${result.reason ?? 'unknown'}.`, 'error');
			}
		} catch {
			toast('Could not test API key.', 'error');
		} finally {
			isTesting = false;
		}
	}

	async function testKeyWithSupplied(value: string) {
		const res = await fetch('/api/settings/ai-key', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ providerId, apiKey: value, action: 'test' }),
		});
		if (!res.ok) throw new Error(`status ${res.status}`);
		return (await res.json()) as { ok: boolean; reason?: string };
	}

	async function handleDelete() {
		if (!canDelete) return;
		isDeleting = true;
		try {
			await deleteKey(providerId);
			status = await getStatus(providerId);
			apiKey = '';
			toast('API key removed.', 'info');
		} catch {
			toast('Could not remove API key.', 'error');
		} finally {
			isDeleting = false;
		}
	}
</script>

<SurfacePanel class="api-settings-panel">
	<header class="panel-header">
		<p class="panel-eyebrow">Primary Integration</p>
		<h2>AI Integration</h2>
		<p class="panel-desc">
			Configure your OpenRouter API key. Your key is stored on this server only and never re-rendered after
			saving.
		</p>
	</header>

	{#if !isLoading && status?.configured}
		<div class="status-row" data-testid="api-key-status-configured">
			<span class="status-chip status-chip--ok">Connected</span>
			<span class="status-hint">Key ending {status.maskedHint}</span>
			{#if status.lastVerifiedAt}
				<span class="status-hint">· verified {new Date(status.lastVerifiedAt).toLocaleString()}</span>
			{/if}
		</div>
	{:else if !isLoading}
		<div class="status-row" data-testid="api-key-status-unconfigured">
			<span class="status-chip status-chip--warn">No key configured</span>
		</div>
	{/if}

	<form class="setting-group" onsubmit={handleSave}>
		<Input
			id="openrouter-key"
			type="password"
			label={status?.configured ? 'Replace OpenRouter API Key' : 'OpenRouter API Key'}
			bind:value={apiKey}
			placeholder="sk-or-v1-..."
			autocomplete="off"
			spellcheck={false}
		/>
		<p class="help-text">Your key is sent only to this server's credential store and never echoed back.</p>

		<footer class="panel-actions">
			<PrimaryButton type="submit" disabled={!canSave}>
				{isSaving ? 'Saving…' : status?.configured ? 'Replace key' : 'Save key'}
			</PrimaryButton>
			<SecondaryButton onclick={handleTest} disabled={!canTest}>
				{isTesting ? 'Testing…' : 'Test connection'}
			</SecondaryButton>
			{#if status?.configured}
				<SecondaryButton onclick={handleDelete} disabled={!canDelete}>
					{isDeleting ? 'Removing…' : 'Remove key'}
				</SecondaryButton>
			{/if}
		</footer>
	</form>
</SurfacePanel>

<style>
	:global(.api-settings-panel) {
		background: linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
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

	.status-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.status-chip--ok {
		background: var(--color-status-ok-bg, rgba(34, 197, 94, 0.15));
		color: var(--color-status-ok-fg, rgb(74, 222, 128));
	}

	.status-chip--warn {
		background: var(--color-status-warn-bg, rgba(250, 204, 21, 0.15));
		color: var(--color-status-warn-fg, rgb(250, 204, 21));
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
