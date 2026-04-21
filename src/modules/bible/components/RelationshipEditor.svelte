<script lang="ts">
	import Link2 from '@lucide/svelte/icons/link-2';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import type { Character, CharacterRelationship } from '$lib/db/types.js';
	import {
		getRelationships,
		initRelationships,
		submitCreateRelationship,
		submitDeleteRelationship,
	} from '../stores/bible-crud.svelte.ts';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	let { characterId, projectId, allCharacters, initialRelationships, onSelectCharacter } = $props<{
		characterId: string;
		projectId: string;
		allCharacters: Character[];
		initialRelationships: CharacterRelationship[];
		onSelectCharacter?: (characterId: string) => void;
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

	function getOtherId(rel: CharacterRelationship): string {
		return rel.characterAId === characterId ? rel.characterBId : rel.characterAId;
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
					<button
						class="rel-other"
						type="button"
						onclick={() => onSelectCharacter?.(getOtherId(rel))}
					>
						<Link2 class="rel-icon" aria-hidden="true" />
						<span>{getOtherName(rel)}</span>
					</button>
					<span class="rel-type">{rel.type}</span>
					{#if rel.description}
						<span class="rel-desc">{rel.description}</span>
					{/if}
					<button
						class="btn-xs"
						onclick={() => submitDeleteRelationship(rel.id)}
						aria-label="Remove relationship"
						type="button"
					>
						<X class="rel-icon" aria-hidden="true" />
					</button
					>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="add-form">
		<h4 class="add-title">Add Relationship</h4>
		<div class="add-row">
			<select class="input" bind:value={targetId} aria-label="Target character" aria-required="true">
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
			<PrimaryButton class="btn-sm" onclick={handleAdd}>
				<Plus class="rel-icon" aria-hidden="true" />
				<span>Add</span>
			</PrimaryButton>
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
		padding: 0;
		margin: 0 0 var(--space-4);
	}

	.rel-item {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
	}

	.rel-other {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
	}

	.rel-type {
		font-size: var(--text-xs);
		color: color-mix(in srgb, var(--color-nova-blue) 72%, var(--color-teal) 22%);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-family: var(--font-mono);
	}

	.rel-desc {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		grid-column: 1 / span 2;
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
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		flex: 1;
		min-width: 120px;
		box-sizing: border-box;
	}

	.input:focus {
		border-color: var(--color-border-focus);
		outline: none;
		box-shadow: var(--focus-ring);
	}

	:global(.rel-icon) {
		width: 0.95rem;
		height: 0.95rem;
		stroke-width: 1.5;
	}

	.btn-xs {
		display: inline-grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border: 1px solid color-mix(in srgb, var(--color-error) 24%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-error) 8%, transparent);
		cursor: pointer;
		color: color-mix(in srgb, var(--color-error) 80%, white 10%);
		transition: var(--transition-color);
	}

	.btn-xs:hover {
		border-color: color-mix(in srgb, var(--color-error) 55%, transparent);
	}

	@media (max-width: 640px) {
		.rel-item {
			grid-template-columns: 1fr;
		}

		.rel-desc {
			grid-column: auto;
		}
	}

	.error-text {
		font-size: var(--text-xs);
		color: var(--color-error);
		margin-top: var(--space-1);
	}
</style>
