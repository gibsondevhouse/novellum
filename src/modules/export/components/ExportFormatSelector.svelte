<script lang="ts">
	import type { ExportFormat } from '../types.js';
	import { EXPORT_FORMAT_OPTIONS } from '../constants.js';

	let {
		value,
		disabled = false,
		onChange,
	}: {
		value: ExportFormat;
		disabled?: boolean;
		onChange: (value: ExportFormat) => void;
	} = $props();

	function labelFor(format: ExportFormat, label: string): string {
		if (format === 'backup_zip') return 'Project backup';
		return label;
	}

	function descriptionFor(format: ExportFormat): string {
		if (format === 'markdown') return 'Plain manuscript file for editing and archive workflows.';
		if (format === 'docx') return 'Word-compatible manuscript document.';
		if (format === 'epub') return 'Ebook draft with metadata for reader testing.';
		return 'Portable project backup, separate from manuscript output.';
	}
</script>

<fieldset class="selector" {disabled}>
	<legend>Format</legend>
	<div class="format-grid" role="radiogroup" aria-label="Export format">
		{#each EXPORT_FORMAT_OPTIONS as option (option.value)}
			<label class:format-card--selected={value === option.value} class="format-card">
				<input
					type="radio"
					name="manuscript-format"
					value={option.value}
					checked={value === option.value}
					onchange={() => onChange(option.value)}
				/>
				<span class="format-card__body">
					<span class="format-card__title">{labelFor(option.value, option.label)}</span>
					<span class="format-card__description">{descriptionFor(option.value)}</span>
					{#if value === option.value}
						<span class="format-card__selected">Selected</span>
					{/if}
				</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	.selector {
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

	.format-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.format-card {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
		cursor: pointer;
		min-height: 7rem;
	}

	.format-card--selected {
		border-color: var(--color-border-strong);
		background: var(--color-surface-overlay);
	}

	input {
		margin-top: var(--space-1);
	}

	.format-card__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.format-card__title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.format-card__description {
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.format-card__selected {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	@media (max-width: 860px) {
		.format-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 560px) {
		.format-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
