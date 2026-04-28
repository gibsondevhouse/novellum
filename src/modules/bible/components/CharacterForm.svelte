<script lang="ts">
	import { untrack } from 'svelte';
	import type { Character } from '$lib/db/domain-types';
	import type { EntityFormCallbacks } from '../types.js';
	import {
		GhostButton,
		Input,
		PrimaryButton,
		SurfacePanel,
	} from '$lib/components/ui/index.js';

	let {
		character = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		character?: Character | null;
		saving?: boolean;
	} & EntityFormCallbacks<Character>>();

	let name = $state(untrack(() => character?.name ?? ''));
	let role = $state(untrack(() => character?.role ?? ''));
	let pronunciation = $state(untrack(() => character?.pronunciation ?? ''));
	let aliasesRaw = $state(untrack(() => (character?.aliases ?? []).join(', ')));
	let diasporaOrigin = $state(untrack(() => character?.diasporaOrigin ?? ''));
	let photoUrl = $state(untrack(() => character?.photoUrl ?? ''));
	let bio = $state(untrack(() => character?.bio ?? ''));
	let faction = $state(untrack(() => character?.faction ?? ''));
	let anomaliesRaw = $state(untrack(() => (character?.anomalies ?? []).join(', ')));
	let traitsRaw = $state(untrack(() => (character?.traits ?? []).join(', ')));
	let goalsRaw = $state(untrack(() => (character?.goals ?? []).join(', ')));
	let flawsRaw = $state(untrack(() => (character?.flaws ?? []).join(', ')));
	let arcsRaw = $state(untrack(() => (character?.arcs ?? []).join(', ')));
	let notes = $state(untrack(() => character?.notes ?? ''));
	let tagsRaw = $state(untrack(() => (character?.tags ?? []).join(', ')));
	let nameError = $state('');

	function splitList(raw: string): string[] {
		return raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function handleSubmit(event?: SubmitEvent) {
		event?.preventDefault();
		if (!name.trim()) {
			nameError = 'Name is required.';
			return;
		}
		nameError = '';
		onSave({
			name: name.trim(),
			role,
			pronunciation: pronunciation.trim(),
			aliases: splitList(aliasesRaw),
			diasporaOrigin: diasporaOrigin.trim(),
			photoUrl: photoUrl.trim(),
			bio,
			faction,
			anomalies: splitList(anomaliesRaw),
			traits: splitList(traitsRaw),
			goals: splitList(goalsRaw),
			flaws: splitList(flawsRaw),
			arcs: splitList(arcsRaw),
			notes,
			tags: splitList(tagsRaw),
		});
	}
</script>

<SurfacePanel class="character-form-panel">
	<form class="character-form" onsubmit={handleSubmit}>
		<div class="form-intro">
			<p>Capture identity anchors first, then record pressures, goals, and continuity notes.</p>
		</div>

		<section class="form-section" aria-labelledby="section-identity">
			<h3 id="section-identity">Identity and Positioning</h3>
			<Input
				id="char-name"
				label="Name *"
				type="text"
				bind:value={name}
				error={nameError}
				aria-required="true"
				aria-invalid={!!nameError}
				aria-describedby={nameError ? 'char-name-error' : undefined}
			/>

			<Input
				id="char-role"
				label="Role"
				type="text"
				bind:value={role}
				placeholder="protagonist, antagonist..."
			/>

			<Input
				id="char-pronunciation"
				label="Pronunciation"
				type="text"
				bind:value={pronunciation}
				placeholder="nah-VEHL, sahy-ree-uhn..."
			/>

			<div class="supporting-field">
				<Input id="char-aliases" label="Aliases" type="text" bind:value={aliasesRaw} />
				<p class="field-hint">Comma-separated aliases, codenames, or honorifics.</p>
			</div>

			<Input
				id="char-diaspora-origin"
				label="Diaspora Origin"
				type="text"
				bind:value={diasporaOrigin}
				placeholder="Glass Delta, Ring Nine, Tideward caravans..."
			/>

			<Input
				id="char-faction"
				label="Faction"
				type="text"
				bind:value={faction}
				placeholder="Court of Glass, Iron Choir..."
			/>

			<Input
				id="char-photo"
				label="Photo URL"
				type="url"
				bind:value={photoUrl}
				placeholder="https://..."
			/>

			<div class="text-field">
				<label class="text-field__label" for="char-bio">Bio</label>
				<textarea id="char-bio" class="text-field__control" bind:value={bio} rows={4}></textarea>
			</div>
		</section>

		<section class="form-section" aria-labelledby="section-signals">
			<h3 id="section-signals">Signals and Continuity</h3>
			<div class="supporting-field">
				<Input id="char-anomalies" label="Anomalies & Traits" type="text" bind:value={anomaliesRaw} />
				<p class="field-hint">Comma-separated spiritual, technical, or uncanny signatures.</p>
			</div>

			<div class="supporting-field">
				<Input id="char-traits" label="Traits" type="text" bind:value={traitsRaw} />
				<p class="field-hint">Comma-separated descriptors.</p>
			</div>

			<div class="supporting-field">
				<Input id="char-goals" label="Goals" type="text" bind:value={goalsRaw} />
				<p class="field-hint">Comma-separated objectives or wants.</p>
			</div>

			<div class="supporting-field">
				<Input id="char-flaws" label="Flaws" type="text" bind:value={flawsRaw} />
				<p class="field-hint">Comma-separated vulnerabilities or blind spots.</p>
			</div>

			<div class="supporting-field">
				<Input id="char-arcs" label="Arcs" type="text" bind:value={arcsRaw} />
				<p class="field-hint">Comma-separated transformation beats or trajectories.</p>
			</div>

			<div class="text-field">
				<label class="text-field__label" for="char-notes">Notes</label>
				<textarea id="char-notes" class="text-field__control" bind:value={notes} rows={4}></textarea>
			</div>

			<div class="supporting-field">
				<Input id="char-tags" label="Tags" type="text" bind:value={tagsRaw} />
				<p class="field-hint">Comma-separated filing tags for search and grouping.</p>
			</div>
		</section>

		<div class="form-actions">
			<GhostButton onclick={onCancel} disabled={saving} type="button">Cancel</GhostButton>
			<PrimaryButton disabled={saving} type="submit">
				{saving ? 'Saving…' : character ? 'Save Changes' : 'Create Character'}
			</PrimaryButton>
		</div>
	</form>
</SurfacePanel>

<style>
	.character-form {
		display: grid;
		gap: var(--space-4);
	}

	.form-intro p,
	.form-section h3 {
		margin: 0;
	}

	.form-intro p {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.form-section {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-4);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 65%, transparent);
	}

	.form-section h3 {
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.supporting-field,
	.text-field {
		display: grid;
		gap: var(--space-2);
	}

	.field-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.text-field__label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	.text-field__control {
		width: 100%;
		min-height: 7rem;
		resize: vertical;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background-color: var(--color-surface-ground);
		color: var(--color-text-primary);
		font: inherit;
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.text-field__control:focus {
		outline: none;
		border-color: var(--color-nova-blue);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}

	@media (max-width: 640px) {
		.form-actions {
			flex-direction: column-reverse;
		}
	}
</style>
