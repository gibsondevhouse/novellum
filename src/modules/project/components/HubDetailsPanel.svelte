<script lang="ts">
	import { tick } from 'svelte';
	import type { Project, WritingStyle } from '$lib/db/types.js';
	import { SurfacePanel, SectionHeader, PrimaryButton, Input } from '$lib/components/ui/index.js';
	import { submitUpdate } from '$modules/project/stores/project-hub.svelte.js';
	import { STYLE_PRESETS } from '$lib/ai/style-presets.js';

	let { project, writingStyles }: { project: Project; writingStyles: WritingStyle[] } = $props();

	let editingTarget = $state(false);
	let targetValue = $state(0);

	const hasTarget = $derived(project.targetWordCount > 0);

	async function startEditTarget() {
		targetValue = project.targetWordCount;
		editingTarget = true;
		await tick();
		const el = document.querySelector<HTMLInputElement>('.hub-target-input input');
		el?.focus();
	}

	async function confirmTarget() {
		await submitUpdate(project.id, { targetWordCount: Number(targetValue) });
		editingTarget = false;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	function formatWords(n: number): string {
		return n.toLocaleString();
	}
</script>

<SurfacePanel class="hub-details-panel">
	<SectionHeader title="Details" />
	<dl class="details-list">
		<div class="details-row">
			<dt class="details-key">Writing Style</dt>
			<dd class="details-val">
				<select
					value={project.stylePresetId ?? ''}
					onchange={(e) => submitUpdate(project.id, { stylePresetId: e.currentTarget.value })}
					class="details-select"
				>
					<option value="">— None —</option>
					{#if writingStyles.length > 0}
						<optgroup label="Your Styles">
							{#each writingStyles as style (style.id)}
								<option value={style.id}>{style.title}</option>
							{/each}
						</optgroup>
					{/if}
					<optgroup label="Built-in Presets">
						{#each STYLE_PRESETS as preset (preset.id)}
							<option value={preset.id}>{preset.name}</option>
						{/each}
					</optgroup>
				</select>
			</dd>
		</div>
		<div class="details-row">
			<dt class="details-key">Status</dt>
			<dd class="details-val">
				<select
					value={project.status}
					onchange={(e) =>
						submitUpdate(project.id, { status: e.currentTarget.value as Project['status'] })}
					class="details-select"
				>
					<option value="draft">Drafting</option>
					<option value="revision">In Revision</option>
					<option value="completed">Completed</option>
					<option value="archived">Archived</option>
				</select>
			</dd>
		</div>
		<div class="details-row">
			<dt class="details-key">Created</dt>
			<dd class="details-val">{formatDate(project.createdAt)}</dd>
		</div>
		<div class="details-row">
			<dt class="details-key">Target Word Count</dt>
			<dd class="details-val">
				{#if editingTarget}
					<div class="target-edit">
						<Input
							type="number"
							bind:value={targetValue}
							min="0"
							step="1000"
							class="hub-target-input"
							onkeydown={(e) => {
								if (e.key === 'Enter') void confirmTarget();
								if (e.key === 'Escape') editingTarget = false;
							}}
						/>
						<PrimaryButton onclick={confirmTarget} class="hub-target-btn">Save</PrimaryButton>
					</div>
				{:else}
					<button class="details-val-btn" onclick={startEditTarget}>
						{hasTarget ? `${formatWords(project.targetWordCount)} words` : 'Set target'}
					</button>
				{/if}
			</dd>
		</div>
	</dl>
</SurfacePanel>

<style>
	:global(.hub-details-panel) {
		display: flex !important;
		flex-direction: column !important;
		gap: var(--space-2) !important;
		padding: var(--space-6) !important;
		grid-column: span 2;
	}

	.details-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: 0;
		padding: 0;
	}

	.details-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.details-row:last-child {
		border-bottom: none;
	}

	.details-key {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.details-val {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-align: right;
	}

	.details-select {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-family: inherit;
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-base) var(--ease-standard);
	}

	.details-select:hover {
		background: var(--color-surface-hover);
	}

	.details-val-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-family: inherit;
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-base) var(--ease-standard);
	}

	.details-val-btn:hover {
		background: var(--color-surface-hover);
	}

	.target-edit {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	:global(.hub-target-input) {
		width: 120px !important;
	}

	:global(.hub-target-btn) {
		padding: var(--space-1) var(--space-2) !important;
		font-size: var(--text-xs) !important;
	}

	@media (max-width: 640px) {
		:global(.hub-details-panel) {
			grid-column: span 1;
		}
	}
</style>