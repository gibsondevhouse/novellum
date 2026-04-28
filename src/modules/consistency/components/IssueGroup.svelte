<script lang="ts">
	import type { ConsistencyIssue } from '$lib/db/domain-types';
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
	const warningCount = $derived(issues.filter((issue) => issue.severity === 'warning').length);
	const errorCount = $derived(issues.filter((issue) => issue.severity === 'error').length);
	const openCount = $derived(issues.filter((issue) => issue.status === 'open').length);
</script>

<details class="issue-group" open>
	<summary class="issue-group__summary">
		<div class="group-heading">
			<span class="group-label">{label}</span>
			<span class="group-count">{issues.length}</span>
		</div>
		<div class="group-stats" aria-label="Group issue counts">
			<span class="group-stat">Open: {openCount}</span>
			<span class="group-stat">Warnings: {warningCount}</span>
			<span class="group-stat">Errors: {errorCount}</span>
		</div>
	</summary>
	<div class="issue-group__list">
		{#each issues as issue (issue.id)}
			<IssueRow {issue} {projectId} {onResolve} {onDismiss} {onReopen} />
		{/each}
	</div>
</details>

<style>
	.issue-group {
		margin-bottom: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: color-mix(in srgb, var(--color-surface-overlay) 66%, transparent);
	}

	.issue-group__summary {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background-color: color-mix(in srgb, var(--color-surface-overlay) 75%, transparent);
		cursor: pointer;
		user-select: none;
		list-style: none;
		gap: var(--space-3);
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

	.group-heading {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
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

	.group-stats {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.group-stat {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		padding: 0.2rem 0.45rem;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
	}

	.issue-group__list {
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 700px) {
		.issue-group__summary {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
