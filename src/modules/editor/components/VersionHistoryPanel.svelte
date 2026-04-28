<script lang="ts">
	import { onMount } from 'svelte';
	import { diffLines } from 'diff';
	import { listByScene } from '$modules/editor/services/snapshot-repository.js';
	import type { SceneSnapshot } from '$lib/db/domain-types';
	import { SurfacePanel, GhostButton } from '$lib/components/ui/index.js';

	interface Props {
		sceneId: string;
		projectId: string;
		currentText: string;
		onRestore: (text: string) => void;
		onClose: () => void;
	}

	let { sceneId, currentText, onRestore, onClose }: Props = $props();

	let snapshots = $state<SceneSnapshot[]>([]);
	let selected = $state<SceneSnapshot | null>(null);

	onMount(async () => {
		snapshots = await listByScene(sceneId);
	});

	function wordCount(text: string): number {
		return text.trim().split(/\s+/).filter(Boolean).length;
	}

	function relativeTime(isoString: string): string {
		const diff = Date.now() - new Date(isoString).getTime();
		const minutes = Math.floor(diff / 60_000);
		if (minutes < 1) return 'just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return `${Math.floor(hours / 24)}d ago`;
	}

	const diffChunks = $derived(selected ? diffLines(selected.text, currentText) : []);
</script>

<SurfacePanel class="version-history-panel">
	<header class="panel-header">
		<h2>Version History</h2>
		<GhostButton class="btn-close" type="button" onclick={onClose}>✕</GhostButton>
	</header>

	<div class="panel-body">
		<ul class="snapshot-list">
			{#each snapshots as snap (snap.id)}
				<li class="snapshot-row" class:active={selected?.id === snap.id}>
					<GhostButton class="snap-btn" type="button" onclick={() => (selected = snap)}>
						<span class="snap-time">{relativeTime(snap.createdAt)}</span>
						<span class="snap-words">{wordCount(snap.text)} words</span>
					</GhostButton>
				</li>
			{:else}
				<li class="empty">No snapshots yet.</li>
			{/each}
		</ul>

		{#if selected}
			<div class="diff-view">
				<div class="diff-actions">
					<GhostButton
						class="btn-restore"
						type="button"
						onclick={() => {
							onRestore(selected!.text);
							onClose();
						}}
					>
						Restore this version
					</GhostButton>
				</div>
				<pre class="diff-content">{#each diffChunks as chunk, i (i)}{#if chunk.added}<span
								class="added">{chunk.value}</span
							>{:else if chunk.removed}<span class="removed">{chunk.value}</span>{:else}<span
								class="unchanged">{chunk.value}</span
							>{/if}{/each}</pre>
			</div>
		{/if}
	</div>
</SurfacePanel>

<style>
	:global(.version-history-panel) {
		display: flex;
		flex-direction: column;
		width: 380px;
		height: 100%;
		background: var(--color-surface-ground);
		border-left: 1px solid var(--color-border-default);
		overflow: hidden;
		padding: 0;
		border-radius: 0;
		border-top: 0;
		border-right: 0;
		border-bottom: 0;
	}
	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-4);
		border-bottom: 1px solid var(--color-border-default);
		flex-shrink: 0;
	}
	.panel-header h2 {
		margin: 0;
		font-size: var(--text-base);
	}
	:global(.btn-close) {
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--text-lg);
	}
	.panel-body {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
	}
	.snapshot-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		max-height: 220px;
		border-bottom: 1px solid var(--color-border-default);
	}
	.snapshot-row {
		display: flex;
		justify-content: space-between;
		padding: var(--space-2) var(--space-4);
		cursor: pointer;
	}
	.snapshot-row:hover,
	.snapshot-row.active {
		background: var(--color-surface-raised);
	}
	:global(.snap-btn) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		width: 100%;
		padding: 0;
		background: transparent;
		border: none;
		text-align: left;
	}
	.snap-time {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}
	.snap-words {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}
	.empty {
		padding: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
	.diff-view {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
		padding: var(--space-3);
		gap: var(--space-2);
	}
	.diff-actions {
		flex-shrink: 0;
	}
	:global(.btn-restore) {
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-sm);
		cursor: pointer;
	}
	.diff-content {
		flex: 1;
		overflow-y: auto;
		font-size: var(--text-xs);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}
	.added {
		background: var(--color-success-subtle);
		color: var(--color-success-on-dark);
		display: block;
	}
	.removed {
		background: var(--color-error-subtle);
		color: var(--color-error-on-dark);
		display: block;
	}
	.unchanged {
		color: var(--color-text-secondary);
		display: block;
	}
</style>
