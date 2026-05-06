<script lang="ts">
	interface Props {
		steps: number;
		current: number;
		class?: string;
	}

	let { steps, current, class: className = '' }: Props = $props();
</script>

<div class="stepper {className}" role="tablist" aria-label="Progress">
	{#each Array(steps) as _, i (i)}
		<span
			class="stepper__dot"
			class:stepper__dot--active={i === current}
			class:stepper__dot--done={i < current}
			role="tab"
			aria-selected={i === current}
			aria-label="Step {i + 1} of {steps}"
		></span>
	{/each}
</div>

<style>
	.stepper {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.stepper__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-border-strong);
		transition: background var(--duration-fast) var(--ease-standard);
	}

	.stepper__dot--active {
		background: var(--color-nova-blue);
		width: 10px;
		height: 10px;
	}

	.stepper__dot--done {
		background: color-mix(in srgb, var(--color-nova-blue) 50%, transparent);
	}
</style>
