<script lang="ts">
	import type { EditSuggestion } from '$lib/ai/types.js';
	import { untrack } from 'svelte';
	import SuggestionCard from './SuggestionCard.svelte';

	let {
		suggestions,
		isLoading = false,
		error = null,
		onApply,
		onClose,
	}: {
		suggestions: EditSuggestion[];
		isLoading?: boolean;
		error?: string | null;
		onApply: (accepted: EditSuggestion[]) => void;
		onClose: () => void;
	} = $props();

	let remaining = $state<EditSuggestion[]>(untrack(() => [...suggestions]));
	let accepted = $state<EditSuggestion[]>([]);

	$effect(() => {
		remaining = [...suggestions];
		accepted = [];
	});

	function handleAccept(suggestion: EditSuggestion) {
		accepted = [...accepted, suggestion];
		remaining = remaining.filter((s) => s !== suggestion);
		if (remaining.length === 0) {
			onApply(accepted);
		}
	}

	function handleReject(suggestion: EditSuggestion) {
		remaining = remaining.filter((s) => s !== suggestion);
		if (remaining.length === 0) {
			onApply(accepted);
		}
	}

	function handleAcceptAll() {
		onApply([...remaining]);
	}

	function handleRejectAll() {
		onApply([]);
	}
</script>

<div class="overlay" role="dialog" aria-label="AI Edit Suggestions" aria-modal="true">
	<div class="overlay-header">
		<h2 class="overlay-title">AI Suggestions</h2>
		<div class="overlay-controls">
			{#if !isLoading && !error && remaining.length > 0}
				<button class="btn btn--primary" onclick={handleAcceptAll}>Accept All</button>
				<button class="btn btn--secondary" onclick={handleRejectAll}>Reject All</button>
			{/if}
			<button class="btn btn--ghost" onclick={onClose} aria-label="Close AI suggestions">✕</button>
		</div>
	</div>

	<div class="overlay-body">
		{#if isLoading}
			<div class="state-block">
				<span class="spinner" aria-hidden="true"></span>
				<p class="state-message">Analysing…</p>
			</div>
		{:else if error}
			<div class="state-block">
				<p class="state-message state-message--error">{error}</p>
			</div>
		{:else if remaining.length === 0}
			<div class="state-block">
				<p class="state-message">No suggestions — your text looks great!</p>
			</div>
		{:else}
			<ul class="suggestion-list" role="list">
				{#each remaining as suggestion (`${suggestion.spanStart}-${suggestion.spanEnd}-${suggestion.original}`)}
					<li role="listitem">
						<SuggestionCard {suggestion} onAccept={handleAccept} onReject={handleReject} />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.overlay {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--color-surface-raised);
		border-left: 1px solid var(--color-border);
	}

	.overlay-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
		gap: var(--space-3);
	}

	.overlay-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
		flex-shrink: 0;
	}

	.overlay-controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.overlay-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
	}

	.suggestion-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.state-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-8) var(--space-4);
		text-align: center;
	}

	.state-message {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.state-message--error {
		color: var(--color-error);
	}

	.spinner {
		display: inline-block;
		width: var(--space-5);
		height: var(--space-5);
		border: 2px solid var(--color-border-strong);
		border-top-color: var(--color-teal);
		border-radius: var(--radius-full);
		--_dur: 0.8s;
		animation: spin var(--_dur) linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		border: 1px solid transparent;
		transition: var(--transition-color);
	}

	.btn--primary {
		background-color: var(--color-nova-blue);
		color: var(--color-text-on-dark);
		border-color: var(--color-nova-blue);
	}

	.btn--primary:hover {
		background-color: color-mix(in srgb, var(--color-nova-blue) 85%, white);
	}

	.btn--secondary {
		background-color: transparent;
		color: var(--color-text-secondary);
		border-color: var(--color-border-strong);
	}

	.btn--secondary:hover {
		background-color: var(--color-surface-elevated);
		color: var(--color-text-primary);
	}

	.btn--ghost {
		background-color: transparent;
		color: var(--color-text-muted);
		border-color: transparent;
		padding: var(--space-2);
	}

	.btn--ghost:hover {
		color: var(--color-text-primary);
		background-color: var(--color-surface-elevated);
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>
