<script lang="ts">
	let { sparsity, label } = $props<{
		sparsity: 'healthy' | 'sparse' | 'very-sparse';
		label: string;
	}>();
</script>

<span class="pacing-pill pacing-pill--{sparsity}" title={label} role="status" aria-label={label}>
	{sparsity === 'healthy' ? '●' : sparsity === 'sparse' ? '◐' : '○'}
</span>

<style>
	.pacing-pill {
		display: inline-flex;
		align-items: center;
		font-size: var(--text-xs);
		border-radius: var(--radius-full, 9999px);
		padding: 1px var(--space-2);
		font-weight: var(--font-weight-semibold);
		cursor: default;
		user-select: none;
	}

	.pacing-pill--healthy {
		color: var(--color-success, #4ade80);
		background: color-mix(in srgb, var(--color-success, #4ade80) 12%, transparent);
	}

	.pacing-pill--sparse {
		color: var(--color-warning, #facc15);
		background: color-mix(in srgb, var(--color-warning, #facc15) 12%, transparent);
	}

	.pacing-pill--very-sparse {
		color: var(--color-error, #f87171);
		background: color-mix(in srgb, var(--color-error, #f87171) 12%, transparent);
	}
</style>
