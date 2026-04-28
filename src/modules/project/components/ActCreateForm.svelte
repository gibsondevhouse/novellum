<script lang="ts">
	import type { Act } from '$lib/db/types.js';
	import { Input, PrimaryButton, GhostButton, SurfacePanel } from '$lib/components/ui/index.js';

	interface Props {
		mode?: 'create' | 'edit';
		initial?: Partial<Act>;
		busy?: boolean;
		error?: string | null;
		onSubmit: (data: { title: string; planningNotes: string }) => void;
		onCancel?: () => void;
	}

	let {
		mode = 'create',
		initial = {},
		busy = false,
		error = null,
		onSubmit,
		onCancel,
	}: Props = $props();

	const initialTitle = $derived(initial.title ?? '');
	const initialNotes = $derived(initial.planningNotes ?? '');

	let title = $state('');
	let planningNotes = $state('');
	let initialKey = $state<Partial<Act> | undefined>(undefined);
	$effect(() => {
		if (initial !== initialKey) {
			initialKey = initial;
			title = initialTitle;
			planningNotes = initialNotes;
		}
	});

	let isValid = $derived(title.trim().length > 0);

	function submit(event: Event) {
		event.preventDefault();
		if (!isValid || busy) return;
		onSubmit({ title: title.trim(), planningNotes: planningNotes.trim() });
		if (mode === 'create') {
			title = '';
			planningNotes = '';
		}
	}
</script>

<SurfacePanel class="act-form">
	<form onsubmit={submit}>
		<div class="act-form__row">
			<label class="act-form__label" for="act-title">Title</label>
			<Input
				id="act-title"
				type="text"
				bind:value={title}
				placeholder="e.g. Act One — Departure"
				required
				disabled={busy}
			/>
		</div>

		<div class="act-form__row">
			<label class="act-form__label" for="act-notes">Planning notes</label>
			<textarea
				id="act-notes"
				class="act-form__textarea"
				bind:value={planningNotes}
				rows="3"
				placeholder="Beats, intentions, or shape of the act"
				disabled={busy}
			></textarea>
		</div>

		{#if error}
			<p class="act-form__error" role="alert">{error}</p>
		{/if}

		<div class="act-form__actions">
			{#if onCancel}
				<GhostButton type="button" onclick={onCancel} disabled={busy}>Cancel</GhostButton>
			{/if}
			<PrimaryButton type="submit" disabled={!isValid || busy}>
				{busy ? 'Saving…' : mode === 'create' ? 'Create act' : 'Save changes'}
			</PrimaryButton>
		</div>
	</form>
</SurfacePanel>

<style>
	:global(.act-form) {
		padding: var(--space-4);
	}

	.act-form__row {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.act-form__label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.act-form__textarea {
		width: 100%;
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		resize: vertical;
	}

	.act-form__textarea:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 2px;
	}

	.act-form__error {
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		margin: 0 0 var(--space-3) 0;
	}

	.act-form__actions {
		display: flex;
		gap: var(--space-2);
		justify-content: flex-end;
	}
</style>
