<script lang="ts">
	import { GhostButton, PrimaryButton } from '$lib/components/ui/index.js';

	let { onAdd, active = $bindable(false), entityLabel = 'Chapter', placeholder } = $props<{
		onAdd: (title: string) => void;
		active?: boolean;
		entityLabel?: string;
		placeholder?: string;
	}>();
	const inputPlaceholder = $derived(placeholder ?? `${entityLabel} title...`);

	let title = $state('');
	let inputEl = $state<HTMLInputElement | undefined>(undefined);

	$effect(() => {
		if (active && inputEl) inputEl.focus();
	});

	function open() {
		active = true;
	}

	function submit() {
		if (!title.trim()) return;
		onAdd(title.trim());
		title = '';
		active = false;
	}

	function cancel() {
		title = '';
		active = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
		if (e.key === 'Escape') cancel();
	}
</script>

{#if active}
	<div class="add-form">
		<input
			bind:this={inputEl}
			class="add-input"
			type="text"
			placeholder={inputPlaceholder}
			bind:value={title}
			onkeydown={handleKeydown}
		/>
		<PrimaryButton class="btn-submit" onclick={submit}>Add</PrimaryButton>
		<GhostButton class="btn-cancel" onclick={cancel} aria-label="Cancel">✕</GhostButton>
	</div>
{:else}
	<GhostButton class="btn-add-chapter" onclick={open}>
		<span class="btn-icon-plus" aria-hidden="true">+</span>
		Add {entityLabel}
	</GhostButton>
{/if}

<style>
	.add-form {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-2) 0 var(--space-1);
		align-items: center;
	}
	.add-input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-focus);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}
	.add-input::placeholder {
		color: var(--color-text-muted);
	}
	.add-input:focus {
		outline: none;
		border-color: var(--color-nova-blue);
	}
	:global(.btn-submit) {
		white-space: nowrap;
	}
	:global(.btn-cancel) {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		padding: var(--space-1);
		line-height: 1;
	}
	:global(.btn-cancel:hover) {
		color: var(--color-text-secondary);
	}
	:global(.btn-add-chapter) {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		border: 1px dashed var(--color-border-default);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-4);
		width: 100%;
		transition:
			border-color 0.12s ease,
			color 0.12s ease,
			background 0.12s ease;
	}
	:global(.btn-add-chapter:hover) {
		border-color: var(--color-border-strong);
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
	}
	.btn-icon-plus {
		font-size: var(--text-base);
		line-height: 1;
		color: var(--color-text-muted);
	}
</style>
