<script lang="ts">
	let { chapterCount, sceneCount } = $props<{
		chapterCount: number;
		sceneCount: number;
	}>();
</script>

{#if chapterCount > 0}
	<div class="summary-bar">
		<span class="summary-stat">
			<strong>{chapterCount}</strong>
			{chapterCount === 1 ? 'chapter' : 'chapters'}
		</span>
		<span class="separator" aria-hidden="true">·</span>
		<span class="summary-stat">
			<strong>{sceneCount}</strong>
			{sceneCount === 1 ? 'scene' : 'scenes'}
		</span>
	</div>
{/if}

<style>
	.summary-bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-bottom: var(--space-4);
		margin-bottom: var(--space-5);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.summary-stat {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.summary-stat strong {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.separator {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}
</style>
