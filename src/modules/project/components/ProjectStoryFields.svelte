<script lang="ts">
	import type { ProjectDraft } from '../types/project-draft.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let {
		draft,
		onchange,
	}: {
		draft: ProjectDraft;
		onchange: (patch: Partial<ProjectDraft>) => void;
	} = $props();

	let showSynopsis = $state(false);

	function handleLoglineInput(e: Event) {
		onchange({ logline: (e.target as HTMLTextAreaElement).value });
	}

	function handleSynopsisInput(e: Event) {
		onchange({ synopsis: (e.target as HTMLTextAreaElement).value });
	}

	function toggleSynopsis() {
		showSynopsis = !showSynopsis;
	}
</script>

<div class="section" aria-label="Story intent">
	<!-- Logline -->
	<div class="field">
		<div class="label-row">
			<label class="label" for="create-logline">Logline</label>
		</div>
		<textarea
			id="create-logline"
			class="input textarea"
			value={draft.logline}
			oninput={handleLoglineInput}
			placeholder="A [protagonist] must [goal] but [conflict] because [stakes]"
			rows={3}
			aria-describedby="logline-helper"
		></textarea>
		<p id="logline-helper" class="helper-text">
			One or two sentences that capture the core tension of your story
		</p>
	</div>

	<!-- Synopsis toggle -->
	{#if !showSynopsis}
		<GhostButton
			type="button"
			class="disclosure-toggle"
			onclick={toggleSynopsis}
			aria-expanded={showSynopsis}
			aria-controls="synopsis-region"
		>
			<span class="toggle-icon" aria-hidden="true">+</span>
			Add synopsis
		</GhostButton>
	{:else}
		<div id="synopsis-region" class="field synopsis-field" role="region" aria-label="Synopsis">
			<div class="label-row">
				<label class="label" for="create-synopsis">Synopsis</label>
				<GhostButton
					type="button"
					class="disclosure-toggle collapse-btn"
					onclick={toggleSynopsis}
				>
					<span aria-hidden="true">−</span> Collapse
				</GhostButton>
			</div>
			<textarea
				id="create-synopsis"
				class="input textarea"
				value={draft.synopsis}
				oninput={handleSynopsisInput}
				placeholder="A broader overview of the story arc, major turning points, and resolution…"
				rows={5}
			></textarea>
		</div>
	{/if}
</div>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	.input {
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-primary);
		font-size: var(--text-base);
		font-family: var(--font-sans);
		width: 100%;
		box-sizing: border-box;
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-nova-blue);
		box-shadow: var(--focus-ring);
	}

	.textarea {
		resize: vertical;
		min-height: 72px;
		line-height: var(--leading-relaxed);
	}

	.helper-text {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
		line-height: var(--leading-normal);
	}

	:global(.disclosure-toggle) {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		background: none;
		border: none;
		padding: var(--space-1) 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-standard);
		font-family: var(--font-sans);
		align-self: flex-start;
	}

	:global(.disclosure-toggle:hover) {
		color: var(--color-text-primary);
	}

	:global(.disclosure-toggle:focus-visible) {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
		border-radius: var(--radius-xs);
	}

	.toggle-icon {
		font-size: var(--text-base);
		line-height: 1;
	}

	.synopsis-field {
		animation: slide-down var(--duration-enter) var(--ease-editorial) both;
	}

	:global(.collapse-btn) {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	@keyframes slide-down {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.synopsis-field {
			animation: none;
		}
	}
</style>
