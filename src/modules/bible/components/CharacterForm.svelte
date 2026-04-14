<script lang="ts">
	import { untrack } from 'svelte';
	import type { Character } from '$lib/db/types.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	let {
		character = null,
		saving = false,
		onSave,
		onCancel,
	} = $props<{
		character?: Character | null;
		saving?: boolean;
		onSave: (data: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => void;
		onCancel: () => void;
	}>();

	let name = $state(untrack(() => character?.name ?? ''));
	let role = $state(untrack(() => character?.role ?? ''));
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

	function handleSubmit() {
		if (!name.trim()) {
			nameError = 'Name is required.';
			return;
		}
		nameError = '';
		onSave({
			name: name.trim(),
			role,
			traits: splitList(traitsRaw),
			goals: splitList(goalsRaw),
			flaws: splitList(flawsRaw),
			arcs: splitList(arcsRaw),
			notes,
			tags: splitList(tagsRaw),
		});
	}
</script>

<div class="form-panel">
	<div class="field">
		<label class="label" for="char-name">Name <span aria-hidden="true">*</span></label>
		<input
			id="char-name"
			class="input"
			class:input-error={!!nameError}
			type="text"
			bind:value={name}
			aria-required="true"
			aria-invalid={!!nameError}
			aria-describedby={nameError ? 'char-name-error' : undefined}
		/>
		{#if nameError}
			<p id="char-name-error" class="error-text" role="alert">{nameError}</p>
		{/if}
	</div>
	<div class="field">
		<label class="label" for="char-role">Role</label>
		<input
			id="char-role"
			class="input"
			type="text"
			bind:value={role}
			placeholder="protagonist, antagonist…"
		/>
	</div>
	<div class="field">
		<label class="label" for="char-traits">Traits <span class="hint">(comma-separated)</span></label
		>
		<input id="char-traits" class="input" type="text" bind:value={traitsRaw} />
	</div>
	<div class="field">
		<label class="label" for="char-goals">Goals <span class="hint">(comma-separated)</span></label>
		<input id="char-goals" class="input" type="text" bind:value={goalsRaw} />
	</div>
	<div class="field">
		<label class="label" for="char-flaws">Flaws <span class="hint">(comma-separated)</span></label>
		<input id="char-flaws" class="input" type="text" bind:value={flawsRaw} />
	</div>
	<div class="field">
		<label class="label" for="char-arcs">Arcs <span class="hint">(comma-separated)</span></label>
		<input id="char-arcs" class="input" type="text" bind:value={arcsRaw} />
	</div>
	<div class="field">
		<label class="label" for="char-notes">Notes</label>
		<textarea id="char-notes" class="input textarea" bind:value={notes} rows={3}></textarea>
	</div>
	<div class="field">
		<label class="label" for="char-tags">Tags <span class="hint">(comma-separated)</span></label>
		<input id="char-tags" class="input" type="text" bind:value={tagsRaw} />
	</div>
	<div class="actions">
		<GhostButton onclick={onCancel} disabled={saving}>Cancel</GhostButton>
		<PrimaryButton onclick={handleSubmit} disabled={saving}>
			{saving ? 'Saving…' : character ? 'Save Changes' : 'Create Character'}
		</PrimaryButton>
	</div>
</div>
