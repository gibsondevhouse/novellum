<script lang="ts">
	import type { ConsistencyIssue } from '$lib/db/types.js';

	let {
		issue,
		projectId,
		onResolve = undefined,
		onDismiss = undefined,
		onReopen = undefined,
	}: {
		issue: ConsistencyIssue;
		projectId: string;
		onResolve?: (id: string) => void;
		onDismiss?: (id: string) => void;
		onReopen?: (id: string) => void;
	} = $props();

	const truncated = $derived(
		issue.description.length > 120 ? issue.description.slice(0, 120) + '…' : issue.description,
	);
</script>

<div class="issue-row" data-severity={issue.severity} data-status={issue.status}>
	<div class="issue-meta">
		<span class="badge badge--{issue.severity}">{issue.severity}</span>
		<span class="issue-type">{issue.type.replace('_', ' ')}</span>
		{#if issue.status !== 'open'}
			<span class="status-chip status-chip--{issue.status}">{issue.status}</span>
		{/if}
	</div>

	<div class="issue-description">
		{#if issue.sceneId}
			<a href="/projects/{projectId}/editor/{issue.sceneId}" class="scene-link">{truncated}</a>
		{:else}
			<span>{truncated}</span>
		{/if}
	</div>

	{#if onResolve || onDismiss || onReopen}
		<div class="issue-actions">
			{#if onResolve && issue.status === 'open'}
				<button onclick={() => onResolve?.(issue.id)} class="btn-resolve">Mark Resolved</button>
			{/if}
			{#if onDismiss && issue.status === 'open'}
				<button onclick={() => onDismiss?.(issue.id)} class="btn-dismiss">Dismiss</button>
			{/if}
			{#if onReopen && (issue.status === 'resolved' || issue.status === 'dismissed')}
				<button onclick={() => onReopen?.(issue.id)} class="btn-reopen">Reopen</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.issue-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface-raised);
	}

	.issue-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.badge {
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.badge--warning {
		background-color: var(--color-warning);
		color: var(--color-surface-base);
	}

	.badge--error {
		background-color: var(--color-error);
		color: var(--color-text-on-dark);
	}

	.issue-type {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: capitalize;
	}

	.status-chip {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		background-color: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		text-transform: capitalize;
	}

	.issue-description {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		line-height: var(--leading-relaxed);
	}

	.scene-link {
		color: var(--color-teal);
	}

	.scene-link:hover {
		text-decoration: underline;
	}

	.issue-actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.btn-resolve,
	.btn-dismiss,
	.btn-reopen {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
		background: transparent;
		cursor: pointer;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		transition: background-color var(--duration-fast) var(--ease-standard);
	}

	.btn-resolve {
		color: var(--color-success);
		border: 1px solid var(--color-success);
	}

	.btn-resolve:hover {
		background-color: color-mix(in srgb, var(--color-success) 15%, transparent);
	}

	.btn-dismiss {
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.btn-dismiss:hover {
		background-color: var(--color-surface-elevated);
	}

	.btn-reopen {
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	.btn-reopen:hover {
		background-color: var(--color-surface-elevated);
	}
</style>
