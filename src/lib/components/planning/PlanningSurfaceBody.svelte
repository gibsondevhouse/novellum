<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children } = $props<{ children: Snippet }>();
</script>

<div class="ps-body">
	{@render children()}
</div>

<style>
	.ps-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-5) var(--space-5) var(--space-6) calc(var(--space-5) + 5px);
	}

	/* ── Planning content panel global styles ──
	   Defined here (via :global) to guarantee Vite always includes them
	   since PlanningSurfaceBody is always imported wherever planning content renders. */

	:global(.planning-panel) {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	:global(.planning-context) {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	:global(.planning-context-label) {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--ps-accent, var(--color-teal));
		opacity: 0.7;
		flex-shrink: 0;
	}

	:global(.planning-context-desc) {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
	}

	:global(.planning-divider) {
		height: 1px;
		background: var(--color-border-subtle);
	}

	:global(.planning-field) {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	:global(.planning-field-label) {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	:global(.planning-field-hint) {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0 0 var(--space-1);
	}

	:global(.planning-field-textarea) {
		padding: var(--space-2) var(--space-3);
		background: color-mix(in srgb, var(--color-surface-ground) 60%, var(--color-surface-overlay));
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		line-height: var(--leading-relaxed);
		width: 100%;
		resize: vertical;
		transition: border-color 0.15s, background 0.15s;
	}

	:global(.planning-field-textarea:focus) {
		outline: none;
		border-color: color-mix(in srgb, var(--ps-accent, var(--color-teal)) 55%, transparent);
		background: color-mix(in srgb, var(--color-surface-ground) 40%, var(--color-surface-overlay));
	}

	:global(.planning-field-textarea::placeholder) {
		color: var(--color-text-muted);
		opacity: 0.6;
	}

	:global(.planning-beat-section) {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-ground);
		border-top: 1px solid var(--color-border-subtle);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	:global(.planning-beat-add) {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	:global(.planning-beat-add-input) {
		flex: 1;
		padding: var(--space-1) var(--space-2);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		font-family: inherit;
		transition: border-color 0.1s;
	}

	:global(.planning-beat-add-input:focus) {
		outline: none;
		border-color: var(--color-border-focus);
	}

	:global(.planning-beat-add-input::placeholder) {
		color: var(--color-text-muted);
	}

	:global(.planning-beat-add-btn) {
		padding: var(--space-1) var(--space-3);
		background: var(--ps-accent, var(--color-teal));
		color: #000;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: opacity 0.1s;
	}

	:global(.planning-beat-add-btn:hover) {
		opacity: 0.85;
	}

	:global(.planning-beat-add-btn:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	:global(.planning-empty-hint) {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0;
		padding: var(--space-1) 0;
	}
</style>
