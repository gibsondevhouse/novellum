<script lang="ts">
	import { onMount } from 'svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	interface AboutInfo {
		appName: string;
		version: string;
		license: string;
		description: string;
	}

	let info = $state<AboutInfo | null>(null);

	onMount(async () => {
		try {
			const res = await fetch('/api/settings/about');
			if (res.ok) {
				info = (await res.json()) as AboutInfo;
			}
		} catch {
			// best-effort — UI degrades gracefully
		}
	});
</script>

<svelte:head>
	<title>About — Novellum</title>
</svelte:head>

<div class="about">
	<h1 class="about__title">About</h1>

	{#if info}
		<section class="about__section" aria-labelledby="about-app-heading">
			<h2 id="about-app-heading" class="about__heading">{info.appName}</h2>
			<SurfaceCard variant="flat">
				<dl class="about__details">
					<div class="about__detail-row">
						<dt class="about__label">Version</dt>
						<dd class="about__value">{info.version}</dd>
					</div>
					<div class="about__detail-row">
						<dt class="about__label">Description</dt>
						<dd class="about__value">{info.description}</dd>
					</div>
					<div class="about__detail-row">
						<dt class="about__label">License</dt>
						<dd class="about__value">{info.license}</dd>
					</div>
				</dl>
			</SurfaceCard>
		</section>
	{/if}
</div>

<style>
	.about {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.about__title {
		font: var(--font-heading-lg);
		color: var(--color-text-primary);
		margin: 0;
	}

	.about__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.about__heading {
		font: var(--font-label-md);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.about__details {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
	}

	.about__detail-row {
		display: flex;
		gap: var(--space-4);
	}

	.about__label {
		font: var(--font-label-sm);
		color: var(--color-text-secondary);
		min-width: 10ch;
	}

	.about__value {
		font: var(--font-body-sm);
		color: var(--color-text-primary);
		margin: 0;
	}
</style>
