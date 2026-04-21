<script lang="ts">
	import ApiSettings from '../../modules/settings/components/ApiSettings.svelte';
</script>

<svelte:head>
	<title>Global Settings — Novellum</title>
</svelte:head>

<div class="settings-page">
	<header class="settings-header">
		<div class="settings-heading">
			<p class="settings-eyebrow">Configuration</p>
			<h1 class="settings-title">Integrations & Settings</h1>
			<p class="settings-subtitle">Manage your external connections and global preferences.</p>
		</div>
		<div class="settings-summary" aria-label="Settings summary">
			<div class="summary-card">
				<span>Primary Surface</span>
				<strong>AI Integrations</strong>
			</div>
			<div class="summary-card">
				<span>Related Routes</span>
				<strong>Styles, Migration</strong>
			</div>
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
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-4);
		border-bottom: 1px solid var(--color-border-default);
		padding-bottom: var(--space-8);
	}

	.settings-eyebrow,
	.settings-title,
	.settings-subtitle {
		margin: 0;
	}

	.settings-eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
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

	.settings-summary {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
		min-width: 20rem;
	}

	.summary-card {
		display: grid;
		gap: 0.2rem;
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 82%, transparent);
	}

	.summary-card span {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.summary-card strong {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
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

	@media (max-width: 900px) {
		.settings-header {
			flex-direction: column;
		}

		.settings-summary {
			min-width: 0;
			width: 100%;
		}
	}

	@media (max-width: 640px) {
		.settings-summary {
			grid-template-columns: 1fr;
		}
	}
</style>