<script lang="ts">
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
		<button class="btn-submit" onclick={submit}>Add</button>
		<button class="btn-cancel" onclick={cancel} aria-label="Cancel">✕</button>
	</div>
{:else}
	<button class="btn-add-scene" onclick={() => (active = true)}>
		<span aria-hidden="true">+</span> Add Scene
	</button>
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
	.btn-submit {
		padding: var(--space-1) var(--space-3);
		background: var(--color-nova-blue);
		color: #fff;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		white-space: nowrap;
	}
	.btn-submit:hover {
		opacity: 0.85;
	}
	.btn-cancel {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: var(--space-1);
		border-radius: var(--radius-sm);
		line-height: 1;
	}
	.btn-cancel:hover {
		color: var(--color-text-secondary);
	}
	.btn-add-scene {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition:
			color 0.1s,
			background 0.1s;
	}
	.btn-add-scene:hover {
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
	}
	.btn-add-scene:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
