<script lang="ts">
	interface Props {
		label: string;
		value: string;
		class?: string;
	}

	let { label, value, class: className = '' }: Props = $props();
</script>

<div class="metadata-row {className}">
	<span class="metadata-row__label">{label}</span>
	<span class="metadata-row__value">{value}</span>
</div>

<style>
	.metadata-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.metadata-row__label {
		flex-shrink: 0;
		min-width: 120px;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.metadata-row__value {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		line-height: var(--leading-normal);
	}
</style>
