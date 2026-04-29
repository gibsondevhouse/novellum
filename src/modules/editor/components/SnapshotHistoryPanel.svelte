<script lang="ts">
	import { onMount } from 'svelte';
	import {
		listByScene,
		restoreSnapshot,
	} from '$modules/editor/services/snapshot-repository.js';
	import type { SceneSnapshot, SceneSnapshotSource } from '$lib/db/domain-types';
	import SnapshotPreviewModal from './SnapshotPreviewModal.svelte';

	interface Props {
		sceneId: string;
		currentText: string;
		onRestore: (text: string) => void;
		onClose: () => void;
	}

	let { sceneId, currentText, onRestore, onClose }: Props = $props();

	let snapshots = $state<SceneSnapshot[]>([]);
	let preview = $state<SceneSnapshot | null>(null);
	let restoring = $state(false);

	const SOURCE_LABEL: Record<SceneSnapshotSource, string> = {
		autosave: 'Autosave',
		manual: 'Manual',
		'pre-restore': 'Pre-restore',
		'pre-migration': 'Pre-migration',
	};

	onMount(async () => {
		snapshots = await listByScene(sceneId);
	});

	function relativeTime(iso: string): string {
		const diff = Date.now() - new Date(iso).getTime();
		const minutes = Math.floor(diff / 60_000);
		if (minutes < 1) return 'just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return `${Math.floor(hours / 24)}d ago`;
	}

	async function handleRestoreClick(snapshot: SceneSnapshot): Promise<void> {
		if (restoring) return;
		restoring = true;
		try {
			const result = await restoreSnapshot(snapshot.id);
			onRestore(result.restoredText);
			snapshots = await listByScene(sceneId);
			preview = null;
		} finally {
			restoring = false;
		}
	}
</script>

<aside class="snapshot-history-panel" aria-label="Snapshot history">
	<header class="panel-header">
		<h2>Snapshot history</h2>
		<button class="btn-close" type="button" onclick={onClose} aria-label="Close history">
			✕
		</button>
	</header>

	<ul class="snapshot-list" role="list">
		{#each snapshots as snap (snap.id)}
			<li>
				<button
					type="button"
					class="snapshot-row"
					class:active={preview?.id === snap.id}
					onclick={() => (preview = snap)}
				>
					<span class="snap-time">{relativeTime(snap.createdAt)}</span>
					<span class="snap-source" data-source={snap.source}>{SOURCE_LABEL[snap.source as SceneSnapshotSource] ?? snap.source}</span>
					<span class="snap-words">{snap.wordCount} words</span>
				</button>
			</li>
		{:else}
			<li class="empty">No snapshots yet.</li>
		{/each}
	</ul>
</aside>

{#if preview}
	<SnapshotPreviewModal
		snapshot={preview}
		{currentText}
		busy={restoring}
		onRestore={handleRestoreClick}
		onClose={() => (preview = null)}
	/>
{/if}

<style>
	.snapshot-history-panel {
		display: flex;
		flex-direction: column;
		width: 320px;
		height: 100%;
		background: var(--color-surface-ground);
		border-left: 1px solid var(--color-border-default);
		overflow: hidden;
	}
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3, 0.75rem);
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.panel-header h2 {
		font-size: var(--text-sm);
		margin: 0;
	}
	.btn-close {
		background: none;
		border: 0;
		cursor: pointer;
		font-size: 1rem;
		color: var(--color-text-muted);
	}
	.snapshot-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}
	.snapshot-row {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-2, 0.5rem);
		align-items: center;
		width: 100%;
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		background: none;
		border: 0;
		border-bottom: 1px solid var(--color-border-subtle);
		text-align: left;
		cursor: pointer;
		color: var(--color-text-primary);
	}
	.snapshot-row.active {
		background: color-mix(in srgb, var(--color-accent, #6c8ef5) 10%, transparent);
	}
	.snap-time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.snap-source {
		font-size: var(--text-xs);
		padding: 0.1rem 0.4rem;
		border-radius: var(--radius-sm, 4px);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}
	.snap-source[data-source='pre-restore'],
	.snap-source[data-source='pre-migration'] {
		background: color-mix(in srgb, var(--color-warning, #f59e0b) 18%, transparent);
		color: var(--color-warning, #f59e0b);
	}
	.snap-words {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.empty {
		padding: var(--space-3, 0.75rem);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
