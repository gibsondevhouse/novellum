<script lang="ts">
	import Columns2 from '@lucide/svelte/icons/columns-2';
	import TextCursorInput from '@lucide/svelte/icons/text-cursor-input';
	import Rows2 from '@lucide/svelte/icons/rows-2';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		createProseDiff,
		type ProseDiffOperation,
		type ProseDiffSegment,
	} from '$lib/ai/pipeline/prose-diff-helper.js';
	import type { ProsePartialInjectionRange } from '$lib/events/prose-injection.js';

	type DiffViewMode = 'split' | 'unified';

	interface Props {
		currentText?: string | null;
		generatedText?: string | null;
		title?: string;
		canInject?: boolean;
		onInjectSelected?: (ranges: ProsePartialInjectionRange[]) => void;
	}

	let {
		currentText = '',
		generatedText = '',
		title = 'Review changes',
		canInject = true,
		onInjectSelected,
	}: Props = $props();

	let viewMode = $state<DiffViewMode>('split');

	const diff = $derived(createProseDiff(currentText, generatedText));
	const annotatedSegments = $derived(
		diff.segments.map((segment, index) => ({
			...segment,
			id: `diff-segment-${index}`,
			order: index,
		})),
	);
	const currentSegments = $derived(annotatedSegments.filter((segment) => segment.operation !== 'insert'));
	const generatedSegments = $derived(annotatedSegments.filter((segment) => segment.operation !== 'delete'));
	const insertionSegments = $derived(annotatedSegments.filter((segment) => segment.operation === 'insert'));
	let selectedInsertionIds = $derived(
		new SvelteSet(insertionSegments.map((segment) => segment.id)),
	);
	const insertionRanges = $derived(
		insertionSegments.map((segment) => ({
			id: segment.id,
			text: segment.text,
			selected: selectedInsertionIds.has(segment.id),
			order: segment.order,
		})),
	);
	const selectedRanges = $derived(insertionRanges.filter((range) => range.selected));
	const hasSelectedInsertions = $derived(selectedRanges.length > 0);
	const insertedCharacterCount = $derived(diff.insertedText.length);
	const deletedCharacterCount = $derived(diff.deletedText.length);

	function setViewMode(nextMode: DiffViewMode): void {
		viewMode = nextMode;
	}

	function segmentClass(operation: ProseDiffOperation): string {
		return `diff-segment diff-segment-${operation}`;
	}

	function toggleInsertion(id: string, checked: boolean): void {
		if (checked) selectedInsertionIds.add(id);
		else selectedInsertionIds.delete(id);
	}

	function handleInsertionToggle(event: Event, id: string): void {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return;
		toggleInsertion(id, input.checked);
	}

	function handleInjectSelected(): void {
		if (!onInjectSelected || !canInject || !hasSelectedInsertions) return;
		onInjectSelected(selectedRanges);
	}
</script>

