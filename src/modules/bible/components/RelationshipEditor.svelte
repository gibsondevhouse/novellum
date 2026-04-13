<script lang="ts">
	import type { Character, CharacterRelationship } from '$lib/db/types.js';
	import {
		getRelationships,
		initRelationships,
		submitCreateRelationship,
		submitDeleteRelationship,
	} from '../stores/bible-crud.svelte.ts';

	let { characterId, projectId, allCharacters, initialRelationships } = $props<{
		characterId: string;
		projectId: string;
		allCharacters: Character[];
		initialRelationships: CharacterRelationship[];
	}>();

	$effect(() => {
		initRelationships(initialRelationships);
	});

	const myRelationships = $derived(
		getRelationships().filter(
			(r) => r.characterAId === characterId || r.characterBId === characterId,
		),
	);

	const otherCharacters = $derived(allCharacters.filter((c: Character) => c.id !== characterId));

	let targetId = $state('');
	let relType = $state('');
	let relDesc = $state('');
	let addError = $state('');

	async function handleAdd() {
		if (!targetId) {
			addError = 'Select a target character.';
			return;
		}
		if (!relType.trim()) {
			addError = 'Type is required.';
			return;
		}
		addError = '';
		await submitCreateRelationship({
			projectId,
			characterAId: characterId,
			characterBId: targetId,
			type: relType.trim(),
			description: relDesc.trim(),
		});
		targetId = '';
		relType = '';
		relDesc = '';
	}

	function getOtherName(rel: CharacterRelationship): string {
		const otherId = rel.characterAId === characterId ? rel.characterBId : rel.characterAId;
		return allCharacters.find((c: Character) => c.id === otherId)?.name ?? otherId;
	}
</script>

<section class="rel-editor">
	<h3 class="section-title">Relationships</h3>

	{#if myRelationships.length === 0}
		<p class="empty-text">No relationships yet.</p>
	{:else}
		<ul class="rel-list">
			{#each myRelationships as rel (rel.id)}
				<li class="rel-item">
					<span class="rel-other">{getOtherName(rel)}</span>
					<span class="rel-type">{rel.type}</span>
					{#if rel.description}
						<span class="rel-desc">{rel.description}</span>
					{/if}
					<button
						class="btn-ghost btn-xs"
						onclick={() => submitDeleteRelationship(rel.id)}
						aria-label="Remove relationship">✕</button
					>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="add-form">
		<h4 class="add-title">Add Relationship</h4>
		<div class="add-row">
			<select class="input" bind:value={targetId} aria-label="Target character">
				<option value="">— Select character —</option>
				{#each otherCharacters as c (c.id)}
					<option value={c.id}>{c.name}</option>
				{/each}
			</select>
			<input
				class="input"
				type="text"
				bind:value={relType}
				placeholder="Type (e.g. friend, rival)"
			/>
			<input class="input" type="text" bind:value={relDesc} placeholder="Description (optional)" />
			<button class="btn-primary btn-sm" onclick={handleAdd}>Add</button>
		</div>
		{#if addError}
			<p class="error-text" role="alert">{addError}</p>
		{/if}
	</div>
</section>

<style>
	.rel-editor {
		margin-top: var(--space-6);
	}

	.section-title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin-bottom: var(--space-3);
	}

	.empty-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: var(--space-4);
	}

	.rel-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.rel-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
	}

	.rel-other {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}

	.rel-type {
		font-size: var(--text-xs);
		color: var(--color-teal);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.rel-desc {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		flex: 1;
	}

	.add-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-2);
	}

	.add-row {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		align-items: flex-end;
	}

	.input {
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		flex: 1;
		min-width: 120px;
		box-sizing: border-box;
	}

	.input:focus {
		outline: none;
		border-color: var(--color-border-focus);
		box-shadow: 0 0 0 2px var(--color-border-focus);
	}

	.btn-sm {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		border-radius: var(--radius-sm);
	}

	.btn-xs {
		padding: var(--space-1);
		font-size: var(--text-xs);
		border: 1px solid transparent;
		border-radius: var(--radius-xs);
		background: none;
		cursor: pointer;
		color: var(--color-text-muted);
		transition: var(--transition-color);
		margin-left: auto;
	}

	.btn-xs:hover {
		color: var(--color-error);
	}

	.error-text {
		font-size: var(--text-xs);
		color: var(--color-error);
		margin-top: var(--space-1);
	}
</style>
