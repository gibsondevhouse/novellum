<script lang="ts">
	let { onAdd, active = $bindable(false) } = $props<{
		onAdd: (title: string) => void;
		active?: boolean;
	}>();

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
			placeholder="Chapter title…"
			bind:value={title}
			onkeydown={handleKeydown}
		/>
		<button class="btn-submit" onclick={submit}>Add</button>
		<button class="btn-cancel" onclick={cancel} aria-label="Cancel">✕</button>
	</div>
{:else}
	<button class="btn-add-chapter" onclick={open}>
		<span class="btn-icon-plus" aria-hidden="true">+</span>
		Add Chapter
	</button>
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
	.btn-submit {
		padding: var(--space-2) var(--space-4);
		background: var(--color-nova-blue);
		color: #fff;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		white-space: nowrap;
		transition: opacity 0.1s;
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
	.btn-add-chapter {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: none;
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-4);
		cursor: pointer;
		width: 100%;
		transition:
			border-color 0.12s ease,
			color 0.12s ease,
			background 0.12s ease;
	}
	.btn-add-chapter:hover {
		border-color: var(--color-border-strong);
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
	}
	.btn-add-chapter:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	.btn-icon-plus {
		font-size: var(--text-base);
		line-height: 1;
		color: var(--color-text-muted);
	}
</style>
