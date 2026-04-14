<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = 'Help me fix this error ...',
		disabled = false,
		onsubmit,
	}: {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		onsubmit?: (text: string) => void;
	} = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			submit();
		}
	}

	function submit() {
		if (!value.trim() || disabled) return;
		onsubmit?.(value.trim());
	}
</script>

<div class="prompt-subcard">
	<textarea
		class="prompt-subcard__textarea"
		bind:value
		{placeholder}
		rows="1"
		onkeydown={handleKeydown}
		{disabled}
	></textarea>
	<button
		class="prompt-subcard__send"
		onclick={submit}
		disabled={!value.trim() || disabled}
		aria-label="Send message"
	>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<line x1="5" y1="12" x2="19" y2="12"></line>
			<polyline points="12 5 19 12 12 19"></polyline>
		</svg>
	</button>
</div>

<style>
	.prompt-subcard {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background-color: var(--color-surface-raised);
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.prompt-subcard:focus-within {
		border-color: var(--color-border-strong);
	}

	.prompt-subcard__textarea {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-family: inherit;
		font-size: var(--text-base);
		line-height: var(--leading-normal);
		resize: none;
		padding: 0;
		min-height: 24px;
		max-height: 200px;
	}

	.prompt-subcard__textarea:focus {
		outline: none;
	}

	.prompt-subcard__textarea::placeholder {
		color: var(--color-text-secondary);
	}

	.prompt-subcard__textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ── Send button ── */
	.prompt-subcard__send {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		background-color: var(--color-ai-tint);
		color: var(--color-teal);
		cursor: pointer;
		flex-shrink: 0;
		padding: 0 var(--space-2);
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.prompt-subcard__send:hover:not(:disabled) {
		background-color: color-mix(in srgb, var(--color-teal) 20%, transparent);
		color: var(--color-text-on-dark);
	}

	.prompt-subcard__send:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.prompt-subcard__send:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}
</style>
