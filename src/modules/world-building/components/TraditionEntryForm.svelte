<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/domain-types';
	import type { EntityFormCallbacks } from '../types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	type TraditionType =
		| 'ritual'
		| 'social'
		| 'seasonal'
		| 'religious'
		| 'inherited-behavior';

	type TraditionPayload = {
		kind: 'tradition';
		traditionType: TraditionType | '';
		description: string;
		whenItOccurs: string;
		participants: string;
		intendedMeaning: string;
		actualFunction: string;
		useInStory: string;
		emotionalTone: string;
		realmIds: string[];
		characterIds: string[];
		factionIds: string[];
		threadIds: string[];
	};

	const TRADITION_TYPES: Array<{ value: TraditionType; label: string }> = [
		{ value: 'ritual', label: 'Ritual' },
		{ value: 'social', label: 'Social' },
		{ value: 'seasonal', label: 'Seasonal' },
		{ value: 'religious', label: 'Religious' },
		{ value: 'inherited-behavior', label: 'Inherited Behavior' },
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

	function parseEntryPayload(source: LoreEntry | null): TraditionPayload {
		if (!source) {
			return {
				kind: 'tradition',
				traditionType: '',
				description: '',
				whenItOccurs: '',
				participants: '',
				intendedMeaning: '',
				actualFunction: '',
				useInStory: '',
				emotionalTone: '',
				realmIds: [],
				characterIds: [],
				factionIds: [],
				threadIds: [],
			};
		}

		try {
			const parsed = JSON.parse(source.content) as Partial<TraditionPayload>;
			if (parsed.kind === 'tradition') {
				return {
					kind: 'tradition',
					traditionType: parsed.traditionType ?? '',
					description: parsed.description ?? '',
					whenItOccurs: parsed.whenItOccurs ?? '',
					participants: parsed.participants ?? '',
					intendedMeaning: parsed.intendedMeaning ?? '',
					actualFunction: parsed.actualFunction ?? '',
					useInStory: parsed.useInStory ?? '',
					emotionalTone: parsed.emotionalTone ?? '',
					realmIds: parsed.realmIds ?? [],
					characterIds: parsed.characterIds ?? [],
					factionIds: parsed.factionIds ?? [],
					threadIds: parsed.threadIds ?? [],
				};
			}
		} catch {
			// Legacy lore entry content may not be JSON.
		}

		const categoryType = source.category.startsWith('tradition:')
			? (source.category.slice(10) as TraditionType)
			: '';

		return {
			kind: 'tradition',
			traditionType: categoryType,
			description: source.content,
			whenItOccurs: '',
			participants: '',
			intendedMeaning: '',
			actualFunction: '',
			useInStory: '',
			emotionalTone: '',
			realmIds: [],
			characterIds: [],
			factionIds: [],
			threadIds: [],
		};
	}

	const initial = untrack(() => parseEntryPayload(entry));
	let name = $state(untrack(() => entry?.title ?? ''));
	let traditionType = $state(initial.traditionType);
	let description = $state(initial.description);
	let whenItOccurs = $state(initial.whenItOccurs);
	let participants = $state(initial.participants);
	let intendedMeaning = $state(initial.intendedMeaning);
	let actualFunction = $state(initial.actualFunction);
	let useInStory = $state(initial.useInStory);
	let emotionalTone = $state(initial.emotionalTone);
	let realmIdsRaw = $state(joinCommaSeparated(initial.realmIds));
	let characterIdsRaw = $state(joinCommaSeparated(initial.characterIds));
	let factionIdsRaw = $state(joinCommaSeparated(initial.factionIds));
	let threadIdsRaw = $state(joinCommaSeparated(initial.threadIds));
	let nameError = $state('');
	let typeError = $state('');
	let useError = $state('');

	function handleSubmit() {
		nameError = '';
		typeError = '';
		useError = '';

		if (!name.trim()) nameError = 'Name is required.';
		if (!traditionType) typeError = 'Tradition type is required.';
		if (!useInStory.trim()) {
			useError = 'Traditions must be visible in scenes. Add use in story.';
		}
		if (nameError || typeError || useError) return;

		const payload: TraditionPayload = {
			kind: 'tradition',
			traditionType,
			description: description.trim(),
			whenItOccurs: whenItOccurs.trim(),
			participants: participants.trim(),
			intendedMeaning: intendedMeaning.trim(),
			actualFunction: actualFunction.trim(),
			useInStory: useInStory.trim(),
			emotionalTone: emotionalTone.trim(),
			realmIds: splitCommaSeparated(realmIdsRaw),
			characterIds: splitCommaSeparated(characterIdsRaw),
			factionIds: splitCommaSeparated(factionIdsRaw),
			threadIds: splitCommaSeparated(threadIdsRaw),
		};

		onSave({
			title: name.trim(),
			category: `tradition:${traditionType}`,
			content: JSON.stringify(payload, null, 2),
			tags: ['archive', 'tradition', traditionType],
		});
	}
</script>

<div class="dossier-form">
	<section class="dossier-form-section">
		<h3>Core Identity</h3>
		<div class="dossier-form-grid dossier-form-grid--double">
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-name">Name <span aria-hidden="true">*</span></label>
				<input id="tradition-name" class="dossier-form-input" class:dossier-form-input-error={!!nameError} type="text" bind:value={name} />
				{#if nameError}<p class="dossier-form-error-text">{nameError}</p>{/if}
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-type">Type <span aria-hidden="true">*</span></label>
				<select id="tradition-type" class="dossier-form-input" class:dossier-form-input-error={!!typeError} bind:value={traditionType}>
					<option value="">Select tradition type</option>
					{#each TRADITION_TYPES as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				{#if typeError}<p class="dossier-form-error-text">{typeError}</p>{/if}
			</div>
		</div>
	</section>

	<section class="dossier-form-section">
		<h3>Practice</h3>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="tradition-description">Description</label>
			<textarea id="tradition-description" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={description}></textarea>
		</div>
		<div class="dossier-form-grid dossier-form-grid--double">
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-when">When It Occurs</label>
				<input id="tradition-when" class="dossier-form-input" type="text" bind:value={whenItOccurs} />
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-participants">Participants</label>
				<input id="tradition-participants" class="dossier-form-input" type="text" bind:value={participants} />
			</div>
		</div>
	</section>

	<section class="dossier-form-section">
		<h3>Meaning</h3>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="tradition-intended">Intended Meaning</label>
			<textarea id="tradition-intended" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={intendedMeaning}></textarea>
		</div>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="tradition-actual">Actual Function <span class="dossier-form-hint">(optional)</span></label>
			<textarea id="tradition-actual" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={actualFunction}></textarea>
		</div>
	</section>

	<section class="dossier-form-section">
		<h3>Narrative Function</h3>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="tradition-use">Use in Story</label>
			<textarea id="tradition-use" class="dossier-form-input dossier-form-textarea" class:dossier-form-input-error={!!useError} rows={3} bind:value={useInStory}></textarea>
			{#if useError}<p class="dossier-form-error-text">{useError}</p>{/if}
		</div>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="tradition-tone">Emotional Tone</label>
			<input id="tradition-tone" class="dossier-form-input" type="text" bind:value={emotionalTone} />
		</div>
	</section>

	<section class="dossier-form-section">
		<h3>Relationships</h3>
		<div class="dossier-form-grid dossier-form-grid--double">
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-realm-ids">Realm IDs</label>
				<input id="tradition-realm-ids" class="dossier-form-input" type="text" bind:value={realmIdsRaw} />
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-character-ids">Character IDs</label>
				<input id="tradition-character-ids" class="dossier-form-input" type="text" bind:value={characterIdsRaw} />
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-faction-ids">Faction IDs</label>
				<input id="tradition-faction-ids" class="dossier-form-input" type="text" bind:value={factionIdsRaw} />
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="tradition-thread-ids">Thread IDs</label>
				<input id="tradition-thread-ids" class="dossier-form-input" type="text" bind:value={threadIdsRaw} />
			</div>
		</div>
	</section>

	<div class="dossier-form-actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : entry ? 'Save Tradition' : 'Create Tradition'}</PrimaryButton>
	</div>
</div>
