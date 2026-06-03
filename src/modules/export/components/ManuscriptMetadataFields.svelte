<script lang="ts">
	import type { ManuscriptMetadata } from '../types.js';

	let {
		value,
		disabled = false,
		onChange,
	}: {
		value: ManuscriptMetadata;
		disabled?: boolean;
		onChange: (value: ManuscriptMetadata) => void;
	} = $props();

	function updateField(field: keyof ManuscriptMetadata, nextValue: string): void {
		onChange({ ...value, [field]: nextValue });
	}
</script>

<fieldset class="metadata" {disabled}>
	<legend>Metadata</legend>
	<div class="field-grid">
		<label class="field">
			<span>Title</span>
			<input
				name="title"
				value={value.title ?? ''}
				autocomplete="off"
				oninput={(event) => updateField('title', event.currentTarget.value)}
			/>
		</label>

		<label class="field">
			<span>Author</span>
			<input
				name="author"
				value={value.author ?? ''}
				autocomplete="off"
				oninput={(event) => updateField('author', event.currentTarget.value)}
			/>
		</label>
	</div>

	<details class="optional-fields">
		<summary>Optional metadata</summary>
		<div class="field-grid">
			<label class="field">
				<span>Subtitle</span>
				<input
					name="subtitle"
					value={value.subtitle ?? ''}
					autocomplete="off"
					oninput={(event) => updateField('subtitle', event.currentTarget.value)}
				/>
			</label>

			<label class="field">
				<span>Copyright</span>
				<input
					name="copyright"
					value={value.copyright ?? ''}
					autocomplete="off"
					oninput={(event) => updateField('copyright', event.currentTarget.value)}
				/>
			</label>
		</div>

		<label class="field">
			<span>Synopsis</span>
			<textarea
				name="synopsis"
				rows="3"
				value={value.synopsis ?? ''}
				oninput={(event) => updateField('synopsis', event.currentTarget.value)}
			></textarea>
			<span class="field__hint">Used for EPUB description and manuscript front matter.</span>
		</label>

		<label class="field">
			<span>Dedication</span>
			<textarea
				name="dedication"
				rows="2"
				value={value.dedication ?? ''}
				oninput={(event) => updateField('dedication', event.currentTarget.value)}
			></textarea>
		</label>
	</details>
</fieldset>

<style>
	.metadata {
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

	.field-grid {
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

	input,
	textarea {
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

	textarea {
		resize: vertical;
		min-height: 4.5rem;
	}

	.optional-fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	summary {
		cursor: pointer;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.optional-fields[open] {
		display: flex;
	}

	.optional-fields[open] > summary {
		margin-bottom: var(--space-3);
	}

	.field__hint {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-muted);
	}

	@media (max-width: 640px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
