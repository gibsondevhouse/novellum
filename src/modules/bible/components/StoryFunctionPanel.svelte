<script lang="ts">
	import { GhostButton, SectionHeader } from '$lib/components/ui/index.js';

	type StoryFunctionField = 'storyRole' | 'arcStage' | 'externalGoal' | 'internalNeed' | 'stakes' | 'conflict';

	type StoryFunctionModel = {
		storyRole?: string;
		arcStage?: string;
		externalGoal?: string;
		internalNeed?: string;
		stakes?: string;
		conflict?: string;
		[key: string]: unknown;
	};

	let {
		character,
		onFieldChange,
	}: {
		character: StoryFunctionModel | null;
		onFieldChange: (field: StoryFunctionField, value: string) => void;
	} = $props();

	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-label="Story Function">
	<SectionHeader title="Story Function" class="dossier-section-header">
		{#snippet actions()}
			<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="story-function-content" onclick={() => (isCollapsed = !isCollapsed)}>
				{isCollapsed ? 'Expand' : 'Collapse'}
			</GhostButton>
		{/snippet}
	</SectionHeader>
	{#if !isCollapsed}
		<div id="story-function-content" class="field-group">
			<div class="field-pair">
				<span class="field-label">Role in Story</span>
				<input class="field-value input-inline" type="text" value={character?.storyRole || ''} oninput={(event) => onFieldChange('storyRole', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="field-pair">
				<span class="field-label">Arc Stage</span>
				<input class="field-value input-inline" type="text" value={character?.arcStage || ''} oninput={(event) => onFieldChange('arcStage', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="field-pair">
				<span class="field-label">External Goal</span>
				<textarea class="field-value input-inline" rows="2" value={character?.externalGoal || ''} oninput={(event) => onFieldChange('externalGoal', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Internal Need</span>
				<textarea class="field-value input-inline" rows="2" value={character?.internalNeed || ''} oninput={(event) => onFieldChange('internalNeed', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair wide">
				<span class="field-label">Stakes</span>
				<textarea class="field-value input-inline" rows="3" value={character?.stakes || ''} oninput={(event) => onFieldChange('stakes', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair wide">
				<span class="field-label">Source of Conflict</span>
				<textarea class="field-value input-inline" rows="3" value={character?.conflict || ''} oninput={(event) => onFieldChange('conflict', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
		</div>
	{/if}
</section>

<style>
	.dossier-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	:global(.dossier-section-header .title) {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	:global(.collapse-toggle) {
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent);
		background: transparent;
		color: var(--color-text-muted);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.field-group {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4) var(--space-5);
	}

	.field-pair {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field-pair.wide {
		grid-column: 1 / -1;
	}

	.field-label {
		font-size: var(--text-xs);
		letter-spacing: 0.03em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.field-value {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		line-height: var(--leading-relaxed);
	}

	.input-inline {
		width: 100%;
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		padding: 0.2rem 0.25rem;
		border-radius: var(--radius-sm);
	}

	.input-inline:hover {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.input-inline:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
	}

	@media (max-width: 768px) {
		.field-group {
			grid-template-columns: 1fr;
		}

		.field-pair.wide {
			grid-column: 1;
		}
	}
</style>
