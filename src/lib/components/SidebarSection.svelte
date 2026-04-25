<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		collapsible = false,
		children,
	}: {
		label?: string;
		collapsible?: boolean;
		children: Snippet;
	} = $props();

	let collapsed = $state(false);
	const sectionId = `sidebar-section-${Math.random().toString(36).slice(2, 10)}`;
	const contentId = `${sectionId}-content`;

	function toggle() {
		if (collapsible) collapsed = !collapsed;
	}
</script>

<div class="sidebar-section">
	{#if label}
		{#if collapsible}
			<button
				class="sidebar-section__header"
				onclick={toggle}
				aria-expanded={!collapsed}
				aria-controls={contentId}
			>
				<h3 class="sidebar-section__label">{label}</h3>
				<svg
					class="sidebar-section__chevron"
					class:sidebar-section__chevron--collapsed={collapsed}
					xmlns="http://www.w3.org/2000/svg"
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</button>
		{:else}
			<h3 class="sidebar-section__label">{label}</h3>
		{/if}
	{/if}
	{#if !collapsed}
		<div id={contentId} class="sidebar-section__content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.sidebar-section {
		display: flex;
		flex-direction: column;
		margin-bottom: var(--space-2);
	}

	.sidebar-section__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2) var(--space-3);
		margin: 0;
	}

	.sidebar-section__header:hover .sidebar-section__label {
		color: var(--color-text-secondary);
	}

	.sidebar-section__header:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
	}

	.sidebar-section__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: var(--space-3) var(--space-3) var(--space-2);
		margin: 0;
		font-weight: var(--font-weight-medium);
	}

	.sidebar-section__header .sidebar-section__label {
		padding: 0;
	}

	.sidebar-section__chevron {
		color: var(--color-text-muted);
		transition: transform var(--duration-fast) var(--ease-standard);
		flex-shrink: 0;
	}

	.sidebar-section__chevron--collapsed {
		transform: rotate(-90deg);
	}

	.sidebar-section__content {
		display: flex;
		flex-direction: column;
	}
</style>
