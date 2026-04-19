<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	export type SecondarySidebarItem = {
		id: string;
		label: string;
		href: string;
		active?: boolean;
	};

	let {
		visible = true,
		ariaLabel = 'Secondary navigation',
		title = 'Project Navigation',
		items = [],
		children,
	}: {
		visible?: boolean;
		ariaLabel?: string;
		title?: string;
		items?: SecondarySidebarItem[];
		children?: Snippet;
	} = $props();

	let sidebarEl = $state<HTMLElement | null>(null);
	let titleOffset = $state(0);

	function getLastProjectLabelTop(): number | null {
		const labels = Array.from(document.querySelectorAll('.app-sidebar .sidebar-section__label'));
		const target = labels.find(
			(node) => (node.textContent ?? '').trim().toUpperCase() === 'LAST PROJECT',
		);
		if (!target) return null;
		return (target as HTMLElement).getBoundingClientRect().top;
	}

	function syncTitleOffset() {
		if (!sidebarEl) return;
		const labelTop = getLastProjectLabelTop();
		if (labelTop == null) {
			titleOffset = 0;
			return;
		}

		const sidebarTop = sidebarEl.getBoundingClientRect().top;
		titleOffset = Math.max(0, Math.round(labelTop - sidebarTop));
	}

	onMount(() => {
		syncTitleOffset();
		window.addEventListener('resize', syncTitleOffset);
		const frame = requestAnimationFrame(syncTitleOffset);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('resize', syncTitleOffset);
		};
	});

	$effect(() => {
		const trackedVisible = visible;
		void trackedVisible;
		const frame = requestAnimationFrame(syncTitleOffset);
		return () => cancelAnimationFrame(frame);
	});
</script>

<aside
	bind:this={sidebarEl}
	class="secondary-left-sidebar"
	class:secondary-left-sidebar--empty={!visible}
	aria-label={ariaLabel}
>
	<div class="secondary-left-sidebar__inner" style:--secondary-title-offset={`${titleOffset}px`}>
		{#if visible}
			<h2 class="secondary-left-sidebar__title">{title}</h2>

			{#if children}
				{@render children()}
			{:else if items.length > 0}
				<nav aria-label={ariaLabel}>
					<ul class="secondary-left-sidebar__list">
						{#each items as item (item.id)}
							<li>
								<a
									href={item.href}
									class="secondary-left-sidebar__link"
									class:active={item.active}
									aria-current={item.active ? 'page' : undefined}
								>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/if}
		{/if}
	</div>
</aside>

<style>
	.secondary-left-sidebar {
		width: 220px;
		flex-shrink: 0;
		height: 100%;
		position: sticky;
		top: 0;
		padding: var(--space-3) 0;
		border-right: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
		overflow: hidden;
	}

	.secondary-left-sidebar__inner {
		height: 100%;
		overflow-y: auto;
		padding: 0;
	}

	.secondary-left-sidebar__title {
		margin: var(--secondary-title-offset, 0px) 0 var(--space-3);
		padding: 0 var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.secondary-left-sidebar--empty {
		background: var(--color-surface-base);
	}

	.secondary-left-sidebar__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-1);
	}

	.secondary-left-sidebar__link {
		display: block;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.secondary-left-sidebar__link:hover {
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
	}

	.secondary-left-sidebar__link.active {
		background: color-mix(in srgb, var(--color-nova-blue) 12%, var(--color-surface-elevated));
		color: var(--color-text-primary);
	}

	@media (max-width: 1200px) {
		.secondary-left-sidebar {
			display: none;
		}
	}
</style>