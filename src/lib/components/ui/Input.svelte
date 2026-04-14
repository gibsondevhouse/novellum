<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		class?: string;
		value?: any;
	}

	let {
		label,
		error,
		class: className = '',
		value = $bindable(''),
		...rest
	}: Props = $props();
</script>

<div class="input-field {className}">
	{#if label}
		<label class="input-label" for={rest.id}>
			{label}
		</label>
	{/if}
	<input
		class="input-control"
		class:input-control--error={!!error}
		bind:value
		{...rest}
	/>
	{#if error}
		<span class="input-error-msg">{error}</span>
	{/if}
</div>

<style>
	.input-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	.input-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.input-control {
		background-color: var(--color-surface-ground);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		transition: border-color var(--duration-fast) var(--ease-standard);
		width: 100%;
	}

	.input-control:focus {
		outline: none;
		border-color: var(--color-nova-blue);
	}

	.input-control--error {
		border-color: var(--color-error);
	}

	.input-error-msg {
		font-size: var(--text-xs);
		color: var(--color-error);
	}

	.input-control:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
