<script lang="ts">
	import { onMount } from 'svelte';
	import type { ConsistencyIssue } from '$lib/db/types.js';
	import {
		loadIssues,
		getIssues,
		getOpenIssues,
		resolveIssue,
		dismissIssue,
		reopenIssue,
	} from '../stores/consistency-store.svelte.js';
	import IssueGroup from './IssueGroup.svelte';
	import { ISSUE_TYPES } from '../constants.js';
	import { SurfacePanel } from '$lib/components/ui/index.js';

	let { projectId }: { projectId: string } = $props();

	let showAll = $state(false);

	const visibleIssues = $derived(showAll ? getIssues() : getOpenIssues());
	const allIssues = $derived(getIssues());

	type GroupEntry = { type: ConsistencyIssue['type']; issues: ConsistencyIssue[] };

	const groups = $derived(
		ISSUE_TYPES.map((t) => ({ type: t, issues: visibleIssues.filter((i) => i.type === t) })).filter(
			(g) => g.issues.length > 0,
		) as GroupEntry[],
	);

	const warningCount = $derived(visibleIssues.filter((issue) => issue.severity === 'warning').length);
	const errorCount = $derived(visibleIssues.filter((issue) => issue.severity === 'error').length);
	const resolvedCount = $derived(allIssues.filter((issue) => issue.status === 'resolved').length);
	const dismissedCount = $derived(allIssues.filter((issue) => issue.status === 'dismissed').length);

	onMount(async () => {
		await loadIssues(projectId);
	});
</script>

<SurfacePanel class="consistency-panel">
	<div class="panel-hero" aria-labelledby="consistency-title">
		<div class="panel-toolbar">
			<div>
				<p class="panel-eyebrow">Continuity Triage</p>
				<h1 id="consistency-title">Consistency Issues</h1>
			</div>
			<label class="show-all-toggle">
				<input type="checkbox" bind:checked={showAll} />
				Show resolved and dismissed
			</label>
		</div>
		<div class="metrics-grid" aria-label="Issue summary">
			<div class="metric-card">
				<span class="metric-label">Open View</span>
				<strong>{visibleIssues.length}</strong>
			</div>
			<div class="metric-card">
				<span class="metric-label">Warnings</span>
				<strong>{warningCount}</strong>
			</div>
			<div class="metric-card">
				<span class="metric-label">Errors</span>
				<strong>{errorCount}</strong>
			</div>
			<div class="metric-card">
				<span class="metric-label">Resolved / Dismissed</span>
				<strong>{resolvedCount} / {dismissedCount}</strong>
			</div>
		</div>
	</div>

	{#if groups.length === 0}
		<div class="empty-state" role="status" aria-live="polite">
			<h2>All clear</h2>
			<p>No issues are currently flagged for this view.</p>
			<p class="empty-tip">Keep this panel healthy by running continuity checks after major plot or lore edits.</p>
		</div>
	{:else}
		<div class="groups-list">
			{#each groups as group (group.type)}
				<IssueGroup
					type={group.type}
					issues={group.issues}
					{projectId}
					onResolve={resolveIssue}
					onDismiss={dismissIssue}
					onReopen={reopenIssue}
				/>
			{/each}
		</div>
	{/if}
</SurfacePanel>

<style>
	:global(.consistency-panel) {
		max-width: 960px;
		display: grid;
		gap: var(--space-5);
		background: linear-gradient(165deg, var(--color-surface-overlay), var(--color-surface-ground));
	}

	.panel-hero {
		display: grid;
		gap: var(--space-4);
	}

	.panel-eyebrow,
	.panel-toolbar {
		margin: 0;
	}

	.panel-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.panel-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.panel-toolbar h1 {
		margin: 0;
	}

	.show-all-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
	}

	.show-all-toggle input {
		cursor: pointer;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.metric-card {
		display: grid;
		gap: 0.15rem;
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 75%, transparent);
	}

	.metric-label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.metric-card strong {
		font-size: var(--text-lg);
		color: var(--color-text-primary);
	}

	.empty-state {
		padding: var(--space-8) var(--space-4) var(--space-7);
		text-align: center;
		color: var(--color-text-secondary);
		border: 1px dashed var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-success) 6%, var(--color-surface-overlay));
	}

	.empty-state h2,
	.empty-state p {
		margin: 0;
 	}

	.empty-state h2 {
		font-size: var(--text-xl);
		margin-bottom: var(--space-2);
	}

	.empty-state p {
		font-size: var(--text-sm);
	}

	.empty-tip {
		margin-top: var(--space-2) !important;
		color: var(--color-text-muted);
	}

	.groups-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	@media (max-width: 900px) {
		.metrics-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.metrics-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
