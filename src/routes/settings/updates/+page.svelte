<script lang="ts">
	import { onMount } from 'svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import SecondaryButton from '$lib/components/ui/SecondaryButton.svelte';

	let version = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await fetch('/api/settings/about');
			if (res.ok) {
				const data = (await res.json()) as { version: string };
				version = data.version;
			}
		} catch {
			// best-effort
		}
	});
</script>

<svelte:head>
	<title>Updates — Novellum</title>
</svelte:head>

<div class="updates">
	<h1 class="updates__title">Updates</h1>

	<section class="updates__section" aria-labelledby="updates-version-heading">
		<h2 id="updates-version-heading" class="updates__heading">Current Version</h2>
		<SurfaceCard variant="flat">
			{#if version}
				<p class="updates__body">You are running Novellum {version}.</p>
			{/if}
			<p class="updates__body">
				Novellum is distributed as a standalone desktop app. Updates are delivered as new
				releases.
			</p>
			<!-- TODO: Tauri updater integration in a future plan -->
			<SecondaryButton
				disabled
				title="Auto-update not yet available"
			>
				Check for updates
			</SecondaryButton>
		</SurfaceCard>
	</section>
</div>

<style>
	.updates {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.updates__title {
		font: var(--font-heading-lg);
		color: var(--color-text-primary);
		margin: 0;
	}

	.updates__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.updates__heading {
		font: var(--font-label-md);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.updates__body {
		margin: 0 0 var(--space-4);
		color: var(--color-text-primary);
	}
</style>
