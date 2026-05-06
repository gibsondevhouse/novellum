<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
</script>

<svelte:head>
	<title>Privacy — Novellum</title>
</svelte:head>

<div class="privacy">
	<h1 class="privacy__title">Privacy</h1>

	<!-- LEGAL_REVIEW_REQUIRED -->
	<section class="privacy__section" aria-labelledby="privacy-no-collection-heading">
		<h2 id="privacy-no-collection-heading" class="privacy__heading">No Data Collection</h2>
		<SurfaceCard variant="flat">
			<p class="privacy__body">
				Novellum does not collect any personal data. All your writing data is stored
				locally on your device. No information is transmitted to Novellum or any
				third-party analytics service.
			</p>
		</SurfaceCard>
	</section>
	<!-- LEGAL_REVIEW_REQUIRED -->

	<!-- LEGAL_REVIEW_REQUIRED -->
	<section class="privacy__section" aria-labelledby="privacy-local-heading">
		<h2 id="privacy-local-heading" class="privacy__heading">Data Stored Locally</h2>
		<SurfaceCard variant="flat">
			<p class="privacy__body">
				All your projects, scenes, characters, and world-building notes are stored in a
				SQLite database on your device. No project data is transmitted to external servers
				or synced to the cloud.
			</p>
		</SurfaceCard>
	</section>
	<!-- LEGAL_REVIEW_REQUIRED -->

	<!-- LEGAL_REVIEW_REQUIRED -->
	<section class="privacy__section" aria-labelledby="privacy-openrouter-heading">
		<h2 id="privacy-openrouter-heading" class="privacy__heading">Data Sent to OpenRouter</h2>
		<SurfaceCard variant="flat">
			<p class="privacy__body">
				When you use AI features, your content is sent to OpenRouter to process your
				request. See our
				<a
					href="https://openrouter.ai/privacy"
					target="_blank"
					rel="noopener noreferrer"
					class="privacy__link"
				>
					Privacy Policy
				</a>
				for details.
			</p>
		</SurfaceCard>
	</section>
	<!-- LEGAL_REVIEW_REQUIRED -->

	<!-- LEGAL_REVIEW_REQUIRED -->
	<section class="privacy__section" aria-labelledby="privacy-never-heading">
		<h2 id="privacy-never-heading" class="privacy__heading">Data Never Transmitted</h2>
		<SurfaceCard variant="flat">
			<p class="privacy__body">
				The following are never sent outside your device: your project files, local
				preferences, and backup archives.
			</p>
		</SurfaceCard>
	</section>
	<!-- LEGAL_REVIEW_REQUIRED -->
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

	.privacy__body {
		margin: 0;
		color: var(--color-text-primary);
	}

	.privacy__link {
		color: var(--color-accent);
		text-decoration: underline;
	}
</style>
