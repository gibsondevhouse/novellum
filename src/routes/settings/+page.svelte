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
		padding: 3rem 2rem;
		width: 100%;
		gap: 2rem;
	}

	.settings-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border-bottom: 1px solid var(--border-color, #333);
		padding-bottom: 2rem;
	}

	.settings-title {
		margin: 0;
		font-size: 2rem;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--text-base, #111111);
	}

	.settings-subtitle {
		margin: 0.5rem 0 0 0;
		font-size: 1.125rem;
		color: var(--text-subtle, #5c5c5c);
		max-width: 60ch;
	}

	.settings-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.settings-grid {
		display: grid;
		gap: 2rem;
		grid-template-columns: 1fr;
		align-items: start;
	}

	@media (min-width: 768px) {
		.settings-grid {
			grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		}
	}
</style>