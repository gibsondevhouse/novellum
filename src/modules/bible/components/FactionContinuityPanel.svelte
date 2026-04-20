<script lang="ts">
	type ContinuityField = 'immutableTraits' | 'knownHistoryMarkers' | 'alliances' | 'feuds' | 'internalRules' | 'secrets' | 'publicKnowledge' | 'lastMajorChange' | 'timelineMarkers';
	let { faction, onFieldChange }: { faction: Record<string, unknown> | null; onFieldChange: (field: ContinuityField, value: string) => void } = $props();
	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="faction-continuity-title">
	<div class="section-header"><h3 id="faction-continuity-title" class="section-title">Continuity</h3><button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="faction-continuity-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</button></div>
	{#if !isCollapsed}
		<div id="faction-continuity-content" class="field-grid">
			<label><span>Immutable Traits</span><textarea rows="2" class="input-inline" value={(faction?.immutableTraits as string) || ''} oninput={(e) => onFieldChange('immutableTraits', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Known History Markers</span><textarea rows="2" class="input-inline" value={(faction?.knownHistoryMarkers as string) || ''} oninput={(e) => onFieldChange('knownHistoryMarkers', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Alliances</span><textarea rows="2" class="input-inline" value={(faction?.alliances as string) || ''} oninput={(e) => onFieldChange('alliances', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Feuds</span><textarea rows="2" class="input-inline" value={(faction?.feuds as string) || ''} oninput={(e) => onFieldChange('feuds', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Internal Rules</span><textarea rows="2" class="input-inline" value={(faction?.internalRules as string) || ''} oninput={(e) => onFieldChange('internalRules', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Secrets</span><textarea rows="2" class="input-inline" value={(faction?.secrets as string) || ''} oninput={(e) => onFieldChange('secrets', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>What the Public Knows</span><textarea rows="2" class="input-inline" value={(faction?.publicKnowledge as string) || ''} oninput={(e) => onFieldChange('publicKnowledge', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Last Major Change</span><textarea rows="2" class="input-inline" value={(faction?.lastMajorChange as string) || ''} oninput={(e) => onFieldChange('lastMajorChange', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label class="full"><span>Timeline Markers</span><textarea rows="3" class="input-inline" value={(faction?.timelineMarkers as string) || ''} oninput={(e) => onFieldChange('timelineMarkers', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
		</div>
	{/if}
</section>

<style>
	.dossier-section { display: flex; flex-direction: column; gap: var(--space-4); padding-top: var(--space-4); border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent); }
	.section-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); }
	.section-title { margin: 0; font-size: var(--text-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
	.collapse-toggle { border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent); background: transparent; color: var(--color-text-muted); padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); font-size: var(--text-xs); cursor: pointer; }
	.field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4) var(--space-5); }
	label { display: flex; flex-direction: column; gap: 0.35rem; }
	label span { font-size: var(--text-xs); letter-spacing: 0.03em; color: var(--color-text-muted); }
	label.full { grid-column: 1 / -1; }
	.input-inline { width: 100%; border: 1px solid transparent; background: transparent; color: inherit; padding: 0.2rem 0.25rem; border-radius: var(--radius-sm); }
	.input-inline:hover { border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent); }
	.input-inline:focus { outline: none; border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default)); background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent); }
	@media (max-width: 768px) { .field-grid { grid-template-columns: 1fr; } }
</style>
