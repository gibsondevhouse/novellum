<script lang="ts">
	import { untrack } from 'svelte';
	import type { Location } from '$lib/db/domain-types';
	import { GhostButton, SectionHeader, SurfacePanel } from '$lib/components/ui/index.js';
	import type { EntityFormCallbacks } from '../types.js';
	import { REALM_TYPE_OPTIONS, joinCommaSeparated, splitCommaSeparated } from '../narrative-locations.js';

	let {
		realm = null,
		onSave,
	} = $props<{
		realm?: Location | null;
		saving?: boolean;
	} & EntityFormCallbacks<Location>>();

	let name = $state(untrack(() => realm?.name ?? ''));
	let description = $state(untrack(() => realm?.description ?? ''));
	let tagsRaw = $state(untrack(() => joinCommaSeparated(realm?.tags)));
	let realmType = $state(untrack(() => realm?.realmType ?? ''));
	let realityRules = $state(untrack(() => realm?.realityRules ?? ''));
	let culturalBaseline = $state(untrack(() => realm?.culturalBaseline ?? ''));
	let powerStructure = $state(untrack(() => realm?.powerStructure ?? ''));
	let conflictPressure = $state(untrack(() => realm?.conflictPressure ?? ''));
	let storyRole = $state(untrack(() => realm?.storyRole ?? ''));
	let tone = $state(untrack(() => realm?.tone ?? ''));
	let landmarkIdsRaw = $state(untrack(() => joinCommaSeparated(realm?.landmarkIds)));
	let factionIdsRaw = $state(untrack(() => joinCommaSeparated(realm?.factionIds)));
	let characterIdsRaw = $state(untrack(() => joinCommaSeparated(realm?.characterIds)));
	let threadIdsRaw = $state(untrack(() => joinCommaSeparated(realm?.threadIds)));
	let nameError = $state('');
	let typeError = $state('');
	let isCoreCollapsed = $state(false);
	let isEnvironmentCollapsed = $state(false);
	let isNarrativeCollapsed = $state(false);
	let isRelationshipsCollapsed = $state(false);
	let saveTimeoutId = $state<ReturnType<typeof setTimeout> | null>(null);

	function submitIfValid() {
		nameError = '';
		typeError = '';

		if (!name.trim()) {
			nameError = 'Name is required.';
		}

		if (!realmType) {
			typeError = 'Realm type is required.';
		}

		if (nameError || typeError) {
			return;
		}

		void onSave({
			name: name.trim(),
			description: description.trim(),
			tags: splitCommaSeparated(tagsRaw),
			kind: 'realm',
			realmType: realmType as Location['realmType'],
			realityRules: realityRules.trim(),
			culturalBaseline: culturalBaseline.trim(),
			powerStructure: powerStructure.trim(),
			conflictPressure: conflictPressure.trim(),
			storyRole: storyRole.trim(),
			tone: tone.trim(),
			realmId: '',
			environment: '',
			notableFeatures: [],
			purpose: '',
			activityType: '',
			emotionalTone: '',
			changeOverTime: '',
			landmarkIds: splitCommaSeparated(landmarkIdsRaw),
			factionIds: splitCommaSeparated(factionIdsRaw),
			characterIds: splitCommaSeparated(characterIdsRaw),
			threadIds: splitCommaSeparated(threadIdsRaw),
		});
	}

	function queueAutosave() {
		if (saveTimeoutId) clearTimeout(saveTimeoutId);
		saveTimeoutId = setTimeout(() => {
			submitIfValid();
			saveTimeoutId = null;
		}, 250);
	}
</script>

