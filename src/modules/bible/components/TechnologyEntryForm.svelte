<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/types.js';
	import type { EntityFormCallbacks } from '../types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	type TechnologyType = 'mechanical' | 'digital' | 'ritualistic' | 'hybrid';
	type AccessType = 'public' | 'restricted' | 'elite-only' | 'lost-knowledge' | '';

	type TechnologyPayload = {
		kind: 'technology';
		technologyType: TechnologyType | '';
		whatItDoes: string;
		howItWorks: string;
		limitations: string;
		useCase: string;
		access: AccessType;
		consequences: string;
		realmIds: string[];
		factionIds: string[];
		characterIds: string[];
		threadIds: string[];
	};

	const TECHNOLOGY_TYPES: Array<{ value: TechnologyType; label: string }> = [
		{ value: 'mechanical', label: 'Mechanical' },
		{ value: 'digital', label: 'Digital' },
		{ value: 'ritualistic', label: 'Ritualistic' },
		{ value: 'hybrid', label: 'Hybrid' },
	];

	const ACCESS_OPTIONS: Array<{ value: AccessType; label: string }> = [
		{ value: '', label: 'Select access' },
		{ value: 'public', label: 'Public' },
		{ value: 'restricted', label: 'Restricted' },
		{ value: 'elite-only', label: 'Elite-only' },
		{ value: 'lost-knowledge', label: 'Lost knowledge' },
	];

	let {
		entry = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		entry?: LoreEntry | null;
		saving?: boolean;
	} & EntityFormCallbacks<LoreEntry>>();

	function splitCommaSeparated(raw: string): string[] {
		return raw
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean);
	}

	function joinCommaSeparated(values: string[] | undefined): string {
		return (values ?? []).join(', ');
	}

	function parseEntryPayload(source: LoreEntry | null): TechnologyPayload {
		if (!source) {
			return {
				kind: 'technology',
				technologyType: '',
				whatItDoes: '',
				howItWorks: '',
				limitations: '',
				useCase: '',
				access: '',
				consequences: '',
				realmIds: [],
				factionIds: [],
				characterIds: [],
				threadIds: [],
			};
		}

		try {
			const parsed = JSON.parse(source.content) as Partial<TechnologyPayload>;
			if (parsed.kind === 'technology') {
				return {
					kind: 'technology',
					technologyType: parsed.technologyType ?? '',
					whatItDoes: parsed.whatItDoes ?? '',
					howItWorks: parsed.howItWorks ?? '',
					limitations: parsed.limitations ?? '',
					useCase: parsed.useCase ?? '',
					access: parsed.access ?? '',
					consequences: parsed.consequences ?? '',
					realmIds: parsed.realmIds ?? [],
					factionIds: parsed.factionIds ?? [],
					characterIds: parsed.characterIds ?? [],
					threadIds: parsed.threadIds ?? [],
				};
			}
		} catch {
			// Legacy lore entry content may not be JSON.
		}

		const categoryType = source.category.startsWith('technology:')
			? (source.category.slice(11) as TechnologyType)
			: '';

		return {
			kind: 'technology',
			technologyType: categoryType,
			whatItDoes: source.content,
			howItWorks: '',
			limitations: '',
			useCase: '',
			access: '',
			consequences: '',
			realmIds: [],
			factionIds: [],
			characterIds: [],
			threadIds: [],
		};
	}

	const initial = untrack(() => parseEntryPayload(entry));
	let name = $state(untrack(() => entry?.title ?? ''));
	let technologyType = $state(initial.technologyType);
	let whatItDoes = $state(initial.whatItDoes);
	let howItWorks = $state(initial.howItWorks);
	let limitations = $state(initial.limitations);
	let useCase = $state(initial.useCase);
	let access = $state(initial.access);
	let consequences = $state(initial.consequences);
	let realmIdsRaw = $state(joinCommaSeparated(initial.realmIds));
	let factionIdsRaw = $state(joinCommaSeparated(initial.factionIds));
	let characterIdsRaw = $state(joinCommaSeparated(initial.characterIds));
	let threadIdsRaw = $state(joinCommaSeparated(initial.threadIds));
	let nameError = $state('');
	let typeError = $state('');
	let limitationsError = $state('');

	function handleSubmit() {
		nameError = '';
		typeError = '';
		limitationsError = '';

		if (!name.trim()) nameError = 'Name is required.';
		if (!technologyType) typeError = 'Technology type is required.';
		if (!limitations.trim()) {
			limitationsError = 'Every technology must have a limitation.';
		}
		if (nameError || typeError || limitationsError) return;

		const payload: TechnologyPayload = {
			kind: 'technology',
			technologyType,
			whatItDoes: whatItDoes.trim(),
			howItWorks: howItWorks.trim(),
			limitations: limitations.trim(),
			useCase: useCase.trim(),
			access,
			consequences: consequences.trim(),
			realmIds: splitCommaSeparated(realmIdsRaw),
			factionIds: splitCommaSeparated(factionIdsRaw),
			characterIds: splitCommaSeparated(characterIdsRaw),
			threadIds: splitCommaSeparated(threadIdsRaw),
		};

		onSave({
			title: name.trim(),
			category: `technology:${technologyType}`,
			content: JSON.stringify(payload, null, 2),
			tags: ['archive', 'technology', technologyType],
		});
	}
