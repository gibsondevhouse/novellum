<script lang="ts">
	import type { Snippet } from 'svelte';

	let { typeindicator, actions, children } = $props<{
		/** Left region: type badge, context label, etc. */
		typeindicator?: Snippet;
		/** Right region: close button, overflow menu, etc. */
		actions?: Snippet;
		/** Center region: typically a PlanningSurfaceModeSwitcher. */
		children?: Snippet;
	}>();
</script>

<header class="ps-header">
	<div class="header-row">
		{#if typeindicator}
			<div class="header-start">
				{@render typeindicator()}
			</div>
		{/if}
		{#if children}
			<div class="header-center">
				{@render children()}
			</div>
		{/if}
		{#if actions}
			<div class="header-end">
				{@render actions()}
			</div>
		{/if}
	</div>
</header>

<style>
	.ps-header {
		flex-shrink: 0;
		padding: var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) + 5px);
		/* Stronger visual separator — card header must feel pinned, not floating */
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 70%, transparent);
		/* Layered shadow below header creates scroll-depth cue */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		background: color-mix(in srgb, var(--color-surface-elevated) 95%, var(--color-surface-ground));
		/* Port above scrolling body */
		position: sticky;
		top: 0;
		z-index: 2;
	}

	.header-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.header-start {
		flex-shrink: 0;
	}

	.header-center {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.header-end {
		flex-shrink: 0;
		margin-left: auto;
	}
</style>
