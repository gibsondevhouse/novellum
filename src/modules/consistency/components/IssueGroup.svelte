<script lang="ts">
	import type { ConsistencyIssue } from '$lib/db/types.js';
	import IssueRow from './IssueRow.svelte';

	let {
		type,
		issues,
		projectId,
		onResolve = undefined,
		onDismiss = undefined,
		onReopen = undefined,
	}: {
		type: ConsistencyIssue['type'];
		issues: ConsistencyIssue[];
		projectId: string;
		onResolve?: (id: string) => void;
		onDismiss?: (id: string) => void;
		onReopen?: (id: string) => void;
	} = $props();

	const label = $derived(type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
</script>

<details class="issue-group" open>
	<summary class="issue-group__summary">
		<span class="group-label">{label}</span>
		<span class="group-count">{issues.length}</span>
	</summary>
	<div class="issue-group__list">
		{#each issues as issue (issue.id)}
			<IssueRow {issue} {projectId} {onResolve} {onDismiss} {onReopen} />
		{/each}
	</div>
</details>

<style>
	.issue-group {
		margin-bottom: var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.issue-group__summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-surface-overlay);
		cursor: pointer;
		user-select: none;
		list-style: none;
	}

	.issue-group__summary::-webkit-details-marker {
		display: none;
	}

	.issue-group__summary::before {
		content: '▶';
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-right: var(--space-2);
		transition: transform var(--duration-fast);
	}

	details[open] .issue-group__summary::before {
		transform: rotate(90deg);
	}

	.group-label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.group-count {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		background-color: var(--color-surface-elevated);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		min-width: 20px;
		text-align: center;
	}

	.issue-group__list {
		display: flex;
		flex-direction: column;
	}
</style>
