<script lang="ts">
	import { untrack } from 'svelte';
	import type { GlossaryTerm } from '$lib/db/domain-types';
	import { GhostButton, Input, PrimaryButton } from '$lib/components/ui/index.js';
	import type { GlossaryTermFormData } from '../services/story-bible-crud.js';

	let {
		term = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		term?: GlossaryTerm | null;
		saving?: boolean;
		onSave: (data: GlossaryTermFormData) => void;
		onCancel: () => void;
	}>();

	let label = $state(untrack(() => term?.term ?? ''));
	let definition = $state(untrack(() => term?.definition ?? ''));
	let pronunciation = $state(untrack(() => term?.pronunciation ?? ''));
	let category = $state(untrack(() => term?.category ?? ''));
	let termError = $state('');

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!label.trim()) {
			termError = 'Term is required.';
			return;
		}

		termError = '';
		onSave({
			term: label.trim(),
			definition,
			pronunciation: pronunciation.trim(),
			category: category.trim(),
		});
	}
</script>

<form class="story-bible-form" onsubmit={handleSubmit}>
	<Input
		id="story-bible-glossary-term"
		label="Term"
		bind:value={label}
		error={termError}
		aria-required="true"
		aria-invalid={!!termError}
	/>
	<Input id="story-bible-glossary-pronunciation" label="Pronunciation" bind:value={pronunciation} />
	<Input id="story-bible-glossary-category" label="Category" bind:value={category} />
	<label class="field">
		<span>Definition</span>
		<textarea bind:value={definition} rows="5"></textarea>
	</label>
	<div class="form-actions">
		<GhostButton type="button" onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton type="submit" disabled={saving}>
			{saving ? 'Saving...' : term ? 'Save Term' : 'Create Term'}
		</PrimaryButton>
	</div>
</form>

<style>
	.story-bible-form {
		display: grid;
		gap: var(--space-4);
	}

	.field {
		display: grid;
		gap: var(--space-1);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	textarea {
		width: 100%;
		resize: vertical;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
		padding: var(--space-2) var(--space-3);
		font: inherit;
		text-transform: none;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-border-focus);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
</style>
