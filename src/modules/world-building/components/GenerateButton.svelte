<!--
  GenerateButton — sparkle icon button that triggers worldbuilding generation.

  Renders as a ghost button with a ✦ prefix. Disabled while a generation is
  already in-flight (any entity kind). The count prop controls single vs batch.
-->
<script lang="ts">
	import { GhostButton } from '$lib/components/ui/index.js';
	import {
		startGeneration,
		isGenerating,
		getEntityKind,
	} from '../stores/generation-draft.svelte.js';
	import type { EntityKind } from '../services/worldbuilding-generation-service.js';
	import type { GenerationContextPayload } from '../services/generation-context.js';
	import PreGenerationDialog from './PreGenerationDialog.svelte';

	interface Props {
		projectId: string;
		entityKind: EntityKind;
		/** 1 = single entity, 3 or 5 = batch suggestions */
		count?: 1 | 3 | 5;
		/** Custom label; defaults to "✦ Generate" (count=1) or "✦ Suggest N" (count>1) */
		label?: string;
	}

	let { projectId, entityKind, count = 1, label }: Props = $props();

	const busy = $derived(isGenerating());
	const activeKind = $derived(getEntityKind());
	// Disabled when any generation is running, not just for this entity kind
	const disabled = $derived(busy);
	const isThisKindGenerating = $derived(busy && activeKind === entityKind);

	const displayLabel = $derived(
		label ??
			(isThisKindGenerating
				? 'Generating…'
				: count === 1
					? '✦ Generate'
					: `✦ Suggest ${count}`),
	);

	let dialogOpen = $state(false);

	const DIALOG_ENTITY_KINDS = new Set<EntityKind>(['character', 'faction', 'lineage']);

	function handleClick(): void {
		if (disabled) return;
		if (DIALOG_ENTITY_KINDS.has(entityKind)) {
			dialogOpen = true;
		} else {
			void startGeneration(projectId, entityKind, count);
		}
	}

	function handleDialogSubmit(ctx: GenerationContextPayload | undefined): void {
		dialogOpen = false;
		void startGeneration(projectId, entityKind, count, undefined, ctx);
	}

	function handleDialogCancel(): void {
		dialogOpen = false;
	}
</script>

<span class="generate-btn-host">
	<GhostButton
		type="button"
		{disabled}
		onclick={handleClick}
		aria-label={`Generate ${entityKind} suggestions`}
	>
		{displayLabel}
	</GhostButton>
</span>

{#if dialogOpen}
	<PreGenerationDialog
		{projectId}
		{entityKind}
		onsubmit={handleDialogSubmit}
		oncancel={handleDialogCancel}
	/>
{/if}

<style>
	.generate-btn-host {
		display: inline-flex;
	}

	.generate-btn-host :global(button) {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		padding: var(--space-1) var(--space-2);
		transition:
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.generate-btn-host :global(button:hover:not(:disabled)) {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
	}

	.generate-btn-host :global(button:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
