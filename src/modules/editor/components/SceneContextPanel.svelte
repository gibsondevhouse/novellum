<script lang="ts">
	import type { Character, Scene } from '$lib/db/domain-types';

	interface Props {
		activeScene: Scene | null;
		characters: Character[];
		activeSceneIndex: number;
		scenesCount: number;
		onPersistPovCharacter: (characterId: string) => void;
		onGoToScene: (offset: -1 | 1) => void;
	}

	let {
		activeScene,
		characters,
		activeSceneIndex,
		scenesCount,
		onPersistPovCharacter,
		onGoToScene,
	}: Props = $props();
</script>

<div class="editor-context-row" aria-label="Scene context controls">
	<label class="inline-field">
		<span>POV</span>
		<select
			value={activeScene?.povCharacterId ?? ''}
			onchange={(event) => onPersistPovCharacter((event.target as HTMLSelectElement).value)}
		>
			<option value="">Unassigned</option>
			{#each characters as character (character.id)}
				<option value={character.id}>{character.name}</option>
			{/each}
		</select>
	</label>
	<div class="nav-actions">
		<button
			type="button"
			class="nav-btn"
			onclick={() => onGoToScene(-1)}
			disabled={activeSceneIndex <= 0}
		>Previous</button>
		<button
			type="button"
			class="nav-btn"
			onclick={() => onGoToScene(1)}
			disabled={activeSceneIndex < 0 || activeSceneIndex >= scenesCount - 1}
		>Next</button>
	</div>
</div>

<style>
	.editor-context-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		justify-content: center;
		align-items: center;
		padding-inline: var(--space-2);
	}

	.inline-field {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.inline-field select {
		min-width: 150px;
		background: var(--color-surface-base);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.nav-actions {
		display: flex;
		gap: var(--space-2);
	}

	.nav-btn {
		background: none;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (max-width: 1360px) {
		.inline-field select {
			min-width: 120px;
		}
	}
</style>
