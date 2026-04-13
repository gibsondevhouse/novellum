<script lang="ts">
	let { chapterCount, sceneCount } = $props<{
		chapterCount: number;
		sceneCount: number;
	}>();
</script>

<div class="planning-header">
	<div class="header-left">
		<span class="header-label">Structure</span>
		{#if chapterCount > 0}
			<div class="stats" role="status" aria-live="polite">
				<span class="stat">
					<strong>{chapterCount}</strong>
					{chapterCount === 1 ? 'chapter' : 'chapters'}
				</span>
				<span class="sep" aria-hidden="true">·</span>
				<span class="stat">
					<strong>{sceneCount}</strong>
					{sceneCount === 1 ? 'scene' : 'scenes'}
				</span>
			</div>
		{:else}
			<span class="stat stat--empty" role="status">No chapters yet</span>
		{/if}
	</div>
</div>

<style>
	.planning-header {
		display: flex;
		align-items: center;
		padding-bottom: var(--space-5);
		margin-bottom: var(--space-5);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.header-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.stats {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.stat {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.stat strong {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.stat--empty {
		font-size: var(--text-sm);
		font-style: italic;
		color: var(--color-text-muted);
	}

	.sep {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}
</style>
