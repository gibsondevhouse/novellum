<script lang="ts">
	import type { ExportChapterOption } from '../services/export-chapter-options.js';
	import {
		resolveChapterSelection,
		type ChapterSelectionState,
		type ChapterSelectionMode,
	} from './chapter-selection.js';

	let {
		chapters,
		state,
		disabled = false,
		onChange,
	}: {
		chapters: ExportChapterOption[];
		state: ChapterSelectionState;
		disabled?: boolean;
		onChange: (state: ChapterSelectionState) => void;
	} = $props();

	const resolved = $derived(resolveChapterSelection(state, chapters));

	function setMode(mode: ChapterSelectionMode): void {
		onChange({ ...state, mode });
	}

	function setRange(field: 'rangeStartId' | 'rangeEndId', value: string): void {
		onChange({ ...state, mode: 'range', [field]: value });
	}

	function toggleSelected(id: string, checked: boolean): void {
		const selectedIds = checked
			? [...state.selectedIds, id]
			: state.selectedIds.filter((selectedId) => selectedId !== id);
		onChange({ ...state, mode: 'selected', selectedIds });
	}
</script>

<fieldset class="chapter-selector" {disabled}>
	<legend>Chapters</legend>

	{#if chapters.length === 0}
		<p class="empty-state" role="status">Add at least one chapter before exporting a manuscript.</p>
	{:else}
		<div class="scope-options" role="radiogroup" aria-label="Chapter scope">
			<label>
				<input
					type="radio"
					name="chapter-scope"
					checked={state.mode === 'all'}
					onchange={() => setMode('all')}
				/>
				<span>All chapters</span>
			</label>
			<label>
				<input
					type="radio"
					name="chapter-scope"
					checked={state.mode === 'range'}
					onchange={() => setMode('range')}
				/>
				<span>Range</span>
			</label>
			<label>
				<input
					type="radio"
					name="chapter-scope"
					checked={state.mode === 'selected'}
					onchange={() => setMode('selected')}
				/>
				<span>Selected</span>
			</label>
		</div>

		{#if state.mode === 'range'}
			<div class="range-grid">
				<label class="field">
					<span>Start</span>
					<select
						value={state.rangeStartId ?? chapters[0]?.id}
						onchange={(event) => setRange('rangeStartId', event.currentTarget.value)}
					>
						{#each chapters as chapter (chapter.id)}
							<option value={chapter.id}>{chapter.label}</option>
						{/each}
					</select>
				</label>
				<label class="field">
					<span>End</span>
					<select
						value={state.rangeEndId ?? chapters[chapters.length - 1]?.id}
						onchange={(event) => setRange('rangeEndId', event.currentTarget.value)}
					>
						{#each chapters as chapter (chapter.id)}
							<option value={chapter.id}>{chapter.label}</option>
						{/each}
					</select>
				</label>
			</div>
		{/if}

		{#if state.mode === 'selected'}
			<div class="chapter-list" aria-label="Select chapters">
				{#each chapters as chapter (chapter.id)}
					<label>
						<input
							type="checkbox"
							checked={state.selectedIds.includes(chapter.id)}
							onchange={(event) => toggleSelected(chapter.id, event.currentTarget.checked)}
						/>
						<span>{chapter.label}</span>
					</label>
				{/each}
			</div>
		{/if}

		<p class="selection-summary" role="status">
			{resolved.count} of {chapters.length} chapter{chapters.length === 1 ? '' : 's'} selected
		</p>

		{#if resolved.error}
			<p class="error-text" role="alert">{resolved.error}</p>
		{/if}

		{#each resolved.warnings as warning (warning)}
			<p class="warning-text" role="status">{warning}</p>
		{/each}
	{/if}
</fieldset>

<style>
	.chapter-selector {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	legend {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		padding: 0;
	}

	.empty-state,
	.selection-summary,
	.warning-text,
	.error-text {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.empty-state,
	.selection-summary {
		color: var(--color-text-secondary);
	}

	.warning-text {
		color: var(--color-warning, var(--color-text-secondary));
	}

	.error-text {
		color: var(--color-error);
	}

	.scope-options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.scope-options label,
	.chapter-list label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.range-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
	}

	select {
		width: 100%;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-normal);
		padding: var(--space-2) var(--space-3);
	}

	.chapter-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2);
		max-height: 12rem;
		overflow: auto;
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
	}

	@media (max-width: 640px) {
		.range-grid,
		.chapter-list {
			grid-template-columns: 1fr;
		}
	}
</style>
