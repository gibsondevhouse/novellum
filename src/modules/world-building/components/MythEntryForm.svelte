<script lang="ts">
	import { untrack } from 'svelte';
	import type { LoreEntry } from '$lib/db/domain-types';
	import type { EntityFormCallbacks } from '../types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	type MythType = 'origin' | 'warning' | 'prophetic' | 'heroic' | 'distorted-truth';

	type MythPayload = {
		kind: 'myth';
		mythType: MythType | '';
		summary: string;
		fullAccount: string;
		perceivedTruth: string;
		actualTruth: string;
		culturalImpact: string;
		fearDesireTriggered: string;
		realmIds: string[];
		characterIds: string[];
		threadIds: string[];
	};

	const MYTH_TYPE_OPTIONS: Array<{ value: MythType; label: string }> = [
		{ value: 'origin', label: 'Origin' },
		{ value: 'warning', label: 'Warning' },
		{ value: 'prophetic', label: 'Prophetic' },
		{ value: 'heroic', label: 'Heroic' },
		{ value: 'distorted-truth', label: 'Distorted Truth' },
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

	function parseEntryPayload(source: LoreEntry | null): MythPayload {
		if (!source) {
			return {
				kind: 'myth',
				mythType: '',
				summary: '',
				fullAccount: '',
				perceivedTruth: '',
				actualTruth: '',
				culturalImpact: '',
				fearDesireTriggered: '',
				realmIds: [],
				characterIds: [],
				threadIds: [],
			};
		}

		try {
			const parsed = JSON.parse(source.content) as Partial<MythPayload>;
			if (parsed.kind === 'myth') {
				return {
					kind: 'myth',
					mythType: parsed.mythType ?? '',
					summary: parsed.summary ?? '',
					fullAccount: parsed.fullAccount ?? '',
					perceivedTruth: parsed.perceivedTruth ?? '',
					actualTruth: parsed.actualTruth ?? '',
					culturalImpact: parsed.culturalImpact ?? '',
					fearDesireTriggered: parsed.fearDesireTriggered ?? '',
					realmIds: parsed.realmIds ?? [],
					characterIds: parsed.characterIds ?? [],
					threadIds: parsed.threadIds ?? [],
				};
			}
		} catch {
			// Legacy lore entry content may not be JSON.
		}

		const categoryType = source.category.startsWith('myth:')
			? (source.category.slice(5) as MythType)
			: '';

		return {
			kind: 'myth',
			mythType: categoryType,
			summary: source.content,
			fullAccount: '',
			perceivedTruth: '',
			actualTruth: '',
			culturalImpact: '',
			fearDesireTriggered: '',
			realmIds: [],
			characterIds: [],
			threadIds: [],
		};
	}

	const initial = untrack(() => parseEntryPayload(entry));
	let name = $state(untrack(() => entry?.title ?? ''));
	let mythType = $state(initial.mythType);
	let summary = $state(initial.summary);
	let fullAccount = $state(initial.fullAccount);
	let perceivedTruth = $state(initial.perceivedTruth);
	let actualTruth = $state(initial.actualTruth);
	let culturalImpact = $state(initial.culturalImpact);
	let fearDesireTriggered = $state(initial.fearDesireTriggered);
	let realmIdsRaw = $state(joinCommaSeparated(initial.realmIds));
	let characterIdsRaw = $state(joinCommaSeparated(initial.characterIds));
	let threadIdsRaw = $state(joinCommaSeparated(initial.threadIds));
	let nameError = $state('');
	let typeError = $state('');
	let impactError = $state('');

	function handleSubmit() {
		nameError = '';
		typeError = '';
		impactError = '';

		if (!name.trim()) nameError = 'Name is required.';
		if (!mythType) typeError = 'Myth type is required.';
		if (!culturalImpact.trim()) {
			impactError = 'A myth must influence behavior. Add cultural impact.';
		}

		if (nameError || typeError || impactError) return;

		const payload: MythPayload = {
			kind: 'myth',
			mythType,
			summary: summary.trim(),
			fullAccount: fullAccount.trim(),
			perceivedTruth: perceivedTruth.trim(),
			actualTruth: actualTruth.trim(),
			culturalImpact: culturalImpact.trim(),
			fearDesireTriggered: fearDesireTriggered.trim(),
			realmIds: splitCommaSeparated(realmIdsRaw),
			characterIds: splitCommaSeparated(characterIdsRaw),
			threadIds: splitCommaSeparated(threadIdsRaw),
		};

		onSave({
			title: name.trim(),
			category: `myth:${mythType}`,
			content: JSON.stringify(payload, null, 2),
			tags: ['archive', 'myth', mythType],
		});
	}
</script>

<div class="dossier-form">
	<section class="dossier-form-section">
		<h3>Core Identity</h3>
		<div class="dossier-form-grid dossier-form-grid--double">
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="myth-name">Name <span aria-hidden="true">*</span></label>
				<input id="myth-name" class="dossier-form-input" class:dossier-form-input-error={!!nameError} type="text" bind:value={name} />
				{#if nameError}<p class="dossier-form-error-text">{nameError}</p>{/if}
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="myth-type">Type <span aria-hidden="true">*</span></label>
				<select id="myth-type" class="dossier-form-input" class:dossier-form-input-error={!!typeError} bind:value={mythType}>
					<option value="">Select myth type</option>
					{#each MYTH_TYPE_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				{#if typeError}<p class="dossier-form-error-text">{typeError}</p>{/if}
			</div>
		</div>
	</section>

	<section class="dossier-form-section">
		<h3>Narrative Content</h3>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="myth-summary">Summary</label>
			<textarea id="myth-summary" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={summary}></textarea>
		</div>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="myth-full-account">Full Account</label>
			<textarea id="myth-full-account" class="dossier-form-input dossier-form-textarea" rows={5} bind:value={fullAccount}></textarea>
		</div>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="myth-perceived-truth">Perceived Truth</label>
			<textarea id="myth-perceived-truth" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={perceivedTruth}></textarea>
		</div>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="myth-actual-truth">Actual Truth <span class="dossier-form-hint">(optional)</span></label>
			<textarea id="myth-actual-truth" class="dossier-form-input dossier-form-textarea" rows={3} bind:value={actualTruth}></textarea>
		</div>
	</section>

	<section class="dossier-form-section">
		<h3>Influence</h3>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="myth-cultural-impact">Cultural Impact</label>
			<textarea id="myth-cultural-impact" class="dossier-form-input dossier-form-textarea" class:dossier-form-input-error={!!impactError} rows={3} bind:value={culturalImpact}></textarea>
			{#if impactError}<p class="dossier-form-error-text">{impactError}</p>{/if}
		</div>
		<div class="dossier-form-field">
			<label class="dossier-form-label" for="myth-fear-desire">Fear / Desire Triggered</label>
			<textarea id="myth-fear-desire" class="dossier-form-input dossier-form-textarea" rows={2} bind:value={fearDesireTriggered}></textarea>
		</div>
	</section>

	<section class="dossier-form-section">
		<h3>Relationships</h3>
		<div class="dossier-form-grid dossier-form-grid--double">
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="myth-realm-ids">Realm IDs</label>
				<input id="myth-realm-ids" class="dossier-form-input" type="text" bind:value={realmIdsRaw} />
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="myth-character-ids">Character IDs</label>
				<input id="myth-character-ids" class="dossier-form-input" type="text" bind:value={characterIdsRaw} />
			</div>
			<div class="dossier-form-field">
				<label class="dossier-form-label" for="myth-thread-ids">Thread IDs</label>
				<input id="myth-thread-ids" class="dossier-form-input" type="text" bind:value={threadIdsRaw} />
			</div>
		</div>
	</section>

	<div class="dossier-form-actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : entry ? 'Save Myth' : 'Create Myth'}</PrimaryButton>
	</div>
</div>
