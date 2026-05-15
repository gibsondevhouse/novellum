<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import SettingsMarkdownDocument from '$lib/components/settings/SettingsMarkdownDocument.svelte';
	import eulaText from '../../../../EULA.md?raw';
	import noticeText from '../../../../NOTICE.md?raw';
</script>

<svelte:head>
	<title>Legal — Novellum</title>
</svelte:head>

<div class="legal">
	<h1 class="legal__title">Legal</h1>
	<p class="legal__intro">
		The full text of the End User License Agreement and the Third-Party
		Notices that ship with this build of Novellum.
	</p>

	<section class="legal__section" aria-labelledby="legal-eula-heading">
		<h2 id="legal-eula-heading" class="legal__heading">
			End User License Agreement
		</h2>
		<SurfaceCard variant="flat">
			<SettingsMarkdownDocument content={eulaText} label="End user license agreement" />
		</SurfaceCard>
	</section>

	<section class="legal__section" aria-labelledby="legal-notice-heading">
		<h2 id="legal-notice-heading" class="legal__heading">
			Third-Party Notices
		</h2>
		<SurfaceCard variant="flat">
			<SettingsMarkdownDocument content={noticeText} label="Third-party notices" />
		</SurfaceCard>
	</section>
</div>

<style>
	.legal {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.legal__title {
		font: var(--font-heading-lg);
		color: var(--color-text-primary);
		margin: 0;
	}

	.legal__intro {
		font: var(--font-body-sm);
		color: var(--color-text-secondary);
		margin: 0;
		max-width: 60ch;
	}

	.legal__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.legal__heading {
		font: var(--font-label-md);
		color: var(--color-text-secondary);
		margin: 0;
	}

</style>
