<script lang="ts">
	import { untrack } from 'svelte';

	let { beat, onSave, onClose } = $props<{
		beat: { id: string; title: string; notes?: string };
		onSave: (text: string) => void;
		onClose: () => void;
	}>();

	let draft = $state(untrack(() => beat.title));
	let overlayEl = $state<HTMLDivElement | undefined>(undefined);

	$effect(() => {
		if (overlayEl) overlayEl.focus();
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onSave(draft.trim() || beat.title);
			onClose();
		}
	}

	function handleBlur(e: FocusEvent) {
		if (!overlayEl?.contains(e.relatedTarget as Node)) {
			onSave(draft.trim() || beat.title);
			onClose();
		}
	}
</script>

<div
	class="beat-overlay"
	role="dialog"
	aria-modal="true"
	aria-label="Edit beat"
	bind:this={overlayEl}
	tabindex="-1"
	onkeydown={handleKeydown}
	onfocusout={handleBlur}
>
	<textarea
		class="beat-textarea"
		aria-label="Beat content"
		placeholder="What happens here? Describe the key action, reaction, or decision."
		bind:value={draft}
		rows="4"
	></textarea>
	<div class="overlay-actions">
		<button
			class="btn-save"
			onclick={() => {
				onSave(draft.trim() || beat.title);
				onClose();
			}}
		>
			Save
		</button>
	</div>
</div>

<style>
	.beat-overlay {
		position: absolute;
		inset: 0;
		background: var(--color-surface-elevated);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		z-index: 10;
		box-shadow: var(--shadow-lg);
		outline: none;
	}

	.beat-textarea {
		flex: 1;
		width: 100%;
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		line-height: 1.5;
		padding: var(--space-2) var(--space-3);
		resize: none;
	}

	.beat-textarea:focus {
		outline: none;
		border-color: var(--color-border-default);
		box-shadow: var(--focus-ring);
	}

	.overlay-actions {
		display: flex;
		justify-content: flex-end;
	}

	.btn-save {
		background: var(--color-nova-blue);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-sm);
		font-family: inherit;
		cursor: pointer;
		transition: opacity 0.1s;
	}

	.btn-save:hover {
		opacity: 0.85;
	}

	.btn-save:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
