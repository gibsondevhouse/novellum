<script lang="ts">
	import { getCreating, getCreateError, submitCreate } from '../stores/project-hub.svelte.ts';
	import { SurfacePanel } from '$lib/components/ui/index.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	let { oncancel } = $props<{ oncancel: () => void }>();

	let title = $state('');
	let genre = $state('');
	let logline = $state('');
	let synopsis = $state('');
	let targetWordCount = $state(80000);
	let titleError = $state('');
	let loglineError = $state('');
	let synopsisError = $state('');

	async function handleSubmit() {
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}
		titleError = '';
		if (!logline.trim()) {
			loglineError = 'Logline is required.';
			return;
		}
		loglineError = '';
		if (!synopsis.trim()) {
			synopsisError = 'Synopsis is required.';
			return;
		}
		synopsisError = '';
		const parsedGenre = genre
			.split(',')
			.map((g) => g.trim())
			.filter(Boolean);
		await submitCreate({
			title: title.trim(),
			genre: parsedGenre,
			logline: logline.trim(),
			synopsis: synopsis.trim(),
			targetWordCount,
		});
	}
</script>

<div class="form-overlay" role="dialog" aria-modal="true" aria-label="Create project">
	<SurfacePanel class="create-project-form">
		<h2 class="form-title">New Project</h2>

		<div class="field">
			<label class="label" for="create-title">Title <span aria-hidden="true">*</span></label>
			<input
				id="create-title"
				class="input"
				class:input-error={!!titleError}
				type="text"
				bind:value={title}
				placeholder="My Novel"
				aria-required="true"
				aria-invalid={!!titleError}
				aria-describedby={titleError ? 'create-title-error' : undefined}
			/>
			{#if titleError}
				<p id="create-title-error" class="error-text" role="alert">{titleError}</p>
			{/if}
		</div>

		<div class="field">
			<label class="label" for="create-genre">Genre</label>
			<input
				id="create-genre"
				class="input"
				type="text"
				bind:value={genre}
				placeholder="e.g. Fantasy"
			/>
		</div>

		<div class="field">
			<label class="label" for="create-logline">Logline <span aria-hidden="true">*</span></label>
			<input
				id="create-logline"
				class="input"
				class:input-error={!!loglineError}
				type="text"
				bind:value={logline}
				placeholder="One-sentence summary"
				aria-required="true"
				aria-invalid={!!loglineError}
				aria-describedby={loglineError ? 'create-logline-error' : undefined}
			/>
			{#if loglineError}
				<p id="create-logline-error" class="error-text" role="alert">{loglineError}</p>
			{/if}
		</div>

		<div class="field">
			<label class="label" for="create-synopsis">Synopsis <span aria-hidden="true">*</span></label>
			<textarea
				id="create-synopsis"
				class="input textarea"
				class:input-error={!!synopsisError}
				bind:value={synopsis}
				rows={3}
				aria-required="true"
				aria-invalid={!!synopsisError}
				aria-describedby={synopsisError ? 'create-synopsis-error' : undefined}
			></textarea>
			{#if synopsisError}
				<p id="create-synopsis-error" class="error-text" role="alert">{synopsisError}</p>
			{/if}
		</div>

		<div class="field">
			<label class="label" for="create-wordcount">Target Word Count</label>
			<input
				id="create-wordcount"
				class="input"
				type="number"
				bind:value={targetWordCount}
				min={0}
				step={1000}
			/>
		</div>

		{#if getCreateError()}
			<p class="error-text" role="alert">{getCreateError()}</p>
		{/if}

		<div class="actions">
			<GhostButton onclick={oncancel} disabled={getCreating()}>Cancel</GhostButton>
			<PrimaryButton onclick={handleSubmit} disabled={getCreating()}>
				{getCreating() ? 'Creating…' : 'Create Project'}
			</PrimaryButton>
		</div>
	</SurfacePanel>
</div>

<style>
	.form-overlay {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, black 60%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	:global(.create-project-form) {
		padding: var(--space-8) !important;
		width: min(480px, 90vw) !important;
		box-shadow: var(--shadow-xl) !important;
	}

	.form-title {
		margin-bottom: var(--space-6);
	}
</style>
