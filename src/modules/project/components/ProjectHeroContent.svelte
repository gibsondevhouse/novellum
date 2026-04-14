<script lang="ts">
	import { tick } from 'svelte';
	import type { Project } from '$lib/db/types.js';
	import { submitUpdate } from '../stores/project-hub.svelte.ts';

	let { project }: { project: Project } = $props();

	type EditableField = 'title' | 'genre' | 'logline' | 'synopsis';

	let editingField = $state<EditableField | null>(null);
	let editValue = $state('');

	async function startEdit(field: EditableField) {
		editingField = field;
		editValue = project[field] ?? '';
		await tick();
		const el = document.querySelector<HTMLElement>('.hero-inline:focus, .hero-inline');
		el?.focus();
	}

	function cancelEdit() {
		editingField = null;
		editValue = '';
	}

	async function confirmEdit() {
		if (!editingField) return;
		const field = editingField;
		const trimmed = editValue.trim();

		// Title cannot be empty
		if (field === 'title' && !trimmed) return;

		editingField = null;
		editValue = '';
		await submitUpdate(project.id, { [field]: trimmed });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			cancelEdit();
		}
	}
</script>

<div class="hero-content">
	<div class="hero-content-head">
		{#if editingField === 'title'}
			<input
				class="hero-inline hero-inline--title"
				type="text"
				bind:value={editValue}
				onkeydown={handleKeydown}
				aria-label="Edit title"
			/>
		{:else}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<h1 class="hero-title hero-title--editable" onclick={() => startEdit('title')}>
				{project.title}
			</h1>
		{/if}

		<!-- Controls: ✓/✕ when editing, pencil hint when not -->
		{#if editingField}
			<div class="hero-controls">
				<button
					class="hero-ctrl hero-ctrl--confirm"
					onclick={confirmEdit}
					aria-label="Save changes"
					title="Save">✓</button
				>
				<button
					class="hero-ctrl hero-ctrl--cancel"
					onclick={cancelEdit}
					aria-label="Cancel editing"
					title="Cancel">✕</button
				>
			</div>
		{/if}
	</div>

	{#if editingField === 'genre'}
		<input
			class="hero-inline hero-inline--genre"
			type="text"
			bind:value={editValue}
			onkeydown={handleKeydown}
			aria-label="Edit genre"
			placeholder="Genre"
		/>
	{:else if project.genre}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="hero-genre-badge hero-genre-badge--editable" onclick={() => startEdit('genre')}>
			{project.genre}
		</span>
	{:else if !editingField}
		<button class="hero-field-empty" onclick={() => startEdit('genre')}>Add a genre</button>
	{/if}

	{#if editingField === 'logline'}
		<textarea
			class="hero-inline hero-inline--logline"
			bind:value={editValue}
			onkeydown={handleKeydown}
			aria-label="Edit logline"
			placeholder="A one-sentence hook for your story"
			rows={2}
		></textarea>
	{:else if project.logline}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<blockquote class="hero-logline hero-logline--editable" onclick={() => startEdit('logline')}>
			{project.logline}
		</blockquote>
	{:else if !editingField}
		<button class="hero-field-empty" onclick={() => startEdit('logline')}>
			Add a logline to define this story
		</button>
	{/if}

	{#if editingField === 'synopsis'}
		<textarea
			class="hero-inline hero-inline--synopsis"
			bind:value={editValue}
			onkeydown={handleKeydown}
			aria-label="Edit synopsis"
			placeholder="A short summary of your story"
			rows={4}
		></textarea>
	{:else if project.synopsis}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<p class="hero-synopsis hero-synopsis--editable" onclick={() => startEdit('synopsis')}>
			{project.synopsis}
		</p>
	{:else if !editingField}
		<button class="hero-field-empty" onclick={() => startEdit('synopsis')}> Add a synopsis </button>
	{/if}
</div>

<style>
	.hero-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.hero-content-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	/* ── Display fields (clickable) ── */
	.hero-title {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		line-height: var(--leading-tight);
		margin: 0;
	}
	.hero-title--editable {
		cursor: text;
		border-radius: var(--radius-sm);
		transition: color var(--duration-base) var(--ease-standard);
	}
	.hero-title--editable:hover {
		color: var(--color-text-secondary);
	}
	.hero-genre-badge {
		display: inline-block;
		width: fit-content;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		padding: var(--space-1) var(--space-3);
	}
	.hero-genre-badge--editable {
		cursor: text;
		transition: border-color var(--duration-base) var(--ease-standard);
	}
	.hero-genre-badge--editable:hover {
		border-color: var(--color-border-default);
	}
	.hero-logline {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-style: italic;
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
		padding: 0;
		border: none;
	}
	.hero-logline--editable {
		cursor: text;
		border-radius: var(--radius-sm);
		transition: color var(--duration-base) var(--ease-standard);
	}
	.hero-logline--editable:hover {
		color: var(--color-text-primary);
	}
	.hero-synopsis {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
		max-height: 8.5em;
		overflow-y: auto;
		scrollbar-width: none;
	}
	.hero-synopsis::-webkit-scrollbar {
		display: none;
	}
	.hero-synopsis--editable {
		cursor: text;
		border-radius: var(--radius-sm);
		transition: color var(--duration-base) var(--ease-standard);
	}
	.hero-synopsis--editable:hover {
		color: var(--color-text-primary);
	}

	/* ── Empty-field prompts ── */
	.hero-field-empty {
		display: block;
		background: none;
		border: 1px dashed var(--color-border-default);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-style: italic;
		color: var(--color-text-muted);
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition:
			color var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard),
			background-color var(--duration-base) var(--ease-standard);
	}
	.hero-field-empty:hover {
		color: var(--color-text-secondary);
		border-color: var(--color-border-strong);
		background: var(--color-surface-overlay);
	}
	.hero-field-empty:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* ── Inline edit inputs ── */
	.hero-inline {
		display: block;
		width: 100%;
		background: transparent;
		border: none;
		border-radius: 0;
		color: var(--color-text-primary);
		outline: none;
		padding: 0;
		resize: none;
	}
	.hero-inline:focus {
		outline: none;
	}
	.hero-inline--title {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-normal);
		line-height: var(--leading-tight);
		flex: 1;
	}
	.hero-inline--genre {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		width: fit-content;
		max-width: 200px;
	}
	.hero-inline--logline {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-style: italic;
		line-height: var(--leading-relaxed);
	}
	.hero-inline--synopsis {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		resize: vertical;
		min-height: 4em;
	}

	/* ── Confirm / Cancel controls ── */
	.hero-controls {
		display: flex;
		gap: var(--space-1);
		flex-shrink: 0;
	}
	.hero-ctrl {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-overlay);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		cursor: pointer;
		transition:
			color var(--duration-base) var(--ease-standard),
			background-color var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}
	.hero-ctrl:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	.hero-ctrl--confirm:hover {
		color: var(--color-teal);
		border-color: var(--color-teal);
		background: color-mix(in srgb, var(--color-teal) 10%, transparent);
	}
	.hero-ctrl--cancel:hover {
		color: var(--color-error);
		border-color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	@media (max-width: 640px) {
		.hero-title {
			font-size: var(--text-3xl);
		}
		.hero-inline--title {
			font-size: var(--text-3xl);
		}
	}
</style>
