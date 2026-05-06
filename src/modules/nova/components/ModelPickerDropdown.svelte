<!--
	plan-018 stage-005 phase-004 — Model picker dropdown.

	Allows the author to switch the active model from the NovaPanel
	header without leaving the editor. Reads AVAILABLE_MODELS and
	persists selection via setSelectedModel.
-->
<script lang="ts">
	import {
		AVAILABLE_MODELS,
		getSelectedModelOption,
		setSelectedModel,
	} from '$lib/stores/model-selection.svelte.js';

	const current = $derived(getSelectedModelOption());

	function pick(id: string) {
		setSelectedModel(id);
	}
</script>

<div class="model-picker">
	<label class="sr-only" for="nova-model-select">Active model</label>
	<select
		id="nova-model-select"
		value={current.id}
		onchange={(e) => pick((e.currentTarget as HTMLSelectElement).value)}
	>
		{#each AVAILABLE_MODELS as model (model.id)}
			<option value={model.id}>{model.label}</option>
		{/each}
	</select>
</div>

<style>
	.model-picker select {
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		cursor: pointer;
	}

	.model-picker select:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}
</style>
