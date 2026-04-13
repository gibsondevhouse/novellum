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

	let { projectId }: { projectId: string } = $props();

	let showAll = $state(false);

	const visibleIssues = $derived(showAll ? getIssues() : getOpenIssues());

	const ISSUE_TYPES = ['timeline', 'character', 'lore', 'plot_thread'] as const;

	type GroupEntry = { type: ConsistencyIssue['type']; issues: ConsistencyIssue[] };

	const groups = $derived(
		ISSUE_TYPES.map((t) => ({ type: t, issues: visibleIssues.filter((i) => i.type === t) })).filter(
			(g) => g.issues.length > 0,
		) as GroupEntry[],
	);

	onMount(async () => {
		await loadIssues(projectId);
	});
</script>

<div class="consistency-panel">
	<div class="panel-toolbar">
		<h1>Consistency</h1>
		<label class="show-all-toggle">
			<input type="checkbox" bind:checked={showAll} />
			Show resolved &amp; dismissed
		</label>
	</div>

	{#if groups.length === 0}
		<div class="empty-state">
			<p>No consistency issues found.</p>
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
</div>

<style>
	.consistency-panel {
		padding: var(--space-6);
		max-width: 860px;
	}

	.panel-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
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
	}

	.show-all-toggle input {
		cursor: pointer;
	}

	.empty-state {
		padding: var(--space-8) var(--space-4);
		text-align: center;
		color: var(--color-text-muted);
	}

	.empty-state p {
		font-size: var(--text-sm);
		margin: 0;
	}

	.groups-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
