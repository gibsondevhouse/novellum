<script lang="ts">
	type ContinuityField = 'immutableTraits' | 'injuries' | 'habits' | 'secrets' | 'othersKnow' | 'lastChange' | 'timelineMarkers';

	type ContinuityModel = {
		immutableTraits?: string;
		injuries?: string;
		habits?: string;
		secrets?: string;
		othersKnow?: string;
		lastChange?: string;
		timelineMarkers?: string;
		[key: string]: unknown;
	};

	let {
		character,
		onFieldChange,
	}: {
		character: ContinuityModel | null;
		onFieldChange: (field: ContinuityField, value: string) => void;
	} = $props();

	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="continuity-title">
	<div class="section-header">
		<h3 id="continuity-title" class="section-title">Continuity</h3>
		<button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="continuity-content" onclick={() => (isCollapsed = !isCollapsed)}>
			{isCollapsed ? 'Expand' : 'Collapse'}
		</button>
	</div>
	{#if !isCollapsed}
		<div id="continuity-content" class="continuity-list">
			<div class="field-pair">
				<span class="field-label">Immutable Traits</span>
				<textarea class="field-value input-inline" rows="2" value={character?.immutableTraits || ''} oninput={(event) => onFieldChange('immutableTraits', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Injuries / Scars</span>
				<textarea class="field-value input-inline" rows="2" value={character?.injuries || ''} oninput={(event) => onFieldChange('injuries', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Habits / Routines</span>
				<textarea class="field-value input-inline" rows="2" value={character?.habits || ''} oninput={(event) => onFieldChange('habits', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Secrets</span>
				<textarea class="field-value input-inline" rows="2" value={character?.secrets || ''} oninput={(event) => onFieldChange('secrets', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">What Others Know</span>
				<textarea class="field-value input-inline" rows="2" value={character?.othersKnow || ''} oninput={(event) => onFieldChange('othersKnow', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Last Major Change</span>
				<textarea class="field-value input-inline" rows="2" value={character?.lastChange || ''} oninput={(event) => onFieldChange('lastChange', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Timeline Markers</span>
				<textarea class="field-value input-inline" rows="2" value={character?.timelineMarkers || ''} oninput={(event) => onFieldChange('timelineMarkers', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
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

	.continuity-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.field-pair {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
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
</style>
