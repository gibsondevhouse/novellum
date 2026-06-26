<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	interface Props {
		initialSeedIdea?: string;
		disabled?: boolean;
		busy?: boolean;
		idPrefix?: string;
		onSeedIdeaChange?: (seedIdea: string) => void;
		onSubmit?: (seedIdea: string) => void;
	}

	let {
		initialSeedIdea = '',
		disabled = false,
		busy = false,
		idPrefix = 'nova-brainstorm-input',
		onSeedIdeaChange,
		onSubmit
	}: Props = $props();

	let seedIdea = $state('');
	let initialSeedHydrated = $state(false);

	const titleId = $derived(`${idPrefix}-title`);
	const descriptionId = $derived(`${idPrefix}-description`);
	const inputId = $derived(`${idPrefix}-textarea`);
	const trimmedSeedIdea = $derived(seedIdea.trim());
	const canSubmit = $derived(trimmedSeedIdea.length > 0 && !disabled && !busy);

	$effect(() => {
		if (initialSeedHydrated) return;
		seedIdea = initialSeedIdea;
		initialSeedHydrated = true;
	});

	function handleInput(event: Event): void {
		seedIdea = (event.currentTarget as HTMLTextAreaElement).value;
		onSeedIdeaChange?.(seedIdea);
	}

	function submitSeed(): void {
		if (!canSubmit) return;
		onSubmit?.(trimmedSeedIdea);
	}
</script>

<form
	class="brainstorm-input"
	aria-labelledby={titleId}
	aria-describedby={descriptionId}
	data-testid="nova-brainstorm-input"
	onsubmit={(event) => {
		event.preventDefault();
		submitSeed();
	}}
>
	<div class="brainstorm-input__copy">
		<h3 id={titleId}>Brainstorm seed</h3>
		<p id={descriptionId}>
			Start with a premise, image, conflict, character, or genre mashup.
		</p>
	</div>

	<label class="brainstorm-input__label" for={inputId}>Seed idea</label>
	<textarea
		id={inputId}
		class="brainstorm-input__textarea"
		data-testid="nova-brainstorm-seed"
		bind:value={seedIdea}
		oninput={handleInput}
		placeholder="A court cartographer notices the coastline changes whenever someone lies..."
		disabled={disabled || busy}
		rows="5"
	></textarea>

	<div class="brainstorm-input__actions">
		<p class="brainstorm-input__hint" aria-live="polite">
			{trimmedSeedIdea.length === 0
				? 'Enter a seed idea to generate reviewable proposals.'
				: `${trimmedSeedIdea.length} characters ready.`}
		</p>
		<PrimaryButton
			type="submit"
			size="sm"
			data-testid="nova-brainstorm-generate"
			disabled={!canSubmit}
		>
			<Sparkles aria-hidden="true" />
			<span>{busy ? 'Generating' : 'Generate seeds'}</span>
		</PrimaryButton>
	</div>
</form>

<style>
	.brainstorm-input {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 82%, var(--color-candle) 18%);
		border-radius: var(--radius-md);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-overlay) 90%, var(--color-surface-raised)) 0%,
				var(--color-surface-raised) 100%
			);
		color: var(--color-text-primary);
	}

	.brainstorm-input__copy {
		display: grid;
		gap: var(--space-1);
	}

	.brainstorm-input__copy h3,
	.brainstorm-input__copy p,
	.brainstorm-input__hint {
		margin: 0;
	}

	.brainstorm-input__copy h3 {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}

	.brainstorm-input__copy p,
	.brainstorm-input__hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-normal);
	}

	.brainstorm-input__label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
	}

	.brainstorm-input__textarea {
		width: 100%;
		min-height: calc(var(--space-12) * 2);
		padding: var(--space-2);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
		font: inherit;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		resize: vertical;
	}

	.brainstorm-input__textarea::placeholder {
		color: color-mix(in srgb, var(--color-text-muted) 76%, var(--color-text-secondary));
	}

	.brainstorm-input__textarea:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.brainstorm-input__textarea:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.brainstorm-input__actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
</style>
