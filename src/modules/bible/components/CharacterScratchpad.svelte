<script lang="ts">
	import FilePenLine from '@lucide/svelte/icons/file-pen-line';
	import { SurfacePanel } from '$lib/components/ui/index.js';

	let { projectId, characterId }: { projectId: string; characterId: string } = $props();

	let content = $state('');
	let persisted = $state('');
	let scratchpadPath = $state('');
	let loadState = $state<'idle' | 'loading' | 'error'>('idle');
	let saveState = $state<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle');
	let error = $state('');
	let hydrationKey = $state('');

	$effect(() => {
		const currentKey = `${projectId}:${characterId}`;
		if (!characterId || hydrationKey === currentKey) return;

		hydrationKey = currentKey;
		loadState = 'loading';
		error = '';

		void (async () => {
			try {
				const response = await fetch(
					`/api/projects/${projectId}/characters/${characterId}/scratchpad`,
				);
				const payload = (await response.json()) as {
					content?: string;
					path?: string;
					error?: string;
				};

				if (!response.ok) {
					throw new Error(payload.error ?? 'Could not load scratchpad.');
				}

				content = payload.content ?? '';
				persisted = payload.content ?? '';
				scratchpadPath = payload.path ?? '';
				loadState = 'idle';
				saveState = 'idle';
			} catch (loadError) {
				loadState = 'error';
				error = loadError instanceof Error ? loadError.message : 'Could not load scratchpad.';
			}
		})();
	});

	$effect(() => {
		if (!characterId || loadState !== 'idle' || content === persisted) {
			return;
		}

		saveState = 'dirty';
		const timer = window.setTimeout(() => {
			void (async () => {
				saveState = 'saving';
				error = '';
				try {
					const response = await fetch(
						`/api/projects/${projectId}/characters/${characterId}/scratchpad`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ content }),
						},
					);
					const payload = (await response.json()) as { path?: string; error?: string };

					if (!response.ok) {
						throw new Error(payload.error ?? 'Could not save scratchpad.');
					}

					persisted = content;
					scratchpadPath = payload.path ?? scratchpadPath;
					saveState = 'saved';
				} catch (saveError) {
					saveState = 'error';
					error = saveError instanceof Error ? saveError.message : 'Could not save scratchpad.';
				}
			})();
		}, 700);

		return () => window.clearTimeout(timer);
	});

	const saveLabel = $derived.by(() => {
		if (saveState === 'saving') return 'syncing';
		if (saveState === 'saved') return 'synced';
		if (saveState === 'dirty') return 'queued';
		if (saveState === 'error') return 'fault';
		return 'idle';
	});
</script>

<SurfacePanel>
	<div class="scratchpad-panel">
		<div class="scratchpad-panel__header">
			<div>
				<p class="scratchpad-panel__eyebrow">Markdown Scratchpad</p>
				<h3>Long-form Drafting</h3>
				<p>Local-first notes stream directly into the character dossier markdown file.</p>
			</div>
			<div class="scratchpad-panel__meta">
				<FilePenLine class="scratchpad-panel__icon" aria-hidden="true" />
				<span>{saveLabel}</span>
			</div>
		</div>

		{#if scratchpadPath}
			<p class="scratchpad-panel__path">{scratchpadPath}</p>
		{/if}

		<textarea
			class="scratchpad-panel__textarea"
			bind:value={content}
			rows={14}
			spellcheck="false"
			aria-label="Character markdown scratchpad"
			disabled={loadState === 'loading'}
		></textarea>

		{#if error}
			<p class="scratchpad-panel__error" role="alert">{error}</p>
		{/if}
	</div>
</SurfacePanel>

<style>
	.scratchpad-panel {
		gap: var(--space-3);
		min-height: 100%;
	}

	.scratchpad-panel__header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.scratchpad-panel__eyebrow,
	.scratchpad-panel__meta,
	.scratchpad-panel__path {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.scratchpad-panel__header h3 {
		margin: 0;
	}

	.scratchpad-panel__header p:last-child {
		margin: var(--space-1) 0 0;
		color: var(--color-text-secondary);
	}

	.scratchpad-panel__meta {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: color-mix(in srgb, var(--color-nova-blue) 70%, #b5ff3d 30%);
	}

	.scratchpad-panel__meta :global(svg) {
		width: 1rem;
		height: 1rem;
		stroke-width: 1.5;
	}

	.scratchpad-panel__path {
		margin: 0;
		padding: 0.75rem 0.9rem;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-ground) 72%, transparent);
		color: var(--color-text-muted);
	}

	.scratchpad-panel__textarea {
		width: 100%;
		min-height: 20rem;
		resize: vertical;
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 90%, transparent);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--color-surface-ground) 88%, transparent), var(--color-surface-overlay));
		padding: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.65;
		color: var(--color-text-primary);
		box-sizing: border-box;
	}

	.scratchpad-panel__textarea:focus {
		outline: none;
		border-color: var(--color-nova-blue);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-nova-blue) 45%, transparent);
	}

	.scratchpad-panel__error {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-error);
	}
</style>