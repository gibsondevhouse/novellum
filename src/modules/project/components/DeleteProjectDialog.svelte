<script lang="ts">
	import { getDeleting, submitDelete } from '../stores/project-hub.svelte.ts';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let { projectId, oncancel } = $props<{ projectId: string; oncancel: () => void }>();

	async function handleConfirm() {
		await submitDelete(projectId);
	}
</script>

<div class="dialog-overlay" role="dialog" aria-modal="true" aria-label="Delete project">
	<div class="dialog-panel">
		<h2 class="dialog-title">Delete Project?</h2>
		<p class="dialog-body">
			This action cannot be undone. All project data will be permanently deleted.
		</p>
		<div class="actions">
			<GhostButton onclick={oncancel} disabled={getDeleting()}>Cancel</GhostButton>
			<button class="btn-danger" onclick={handleConfirm} disabled={getDeleting()}>
				{getDeleting() ? 'Deleting…' : 'Delete Project'}
			</button>
		</div>
	</div>
</div>

<style>
	.dialog-overlay {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, black 60%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.dialog-panel {
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-lg);
		padding: var(--space-8);
		width: min(400px, 90vw);
		box-shadow: var(--shadow-xl);
	}

	.dialog-title {
		margin-bottom: var(--space-3);
		color: var(--color-text-primary);
	}

	.dialog-body {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		margin-bottom: var(--space-6);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
	}
</style>
