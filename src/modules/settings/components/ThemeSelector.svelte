<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { GhostButton } from '$lib/components/ui/index.js';
	import { onMount } from 'svelte';
	import { getStoredTheme, storeTheme, applyTheme, type Theme } from '../services/themeService';

	let theme = $state<Theme>('system');

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		storeTheme(newTheme);
		applyTheme(newTheme);
	}

	onMount(() => {
		theme = getStoredTheme();
		applyTheme(theme);

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleSystemChange = () => {
			if (theme === 'system') {
				applyTheme('system');
			}
		};

		mediaQuery.addEventListener('change', handleSystemChange);
		return () => {
			mediaQuery.removeEventListener('change', handleSystemChange);
		};
	});
</script>

<SurfaceCard variant="flat">
	<div class="theme-selector">
		<div class="theme-selector__header">
			<h3 class="theme-selector__title">App Theme</h3>
			<p class="theme-selector__description">Choose the appearance of the workspace.</p>
		</div>

		<div class="theme-selector__options">
			<GhostButton
				type="button"
				class="theme-option {theme === 'light' ? 'active' : ''}"
				onclick={() => setTheme('light')}
				aria-pressed={theme === 'light'}
			>
				<span class="theme-option__icon" aria-hidden="true">☀️</span>
				<span class="theme-option__label">Light</span>
			</GhostButton>

			<GhostButton
				type="button"
				class="theme-option {theme === 'dark' ? 'active' : ''}"
				onclick={() => setTheme('dark')}
				aria-pressed={theme === 'dark'}
			>
				<span class="theme-option__icon" aria-hidden="true">🌙</span>
				<span class="theme-option__label">Dark</span>
			</GhostButton>

			<GhostButton
				type="button"
				class="theme-option {theme === 'system' ? 'active' : ''}"
				onclick={() => setTheme('system')}
				aria-pressed={theme === 'system'}
			>
				<span class="theme-option__icon" aria-hidden="true">💻</span>
				<span class="theme-option__label">System</span>
			</GhostButton>
		</div>
	</div>
</SurfaceCard>

<style>
	.theme-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.theme-selector__header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.theme-selector__title {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
	}

	.theme-selector__description {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.theme-selector__options {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	:global(.theme-option) {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: var(--transition-color), box-shadow var(--duration-fast) var(--ease-standard);
	}

	:global(.theme-option:hover) {
		background: var(--color-surface-hover);
		border-color: var(--color-border-strong);
	}

	:global(.theme-option:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
		border-color: var(--color-border-focus);
	}

	:global(.theme-option.active) {
		background: var(--color-ai-tint);
		border-color: var(--color-nova-blue);
		color: var(--color-nova-blue);
	}

	.theme-option__icon {
		font-size: var(--text-base);
	}
</style>
