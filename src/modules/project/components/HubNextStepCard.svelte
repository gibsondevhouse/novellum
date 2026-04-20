<script lang="ts">
	let { projectId, currentWordCount }: { projectId: string; currentWordCount: number } = $props();

	const hasProgress = $derived(currentWordCount > 0);
</script>

<a
	class="hub-next-step-card"
	href="/projects/{projectId}/editor"
	aria-label={hasProgress ? 'Continue writing your story' : 'Begin writing your story'}
>
	<span class="hub-card__label">Next Step</span>
	<span class="hub-card__action-title">
		{hasProgress ? 'Continue Writing' : 'Begin Writing'}
	</span>
	<span class="hub-card__sub">
		{hasProgress ? 'Pick up where you left off.' : 'Start your first scene.'}
	</span>
	<span class="hub-card__arrow" aria-hidden="true">→</span>
</a>

<style>
	.hub-next-step-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 20%, var(--color-border-default));
		background: var(--color-surface-raised);
		text-decoration: none;
		transition:
			background-color var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}

	.hub-next-step-card:hover {
		background: var(--color-surface-elevated);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
	}

	.hub-next-step-card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.hub-card__label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.hub-card__action-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-nova-blue);
		line-height: var(--leading-tight);
	}

	.hub-card__sub {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.hub-card__arrow {
		font-size: var(--text-lg);
		color: var(--color-nova-blue);
		opacity: 0.6;
		margin-top: auto;
		align-self: flex-end;
		transition: transform var(--duration-base) var(--ease-standard);
	}

	.hub-next-step-card:hover .hub-card__arrow {
		transform: translateX(4px);
		opacity: 1;
	}
</style>