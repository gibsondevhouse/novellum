<script lang="ts">
	import type { RewriteOption } from '$lib/ai/types.js';

	let {
		options,
		original,
		isLoading,
		error,
		onSelect,
		onClose,
	}: {
		options: RewriteOption[];
		original: string;
		isLoading: boolean;
		error: string | null;
		onSelect: (option: RewriteOption) => void;
		onClose: () => void;
	} = $props();

	const originalPreview = $derived(original.length > 80 ? original.slice(0, 80) + '…' : original);
</script>

<div class="modal-backdrop" role="presentation" onclick={onClose}>
	<div
		class="modal"
		role="dialog"
		aria-label="Rewrite Options"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<div class="modal-header">
			<h2 class="modal-title">Rewrite Options</h2>
		</div>

		<div class="modal-body">
			{#if isLoading}
				<div class="loading-state">
					<span class="spinner" aria-hidden="true"></span>
					<p>Generating 3 rewrite options…</p>
				</div>
			{:else if error}
				<div class="error-state">
					<p class="error-message">{error}</p>
					<p class="error-hint">Try Again</p>
				</div>
			{:else}
				<div class="options-list">
					{#each options as option (option.index)}
						<div class="option-card">
							<h3 class="option-heading">Option {option.index}</h3>
							<p class="option-text">{option.text}</p>
							<p class="option-original" aria-label="Original text">{originalPreview}</p>
							<button
								class="btn btn--primary"
								onclick={() => onSelect(option)}
								aria-label={`Select option ${option.index}`}
							>
								Select
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="modal-footer">
			<button class="btn btn--secondary" onclick={onClose}>Cancel</button>
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, black 50%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		width: min(600px, 90vw);
		max-height: 80vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.modal-title {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		margin: 0;
	}

	.loading-state {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4) 0;
		color: var(--color-text-muted);
	}

	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		--_dur: 0.6s;
		animation: spin var(--_dur) linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state {
		padding: var(--space-4) 0;
	}

	.error-message {
		color: var(--color-error);
		margin: 0 0 var(--space-2);
	}

	.error-hint {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.option-card {
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.option-heading {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		margin: 0;
		color: var(--color-text-muted);
	}

	.option-text {
		margin: 0;
		line-height: var(--leading-relaxed);
	}

	.option-original {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-default);
	}

	.btn {
		padding: var(--space-1) var(--space-4);
		border-radius: var(--radius-sm);
		border: none;
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
	}

	.btn--primary {
		background: var(--color-nova-blue);
		color: var(--color-text-on-dark);
		align-self: flex-start;
	}

	.btn--secondary {
		background: transparent;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-default);
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>
