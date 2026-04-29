<script lang="ts">
	import type { PendingDraft } from '$modules/editor/services/recovery-service.js';

	interface Props {
		draft: PendingDraft;
		onRestore: (draft: PendingDraft) => void;
		onDiscard: (draft: PendingDraft) => void;
	}

	let { draft, onRestore, onDiscard }: Props = $props();

	function handleKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') onDiscard(draft);
	}

	const savedRelative = $derived.by(() => {
		const ms = Date.now() - new Date(draft.savedAt).getTime();
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ago`;
	});
</script>

<svelte:window onkeydown={handleKey} />

<div class="recovery-backdrop" role="presentation" onclick={() => onDiscard(draft)}>
	<div
		class="recovery-card"
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="recovery-title"
		aria-describedby="recovery-body"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		tabindex="-1"
	>
		<header>
			<h2 id="recovery-title">Recover unsaved draft?</h2>
		</header>
		<p id="recovery-body">
			Novellum found an unsaved draft for this scene from {savedRelative}.
			Restore it, or discard it to keep the saved version.
		</p>
		<footer>
			<button type="button" class="btn-secondary" onclick={() => onDiscard(draft)}>
				Discard draft
			</button>
			<button type="button" class="btn-primary" onclick={() => onRestore(draft)}>
				Restore draft
			</button>
		</footer>
	</div>
</div>

<style>
	.recovery-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1100;
	}
	.recovery-card {
		width: min(480px, 90vw);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg, 8px);
		padding: var(--space-4, 1rem);
		display: flex;
		flex-direction: column;
		gap: var(--space-3, 0.75rem);
	}
	header h2 {
		margin: 0;
		font-size: var(--text-md);
	}
	footer {
		display: flex;
		gap: var(--space-2, 0.5rem);
		justify-content: flex-end;
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
</style>
