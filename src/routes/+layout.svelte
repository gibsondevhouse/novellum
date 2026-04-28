<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';

	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { initLocale } from '$lib/i18n';

	let { children } = $props();

	onMount(() => {
		initLocale();

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

<AppShell>
	{#snippet sidebar()}
		<AppSidebar />
	{/snippet}

	{#snippet header()}
		<AppHeader />
	{/snippet}

	{@render children()}
</AppShell>

<OnboardingModal />
<ToastContainer />
