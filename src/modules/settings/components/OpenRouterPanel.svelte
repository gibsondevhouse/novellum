<script lang="ts">
	import ApiSettings from './ApiSettings.svelte';
</script>

<div class="openrouter-links">
	<a
		href="https://openrouter.ai/docs"
		target="_blank"
		rel="noopener noreferrer"
		class="provider-link"
	>
		OpenRouter Documentation
	</a>
	<a
		href="https://openrouter.ai/settings/keys"
		target="_blank"
		rel="noopener noreferrer"
		class="provider-link"
	>
		API Keys Dashboard
	</a>
</div>

<ApiSettings />

<style>
	.openrouter-links {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
	}
	.provider-link {
		font-size: var(--text-sm);
		color: var(--color-accent-default);
		text-decoration: underline;
	}
	.provider-link:hover {
		color: var(--color-accent-hover);
	}
</style>
