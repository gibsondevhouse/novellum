<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		class?: string;
	}

	let { children, class: className = '', ...rest }: Props = $props();
</script>

<div class="surface-panel {className}" {...rest}>
	{@render children?.()}
</div>

<style>
	.surface-panel {
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		padding: var(--panel-padding);
		transition: background-color var(--duration-fast) var(--ease-standard);
		display: flex;
		flex-direction: column;
	}
	
	@media (prefers-reduced-motion: reduce) {
		.surface-panel {
			transition: none;
		}
	}
</style>
