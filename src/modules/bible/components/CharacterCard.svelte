<script lang="ts">
	import type { Character } from '$lib/db/types.js';
	import { GhostButton, DestructiveButton, SurfaceCard } from '$lib/components/ui/index.js';

	let { character, onEdit, onDelete } = $props<{
		character: Character;
		onEdit: (c: Character) => void;
		onDelete: (id: string) => void;
	}>();

	let confirmDelete = $state(false);
</script>

<SurfaceCard class="char-card" element="li">
	<div class="card-body">
		<span class="char-name">{character.name}</span>
		{#if character.role}
			<span class="char-role">{character.role}</span>
		{/if}
	</div>
	<div class="card-actions">
		<GhostButton onclick={() => onEdit(character)}>Edit</GhostButton>
		{#if confirmDelete}
			<span class="confirm-text">Delete?</span>
			<DestructiveButton onclick={() => onDelete(character.id)}>Yes</DestructiveButton>
			<GhostButton onclick={() => (confirmDelete = false)}>No</GhostButton>
		{:else}
			<GhostButton onclick={() => (confirmDelete = true)}>Delete</GhostButton>
		{/if}
	</div>
</SurfaceCard>

<style>
	:global(.char-card) {
		display: flex !important;
		flex-direction: row !important;
		align-items: center !important;
		justify-content: space-between !important;
		padding: var(--space-3) var(--space-4) !important;
		list-style: none !important;
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
</style>
