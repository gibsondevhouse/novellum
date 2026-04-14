<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getToasts, dismissToast } from '$lib/stores/toast.svelte.js';

	const toasts = $derived(getToasts());
</script>

<div class="toast-container" role="status" aria-live="polite" aria-atomic="false">
	{#each toasts as t (t.id)}
		<div
			class="toast toast--{t.type}"
			in:fly={{ y: 16, duration: 200 }}
			out:fly={{ y: 16, duration: 150 }}
		>
			<span class="toast__message">{t.message}</span>
			<button
				class="toast__dismiss"
				onclick={() => dismissToast(t.id)}
				aria-label="Dismiss notification"
			>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
					<path
						d="M1 1L13 13M13 1L1 13"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: var(--space-6);
		right: var(--space-6);
		z-index: var(--z-toast, 9999);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		pointer-events: none;
		max-width: 24rem;
		width: calc(100vw - var(--space-12, 3rem));
	}

	.toast {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-surface-overlay, var(--color-surface-raised));
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		pointer-events: all;
		border-left: 3px solid transparent;
	}

	.toast--success {
		border-left-color: var(--color-teal);
	}

	.toast--error {
		border-left-color: var(--color-error);
	}

	.toast--info {
		border-left-color: var(--color-nova-blue);
	}

	.toast__message {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		flex: 1;
	}

	.toast__dismiss {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted);
		padding: var(--space-1);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.toast__dismiss:hover {
		color: var(--color-text-primary);
	}
</style>
