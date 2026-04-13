<script lang="ts">
	import { page } from '$app/state';
	import { getOpenCount } from '$modules/consistency/stores/consistency-store.svelte.js';

	let { projectId }: { projectId: string } = $props();

	const openCount = $derived(getOpenCount());

	const modes = $derived([
		{ label: 'Hub', href: `/projects/${projectId}`, exact: true },
		{ label: 'Editor', href: `/projects/${projectId}/editor`, exact: false },
		{ label: 'Outline', href: `/projects/${projectId}/outline`, exact: false },
		{ label: 'Bible', href: `/projects/${projectId}/bible`, exact: false },
		{ label: 'Consistency', href: `/projects/${projectId}/consistency`, exact: false, badge: openCount > 0 ? openCount : null },
	]);

	function isActive(href: string, exact: boolean): boolean {
		const path = page.url.pathname;
		if (exact) return path === href;
		return path === href || path.startsWith(href + '/');
	}

	function handleKeydown(e: KeyboardEvent, index: number) {
		const items = document.querySelectorAll<HTMLElement>('[data-mode-item]');
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			items[(index + 1) % items.length]?.focus();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			items[(index - 1 + items.length) % items.length]?.focus();
		}
	}
</script>

<nav
	class="mode-switcher"
	aria-label="Project modes"
>
	<div class="mode-switcher-frame">
		{#each modes as mode, i (mode.href)}
			{@const active = isActive(mode.href, mode.exact)}
			<a
				href={mode.href}
				class="mode-item"
				class:active
				aria-current={active ? 'page' : undefined}
				data-mode-item
				tabindex={active ? 0 : -1}
				onkeydown={(e) => handleKeydown(e, i)}
			>
				{mode.label}
				{#if mode.badge}
					<span class="mode-badge" aria-label="{mode.badge} open issues">{mode.badge}</span>
				{/if}
			</a>
		{/each}
	</div>
</nav>

<style>
	.mode-switcher {
		display: flex;
		align-items: stretch;
		border-bottom: 1px solid var(--color-border-default);
		background-color: var(--color-surface-ground);
	}

	.mode-switcher-frame {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 calc(var(--space-6) - var(--space-4)); /* offset tab padding to align text with frame */
		display: flex;
		align-items: center;
		width: 100%;
	}

	.mode-item {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-decoration: none;
		white-space: nowrap;
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		transition:
			color var(--duration-base) var(--ease-standard),
			background-color var(--duration-base) var(--ease-standard);
		outline: none;
	}

	.mode-item::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: var(--space-1);
		right: var(--space-1);
		height: 2px;
		background: var(--color-nova-blue);
		border-radius: var(--radius-full);
		opacity: 0;
		transform: scaleX(0.6);
		transition:
			opacity var(--duration-base) var(--ease-standard),
			transform var(--duration-base) var(--ease-standard);
	}

	.mode-item:hover {
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
		text-decoration: none;
	}

	.mode-item.active {
		color: var(--color-text-primary);
		font-weight: var(--font-weight-semibold);
		background: color-mix(in srgb, var(--color-nova-blue) 8%, transparent);
	}

	.mode-item.active::after {
		opacity: 1;
		transform: scaleX(1);
	}

	.mode-item:focus-visible {
		box-shadow: inset var(--focus-ring);
	}

	.mode-badge {
		background-color: var(--color-error);
		color: #fff;
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		line-height: 1;
		padding: 2px 5px;
		border-radius: var(--radius-full);
		min-width: 16px;
		text-align: center;
	}
</style>
