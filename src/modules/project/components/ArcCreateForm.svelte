<script lang="ts">
	import type { Arc } from '$lib/db/domain-types';
	import { Input, PrimaryButton, GhostButton, SurfacePanel } from '$lib/components/ui/index.js';

	interface Props {
		mode?: 'create' | 'edit';
		initial?: Partial<Arc>;
		busy?: boolean;
		error?: string | null;
		onSubmit: (data: { title: string; purpose: string; description: string }) => void;
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
	const initialPurpose = $derived(initial.purpose ?? '');
	const initialDescription = $derived(initial.description ?? '');

	let title = $state('');
	let purpose = $state('');
	let description = $state('');

	let initialKey = $state<Partial<Arc> | undefined>(undefined);
	$effect(() => {
		if (initial !== initialKey) {
			initialKey = initial;
			title = initialTitle;
			purpose = initialPurpose;
			description = initialDescription;
		}
	});

	let isValid = $derived(title.trim().length > 0);

	function submit(event: Event) {
		event.preventDefault();
		if (!isValid || busy) return;
		onSubmit({ title: title.trim(), purpose: purpose.trim(), description: description.trim() });
		if (mode === 'create') {
			title = '';
			purpose = '';
			description = '';
		}
	}
</script>

<SurfacePanel class="arc-form">
	<form onsubmit={submit}>
		<div class="arc-form__row">
			<label class="arc-form__label" for="arc-title">Title</label>
			<Input
				id="arc-title"
				type="text"
				bind:value={title}
				placeholder="e.g. Aria's Redemption"
				required
				disabled={busy}
			/>
		</div>

		<div class="arc-form__row">
			<label class="arc-form__label" for="arc-purpose">Purpose</label>
			<Input
				id="arc-purpose"
				type="text"
				bind:value={purpose}
				placeholder="What this arc drives in the story"
				disabled={busy}
			/>
		</div>

		<div class="arc-form__row">
			<label class="arc-form__label" for="arc-description">Description</label>
			<textarea
				id="arc-description"
				class="arc-form__textarea"
				bind:value={description}
				rows="3"
				placeholder="Brief description of the arc"
				disabled={busy}
			></textarea>
		</div>

		{#if error}
			<p class="arc-form__error" role="alert">{error}</p>
		{/if}

		<div class="arc-form__actions">
			{#if onCancel}
				<GhostButton type="button" onclick={onCancel} disabled={busy}>Cancel</GhostButton>
			{/if}
			<PrimaryButton type="submit" disabled={!isValid || busy}>
				{busy ? 'Saving…' : mode === 'create' ? 'Create arc' : 'Save changes'}
			</PrimaryButton>
		</div>
	</form>
</SurfacePanel>

<style>
	:global(.arc-form) {
		padding: var(--space-4);
	}

	.arc-form__row {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.arc-form__label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.arc-form__textarea {
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

	.arc-form__textarea:focus-visible {
		outline: 2px solid var(--color-nova-blue);
		outline-offset: 2px;
	}

	.arc-form__error {
		color: var(--color-danger, var(--color-text-primary));
		font-size: var(--text-sm);
		margin: 0 0 var(--space-3) 0;
	}

	.arc-form__actions {
		display: flex;
		gap: var(--space-2);
		justify-content: flex-end;
	}
</style>
