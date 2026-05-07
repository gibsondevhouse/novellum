<script lang="ts">
	import { diffLines } from 'diff';
	import type { SceneSnapshot } from '$lib/db/domain-types';

	interface Props {
		snapshot: SceneSnapshot;
		currentText: string;
		busy?: boolean;
		onRestore: (snapshot: SceneSnapshot) => void;
		onClose: () => void;
	}

	let { snapshot, currentText, busy = false, onRestore, onClose }: Props = $props();

	const diffChunks = $derived(diffLines(snapshot.text, currentText));

	function handleBackdropKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleBackdropKey} />

<div
	class="modal-backdrop"
	role="presentation"
	onclick={onClose}
>
	<div
		class="modal-card"
		role="dialog"
		aria-modal="true"
		aria-label="Snapshot preview"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		tabindex="-1"
	>
		<header>
			<h2>Snapshot preview</h2>
			<button type="button" class="btn-close" onclick={onClose} aria-label="Close preview">
				✕
			</button>
		</header>

		<div class="meta">
			<span>{snapshot.wordCount} words</span>
			<span class="badge" data-source={snapshot.source}>{snapshot.source}</span>
			{#if snapshot.label}
				<span class="label">{snapshot.label}</span>
			{/if}
		</div>

		<pre class="diff">{#each diffChunks as chunk, i (i)}{#if chunk.added}<span class="added">{chunk.value}</span>{:else if chunk.removed}<span class="removed">{chunk.value}</span>{:else}<span>{chunk.value}</span>{/if}{/each}</pre>

		<footer>
			<button type="button" class="btn-secondary" onclick={onClose}>Cancel</button>
			<button type="button" class="btn-primary" disabled={busy} onclick={() => onRestore(snapshot)}>
				{busy ? 'Restoring…' : 'Restore this version'}
			</button>
		</footer>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: var(--color-scrim);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.modal-card {
		width: min(720px, 90vw);
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg, 8px);
		overflow: hidden;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3, 0.75rem);
		border-bottom: 1px solid var(--color-border-subtle);
	}
	header h2 {
		margin: 0;
		font-size: var(--text-md);
	}
	.btn-close {
		background: none;
		border: 0;
		cursor: pointer;
		font-size: 1rem;
		color: var(--color-text-muted);
	}
	.meta {
		display: flex;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.badge {
		padding: 0.1rem 0.4rem;
		border-radius: var(--radius-sm, 4px);
		background: var(--color-surface-overlay);
	}
	.diff {
		flex: 1;
		overflow: auto;
		padding: var(--space-3, 0.75rem);
		margin: 0;
		font-family: var(--font-mono, monospace);
		font-size: var(--text-xs);
		white-space: pre-wrap;
		word-break: break-word;
	}
	.added {
		background: color-mix(in srgb, var(--color-success, #2f9e44) 18%, transparent);
	}
	.removed {
		background: color-mix(in srgb, var(--color-danger, #e03131) 18%, transparent);
		text-decoration: line-through;
	}
	footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-3, 0.75rem);
		border-top: 1px solid var(--color-border-subtle);
	}
	.btn-secondary,
	.btn-primary {
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border-radius: var(--radius-md, 6px);
		border: 1px solid var(--color-border-default);
		cursor: pointer;
		font-size: var(--text-sm);
	}
	.btn-secondary {
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}
	.btn-primary {
		background: var(--color-accent, #6c8ef5);
		color: var(--color-on-accent, white);
		border-color: var(--color-accent, #6c8ef5);
	}
	.btn-primary[disabled] {
		opacity: 0.6;
		cursor: progress;
	}
</style>
