<script lang="ts">
	import { onMount } from 'svelte';

	type ActiveProvider = 'openrouter' | 'ollama';

	interface OllamaStatus {
		baseUrl: string;
		model: string | null;
		activeProvider: ActiveProvider;
		configured: boolean;
	}

	interface ModelInfo {
		id: string;
		name: string;
	}

	let baseUrl = $state('http://127.0.0.1:11434');
	let model = $state<string | null>(null);
	let activeProvider = $state<ActiveProvider>('openrouter');
	let models = $state<ModelInfo[]>([]);
	let loading = $state(true);
	let starting = $state(false);
	let testing = $state(false);
	let saving = $state(false);
	let message = $state<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);

	onMount(async () => {
		try {
			const res = await fetch('/api/settings/ai-ollama');
			if (res.ok) {
				const status = (await res.json()) as OllamaStatus;
				baseUrl = status.baseUrl;
				model = status.model;
				activeProvider = status.activeProvider;
			}
		} catch (err) {
			message = {
				kind: 'err',
				text: `Failed to load config: ${err instanceof Error ? err.message : 'unknown'}`,
			};
		} finally {
			loading = false;
		}
		// Auto-start the daemon and populate the model list.
		await startAndList();
	});

	async function startDaemon(): Promise<boolean> {
		starting = true;
		message = { kind: 'info', text: 'Starting Ollama…' };
		try {
			const res = await fetch('/api/settings/ai-ollama', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'start', baseUrl }),
			});
			const body = (await res.json()) as
				| { ok: true; alreadyRunning: boolean }
				| { ok: false; reason: string; message: string };
			if (body.ok) {
				message = body.alreadyRunning
					? { kind: 'ok', text: 'Ollama is running.' }
					: { kind: 'ok', text: 'Ollama started.' };
				return true;
			}
			if (body.reason === 'not_installed') {
				message = {
					kind: 'err',
					text:
						'Ollama is not installed on this Mac. Install it from ollama.com, then click Retry.',
				};
			} else {
				message = { kind: 'err', text: body.message };
			}
			return false;
		} catch (err) {
			message = {
				kind: 'err',
				text: `Failed to start Ollama: ${err instanceof Error ? err.message : 'unknown'}`,
			};
			return false;
		} finally {
			starting = false;
		}
	}

	async function startAndList() {
		const started = await startDaemon();
		if (started) await refreshModels({ silent: false });
	}

	async function refreshModels(opts: { silent?: boolean } = {}) {
		testing = true;
		try {
			const res = await fetch('/api/settings/ai-ollama', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'list-models', baseUrl }),
			});
			const body = (await res.json()) as { models?: ModelInfo[]; error?: { message: string } };
			if (!res.ok) {
				if (!opts.silent) {
					message = {
						kind: 'err',
						text: body.error?.message ?? 'Failed to reach Ollama.',
					};
				}
				return;
			}
			models = body.models ?? [];
			if (!opts.silent) {
				message = {
					kind: 'ok',
					text: `Connected. Found ${models.length} model${models.length === 1 ? '' : 's'}.`,
				};
			}
			if (model && !models.some((m) => m.id === model)) {
				model = null;
			}
		} catch (err) {
			if (!opts.silent) {
				message = {
					kind: 'err',
					text: `Connection failed: ${err instanceof Error ? err.message : 'unknown'}`,
				};
			}
		} finally {
			testing = false;
		}
	}

	async function save() {
		saving = true;
		message = null;
		try {
			const res = await fetch('/api/settings/ai-ollama', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'save', baseUrl, model }),
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as
					| { error?: { message: string } }
					| null;
				message = {
					kind: 'err',
					text: body?.error?.message ?? 'Failed to save settings.',
				};
				return;
			}
			const status = (await res.json()) as OllamaStatus;
			baseUrl = status.baseUrl;
			model = status.model;
			message = { kind: 'ok', text: 'Saved.' };
		} finally {
			saving = false;
		}
	}

	async function setActive(next: ActiveProvider) {
		const res = await fetch('/api/settings/ai-ollama', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'set-active', activeProvider: next }),
		});
		if (res.ok) {
			const status = (await res.json()) as OllamaStatus;
			activeProvider = status.activeProvider;
			message = {
				kind: 'ok',
				text:
					next === 'ollama'
						? 'Ollama is now the active AI provider.'
						: 'OpenRouter is now the active AI provider.',
			};
		}
	}
