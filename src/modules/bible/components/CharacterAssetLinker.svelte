<script lang="ts">
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import Link2 from '@lucide/svelte/icons/link-2';
	import ScanSearch from '@lucide/svelte/icons/scan-search';
	import { untrack } from 'svelte';
	import { Input, PrimaryButton, SurfacePanel } from '$lib/components/ui/index.js';

	let {
		value = '',
		title = 'Portrait',
		description = 'Drop or paste a workspace-relative image path to attach a portrait.',
		onApply,
	}: {
		value?: string;
		title?: string;
		description?: string;
		onApply: (nextPath: string) => Promise<void> | void;
	} = $props();

	let draftPath = $state(untrack(() => value));
	let activeDrop = $state(false);
	let saving = $state(false);
	let error = $state('');
	let status = $state('');

	const previewSrc = $derived.by(() => {
		const trimmed = value.trim();
		if (!trimmed) return '';
		if (/^https?:\/\//i.test(trimmed)) return trimmed;
		return `/api/local-files/image?path=${encodeURIComponent(trimmed)}`;
	});

	async function normalizePath(rawPath: string): Promise<string> {
		const response = await fetch('/api/local-files/normalize', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ path: rawPath }),
		});

		const payload = (await response.json()) as { path?: string; error?: string };
		if (!response.ok || !payload.path) {
			throw new Error(payload.error ?? 'Could not normalize image path.');
		}

		return payload.path;
	}

	async function applyPath(rawPath: string) {
		const trimmed = rawPath.trim();
		if (!trimmed) {
			error = 'Enter a workspace-relative image path.';
			status = '';
			return;
		}

		saving = true;
		error = '';
		status = '';

		try {
			const normalizedPath = /^https?:\/\//i.test(trimmed) ? trimmed : await normalizePath(trimmed);
			await onApply(normalizedPath);
			draftPath = normalizedPath;
			status = normalizedPath;
		} catch (applyError) {
			error = applyError instanceof Error ? applyError.message : 'Could not attach image path.';
		} finally {
			saving = false;
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		activeDrop = false;

		const textPath = event.dataTransfer?.getData('text/plain')?.trim();
		if (textPath) {
			draftPath = textPath;
			await applyPath(textPath);
			return;
		}

		error = 'Drop a plain-text workspace path from VS Code, or paste it manually.';
	}
</script>

<SurfacePanel>
	<div class="asset-linker">
		<div class="asset-linker__header">
			<div>
				<p class="asset-linker__eyebrow">Image</p>
				<h3>{title}</h3>
				<p>{description}</p>
			</div>
			<div class="asset-linker__badge">
				<Link2 class="asset-linker__badge-icon" aria-hidden="true" />
				<span>{value ? 'linked' : 'idle'}</span>
			</div>
		</div>

		<button
			class:asset-linker__dropzone--active={activeDrop}
			class="asset-linker__dropzone"
			type="button"
			ondragenter={() => (activeDrop = true)}
			ondragleave={() => (activeDrop = false)}
			ondragover={(event) => event.preventDefault()}
			ondrop={handleDrop}
			onclick={() => draftPath && applyPath(draftPath)}
			aria-label="Link portrait image path"
		>
			{#if previewSrc}
				<img class="asset-linker__preview" src={previewSrc} alt="Portrait preview" />
			{:else}
				<div class="asset-linker__empty">
					<ImagePlus class="asset-linker__empty-icon" aria-hidden="true" />
					<p>Drop a workspace path here</p>
					<span>Example: static/portraits/solenne.png</span>
				</div>
			{/if}
		</button>

		<div class="asset-linker__controls">
			<Input
				id="portrait-path"
				label="Workspace Path"
				type="text"
				bind:value={draftPath}
				placeholder="static/portraits/persona.png"
			/>
			<PrimaryButton type="button" onclick={() => applyPath(draftPath)} disabled={saving}>
				<ScanSearch class="button-icon" aria-hidden="true" />
				<span>{saving ? 'Linking…' : 'Link Asset'}</span>
			</PrimaryButton>
		</div>

		{#if error}
			<p class="asset-linker__error" role="alert">{error}</p>
		{:else if status}
			<p class="asset-linker__status" role="status">Stored as {status}</p>
		{/if}
	</div>
</SurfacePanel>

<style>
	.asset-linker {
		gap: var(--space-4);
		background: var(--color-surface-base);
	}

	.asset-linker__header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		align-items: flex-start;
	}

	.asset-linker__eyebrow,
	.asset-linker__badge,
	.asset-linker__status {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.asset-linker__header h3 {
		margin: 0;
		font-size: var(--text-lg);
	}

	.asset-linker__header p:last-child {
		margin: var(--space-1) 0 0;
		color: var(--color-text-secondary);
		max-width: 42ch;
	}

	.asset-linker__badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.5rem 0.75rem;
		border-radius: 999px;
		border: 1px solid var(--color-border-default);
		color: var(--color-text-secondary);
		background: var(--color-surface-overlay);
	}

	.asset-linker__badge :global(svg),
	.asset-linker__empty :global(svg),
	:global(.button-icon) {
		width: 1rem;
		height: 1rem;
		stroke-width: 1.5;
	}

	.asset-linker__dropzone {
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-lg);
		padding: 0;
		background: var(--color-surface-overlay);
		min-height: 17rem;
		cursor: pointer;
		overflow: hidden;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard),
			transform var(--duration-fast) var(--ease-standard);
	}

	.asset-linker__dropzone:hover,
	.asset-linker__dropzone:focus-visible,
	.asset-linker__dropzone--active {
		border-color: color-mix(in srgb, var(--color-nova-blue) 60%, var(--color-border-default));
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-nova-blue) 25%, transparent);
		transform: translateY(-1px);
	}

	.asset-linker__preview {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 17rem;
		object-fit: cover;
	}

	.asset-linker__empty {
		display: grid;
		place-items: center;
		gap: var(--space-2);
		padding: var(--space-6);
		min-height: 17rem;
		color: var(--color-text-secondary);
		text-align: center;
	}

	.asset-linker__empty p {
		margin: 0;
		font-size: var(--text-base);
		color: var(--color-text-primary);
	}

	.asset-linker__empty span {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.asset-linker__controls {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-3);
		align-items: end;
	}

	.asset-linker__error {
		margin: 0;
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	.asset-linker__status {
		margin: 0;
		color: var(--color-text-secondary);
	}

	@media (max-width: 640px) {
		.asset-linker__header,
		.asset-linker__controls {
			grid-template-columns: 1fr;
			display: grid;
		}
	}
</style>