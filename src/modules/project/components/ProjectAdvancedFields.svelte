<script lang="ts">
	import type { ProjectDraft } from '../types/project-draft.js';
	import { WORD_COUNT_PRESETS as PRESETS } from '../constants.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let {
		draft,
		onchange,
	}: {
		draft: ProjectDraft;
		onchange: (patch: Partial<ProjectDraft>) => void;
	} = $props();

	let customInput = $state('');

	$effect(() => {
		if (draft.targetWordCount !== null && document.activeElement?.id !== 'create-wordcount') {
			customInput = String(draft.targetWordCount);
		}
	});

	let activePreset = $derived(
		PRESETS.find((p) => p.value === draft.targetWordCount)?.value ?? null,
	);

	function selectPreset(value: number) {
		onchange({ targetWordCount: value });
		customInput = String(value);
	}

	function handleCustomInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		customInput = raw;
		const parsed = parseInt(raw, 10);
		onchange({ targetWordCount: isNaN(parsed) ? null : parsed });
	}
</script>

<div class="section" aria-label="Advanced options">
	<div class="field">
		<span class="label group-label" id="wordcount-label">Target Word Count</span>

		<div class="presets" role="group" aria-labelledby="wordcount-label">
			{#each PRESETS as preset (preset.value)}
				<GhostButton
					type="button"
					class={`preset-btn ${activePreset === preset.value ? 'active' : ''}`}
					onclick={() => selectPreset(preset.value)}
					aria-pressed={activePreset === preset.value}
				>
					<span class="preset-name">{preset.label}</span>
					<span class="preset-value">~{preset.value.toLocaleString()}</span>
				</GhostButton>
			{/each}
		</div>

		<div class="custom-row">
			<label class="label label-inline" for="create-wordcount">Custom</label>
			<input
				id="create-wordcount"
				class="input input-inline"
				type="number"
				value={customInput}
				oninput={handleCustomInput}
				min={0}
				step={1000}
				placeholder="e.g. 100000"
				aria-describedby="wordcount-helper"
			/>
		</div>
		<p id="wordcount-helper" class="helper-text">Optional — sets your writing goal</p>
	</div>
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
		gap: var(--space-3);
	}

	.label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
	}

	.presets {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	:global(.preset-btn) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			background-color var(--duration-fast) var(--ease-standard);
		font-family: var(--font-sans);
		flex: 1;
		min-width: 80px;
	}

	:global(.preset-btn:hover) {
		border-color: var(--color-border-strong);
	}

	:global(.preset-btn:focus-visible) {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	:global(.preset-btn.active) {
		border-color: var(--color-nova-blue);
		background-color: color-mix(in srgb, var(--color-nova-blue) 10%, transparent);
	}

	.preset-name {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.preset-value {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.custom-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.label-inline {
		white-space: nowrap;
		flex-shrink: 0;
	}

	.input {
		background-color: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		box-sizing: border-box;
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-nova-blue);
		box-shadow: var(--focus-ring);
	}

	.input-inline {
		width: 140px;
	}

	.helper-text {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}
</style>
