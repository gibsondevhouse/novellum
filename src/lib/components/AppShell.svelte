<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		sidebar,
		header,
		children,
	}: {
		sidebar: Snippet;
		header: Snippet;
		children: Snippet;
	} = $props();
</script>

<!-- Skip-to-main link for keyboard users -->
<a class="skip-link" href="#main-content">Skip to content</a>

<div class="app-shell">
	{@render sidebar()}
	<div class="content-column">
		{@render header()}
		<main id="main-content" class="main-content" aria-label="Main content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.skip-link {
		position: absolute;
		left: -9999px;
		top: var(--space-2);
		z-index: 9999;
		padding: var(--space-2) var(--space-4);
		background-color: var(--color-nova-blue);
		color: var(--color-text-primary);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.skip-link:focus {
		left: var(--space-2);
	}

	.app-shell {
		display: flex;
		min-height: 100vh;
		background-color: var(--color-surface-base);
	}

	.content-column {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		min-height: 0;
		overflow-y: auto;
		padding: var(--panel-padding);
		color: var(--color-text-primary);
	}
</style>