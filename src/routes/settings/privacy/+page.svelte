<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import privacyText from '../../../../PRIVACY.md?raw';
</script>

<svelte:head>
	<title>Privacy — Novellum</title>
</svelte:head>

<div class="privacy">
	<h1 class="privacy__title">Privacy</h1>
	<p class="privacy__intro">
		The full text of the Novellum privacy policy that ships with this build.
	</p>

	<section class="privacy__section" aria-labelledby="privacy-policy-heading">
		<h2 id="privacy-policy-heading" class="privacy__heading">Privacy Policy</h2>
		<SurfaceCard variant="flat">
			<pre class="privacy__doc">{privacyText}</pre>
		</SurfaceCard>
	</section>
</div>

<style>
	.privacy {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.privacy__title {
		font: var(--font-heading-lg);
		color: var(--color-text-primary);
		margin: 0;
	}

	.privacy__intro {
		font: var(--font-body-sm);
		color: var(--color-text-secondary);
		margin: 0;
		max-width: 60ch;
	}

	.privacy__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.privacy__heading {
		font: var(--font-label-md);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.privacy__doc {
		font: var(--font-body-sm);
		color: var(--color-text-primary);
		white-space: pre-wrap;
		overflow-wrap: break-word;
		margin: 0;
	}
</style>
