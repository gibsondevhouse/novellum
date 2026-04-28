<script lang="ts">
	import type { ConsistencyIssue } from '$lib/db/domain-types';
	import { GhostButton } from '$lib/components/ui/index.js';

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

	const severityLabel = $derived(issue.severity === 'error' ? 'High severity' : 'Warning severity');
	const severityGlyph = $derived(issue.severity === 'error' ? '!' : '~');
	const statusLabel = $derived.by(() => {
		switch (issue.status) {
			case 'resolved':
				return 'Resolved';
			case 'dismissed':
				return 'Dismissed';
			default:
				return 'Open';
		}
	});
</script>

<div class="issue-row" data-severity={issue.severity} data-status={issue.status}>
	<div class="issue-meta">
		<span class="badge badge--{issue.severity}" aria-label={severityLabel}>
			<span aria-hidden="true" class="badge-glyph">{severityGlyph}</span>
			{severityLabel}
		</span>
		<span class="issue-type">{issue.type.replace('_', ' ')}</span>
		<span class="status-chip status-chip--{issue.status}">{statusLabel}</span>
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
				<GhostButton type="button" onclick={() => onResolve?.(issue.id)}>Mark Resolved</GhostButton>
			{/if}
			{#if onDismiss && issue.status === 'open'}
				<GhostButton type="button" onclick={() => onDismiss?.(issue.id)}>Dismiss</GhostButton>
			{/if}
			{#if onReopen && (issue.status === 'resolved' || issue.status === 'dismissed')}
				<GhostButton type="button" onclick={() => onReopen?.(issue.id)}>Reopen</GhostButton>
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
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.badge-glyph {
		display: inline-flex;
		width: 1rem;
		height: 1rem;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: var(--font-weight-bold);
		background: color-mix(in srgb, currentColor 20%, transparent);
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
		padding-top: var(--space-1);
	}
</style>
