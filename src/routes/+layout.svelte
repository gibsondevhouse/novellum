<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { db } from '$lib/db';

	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { children } = $props();

	onMount(() => {
		db.open().catch(() => {}); // already opened; no-op if open

		// Register service worker for stale-chunk protection
		if (!('serviceWorker' in navigator)) return;

		navigator.serviceWorker.register('/service-worker.js', { type: 'module' }).catch(() => {});
		// Handle stale-chunk signal: reload the page to pick up fresh assets
		const handleSwMessage = (event: MessageEvent) => {
			if ((event.data as { type?: string } | null)?.type === 'STALE_CHUNK') {
				window.location.reload();
			}
		};
		navigator.serviceWorker.addEventListener('message', handleSwMessage);
		return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
	});

	// Enable View Transitions API for route changes (with reduced-motion safety via CSS)
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Skip-to-main link for keyboard users -->
<a class="skip-link" href="#main-content">Skip to content</a>

<div class="app-shell">
	<AppSidebar />
	<div class="content-column">
		<AppHeader />
		<main id="main-content" class="main-content" aria-label="Main content">
			{@render children()}
		</main>
	</div>
</div>

<OnboardingModal />
<ToastContainer />

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
