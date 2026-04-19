<script lang="ts">
	import type { Character } from '$lib/db/types.js';
	import { GhostButton, DestructiveButton, SurfaceCard } from '$lib/components/ui/index.js';

	let { character, onEdit, onDelete } = $props<{
		character: Character;
		onEdit: (c: Character) => void;
		onDelete: (id: string) => void;
	}>();

	let confirmDelete = $state(false);

	const fallbackInitials = $derived(
		character.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((chunk: string) => chunk[0]?.toUpperCase() ?? '')
			.join('') || '?',
	);
	const bioPreview = $derived(character.bio?.trim() || character.notes?.trim() || 'No bio yet.');
	const factionLabel = $derived(character.faction?.trim() || 'Unaffiliated');
</script>

<SurfaceCard class="char-card" element="li">
	<div class="char-avatar-wrap">
		<div class="char-avatar" aria-hidden="true">
			{#if character.photoUrl}
				<img class="char-avatar__image" src={character.photoUrl} alt="" loading="lazy" />
			{:else}
				<span class="char-avatar__fallback">{fallbackInitials}</span>
			{/if}
		</div>
	</div>
	<div class="card-body">
		<div class="card-heading">
			<span class="char-name">{character.name}</span>
			<span class="char-faction">{factionLabel}</span>
		</div>
		{#if character.role}
			<span class="char-role">{character.role}</span>
		{/if}
		<p class="char-bio">{bioPreview}</p>
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
	:global(.char-card.surface-card) {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;
		gap: var(--space-3);
		padding: var(--space-5);
		list-style: none;
		height: 100%;
	}

	.char-avatar-wrap {
		display: flex;
		justify-content: flex-start;
	}

	.char-avatar {
		width: 100%;
		max-width: 100%;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-md);
		overflow: hidden;
		flex-shrink: 0;
		background: linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface-overlay));
		border: 1px solid var(--color-border-strong);
		display: grid;
		place-items: center;
	}

	.char-avatar__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.char-avatar__fallback {
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-secondary);
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
		flex: 1;
	}

	.card-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.char-name {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.char-faction {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.55rem;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-surface-elevated) 78%, transparent 22%);
		border: 1px solid var(--color-border-default);
	}

	.char-role {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: capitalize;
	}

	.char-bio {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
		color: var(--color-text-secondary);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.card-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}

	.confirm-text {
		font-size: var(--text-sm);
		color: var(--color-warning);
	}

	@media (max-width: 720px) {
		:global(.char-card.surface-card) {
			padding: var(--space-4);
		}

		.card-actions {
			justify-content: flex-end;
		}
	}
</style>
