<script lang="ts">
	import { GhostButton, PrimaryButton } from '$lib/components/ui/index.js';

	let { onAdd } = $props<{ onAdd: (title: string) => void }>();
	let title = $state('');
	let active = $state(false);
	let inputEl = $state<HTMLInputElement | undefined>(undefined);

	$effect(() => {
		if (active && inputEl) inputEl.focus();
	});

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
			placeholder="Scene title…"
			bind:value={title}
			onkeydown={handleKeydown}
		/>
		<PrimaryButton class="btn-submit" onclick={submit}>Add</PrimaryButton>
		<GhostButton class="btn-cancel" onclick={cancel} aria-label="Cancel">✕</GhostButton>
	</div>
{:else}
	<GhostButton class="btn-add-scene" onclick={() => (active = true)}>
		<span aria-hidden="true">+</span> Add Scene
	</GhostButton>
{/if}

<style>
	.add-form {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.add-input {
		flex: 1;
		padding: var(--space-1) var(--space-2);
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
	:global(.btn-add-scene) {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		transition:
			color 0.1s,
			background 0.1s;
	}
	:global(.btn-add-scene:hover) {
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
	}
</style>
