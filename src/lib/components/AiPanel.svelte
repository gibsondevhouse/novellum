<script lang="ts">
	import { aiPanel } from '$lib/stores/ai-panel.svelte';
	import { tick } from 'svelte';

	let { onAccept }: { onAccept?: (text: string) => void } = $props();

	let panelEl = $state<HTMLElement | null>(null);
	let closeButtonEl = $state<HTMLButtonElement | null>(null);
	let triggerEl: HTMLElement | null = null;

	function handleAccept() {
		const text = aiPanel.suggestion;
		if (text && onAccept) {
			onAccept(text);
			aiPanel.suggestion = null;
			aiPanel.isOpen = false;
		}
	}

	function handleReject() {
		aiPanel.rejectSuggestion();
	}

	async function handleRegenerate() {
		const prompt = aiPanel.lastPrompt;
		if (prompt) await aiPanel.requestSuggestion(prompt);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleReject();
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleAccept();
		// Trap focus inside panel: Tab/Shift+Tab cycle within panel
		if (e.key === 'Tab' && panelEl) {
			const focusable = panelEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last?.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first?.focus();
			}
		}
	}

	// Move focus into panel when opened; return focus to trigger when closed
	$effect(() => {
		if (aiPanel.isOpen) {
			triggerEl = document.activeElement as HTMLElement;
			tick().then(() => closeButtonEl?.focus());
		} else if (triggerEl) {
			tick().then(() => {
				triggerEl?.focus();
				triggerEl = null;
			});
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if aiPanel.isOpen}
	<aside class="ai-panel" aria-label="AI Assistant" bind:this={panelEl}>
		<div class="panel-header">
			<span class="panel-title" id="ai-panel-heading">AI Assistant</span>
			<button
				class="btn-close"
				onclick={() => aiPanel.toggle()}
				aria-label="Close AI panel"
				bind:this={closeButtonEl}>✕</button
			>
		</div>

		<div
			class="panel-body"
			aria-live="polite"
			aria-atomic="false"
			aria-labelledby="ai-panel-heading"
		>
			{#if aiPanel.isLoading}
				<div class="loading" role="status" aria-label="AI is generating a suggestion">
					<span class="spinner" aria-hidden="true"></span>
					<span>Generating...</span>
				</div>
			{:else if aiPanel.error}
				<div class="error-message" role="alert">
					<p>{aiPanel.error}</p>
				</div>
			{:else if aiPanel.suggestion}
				<div class="suggestion">
					<p class="suggestion-text">{aiPanel.suggestion}</p>
				</div>
				<div class="action-row">
					<button class="btn-accept" onclick={handleAccept}>Accept <kbd>⌘↩</kbd></button>
					<button class="btn-regenerate" onclick={handleRegenerate}>Regenerate</button>
					<button class="btn-reject" onclick={handleReject}>Reject <kbd>Esc</kbd></button>
				</div>
			{:else}
				<p class="empty-hint">Click <strong>Ask AI</strong> in the toolbar to get a suggestion.</p>
			{/if}
		</div>
	</aside>
{/if}

<style>
	.ai-panel {
		width: 280px;
		background-color: var(--color-surface-overlay);
		border-left: 1px solid var(--color-border-default);
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: novellum-enter var(--duration-enter) var(--ease-editorial) both;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.panel-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-teal);
	}

	.btn-close {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: var(--space-1);
		border-radius: var(--radius-sm);
	}

	.btn-close:hover {
		color: var(--color-text-primary);
	}

	.panel-body {
		flex: 1;
		padding: var(--space-4);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.loading {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-teal);
		border-radius: 50%;
		--_dur: 0.6s;
		animation: spin var(--_dur) linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-message {
		color: var(--color-error);
		font-size: var(--text-sm);
		background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
	}

	.suggestion {
		flex: 1;
		overflow-y: auto;
		background-color: var(--color-ai-tint);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-3);
	}

	.suggestion-text {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-primary);
		white-space: pre-wrap;
	}

	.action-row {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.btn-accept {
		background-color: var(--color-nova-blue);
		color: var(--color-text-primary);
		border: none;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.btn-regenerate {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.btn-reject {
		background: none;
		border: none;
		color: var(--color-text-muted);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.btn-accept:hover {
		opacity: 0.85;
	}
	.btn-regenerate:hover {
		border-color: var(--color-teal);
		color: var(--color-text-primary);
	}
	.btn-reject:hover {
		color: var(--color-text-secondary);
	}

	.empty-hint {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		text-align: center;
		padding-top: var(--space-6);
	}

	kbd {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		background-color: var(--color-border);
		padding: 1px var(--space-1);
		border-radius: 2px;
	}
</style>
