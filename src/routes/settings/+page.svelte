<script lang="ts">
	import ApiSettings from '../../modules/settings/components/ApiSettings.svelte';
</script>

<svelte:head>
	<title>Global Settings — Novellum</title>
</svelte:head>

<div class="settings-page">
	<header class="settings-header">
		<div class="settings-heading">
			<h1 class="settings-title">Integrations & Settings</h1>
			<p class="settings-subtitle">Manage your external connections and global preferences.</p>
		</div>
	</header>

	<main class="settings-content">
		<div class="settings-grid">
			<ApiSettings />
		</div>
	</main>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-12) var(--space-8);
		width: 100%;
		gap: var(--space-8);
	}

	.settings-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		border-bottom: 1px solid var(--color-border-default);
		padding-bottom: var(--space-8);
	}

	.settings-title {
		margin: 0;
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-tight);
		color: var(--color-text-primary);
	}

	.settings-subtitle {
		margin: var(--space-2) 0 0 0;
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-width: 60ch;
	}

	.settings-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.settings-grid {
		display: grid;
		gap: var(--space-8);
		grid-template-columns: 1fr;
		align-items: start;
	}

	@media (min-width: 768px) {
		.settings-grid {
			grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		}
	}
</style>