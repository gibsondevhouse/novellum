<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let isSettingsRoute = $derived(page.url.pathname.startsWith('/settings'));
	let isNovaRoute = $derived(page.url.pathname === '/nova');
	let isProjectRoute = $derived(page.url.pathname.startsWith('/projects/'));
	let isBooksRoute = $derived(page.url.pathname.startsWith('/books'));
	let isImagesRoute = $derived(page.url.pathname.startsWith('/images'));

	let projectTitle = $derived(
		isProjectRoute && page.data?.project ? (page.data.project as { title: string }).title : '',
	);

	let displayTitle = $derived.by(() => {
		if (projectTitle) return projectTitle;
		if (isSettingsRoute) return 'Settings';
		if (isNovaRoute) return 'Nova';
		if (isBooksRoute) return 'Books';
		if (isImagesRoute) return 'Images';
		return 'Novellum';
	});

	function handleNewProject() {
		goto('/');
	}
</script>

<header class="app-header">
	<div class="header-left">
		{#if displayTitle}
			<div class="header-context">
				{#if isProjectRoute}
					<span class="header-context__icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
							<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
						</svg>
					</span>
				{/if}
				<span class="header-context__title">{displayTitle}</span>
			</div>
		{/if}
	</div>

	<div class="header-right">
		<button
			class="header-action header-action--new"
			onclick={handleNewProject}
			aria-label="New project"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
		</button>

		<button
			class="header-action"
			aria-label="Toggle theme"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="5"></circle>
				<line x1="12" y1="1" x2="12" y2="3"></line>
				<line x1="12" y1="21" x2="12" y2="23"></line>
				<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
				<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
				<line x1="1" y1="12" x2="3" y2="12"></line>
				<line x1="21" y1="12" x2="23" y2="12"></line>
				<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
				<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
			</svg>
		</button>

		<a
			href="/nova"
			class="header-action"
			class:header-action--active={isNovaRoute}
			aria-label="Nova AI"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
			</svg>
		</a>

		<a
			href="/settings"
			class="header-action"
			class:header-action--active={isSettingsRoute}
			aria-label="Settings"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="3"></circle>
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
			</svg>
		</a>
	</div>
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 48px;
		padding: 0 var(--space-4);
		background-color: var(--color-surface-base);
		border-bottom: 1px solid var(--color-border-default);
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
	}

	.header-context {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.header-context__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.header-context__title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.header-action {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		background: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.header-action:hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.header-action:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
	}

	.header-action--new {
		background-color: var(--color-nova-blue);
		color: white;
	}

	.header-action--new:hover {
		background-color: color-mix(in srgb, var(--color-nova-blue) 85%, white);
		color: white;
	}

	.header-action--active {
		color: var(--color-text-primary);
		background-color: var(--color-surface-glass);
	}
</style>
