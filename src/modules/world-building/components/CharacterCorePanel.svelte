<script lang="ts">
	import { GhostButton, SectionHeader } from '$lib/components/ui/index.js';

	type CoreField = 'coreDesire' | 'fear' | 'contradiction' | 'temperament' | 'alignment' | 'strength' | 'flaw' | 'biography';

	type CharacterCoreModel = {
		coreDesire?: string;
		fear?: string;
		contradiction?: string;
		temperament?: string;
		alignment?: string;
		strength?: string;
		flaw?: string;
		biography?: string;
		[key: string]: unknown;
	};

	let {
		character,
		onFieldChange,
	}: {
		character: CharacterCoreModel | null;
		onFieldChange: (field: CoreField, value: string) => void;
	} = $props();

	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-label="Character Core">
	<SectionHeader title="Character Core" class="dossier-section-header">
		{#snippet actions()}
			<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="character-core-content" onclick={() => (isCollapsed = !isCollapsed)}>
				{isCollapsed ? 'Expand' : 'Collapse'}
			</GhostButton>
		{/snippet}
	</SectionHeader>
	{#if !isCollapsed}
		<div id="character-core-content" class="section-content">
			<div class="field-group">
				<div class="field-pair">
					<span class="field-label">Core Desire</span>
					<textarea class="field-value input-inline" rows="2" value={character?.coreDesire || ''} oninput={(event) => onFieldChange('coreDesire', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
				</div>
				<div class="field-pair">
					<span class="field-label">Fear / Constraint</span>
					<textarea class="field-value input-inline" rows="2" value={character?.fear || ''} oninput={(event) => onFieldChange('fear', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
				</div>
				<div class="field-pair">
					<span class="field-label">Contradiction</span>
					<textarea class="field-value input-inline" rows="2" value={character?.contradiction || ''} oninput={(event) => onFieldChange('contradiction', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
				</div>
				<div class="field-pair">
					<span class="field-label">Temperament</span>
					<textarea class="field-value input-inline" rows="2" value={character?.temperament || ''} oninput={(event) => onFieldChange('temperament', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
				</div>
				<div class="field-pair">
					<span class="field-label">Moral Alignment</span>
					<input class="field-value input-inline" type="text" value={character?.alignment || ''} oninput={(event) => onFieldChange('alignment', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
				</div>
				<div class="field-pair">
					<span class="field-label">Greatest Strength</span>
					<textarea class="field-value input-inline" rows="2" value={character?.strength || ''} oninput={(event) => onFieldChange('strength', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
				</div>
				<div class="field-pair">
					<span class="field-label">Greatest Flaw</span>
					<textarea class="field-value input-inline" rows="2" value={character?.flaw || ''} oninput={(event) => onFieldChange('flaw', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
				</div>
			</div>
			<div class="field-pair biography-pair">
				<span class="field-label">Biography</span>
				<textarea class="field-value longform input-inline" rows="6" value={character?.biography || ''} oninput={(event) => onFieldChange('biography', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="No biography recorded yet."></textarea>
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

	.section-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
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

	.biography-pair {
		margin-top: var(--space-1);
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

	.longform {
		max-width: 74ch;
		resize: vertical;
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
	}
</style>
