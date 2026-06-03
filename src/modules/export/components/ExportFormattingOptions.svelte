<script lang="ts">
	import type { ExportOptions } from '../types.js';
	import {
		CHAPTER_STYLE_OPTIONS,
		FONT_FAMILY_OPTIONS,
		LINE_SPACING_OPTIONS,
	} from '../constants.js';

	let {
		options,
		includeFrontMatter,
		includeBackMatter,
		disabled = false,
		onOptionsChange,
		onFrontMatterChange,
		onBackMatterChange,
	}: {
		options: ExportOptions;
		includeFrontMatter: boolean;
		includeBackMatter: boolean;
		disabled?: boolean;
		onOptionsChange: (options: ExportOptions) => void;
		onFrontMatterChange: (value: boolean) => void;
		onBackMatterChange: (value: boolean) => void;
	} = $props();

	function updateOptions(next: Partial<ExportOptions>): void {
		onOptionsChange({ ...options, ...next });
	}
</script>

<fieldset class="formatting" {disabled}>
	<legend>Formatting</legend>
	<div class="control-grid">
		<label class="field">
			<span>Font</span>
			<select
				value={options.fontFamily}
				onchange={(event) => updateOptions({ fontFamily: event.currentTarget.value })}
			>
				{#each FONT_FAMILY_OPTIONS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>

		<label class="field">
			<span>Font size</span>
			<input
				type="number"
				min="8"
				max="24"
				step="1"
				value={options.fontSize}
				oninput={(event) => updateOptions({ fontSize: Number(event.currentTarget.value) })}
			/>
		</label>

		<label class="field">
			<span>Line spacing</span>
			<select
				value={options.lineSpacing}
				onchange={(event) => updateOptions({ lineSpacing: Number(event.currentTarget.value) })}
			>
				{#each LINE_SPACING_OPTIONS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>

		<label class="field">
			<span>Chapter headings</span>
			<select
				value={options.chapterStyle}
				onchange={(event) =>
					updateOptions({
						chapterStyle: event.currentTarget.value as ExportOptions['chapterStyle'],
					})}
			>
				{#each CHAPTER_STYLE_OPTIONS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="toggle-row">
		<label>
			<input
				type="checkbox"
				checked={includeFrontMatter}
				onchange={(event) => onFrontMatterChange(event.currentTarget.checked)}
			/>
			<span>Front matter</span>
		</label>
		<label>
			<input
				type="checkbox"
				checked={includeBackMatter}
				onchange={(event) => onBackMatterChange(event.currentTarget.checked)}
			/>
			<span>Back matter</span>
		</label>
	</div>
</fieldset>

<style>
	.formatting {
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

	.control-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
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

	select,
	input[type='number'] {
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

	.toggle-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.toggle-row label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	@media (max-width: 820px) {
		.control-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 540px) {
		.control-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
