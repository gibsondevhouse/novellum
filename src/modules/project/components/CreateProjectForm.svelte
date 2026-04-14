<script lang="ts">
	import { getCreating, getCreateError, submitCreate } from '../stores/project-hub.svelte.ts';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	let { oncancel } = $props<{ oncancel: () => void }>();

	let title = $state('');
	let genre = $state('');
	let logline = $state('');
	let synopsis = $state('');
	let targetWordCount = $state(80000);
	let titleError = $state('');

	async function handleSubmit() {
		if (!title.trim()) {
			titleError = 'Title is required.';
			return;
		}
		titleError = '';
		const parsedGenre = genre
			.split(',')
			.map((g) => g.trim())
			.filter(Boolean);
		await submitCreate({
			title: title.trim(),
			genre: parsedGenre,
			logline,
			synopsis,
			targetWordCount,
		});
	}
</script>

<div class="form-overlay" role="dialog" aria-modal="true" aria-label="Create project">
	<div class="form-panel">
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
			<label class="label" for="create-logline">Logline</label>
			<input
				id="create-logline"
				class="input"
				type="text"
				bind:value={logline}
				placeholder="One-sentence summary"
			/>
		</div>

		<div class="field">
			<label class="label" for="create-synopsis">Synopsis</label>
			<textarea id="create-synopsis" class="input textarea" bind:value={synopsis} rows={3}
			></textarea>
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
	</div>
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

	.form-panel {
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-8);
		width: min(480px, 90vw);
		box-shadow: var(--shadow-xl);
	}

	.form-title {
		margin-bottom: var(--space-6);
	}
</style>