</script>

<div class="ollama-panel">
	<p class="ollama-description">
		Run open-source models locally with <a
			href="https://ollama.com"
			target="_blank"
			rel="noopener noreferrer">Ollama</a
		>. Novellum will start the daemon automatically — just install Ollama once and pick
		a model.
	</p>

	{#if loading}
		<p class="hint">Loading…</p>
	{:else}
		<div class="form-row">
			<label for="ollama-base-url" class="form-label">Base URL</label>
			<input
				id="ollama-base-url"
				type="url"
				class="form-input"
				bind:value={baseUrl}
				placeholder="http://127.0.0.1:11434"
				autocomplete="off"
				spellcheck="false"
			/>
			<p class="hint">Default is <code>http://127.0.0.1:11434</code>.</p>
		</div>

		<div class="form-row">
			<button
				type="button"
				class="btn-secondary"
				disabled={starting || testing}
				onclick={startAndList}
			>
				{starting ? 'Starting Ollama…' : testing ? 'Loading models…' : 'Retry connection'}
			</button>
		</div>

		<div class="form-row">
			<label for="ollama-model" class="form-label">Model</label>
			<select id="ollama-model" class="form-input" bind:value={model} disabled={models.length === 0}>
				<option value={null}>{models.length === 0 ? 'No models yet' : 'Select a model…'}</option>
				{#each models as m (m.id)}
					<option value={m.id}>{m.name}</option>
				{/each}
			</select>
			<p class="hint">
				Pull models locally with <code>ollama pull &lt;name&gt;</code>, then refresh this list.
			</p>
		</div>

		<div class="form-row actions">
			<button type="button" class="btn-primary" onclick={save} disabled={saving}>
				{saving ? 'Saving…' : 'Save'}
			</button>
			{#if activeProvider === 'ollama'}
				<button type="button" class="btn-secondary" onclick={() => setActive('openrouter')}>
					Switch to OpenRouter
				</button>
				<span class="active-pill">Active provider</span>
			{:else}
				<button
					type="button"
					class="btn-secondary"
					disabled={!model}
					onclick={() => setActive('ollama')}
				>
					Use Ollama as active provider
				</button>
			{/if}
		</div>

		{#if message}
			<p class="status status--{message.kind}" role="status">{message.text}</p>
		{/if}
	{/if}
</div>

<style>
	.ollama-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.ollama-description {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.ollama-description a {
		color: var(--color-accent-default);
		text-decoration: underline;
	}

	.form-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-row.actions {
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.form-label {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.form-input {
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-default);
		color: var(--color-text-primary);
	}

	.form-input:focus-visible {
		outline: 2px solid var(--color-accent-default);
		outline-offset: 1px;
	}

	.hint {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.hint code {
		font-family: var(--font-mono);
		font-size: 0.95em;
		padding: 0 var(--space-1);
		background: var(--color-surface-subtle);
		border-radius: var(--radius-xs);
	}

	.btn-primary,
	.btn-secondary {
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--color-accent-default);
		color: var(--color-text-on-accent);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.btn-secondary {
		background: transparent;
		border-color: var(--color-border-default);
		color: var(--color-text-primary);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-surface-subtle);
	}

	.btn-primary:disabled,
	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.active-pill {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--color-accent-subtle);
		color: var(--color-accent-default);
	}

	.status {
		font-size: var(--text-sm);
		margin: 0;
	}

	.status--ok {
		color: var(--color-success-default);
	}

	.status--err {
		color: var(--color-danger-default);
	}

	.status--info {
		color: var(--color-text-secondary);
	}
</style>
