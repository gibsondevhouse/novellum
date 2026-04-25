<script lang="ts">
	import type { ProjectDraft } from '../types/project-draft.js';
	import { GENRE_SUGGESTIONS } from '../constants.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let {
		draft,
		onchange,
	}: {
		draft: ProjectDraft;
		onchange: (patch: Partial<ProjectDraft>) => void;
	} = $props();

	let titleError = $derived(!draft.title.trim() ? '' : '');
	let genreError = $state('');
	let genreInput = $state('');

	function handleTitleInput(e: Event) {
		onchange({ title: (e.target as HTMLInputElement).value });
	}

	function addGenre(value: string) {
		const trimmed = value.trim();
		if (!trimmed || draft.genre.includes(trimmed)) return;
		onchange({ genre: [...draft.genre, trimmed] });
		genreInput = '';
	}

	function removeGenre(tag: string) {
		onchange({ genre: draft.genre.filter((g) => g !== tag) });
	}

	function handleGenreKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addGenre(genreInput);
		} else if (e.key === 'Backspace' && !genreInput && draft.genre.length > 0) {
			onchange({ genre: draft.genre.slice(0, -1) });
		}
	}

	function handleGenreInput() {
		// When a user picks from the datalist, the value is set in one shot.
		// If it matches a suggestion exactly, auto-add it as a tag.
		const trimmed = genreInput.trim();
		if (GENRE_SUGGESTIONS.some((g) => g === trimmed)) {
			addGenre(trimmed);
		}
		// Also handle comma-separated paste/input (e.g. "Fantasy, Thriller")
		if (trimmed.includes(',')) {
			const parts = trimmed.split(',');
			for (const part of parts) {
				addGenre(part);
			}
			genreInput = '';
		}
	}
</script>

<div class="section">
	<!-- Title -->
	<div class="field">
		<label class="label" for="create-title">
			Title
			<span class="required" aria-hidden="true">*</span>
		</label>
		<input
			id="create-title"
			class="input"
			class:input-error={!!titleError}
			type="text"
			value={draft.title}
			oninput={handleTitleInput}
			placeholder="The Last Oracle of Atlanta"
			aria-required="true"
			aria-invalid={!!titleError || undefined}
			autocomplete="off"
		/>
		<p class="helper-text">Working title — you can change this anytime</p>
	</div>

	<!-- Genre tag input -->
	<div class="field">
		<label class="label" for="create-genre-input">Genre</label>

		{#if draft.genre.length > 0}
			<div class="tag-list" role="list" aria-label="Selected genres">
				{#each draft.genre as tag (tag)}
					<span class="tag" role="listitem">
						{tag}
						<GhostButton
							type="button"
							class="tag-remove"
							onclick={() => removeGenre(tag)}
							aria-label="Remove {tag}">✕</GhostButton
						>
					</span>
				{/each}
			</div>
		{/if}

		<input
			id="create-genre-input"
			class="input"
			type="text"
			bind:value={genreInput}
			oninput={handleGenreInput}
			onkeydown={handleGenreKeydown}
			onblur={() => {
				if (genreInput.trim()) addGenre(genreInput);
			}}
			placeholder="e.g. Fantasy, Thriller"
			aria-describedby="genre-suggestions-hint genre-error"
			aria-invalid={!!genreError || undefined}
			autocomplete="off"
			list="genre-suggestions"
		/>
		<datalist id="genre-suggestions">
			{#each GENRE_SUGGESTIONS as g (g)}
				<option value={g}></option>
			{/each}
		</datalist>
		<span id="genre-error" role="alert" class="error-text">{genreError}</span>
		<p id="genre-suggestions-hint" class="helper-text">Press Enter or comma to add a tag</p>
	</div>
</div>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.required {
		color: var(--color-nova-blue);
	}

	.input {
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-primary);
		font-size: var(--text-base);
		font-family: var(--font-sans);
		width: 100%;
		box-sizing: border-box;
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-nova-blue);
		box-shadow: var(--focus-ring);
	}

	.input-error {
		border-color: var(--color-error);
	}

	.helper-text {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
		line-height: var(--leading-normal);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin-bottom: var(--space-2);
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		background-color: color-mix(in srgb, var(--color-teal) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-teal) 30%, transparent);
		color: var(--color-teal);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
	}

	:global(.tag-remove) {
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		opacity: 0.6;
		font-size: 10px;
		line-height: 1;
		padding: 0;
		display: flex;
		align-items: center;
	}

	:global(.tag-remove:hover) {
		opacity: 1;
	}

        .error-text {
                font-size: var(--text-xs);
                color: var(--color-error, var(--color-warning));
                min-height: 1em;
        }
</style>
