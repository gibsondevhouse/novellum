<script lang="ts">
	import { untrack } from 'svelte';
	import type { Location } from '$lib/db/types.js';
	import type { EntityFormCallbacks } from '../types.js';
	import {
		LANDMARK_ACTIVITY_OPTIONS,
		joinCommaSeparated,
		splitCommaSeparated,
	} from '../narrative-locations.js';

	type RealmOption = {
		id: string;
		name: string;
		realmType?: string;
	};

	let {
		landmark = null,
		realms,
		onSave,
	} = $props<{
		landmark?: Location | null;
		realms: RealmOption[];
		saving?: boolean;
	} & EntityFormCallbacks<Location>>();

	let name = $state(untrack(() => landmark?.name ?? ''));
	let description = $state(untrack(() => landmark?.description ?? ''));
	let tagsRaw = $state(untrack(() => joinCommaSeparated(landmark?.tags)));
	let realmId = $state(untrack(() => landmark?.realmId ?? ''));
	let environment = $state(untrack(() => landmark?.environment ?? ''));
	let notableFeaturesRaw = $state(untrack(() => joinCommaSeparated(landmark?.notableFeatures)));
	let purpose = $state(untrack(() => landmark?.purpose ?? ''));
	let activityType = $state(untrack(() => landmark?.activityType ?? ''));
	let emotionalTone = $state(untrack(() => landmark?.emotionalTone ?? ''));
	let changeOverTime = $state(untrack(() => landmark?.changeOverTime ?? ''));
	let factionIdsRaw = $state(untrack(() => joinCommaSeparated(landmark?.factionIds)));
	let characterIdsRaw = $state(untrack(() => joinCommaSeparated(landmark?.characterIds)));
	let threadIdsRaw = $state(untrack(() => joinCommaSeparated(landmark?.threadIds)));
	let nameError = $state('');
	let realmError = $state('');
	let isCoreCollapsed = $state(false);
	let isSpatialCollapsed = $state(false);
	let isRoleCollapsed = $state(false);
	let isWeightCollapsed = $state(false);
	let isRelationshipsCollapsed = $state(false);
	let saveTimeoutId = $state<ReturnType<typeof setTimeout> | null>(null);

	function submitIfValid() {
		nameError = '';
		realmError = '';

		if (!name.trim()) {
			nameError = 'Name is required.';
		}

		if (!realmId) {
			realmError = 'Every landmark must belong to a realm.';
		}

		if (nameError || realmError) {
			return;
		}

		void onSave({
			name: name.trim(),
			description: description.trim(),
			tags: splitCommaSeparated(tagsRaw),
			kind: 'landmark',
			realmType: '',
			realityRules: '',
			culturalBaseline: '',
			powerStructure: '',
			conflictPressure: '',
			storyRole: '',
			tone: '',
			realmId,
			environment: environment.trim(),
			notableFeatures: splitCommaSeparated(notableFeaturesRaw),
			purpose: purpose.trim(),
			activityType: activityType.trim(),
			emotionalTone: emotionalTone.trim(),
			changeOverTime: changeOverTime.trim(),
			landmarkIds: [],
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

<div class="form-panel" oninput={queueAutosave} onchange={queueAutosave}>
	<section class="form-section">
		<div class="section-header">
			<div class="section-heading">
				<p class="section-eyebrow">Core Identity</p>
				<h3>Landmark is where scenes actually happen</h3>
			</div>
			<button type="button" class="collapse-toggle" aria-expanded={!isCoreCollapsed} onclick={() => (isCoreCollapsed = !isCoreCollapsed)}>
				{isCoreCollapsed ? 'Expand' : 'Collapse'}
			</button>
		</div>
		{#if !isCoreCollapsed}
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="landmark-name">Name <span aria-hidden="true">*</span></label>
					<input
						id="landmark-name"
						class="input"
						class:input-error={!!nameError}
						type="text"
						bind:value={name}
						aria-invalid={!!nameError}
					/>
					{#if nameError}
						<p class="error-text" role="alert">{nameError}</p>
					{/if}
				</div>
				<div class="field">
					<label class="label" for="landmark-realm">Realm <span aria-hidden="true">*</span></label>
					<select id="landmark-realm" class="input" bind:value={realmId} aria-invalid={!!realmError}>
						<option value="">Select parent realm</option>
						{#each realms as realmOption (realmOption.id)}
							<option value={realmOption.id}>{realmOption.name}</option>
						{/each}
					</select>
					{#if realmError}
						<p class="error-text" role="alert">{realmError}</p>
					{/if}
				</div>
			</div>
			<div class="field">
				<label class="label" for="landmark-description">Summary</label>
				<textarea id="landmark-description" class="input textarea" bind:value={description} rows={3}></textarea>
			</div>
			<div class="field">
				<label class="label" for="landmark-tags">Tags <span class="hint">(comma-separated)</span></label>
				<input id="landmark-tags" class="input" type="text" bind:value={tagsRaw} />
			</div>
		{/if}
	</section>

	<section class="form-section">
		<div class="section-header">
			<div class="section-heading">
				<p class="section-eyebrow">Physical / Spatial Description</p>
				<h3>Make the place usable on the page</h3>
			</div>
			<button type="button" class="collapse-toggle" aria-expanded={!isSpatialCollapsed} onclick={() => (isSpatialCollapsed = !isSpatialCollapsed)}>
				{isSpatialCollapsed ? 'Expand' : 'Collapse'}
			</button>
		</div>
		{#if !isSpatialCollapsed}
			<div class="field">
				<label class="label" for="landmark-environment">Environment</label>
				<textarea id="landmark-environment" class="input textarea textarea--tall" bind:value={environment} rows={4}></textarea>
			</div>
			<div class="field">
				<label class="label" for="landmark-features">Notable Features</label>
				<input id="landmark-features" class="input" type="text" bind:value={notableFeaturesRaw} />
				<p class="support-copy">Comma-separated anchors like altars, elevators, walls of photos, gates, or ritual objects.</p>
			</div>
		{/if}
	</section>

	<section class="form-section">
		<div class="section-header">
			<div class="section-heading">
				<p class="section-eyebrow">Functional Role</p>
				<h3>Define what the place does in story</h3>
			</div>
			<button type="button" class="collapse-toggle" aria-expanded={!isRoleCollapsed} onclick={() => (isRoleCollapsed = !isRoleCollapsed)}>
				{isRoleCollapsed ? 'Expand' : 'Collapse'}
			</button>
		</div>
		{#if !isRoleCollapsed}
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="landmark-purpose">Purpose</label>
					<input id="landmark-purpose" class="input" type="text" bind:value={purpose} />
				</div>
				<div class="field">
					<label class="label" for="landmark-activity">Activity Type</label>
					<input id="landmark-activity" class="input" type="text" list="landmark-activity-options" bind:value={activityType} />
					<datalist id="landmark-activity-options">
						{#each LANDMARK_ACTIVITY_OPTIONS as option (option)}
							<option value={option}></option>
						{/each}
					</datalist>
				</div>
			</div>
		{/if}
	</section>

	<section class="form-section">
		<div class="section-header">
			<div class="section-heading">
				<p class="section-eyebrow">Narrative Weight</p>
				<h3>Track how the place evolves</h3>
			</div>
			<button type="button" class="collapse-toggle" aria-expanded={!isWeightCollapsed} onclick={() => (isWeightCollapsed = !isWeightCollapsed)}>
				{isWeightCollapsed ? 'Expand' : 'Collapse'}
			</button>
		</div>
		{#if !isWeightCollapsed}
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="landmark-tone">Emotional Tone</label>
					<input id="landmark-tone" class="input" type="text" bind:value={emotionalTone} />
				</div>
				<div class="field">
					<label class="label" for="landmark-change">Change Over Time</label>
					<input id="landmark-change" class="input" type="text" bind:value={changeOverTime} />
				</div>
			</div>
		{/if}
	</section>

	<section class="form-section">
		<div class="section-header">
			<div class="section-heading">
				<p class="section-eyebrow">Relationships</p>
				<h3>Keep the landmark tied to active systems</h3>
			</div>
			<button type="button" class="collapse-toggle" aria-expanded={!isRelationshipsCollapsed} onclick={() => (isRelationshipsCollapsed = !isRelationshipsCollapsed)}>
				{isRelationshipsCollapsed ? 'Expand' : 'Collapse'}
			</button>
		</div>
		{#if !isRelationshipsCollapsed}
			<div class="field-grid field-grid--double">
				<div class="field">
					<label class="label" for="landmark-character-ids">Character IDs</label>
					<input id="landmark-character-ids" class="input" type="text" bind:value={characterIdsRaw} />
				</div>
				<div class="field">
					<label class="label" for="landmark-faction-ids">Faction IDs</label>
					<input id="landmark-faction-ids" class="input" type="text" bind:value={factionIdsRaw} />
				</div>
				<div class="field">
					<label class="label" for="landmark-thread-ids">Thread IDs</label>
					<input id="landmark-thread-ids" class="input" type="text" bind:value={threadIdsRaw} />
				</div>
			</div>
			<p class="support-copy">A landmark with no interaction is dead space. Link it to the threads and actors that actually use it.</p>
		{/if}
	</section>

</div>

<style>
	.form-panel {
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

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
	}

	.section-heading {
		display: grid;
		gap: var(--space-1);
	}

	.section-heading h3,
	.section-eyebrow,
	.support-copy {
		margin: 0;
	}

	.section-heading h3 {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.section-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.collapse-toggle {
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