<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		width = 480,
		topOffset = 0,
		children,
	} = $props<{
		title: string;
		subtitle?: string;
		width?: number;
		topOffset?: number;
		children: Snippet;
	}>();
</script>

<div
	class="planning-surface-shell"
	style="width: {width}px; top: {topOffset}px;"
	role="region"
	aria-label="{subtitle ? subtitle + ': ' : ''}{title}"
>
	<div class="shell-header">
		{#if subtitle}
			<span class="shell-subtitle">{subtitle}</span>
		{/if}
		<h2 class="shell-title">{title}</h2>
	</div>
	<div class="shell-body">
		{@render children()}
	</div>
</div>

<style>
	.planning-surface-shell {
		position: sticky;
		top: var(--space-6);
		display: flex;
		flex-direction: column;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		max-height: calc(100vh - var(--space-12));
	}

	.shell-header {
		flex-shrink: 0;
		padding: var(--panel-padding, var(--space-4)) var(--panel-padding, var(--space-5));
		border-bottom: 1px solid var(--color-border-subtle);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.shell-subtitle {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.shell-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.shell-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--panel-padding, var(--space-4)) var(--panel-padding, var(--space-5));
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
</style>
