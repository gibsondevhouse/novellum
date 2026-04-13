<script lang="ts">
	import type { Character } from '$lib/db/types.js';

	let { character, onEdit, onDelete } = $props<{
		character: Character;
		onEdit: (c: Character) => void;
		onDelete: (id: string) => void;
	}>();

	let confirmDelete = $state(false);
</script>

<li class="char-card">
	<div class="card-body">
		<span class="char-name">{character.name}</span>
		{#if character.role}
			<span class="char-role">{character.role}</span>
		{/if}
	</div>
	<div class="card-actions">
		<button class="btn-ghost btn-sm" onclick={() => onEdit(character)}>Edit</button>
		{#if confirmDelete}
			<span class="confirm-text">Delete?</span>
			<button class="btn-danger btn-sm" onclick={() => onDelete(character.id)}>Yes</button>
			<button class="btn-ghost btn-sm" onclick={() => (confirmDelete = false)}>No</button>
		{:else}
			<button class="btn-ghost btn-sm" onclick={() => (confirmDelete = true)}>Delete</button>
		{/if}
	</div>
</li>

<style>
	.char-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		list-style: none;
	}

	.char-card:hover {
		border-color: var(--color-border-strong);
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.char-name {
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.char-role {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: capitalize;
	}

	.card-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.confirm-text {
		font-size: var(--text-sm);
		color: var(--color-warning);
	}

	.btn-sm {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-default);
		background: none;
		cursor: pointer;
		color: var(--color-text-secondary);
		transition: var(--transition-color), var(--transition-border);
	}

	.btn-sm:hover {
		color: var(--color-text-primary);
		border-color: var(--color-border-strong);
	}

	.btn-danger {
		color: var(--color-error);
		border-color: var(--color-error);
	}

	.btn-danger:hover {
		background-color: var(--color-error);
		color: var(--color-surface-base);
	}
</style>