</script>

<div class="archive-form">
	<section class="archive-section">
		<h3>Core Identity</h3>
		<div class="archive-grid archive-grid--double">
			<div class="archive-field">
				<label class="archive-label" for="technology-name">Name <span aria-hidden="true">*</span></label>
				<input id="technology-name" class="archive-input" class:archive-input-error={!!nameError} type="text" bind:value={name} />
				{#if nameError}<p class="archive-error-text">{nameError}</p>{/if}
			</div>
			<div class="archive-field">
				<label class="archive-label" for="technology-type">Type <span aria-hidden="true">*</span></label>
				<select id="technology-type" class="archive-input" class:archive-input-error={!!typeError} bind:value={technologyType}>
					<option value="">Select technology type</option>
					{#each TECHNOLOGY_TYPES as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				{#if typeError}<p class="archive-error-text">{typeError}</p>{/if}
			</div>
		</div>
	</section>

	<section class="archive-section">
		<h3>Functional Description</h3>
		<div class="archive-field">
			<label class="archive-label" for="technology-what">What It Does</label>
			<textarea id="technology-what" class="archive-input archive-textarea" rows={3} bind:value={whatItDoes}></textarea>
		</div>
		<div class="archive-field">
			<label class="archive-label" for="technology-how">How It Works</label>
			<textarea id="technology-how" class="archive-input archive-textarea" rows={3} bind:value={howItWorks}></textarea>
		</div>
		<div class="archive-field">
			<label class="archive-label" for="technology-limitations">Limitations</label>
			<textarea id="technology-limitations" class="archive-input archive-textarea" class:archive-input-error={!!limitationsError} rows={3} bind:value={limitations}></textarea>
			{#if limitationsError}<p class="archive-error-text">{limitationsError}</p>{/if}
		</div>
	</section>

	<section class="archive-section">
		<h3>Narrative Function</h3>
		<div class="archive-grid archive-grid--double">
			<div class="archive-field">
				<label class="archive-label" for="technology-use-case">Use Case</label>
				<input id="technology-use-case" class="archive-input" type="text" bind:value={useCase} />
			</div>
			<div class="archive-field">
				<label class="archive-label" for="technology-access">Access</label>
				<select id="technology-access" class="archive-input" bind:value={access}>
					{#each ACCESS_OPTIONS as option (option.value + option.label)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="archive-field">
			<label class="archive-label" for="technology-consequences">Consequences</label>
			<textarea id="technology-consequences" class="archive-input archive-textarea" rows={3} bind:value={consequences}></textarea>
		</div>
	</section>

	<section class="archive-section">
		<h3>Relationships</h3>
		<div class="archive-grid archive-grid--double">
			<div class="archive-field">
				<label class="archive-label" for="technology-realm-ids">Realm IDs</label>
				<input id="technology-realm-ids" class="archive-input" type="text" bind:value={realmIdsRaw} />
			</div>
			<div class="archive-field">
				<label class="archive-label" for="technology-faction-ids">Faction IDs</label>
				<input id="technology-faction-ids" class="archive-input" type="text" bind:value={factionIdsRaw} />
			</div>
			<div class="archive-field">
				<label class="archive-label" for="technology-character-ids">Character IDs</label>
				<input id="technology-character-ids" class="archive-input" type="text" bind:value={characterIdsRaw} />
			</div>
			<div class="archive-field">
				<label class="archive-label" for="technology-thread-ids">Thread IDs</label>
				<input id="technology-thread-ids" class="archive-input" type="text" bind:value={threadIdsRaw} />
			</div>
		</div>
	</section>

	<div class="archive-actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : entry ? 'Save Technology' : 'Create Technology'}</PrimaryButton>
	</div>
</div>

<style>
	.archive-form {
		display: grid;
		gap: var(--space-6);
	}

	.archive-section {
		display: grid;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	h3 {
		margin: 0;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.archive-grid {
		display: grid;
		gap: var(--space-4);
	}

	.archive-grid--double {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.archive-field {
		display: grid;
		gap: var(--space-2);
	}

	.archive-label {
		font-size: var(--text-xs);
		letter-spacing: 0.03em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.archive-input {
		width: 100%;
		padding: 0.2rem 0.25rem;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-primary);
		font: inherit;
	}

	.archive-input:hover {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.archive-input:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
	}

	.archive-textarea {
		min-height: 6rem;
		resize: vertical;
	}

	.archive-input-error {
		border-color: var(--color-error);
	}

	.archive-error-text {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-error-on-dark);
	}

	.archive-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
	}

	@media (max-width: 860px) {
		.archive-grid--double {
			grid-template-columns: 1fr;
		}
	}
</style>
