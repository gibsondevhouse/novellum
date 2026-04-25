<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { EmptyStatePanel, PrimaryButton } from '$lib/components/ui/index.js';

	const message = $derived(page.error?.message ?? 'An unexpected error occurred.');
	const projectId = $derived(page.params?.id ?? '');
</script>

<div class="error-page" role="alert">
	<EmptyStatePanel
		title="Something went wrong."
		description="{page.status ?? 500} — {message}"
	>
		{#snippet actions()}
			<PrimaryButton onclick={() => goto(projectId ? `/projects/${projectId}` : '/')}>
				Back to Project
			</PrimaryButton>
		{/snippet}
	</EmptyStatePanel>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: var(--space-8);
	}
</style>
