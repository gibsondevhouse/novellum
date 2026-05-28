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
	.model-picker {
		display: inline-flex;
	}

	.model-picker select {
		appearance: none;
		-webkit-appearance: none;
		height: 30px;
		min-width: 128px;
		padding: 0 var(--space-6) 0 var(--space-2);
		background-color: var(--color-surface-raised);
		background-image:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-raised) 88%, var(--color-candle) 12%) 0%,
				var(--color-surface-raised) 100%
			),
			linear-gradient(45deg, transparent 50%, var(--color-text-muted) 50%),
			linear-gradient(135deg, var(--color-text-muted) 50%, transparent 50%);
		background-position:
			0 0,
			calc(100% - 12px) 12px,
			calc(100% - 8px) 12px;
		background-size:
			100% 100%,
			4px 4px,
			4px 4px;
		background-repeat: no-repeat;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 86%, var(--color-candle) 14%);
		border-radius: var(--radius-full);
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
	}

	.model-picker select:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
