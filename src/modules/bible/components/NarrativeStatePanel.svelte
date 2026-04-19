<script lang="ts">
	type NarrativeStateField = 'emotionalState' | 'currentObjective' | 'currentPressure' | 'lastSeen' | 'nextMove';

	type NarrativeStateModel = {
		emotionalState?: string;
		currentObjective?: string;
		currentPressure?: string;
		lastSeen?: string;
		nextMove?: string;
		[key: string]: unknown;
	};

	let {
		character,
		onFieldChange,
	}: {
		character: NarrativeStateModel | null;
		onFieldChange: (field: NarrativeStateField, value: string) => void;
	} = $props();

	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="narrative-state-title">
	<div class="section-header">
		<h3 id="narrative-state-title" class="section-title">Current Narrative State</h3>
		<button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="narrative-state-content" onclick={() => (isCollapsed = !isCollapsed)}>
			{isCollapsed ? 'Expand' : 'Collapse'}
		</button>
	</div>
	{#if !isCollapsed}
		<div id="narrative-state-content" class="field-group">
			<div class="field-pair wide">
				<span class="field-label">Current Emotional State</span>
				<textarea class="field-value input-inline" rows="2" value={character?.emotionalState || ''} oninput={(event) => onFieldChange('emotionalState', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair wide">
				<span class="field-label">Current Objective</span>
				<textarea class="field-value input-inline" rows="2" value={character?.currentObjective || ''} oninput={(event) => onFieldChange('currentObjective', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair wide">
				<span class="field-label">Current Pressure / Obstacle</span>
				<textarea class="field-value input-inline" rows="2" value={character?.currentPressure || ''} oninput={(event) => onFieldChange('currentPressure', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Last Seen In</span>
				<input class="field-value input-inline" type="text" value={character?.lastSeen || ''} oninput={(event) => onFieldChange('lastSeen', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="field-pair">
				<span class="field-label">Next Expected Move</span>
				<textarea class="field-value input-inline" rows="2" value={character?.nextMove || ''} oninput={(event) => onFieldChange('nextMove', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
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

	.section-title {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
	}

	.collapse-toggle {
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
