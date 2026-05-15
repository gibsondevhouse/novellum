<div class="sidebar-bottom">
	<a href="/nova" class="sidebar-bottom__link" aria-label="Nova AI Help">
		<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
		</svg>
		<span>Nova</span>
	</a>
	<span class="sidebar-bottom__separator">·</span>
	<a href="/settings/about" class="sidebar-bottom__link" aria-label="About and Help">
		<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"></circle>
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
			<line x1="12" y1="17" x2="12.01" y2="17"></line>
		</svg>
		<span>About</span>
	</a>
</div>

<style>
	.sidebar-bottom {
		margin-top: auto;
		padding: var(--space-3);
		border-top: 1px solid var(--color-border-default);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.sidebar-bottom__link {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-standard);
	}

	.sidebar-bottom__link:hover {
		color: var(--color-text-primary);
	}

	.sidebar-bottom__link:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.sidebar-bottom__separator {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}
</style>
