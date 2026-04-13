<script lang="ts">
	import { page } from '$app/state';

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<aside class="sidebar" aria-label="Application sidebar">
	<nav class="nav" aria-label="Primary navigation">
		<a
			href="/"
			class:active={isActive('/')}
			class="nav-link nav-link--global"
			aria-current={isActive('/') ? 'page' : undefined}
		>
			Projects
		</a>
	</nav>
</aside>

<style>
	.sidebar {
		width: var(--sidebar-width);
		min-height: 100vh;
		background-color: var(--color-slate);
		border-right: 1px solid var(--color-border);
		padding: var(--panel-padding);
		flex-shrink: 0;
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.nav-link {
		display: flex;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: var(--text-sm);
		transition: var(--transition-color);
	}

	.nav-link:hover {
		color: var(--color-text-primary);
		background-color: var(--color-border);
		text-decoration: none;
	}

	.nav-link.active {
		color: var(--color-teal);
		background-color: color-mix(in srgb, var(--color-teal) 10%, transparent);
	}

	.nav-link--global {
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-base);
	}
</style>
