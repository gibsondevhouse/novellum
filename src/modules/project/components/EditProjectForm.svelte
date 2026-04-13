<script lang="ts">
	import { untrack } from 'svelte';
	import type { Project } from '$lib/db/types.js';
	import { getSaving, getSaveSuccess, submitUpdate } from '../stores/project-hub.svelte.ts';

	let { project, oncancel } = $props<{ project: Project; oncancel: () => void }>();

	let title = $state(untrack(() => project.title));
	let genre = $state(untrack(() => project.genre));
	let logline = $state(untrack(() => project.logline));
	let synopsis = $state(untrack(() => project.synopsis));
	let targetWordCount = $state(untrack(() => project.targetWordCount));
	let titleError = $state('');

	async function handleSubmit() {
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}
		titleError = '';
		await submitUpdate(project.id, {
			title: title.trim(),
			genre,
			logline,
			synopsis,
			targetWordCount,
		});
		oncancel();
	}
</script>

<div class="form-panel">
	<div class="field">
		<label class="label" for="edit-title">Title <span aria-hidden="true">*</span></label>
		<input
			id="edit-title"
			class="input"
			class:input-error={!!titleError}
			type="text"
			bind:value={title}
			aria-required="true"
			aria-invalid={!!titleError}
			aria-describedby={titleError ? 'edit-title-error' : undefined}
		/>
		{#if titleError}
			<p id="edit-title-error" class="error-text" role="alert">{titleError}</p>
		{/if}
	</div>

	<div class="field">
		<label class="label" for="edit-genre">Genre</label>
		<input id="edit-genre" class="input" type="text" bind:value={genre} />
	</div>

	<div class="field">
		<label class="label" for="edit-logline">Logline</label>
		<input id="edit-logline" class="input" type="text" bind:value={logline} />
	</div>

	<div class="field">
		<label class="label" for="edit-synopsis">Synopsis</label>
		<textarea id="edit-synopsis" class="input textarea" bind:value={synopsis} rows={4}></textarea>
	</div>

	<div class="field">
		<label class="label" for="edit-wordcount">Target Word Count</label>
		<input
			id="edit-wordcount"
			class="input"
			type="number"
			bind:value={targetWordCount}
			min={0}
			step={1000}
		/>
	</div>

	{#if getSaveSuccess()}
		<p class="success-text" role="status">Saved successfully.</p>
	{/if}

	<div class="actions">
		<button class="btn-ghost" onclick={oncancel} disabled={getSaving()}>Cancel</button>
		<button class="btn-primary" onclick={handleSubmit} disabled={getSaving()}>
			{getSaving() ? 'Saving…' : 'Save Changes'}
		</button>
	</div>
</div>
