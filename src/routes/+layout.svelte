<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';

	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { NovaPanel } from '$modules/nova';
	import { initLocale } from '$lib/i18n';
	import { appearance } from '$lib/stores/appearance.svelte.js';
	import { installGlobalShortcuts } from '$lib/keyboard/global-handler.js';

	let { children } = $props();

	const activeProjectId = $derived(page.params.id ?? null);
	const activeSceneId = $derived(page.url.searchParams.get('sceneId'));
	const activeChapterId = $derived(page.url.searchParams.get('chapterId'));

	onMount(() => {
		initLocale();
		// Hydrate user-controllable editor typography globally so the editor
		// reflects saved preferences regardless of which route launches first.
		void appearance.hydrate();
		// Install global keyboard shortcut dispatcher.
		const uninstallShortcuts = installGlobalShortcuts();

		// Register service worker for stale-chunk protection
		let removeSwListener: (() => void) | null = null;
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js', { type: 'module' })
				.catch(() => {});
			// Handle stale-chunk signal: reload the page to pick up fresh assets
			const handleSwMessage = (event: MessageEvent) => {
				if ((event.data as { type?: string } | null)?.type === 'STALE_CHUNK') {
					window.location.reload();
				}
			};
			navigator.serviceWorker.addEventListener('message', handleSwMessage);
			removeSwListener = () =>
				navigator.serviceWorker.removeEventListener('message', handleSwMessage);
		}

		return () => {
			uninstallShortcuts();
			removeSwListener?.();
		};
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

<NovaPanel
	projectId={activeProjectId}
	activeSceneId={activeSceneId}
	activeChapterId={activeChapterId}
/>

<OnboardingModal />
<ToastContainer />