<SurfacePanel class="form-panel" oninput={queueAutosave} onchange={queueAutosave}>
	<section class="form-section">
		<SectionHeader title="Realm rules the environment" class="dossier-section-header">
			{#snippet meta()}
				<p class="section-eyebrow">Core Identity</p>
			{/snippet}
			{#snippet actions()}
				<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCoreCollapsed} onclick={() => (isCoreCollapsed = !isCoreCollapsed)}>
					{isCoreCollapsed ? 'Expand' : 'Collapse'}
				</GhostButton>
			{/snippet}
		</SectionHeader>
		{#if !isCoreCollapsed}
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="realm-name">Name <span aria-hidden="true">*</span></label>
					<input
						id="realm-name"
						class="input"
						class:input-error={!!nameError}
						type="text"
						bind:value={name}
						aria-required="true"
						aria-invalid={!!nameError}
					/>
					{#if nameError}
						<p class="error-text" role="alert">{nameError}</p>
					{/if}
				</div>
				<div class="field">
					<label class="label" for="realm-type">Type <span aria-hidden="true">*</span></label>
					<select id="realm-type" class="input" bind:value={realmType} aria-invalid={!!typeError}>
						<option value="">Select realm type</option>
						{#each REALM_TYPE_OPTIONS as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					{#if typeError}
						<p class="error-text" role="alert">{typeError}</p>
					{/if}
				</div>
			</div>
			<div class="field">
				<label class="label" for="realm-description">Summary</label>
				<textarea id="realm-description" class="input textarea" bind:value={description} rows={3}></textarea>
			</div>
			<div class="field">
				<label class="label" for="realm-tags">Tags <span class="hint">(comma-separated)</span></label>
				<input id="realm-tags" class="input" type="text" bind:value={tagsRaw} />
			</div>
		{/if}
	</section>

	<section class="form-section">
		<SectionHeader title="Define the default reality" class="dossier-section-header">
			{#snippet meta()}
				<p class="section-eyebrow">Environmental Rules</p>
			{/snippet}
			{#snippet actions()}
				<GhostButton type="button" class="collapse-toggle" aria-expanded={!isEnvironmentCollapsed} onclick={() => (isEnvironmentCollapsed = !isEnvironmentCollapsed)}>
					{isEnvironmentCollapsed ? 'Expand' : 'Collapse'}
				</GhostButton>
			{/snippet}
		</SectionHeader>
		{#if !isEnvironmentCollapsed}
			<div class="field">
				<label class="label" for="realm-reality-rules">Reality Rules</label>
				<textarea id="realm-reality-rules" class="input textarea textarea--tall" bind:value={realityRules} rows={4}></textarea>
			</div>
			<div class="field">
				<label class="label" for="realm-cultural-baseline">Cultural Baseline</label>
				<textarea id="realm-cultural-baseline" class="input textarea" bind:value={culturalBaseline} rows={3}></textarea>
			</div>
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="realm-power-structure">Power Structure</label>
					<textarea id="realm-power-structure" class="input textarea" bind:value={powerStructure} rows={3}></textarea>
				</div>
				<div class="field">
					<label class="label" for="realm-conflict-pressure">Conflict Pressure</label>
					<textarea id="realm-conflict-pressure" class="input textarea" bind:value={conflictPressure} rows={3}></textarea>
				</div>
			</div>
		{/if}
	</section>

	<section class="form-section">
		<SectionHeader title="Clarify what this realm does in story" class="dossier-section-header">
			{#snippet meta()}
				<p class="section-eyebrow">Narrative Function</p>
			{/snippet}
			{#snippet actions()}
				<GhostButton type="button" class="collapse-toggle" aria-expanded={!isNarrativeCollapsed} onclick={() => (isNarrativeCollapsed = !isNarrativeCollapsed)}>
					{isNarrativeCollapsed ? 'Expand' : 'Collapse'}
				</GhostButton>
			{/snippet}
		</SectionHeader>
		{#if !isNarrativeCollapsed}
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="realm-story-role">Story Role</label>
					<input id="realm-story-role" class="input" type="text" bind:value={storyRole} />
				</div>
				<div class="field">
					<label class="label" for="realm-tone">Tone</label>
					<input id="realm-tone" class="input" type="text" bind:value={tone} />
				</div>
			</div>
		{/if}
	</section>

	<section class="form-section">
		<SectionHeader title="Link the realm to active systems" class="dossier-section-header">
			{#snippet meta()}
				<p class="section-eyebrow">Relationships</p>
			{/snippet}
			{#snippet actions()}
				<GhostButton type="button" class="collapse-toggle" aria-expanded={!isRelationshipsCollapsed} onclick={() => (isRelationshipsCollapsed = !isRelationshipsCollapsed)}>
					{isRelationshipsCollapsed ? 'Expand' : 'Collapse'}
				</GhostButton>
			{/snippet}
		</SectionHeader>
		{#if !isRelationshipsCollapsed}
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="realm-landmark-ids">Landmark IDs</label>
					<input id="realm-landmark-ids" class="input" type="text" bind:value={landmarkIdsRaw} />
				</div>
				<div class="field">
					<label class="label" for="realm-faction-ids">Faction IDs</label>
					<input id="realm-faction-ids" class="input" type="text" bind:value={factionIdsRaw} />
				</div>
				<div class="field">
					<label class="label" for="realm-character-ids">Character IDs</label>
					<input id="realm-character-ids" class="input" type="text" bind:value={characterIdsRaw} />
				</div>
				<div class="field">
					<label class="label" for="realm-thread-ids">Thread IDs</label>
					<input id="realm-thread-ids" class="input" type="text" bind:value={threadIdsRaw} />
				</div>
			</div>
			<p class="support-copy">Use comma-separated IDs until linked selectors are added. A realm with no relationships will drift into decorative lore.</p>
		{/if}
	</section>

</SurfacePanel>

<style>
	:global(.form-panel) {
		display: grid;
		gap: var(--space-6);
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
	}

	.form-section {
		display: grid;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	:global(.dossier-section-header .title) {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	:global(.dossier-section-header .header-content) {
		display: flex;
		flex-direction: column;
	}

	:global(.dossier-section-header .meta) {
		order: -1;
		margin-top: 0;
	}

	.section-eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.support-copy {
		margin: 0;
	}

	:global(.collapse-toggle) {
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent);
		background: transparent;
		color: var(--color-text-muted);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.field-grid {
		display: grid;
		gap: var(--space-4);
	}

	.field-grid--double {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.field {
		display: grid;
		gap: var(--space-2);
	}

	.label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.hint {
		font-weight: var(--font-weight-normal);
		color: var(--color-text-muted);
	}

	.input {
		width: 100%;
		padding: 0.2rem 0.25rem;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-primary);
		font: inherit;
	}

	.input:hover {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.input:focus-visible {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
		box-shadow: none;
	}

	.textarea {
		resize: vertical;
		min-height: 7rem;
	}

	.textarea--tall {
		min-height: 10rem;
	}

	.input-error {
		border-color: var(--color-danger-border);
	}

	.error-text,
	.support-copy {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.error-text {
		color: var(--color-danger-text);
	}

	@media (max-width: 860px) {
		.field-grid--double {
			grid-template-columns: 1fr;
		}
	}
</style>