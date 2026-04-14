<script lang="ts">
	import type { EditSuggestion } from '$lib/ai/types.js';

	let {
		suggestion,
		onAccept,
		onReject,
	}: {
		suggestion: EditSuggestion;
		onAccept: (suggestion: EditSuggestion) => void;
		onReject: (suggestion: EditSuggestion) => void;
	} = $props();

	const modeLabel = $derived(suggestion.mode === 'line_edit' ? 'line edit' : suggestion.mode);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') onAccept(suggestion);
		if (e.key === 'Escape') onReject(suggestion);
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="suggestion-card" tabindex="0" role="group" onkeydown={handleKeydown}>
	<div class="card-header">
		<span class="mode-badge mode-badge--{suggestion.mode}">{modeLabel}</span>
	</div>

	<div class="diff-block">
		<div class="diff-row diff-row--removed">
			<span class="diff-label">Original</span>
			<span class="diff-text">{suggestion.original}</span>
		</div>
		<div class="diff-row diff-row--added">
			<span class="diff-label">Suggested</span>
			<span class="diff-text">{suggestion.suggestion}</span>
		</div>
	</div>

	<p class="reason">{suggestion.reason}</p>

	<div class="card-actions">
		<button
			class="btn btn--primary"
			onclick={() => onAccept(suggestion)}
			aria-label={`Accept suggestion: replace '${suggestion.original}' with '${suggestion.suggestion}'`}
		>
			Accept
		</button>
		<button
			class="btn btn--secondary"
			onclick={() => onReject(suggestion)}
			aria-label={`Reject suggestion: replace '${suggestion.original}' with '${suggestion.suggestion}'`}
		>
			Reject
		</button>
	</div>
</div>

<style>
	.suggestion-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.suggestion-card:focus {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.card-header {
		display: flex;
		align-items: center;
	}

	.mode-badge {
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: capitalize;
		letter-spacing: var(--tracking-wide);
	}

	.mode-badge--developmental {
		background-color: color-mix(in srgb, var(--color-teal) 15%, transparent);
		color: var(--color-teal);
	}

	.mode-badge--line_edit {
		background-color: color-mix(in srgb, var(--color-warning) 15%, transparent);
		color: var(--color-warning);
	}

	.mode-badge--proofread {
		background-color: color-mix(in srgb, var(--color-nova-blue) 15%, transparent);
		color: var(--color-nova-blue);
	}

	.diff-block {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.diff-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
	}

	.diff-row--removed {
		background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
		border-left: 2px solid var(--color-error);
	}

	.diff-row--removed .diff-text {
		text-decoration: line-through;
		color: var(--color-error);
	}

	.diff-row--added {
		background-color: color-mix(in srgb, var(--color-success) 10%, transparent);
		border-left: 2px solid var(--color-success);
	}

	.diff-row--added .diff-text {
		color: var(--color-success);
	}

	.diff-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.diff-text {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.reason {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
	}

	.card-actions {
		display: flex;
		gap: var(--space-2);
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
</style>
