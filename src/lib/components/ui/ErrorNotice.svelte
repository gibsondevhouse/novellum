<script lang="ts">
	interface Props {
		message: string;
		title?: string;
		retry?: () => void;
		class?: string;
	}

	let { message, title, retry, class: className = '' }: Props = $props();
</script>

<div class="error-notice {className}" role="alert">
	{#if title}
		<p class="error-notice__title">{title}</p>
	{/if}
	<p class="error-notice__message">{message}</p>
	{#if retry}
		<button type="button" class="error-notice__retry" onclick={retry}>Try again</button>
	{/if}
</div>

<style>
	.error-notice {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
	}

	.error-notice__title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-error);
	}

	.error-notice__message {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.error-notice__retry {
		align-self: flex-start;
		margin-top: var(--space-1);
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.error-notice__retry:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.error-notice__retry:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}
</style>