{#snippet diffText(segments: readonly (ProseDiffSegment & { id: string; order: number })[], selectable = false)}
	{#each segments as segment, i (i)}
		{#if selectable && segment.operation === 'insert'}
			<label class="diff-insert-choice">
				<input
					type="checkbox"
					checked={selectedInsertionIds.has(segment.id)}
					aria-label="Select inserted prose"
					onchange={(event) => handleInsertionToggle(event, segment.id)}
				/>
				<span class={segmentClass(segment.operation)} data-operation={segment.operation}>{segment.text}</span>
			</label>
		{:else}
			<span class={segmentClass(segment.operation)} data-operation={segment.operation}>{segment.text}</span>
		{/if}
	{/each}
{/snippet}

<section
	class="prose-diff-panel"
	data-mode={viewMode}
	data-testid="prose-diff-panel"
	aria-label={title}
>
	<header class="diff-panel-header">
		<div class="diff-panel-summary">
			<p class="diff-panel-title">{title}</p>
			<p class="diff-panel-counts">
				<span>{insertedCharacterCount} chars added</span>
				<span>{deletedCharacterCount} chars deleted</span>
			</p>
		</div>

		<div class="diff-mode-toggle" role="group" aria-label="Diff layout">
			<button
				type="button"
				class:is-active={viewMode === 'split'}
				aria-pressed={viewMode === 'split'}
				aria-label="Show split diff"
				onclick={() => setViewMode('split')}
			>
				<Columns2 class="diff-mode-icon" aria-hidden="true" />
				<span>Split</span>
			</button>
			<button
				type="button"
				class:is-active={viewMode === 'unified'}
				aria-pressed={viewMode === 'unified'}
				aria-label="Show unified diff"
				onclick={() => setViewMode('unified')}
			>
				<Rows2 class="diff-mode-icon" aria-hidden="true" />
				<span>Unified</span>
			</button>
		</div>

		{#if onInjectSelected}
			<button
				type="button"
				class="diff-inject-button"
				disabled={!canInject || !hasSelectedInsertions}
				onclick={handleInjectSelected}
			>
				<TextCursorInput class="diff-mode-icon" aria-hidden="true" />
				<span>Insert selected</span>
			</button>
		{/if}
	</header>

	{#if diff.hasChanges}
		{#if viewMode === 'split'}
			<div class="diff-split" data-testid="prose-diff-split">
				<section class="diff-column" aria-label="Current scene prose">
					<h3>Current</h3>
					<pre class="diff-scroll" data-testid="prose-diff-current">{@render diffText(currentSegments)}</pre>
				</section>
				<section class="diff-column" aria-label="Draft prose">
					<h3>Draft</h3>
					<pre class="diff-scroll" data-testid="prose-diff-generated">{@render diffText(generatedSegments, true)}</pre>
				</section>
			</div>
		{:else}
			<section class="diff-unified" aria-label="Unified prose diff" data-testid="prose-diff-unified">
				<pre class="diff-scroll">{@render diffText(annotatedSegments, true)}</pre>
			</section>
		{/if}
	{:else}
		<p class="diff-empty" data-testid="prose-diff-empty">No prose changes.</p>
	{/if}
</section>

<style>
	.prose-diff-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-block: var(--space-2);
		border-block: 1px solid color-mix(in srgb, var(--color-border-default) 72%, transparent);
	}

	.diff-panel-header {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.diff-panel-summary {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		margin-right: auto;
	}

	.diff-panel-title,
	.diff-panel-counts {
		margin: 0;
	}

	.diff-panel-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.diff-panel-counts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		font-size: 11px;
		color: var(--color-text-secondary);
	}

	.diff-mode-toggle {
		display: inline-flex;
		flex: 0 0 auto;
		padding: 2px;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-ground);
	}

	.diff-mode-toggle button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		min-height: 28px;
		padding: 0 var(--space-2);
		border: 0;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font: inherit;
		font-size: 11px;
		cursor: pointer;
	}

	.diff-mode-toggle button:hover {
		color: var(--color-text-primary);
		background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
	}

	.diff-mode-toggle button:focus-visible {
		outline: 2px solid var(--color-focus-ring, var(--color-nova-blue));
		outline-offset: 2px;
	}

	.diff-mode-toggle button.is-active {
		color: var(--color-text-primary);
		background: color-mix(in srgb, var(--color-nova-blue) 18%, var(--color-surface-overlay));
	}

	.diff-inject-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		min-height: 32px;
		padding: 0 var(--space-2);
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 48%, var(--color-border-default));
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-nova-blue) 15%, var(--color-surface-overlay));
		color: var(--color-text-primary);
		font: inherit;
		font-size: 11px;
		cursor: pointer;
	}

	.diff-inject-button:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 22%, var(--color-surface-overlay));
	}

	.diff-inject-button:focus-visible {
		outline: 2px solid var(--color-focus-ring, var(--color-nova-blue));
		outline-offset: 2px;
	}

	.diff-inject-button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	:global(.diff-mode-icon) {
		width: 14px;
		height: 14px;
		flex: 0 0 auto;
	}

	.diff-split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--space-2);
	}

	.diff-column,
	.diff-unified {
		min-width: 0;
	}

	.diff-column h3 {
		margin: 0 0 var(--space-1);
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
	}

	.diff-scroll {
		max-height: min(26rem, 52vh);
		margin: 0;
		padding: var(--space-2);
		overflow: auto;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 68%, transparent);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 92%, transparent);
		color: var(--color-text-primary);
		font-family: var(--font-mono, monospace);
		font-size: 12px;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.diff-segment {
		border-radius: 3px;
	}

	.diff-insert-choice {
		display: inline;
	}

	.diff-insert-choice input {
		width: 13px;
		height: 13px;
		margin: 0 3px 0 0;
		vertical-align: -2px;
		accent-color: var(--color-nova-blue);
	}

	.diff-segment-insert {
		background: color-mix(in srgb, var(--color-success, #2f9e44) 18%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--color-success, #2f9e44) 58%, transparent);
	}

	.diff-segment-delete {
		background: color-mix(in srgb, var(--color-error, #e03131) 18%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--color-error, #e03131) 58%, transparent);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}

	.diff-empty {
		margin: 0;
		padding: var(--space-2);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 92%, transparent);
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	@media (max-width: 720px) {
		.diff-panel-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.diff-split {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
