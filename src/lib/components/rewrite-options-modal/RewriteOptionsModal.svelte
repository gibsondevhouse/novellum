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
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		background: var(--color-surface, #1e1e2e);
		border: 1px solid var(--color-border, #313244);
		border-radius: 8px;
		padding: 1.5rem;
		width: min(600px, 90vw);
		max-height: 80vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.modal-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
	}

	.loading-state {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 0;
		color: var(--color-text-muted, #6c7086);
	}

	.spinner {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-state {
		padding: 1rem 0;
	}

	.error-message {
		color: var(--color-error, #f38ba8);
		margin: 0 0 0.5rem;
	}

	.error-hint {
		color: var(--color-text-muted, #6c7086);
		font-size: 0.875rem;
		margin: 0;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.option-card {
		background: var(--color-surface-raised, #181825);
		border: 1px solid var(--color-border, #313244);
		border-radius: 6px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.option-heading {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0;
		color: var(--color-text-muted, #6c7086);
	}

	.option-text {
		margin: 0;
		line-height: 1.6;
	}

	.option-original {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-text-muted, #6c7086);
		font-style: italic;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-border, #313244);
	}

	.btn {
		padding: 0.4rem 1rem;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.btn--primary {
		background: var(--color-accent, #cba6f7);
		color: var(--color-surface, #1e1e2e);
		align-self: flex-start;
	}

	.btn--secondary {
		background: transparent;
		color: var(--color-text, #cdd6f4);
		border: 1px solid var(--color-border, #313244);
	}
</style>
