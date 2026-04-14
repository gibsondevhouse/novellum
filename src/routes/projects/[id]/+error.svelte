<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const message = $derived(page.error?.message ?? 'An unexpected error occurred.');
	const projectId = $derived(page.params?.id ?? '');
</script>

<div class="error-page">
	<div class="error-card">
		<span class="error-code">{page.status ?? 500}</span>
		<h1>Something went wrong</h1>
		<p class="error-message">{message}</p>
		<button class="cta" onclick={() => goto(projectId ? `/projects/${projectId}` : '/')}>Back to Project</button>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: var(--space-8);
	}

	.error-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-8);
		background-color: var(--color-surface-raised);
		border-radius: var(--radius-md);
		text-align: center;
		max-width: 32rem;
		width: 100%;
	}

	.error-code {
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-muted);
		line-height: 1;
	}

	h1 {
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.error-message {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.cta {
		margin-top: var(--space-2);
		padding: var(--space-2) var(--space-6);
		background-color: var(--color-nova-blue);
		color: var(--color-text-primary);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.cta:hover {
		opacity: 0.85;
	}
</style>
